import { NextResponse } from "next/server";

import { chunkSources } from "@/lib/pipeline/chunkSources";
import { draftAnswer } from "@/lib/pipeline/draftAnswer";
import { extractClaims } from "@/lib/pipeline/extractClaims";
import { loadDemoDataset } from "@/lib/pipeline/loadDemoDataset";
import { redlineAnswer } from "@/lib/pipeline/redlineAnswer";
import { retrieveEvidence } from "@/lib/pipeline/retrieveEvidence";
import { scoreReport } from "@/lib/pipeline/scoreReport";
import { verifyClaims } from "@/lib/pipeline/verifyClaims";
import { setLatestSession } from "@/lib/session/latestSession";
import type {
  ClaimVerdict,
  DomainPreset,
  EvidenceSnippet,
  StrictnessPreset,
  VerificationSession,
  SourceDoc,
} from "@/lib/types/proofstack";
import { debugLog } from "@/lib/utils/debug";

const DOMAIN_PRESETS: DomainPreset[] = ["Cyber/Security"];
const STRICTNESS_PRESETS: StrictnessPreset[] = ["Fast", "Balanced", "Strict"];
const MAX_CLAIMS = 12;
const TOP_K = 3;

function isDomainPreset(value: unknown): value is DomainPreset {
  return typeof value === "string" && DOMAIN_PRESETS.includes(value as DomainPreset);
}

function isStrictnessPreset(value: unknown): value is StrictnessPreset {
  return typeof value === "string" && STRICTNESS_PRESETS.includes(value as StrictnessPreset);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  let question = "";
  let useDemoDataset = false;
  let domain: DomainPreset = "Cyber/Security";
  let strictness: StrictnessPreset = "Balanced";
  let sources: SourceDoc[] = [];

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    question = formData.get("question")?.toString() || "Analyze this incident and recommend remediation steps.";
    useDemoDataset = formData.get("useDemoDataset") === "true";

    const d = formData.get("domain");
    if (isDomainPreset(d)) domain = d;

    const s = formData.get("strictness");
    if (isStrictnessPreset(s)) strictness = s;

    const files = formData.getAll("files") as File[];
    if (files.length > 0) {
      sources = await Promise.all(
        files.map(async (file, index) => ({
          id: `source-upload-${Date.now()}-${index}`,
          fileName: file.name,
          content: await file.text(),
          isDemo: false,
        }))
      );
    }
  } else {
    const rawBody = (await request.json().catch(() => ({})));
    question = rawBody.question || "Analyze this incident and recommend remediation steps.";
    useDemoDataset = rawBody.useDemoDataset === true;
    domain = isDomainPreset(rawBody.domain) ? rawBody.domain : "Cyber/Security";
    strictness = isStrictnessPreset(rawBody.strictness) ? rawBody.strictness : "Balanced";
  }

  if (sources.length === 0 && useDemoDataset) {
    sources = await loadDemoDataset();
  } else if (sources.length === 0 && !useDemoDataset) {
    // Fallback to demo if no files uploaded but demo not explicitly requested? 
    // Or just return error? For the hackathon, let's fallback to demo if empty.
    sources = await loadDemoDataset();
    useDemoDataset = true;
  }

  const chunks = chunkSources(sources);

  debugLog("verifyRoute", "ingestion_complete", {
    sourceCount: sources.length,
    chunkCount: chunks.length,
    useDemoDataset,
  });

  const draft = await draftAnswer({ question, domain, strictness, sources });
  const claims = (await extractClaims(draft.draftText)).slice(0, MAX_CLAIMS);

  const evidenceSnippets = claims.flatMap((claim) => retrieveEvidence(claim, chunks, TOP_K));

  const evidenceByClaimId = new Map<string, EvidenceSnippet[]>();
  for (const snippet of evidenceSnippets) {
    const existing = evidenceByClaimId.get(snippet.claimId) ?? [];
    existing.push(snippet);
    evidenceByClaimId.set(snippet.claimId, existing);
  }

  const verificationResults = await verifyClaims(claims, evidenceByClaimId);
  const claimVerdicts: ClaimVerdict[] = verificationResults.map((result) => ({
    claimId: result.claimId,
    verdict: result.verdict,
    confidence: result.confidence,
    explanation: result.reason,
    evidenceSnippetIds: result.evidenceIds,
  }));
  const trustReport = scoreReport(claims, claimVerdicts);
  const verified = redlineAnswer(draft.draftText, claims, claimVerdicts, evidenceSnippets);

  debugLog("verifyRoute", "verification_complete", {
    claimCount: claims.length,
    evidenceCount: evidenceSnippets.length,
    trustScore: trustReport.trustScore,
  });

  const session: VerificationSession = {
    id: `session-${Date.now()}`,
    createdAt: new Date().toISOString(),
    question,
    draftAnswer: draft.draftText,
    verifiedAnswer: verified.verifiedText,
    domain,
    strictness,
    useDemoDataset,
    sources,
    chunks,
    claims,
    evidenceSnippets,
    claimVerdicts,
    trustReport,
  };

  await setLatestSession(session);

  return NextResponse.json(session);
}
