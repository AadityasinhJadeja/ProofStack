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
} from "@/lib/types/proofstack";
import { debugLog } from "@/lib/utils/debug";

interface VerifyRequestBody {
  question?: string;
  useDemoDataset?: boolean;
  domain?: DomainPreset;
  strictness?: StrictnessPreset;
}

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
  const rawBody = (await request.json().catch(() => ({}))) as VerifyRequestBody;

  const question =
    typeof rawBody.question === "string" && rawBody.question.trim().length > 0
      ? rawBody.question.trim()
      : "Analyze this incident and recommend remediation steps.";
  const useDemoDataset = rawBody.useDemoDataset === true;
  const domain = isDomainPreset(rawBody.domain) ? rawBody.domain : "Cyber/Security";
  const strictness = isStrictnessPreset(rawBody.strictness) ? rawBody.strictness : "Balanced";

  const sources = useDemoDataset ? await loadDemoDataset() : [];
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
