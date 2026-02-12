import { NextResponse } from "next/server";

import { computeImpactMetrics, computeTrustScoreBreakdown } from "@/lib/pipeline/scoreReport";
import type { ClaimVerdict, EvidenceSnippet, VerificationSession } from "@/lib/types/proofstack";

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n+/g, " ").trim();
}

function formatConfidence(value: number): string {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return value.toFixed(2);
}

function buildEvidenceByClaim(evidence: EvidenceSnippet[]): Map<string, EvidenceSnippet[]> {
  const map = new Map<string, EvidenceSnippet[]>();

  for (const snippet of evidence) {
    const existing = map.get(snippet.claimId) ?? [];
    existing.push(snippet);
    map.set(snippet.claimId, existing);
  }

  return map;
}

function buildVerdictByClaim(verdicts: ClaimVerdict[]): Map<string, ClaimVerdict> {
  return new Map(verdicts.map((verdict) => [verdict.claimId, verdict]));
}

function buildReportMarkdown(session: VerificationSession): string {
  const generatedAt = new Date().toISOString();
  const verdictByClaim = buildVerdictByClaim(session.claimVerdicts);
  const evidenceByClaim = buildEvidenceByClaim(session.evidenceSnippets);
  const sourceById = new Map(session.sources.map((source) => [source.id, source.fileName]));
  const scoreBreakdown =
    session.trustReport.scoreBreakdown ??
    computeTrustScoreBreakdown(session.claims, session.claimVerdicts);
  const impactMetrics =
    session.trustReport.impactMetrics ??
    computeImpactMetrics(session.claims, session.claimVerdicts);

  const lines: string[] = [];

  lines.push("# ProofStack Trust Report");
  lines.push("");
  lines.push("## Metadata");
  lines.push(`- Session ID: ${session.id}`);
  lines.push(`- Generated At: ${generatedAt}`);
  lines.push(`- Session Created At: ${session.createdAt}`);
  lines.push(`- Domain: ${session.domain}`);
  lines.push(`- Strictness: ${session.strictness}`);
  lines.push(`- Challenge Demo Mode: ${session.challengeMode ? "Yes" : "No"}`);
  if (session.challengeMode && session.challengeInjectedClaimId) {
    lines.push(`- Injected Challenge Claim ID: ${session.challengeInjectedClaimId}`);
  }
  lines.push("");

  lines.push("## Trust Summary");
  lines.push(`- Trust Score: ${session.trustReport.trustScore}`);
  lines.push(`- Supported: ${session.trustReport.supportedCount}`);
  lines.push(`- Weak: ${session.trustReport.weakCount}`);
  lines.push(`- Unsupported: ${session.trustReport.unsupportedCount}`);
  lines.push(`- Supported Claims %: ${impactMetrics.supportedRatePct}%`);
  lines.push(`- Critical Unsupported Count: ${impactMetrics.criticalUnsupportedCount}`);
  lines.push(`- Estimated Time-to-Review: ${impactMetrics.estimatedReviewMinutes} minutes`);
  lines.push(`- Review-Time Formula: ${impactMetrics.reviewTimeFormula}`);
  lines.push(`- Raw Points: ${scoreBreakdown.rawPoints.toFixed(2)}`);
  lines.push(`- Normalized Score (pre-clamp): ${scoreBreakdown.normalizedScore.toFixed(2)}`);
  lines.push(`- Formula: ${scoreBreakdown.formula}`);
  lines.push("");
  lines.push("### Score Explainability");
  lines.push("| Rule | Weight | Count |");
  lines.push("| --- | ---: | ---: |");
  lines.push(`| Supported | ${scoreBreakdown.weights.supported.toFixed(2)} | ${scoreBreakdown.counts.supported} |`);
  lines.push(`| Weak | ${scoreBreakdown.weights.weak.toFixed(2)} | ${scoreBreakdown.counts.weak} |`);
  lines.push(
    `| Unsupported | ${scoreBreakdown.weights.unsupported.toFixed(2)} | ${scoreBreakdown.counts.unsupported} |`,
  );
  lines.push(`| Pending | ${scoreBreakdown.weights.pending.toFixed(2)} | ${scoreBreakdown.counts.pending} |`);
  lines.push(
    `| Critical Unsupported Penalty | -${scoreBreakdown.weights.criticalUnsupportedPenalty.toFixed(2)} | ${scoreBreakdown.counts.criticalUnsupported} |`,
  );
  lines.push(
    `| Contradiction Penalty | -${scoreBreakdown.weights.contradictionPenalty.toFixed(2)} | ${scoreBreakdown.counts.contradictions} |`,
  );
  lines.push("");
  lines.push("### Per-Claim Score Contributions");
  lines.push("| Claim ID | Verdict | Criticality | Base | Penalty | Net |");
  lines.push("| --- | --- | --- | ---: | ---: | ---: |");

  for (const contribution of scoreBreakdown.claimContributions) {
    lines.push(
      `| ${escapeCell(contribution.claimId)} | ${contribution.verdict} | ${contribution.criticality} | ${contribution.basePoints.toFixed(2)} | ${contribution.penaltyPoints.toFixed(2)} | ${contribution.netPoints.toFixed(2)} |`,
    );
  }

  lines.push("");
  lines.push("### Top Risks");

  if (session.trustReport.topRisks.length > 0) {
    for (const risk of session.trustReport.topRisks) {
      lines.push(`- ${risk}`);
    }
  } else {
    lines.push("- None");
  }

  lines.push("");
  lines.push("## Claims");
  lines.push("| Claim ID | Claim | Verdict | Confidence |");
  lines.push("| --- | --- | --- | ---: |");

  for (const claim of session.claims) {
    const verdict = verdictByClaim.get(claim.id);
    lines.push(
      `| ${escapeCell(claim.id)} | ${escapeCell(claim.text)} | ${verdict?.verdict ?? "pending"} | ${formatConfidence(verdict?.confidence ?? Number.NaN)} |`,
    );
  }

  lines.push("");
  lines.push("## Evidence By Claim");

  for (const claim of session.claims) {
    lines.push(`### ${claim.id}`);
    lines.push(claim.text);
    const snippets = evidenceByClaim.get(claim.id) ?? [];

    if (snippets.length === 0) {
      lines.push("- No evidence snippets available.");
      lines.push("");
      continue;
    }

    for (const snippet of snippets) {
      lines.push(
        `- [${snippet.id}] Source: ${sourceById.get(snippet.sourceId) ?? snippet.sourceId} | Relevance: ${snippet.relevanceScore.toFixed(3)}`,
      );
      lines.push(`  - ${snippet.snippet.replace(/\n+/g, " ").trim()}`);
    }

    lines.push("");
  }

  lines.push("## Draft Answer");
  lines.push(session.draftAnswer || "(empty)");
  lines.push("");
  lines.push("## Verified Answer");
  lines.push(session.verifiedAnswer || session.draftAnswer || "(empty)");

  return `${lines.join("\n")}\n`;
}

function sanitizeFilenamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9-_]/g, "-");
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as VerificationSession | null;

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid session payload." }, { status: 400 });
  }

  if (!payload.id || !payload.trustReport || !Array.isArray(payload.claims)) {
    return NextResponse.json({ error: "Session payload missing required fields." }, { status: 400 });
  }

  const safeSession: VerificationSession = {
    ...payload,
    verifiedAnswer: payload.verifiedAnswer || payload.draftAnswer || "",
  };

  const markdown = buildReportMarkdown(safeSession);
  const safeId = sanitizeFilenamePart(safeSession.id || `session-${Date.now()}`);
  const filename = `proofstack-trust-report-${safeId}.md`;

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
      "Cache-Control": "no-store",
    },
  });
}
