import type { Claim, ClaimVerdict, TrustReport } from "@/lib/types/proofstack";

const BASELINE_SCORE = 50;
const CYBER_DOMAIN_MULTIPLIER = 1;

function scoreForVerdict(verdict: ClaimVerdict["verdict"]): number {
  if (verdict === "supported") {
    return 1;
  }

  if (verdict === "weak") {
    return 0.5;
  }

  return 0;
}

/**
 * Computes deterministic trust score (0-100) and top risks from claim verdicts.
 */
export function scoreReport(claims: Claim[], claimVerdicts: ClaimVerdict[]): TrustReport {
  const verdictMap = new Map(claimVerdicts.map((verdict) => [verdict.claimId, verdict]));

  let raw = 0;
  const risks: string[] = [];
  let supportedCount = 0;
  let weakCount = 0;
  let unsupportedCount = 0;

  for (const claim of claims) {
    const verdict = verdictMap.get(claim.id);
    const status = verdict?.verdict ?? "pending";

    if (status === "supported") {
      supportedCount += 1;
    } else if (status === "weak") {
      weakCount += 1;
    } else if (status === "unsupported") {
      unsupportedCount += 1;
    }

    raw += scoreForVerdict(status);

    if (status === "unsupported" && claim.criticality === "high") {
      raw -= 2;
      risks.push(`High-criticality unsupported claim: ${claim.text}`);
    }

    if (status === "weak") {
      risks.push(`Weak evidence claim: ${claim.text}`);
    }

    if (status === "unsupported" && claim.criticality !== "high") {
      risks.push(`Unsupported claim: ${claim.text}`);
    }
  }

  const claimCount = Math.max(claims.length, 1);
  const normalized = ((raw / claimCount) * 50 + BASELINE_SCORE) * CYBER_DOMAIN_MULTIPLIER;
  const trustScore = Math.max(0, Math.min(100, Math.round(normalized)));

  return {
    trustScore,
    supportedCount,
    weakCount,
    unsupportedCount,
    topRisks: risks.slice(0, 3),
  };
}
