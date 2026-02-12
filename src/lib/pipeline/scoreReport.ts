import type {
  Claim,
  ClaimVerdict,
  ImpactMetrics,
  TrustReport,
  TrustScoreBreakdown,
} from "@/lib/types/proofstack";

const BASELINE_SCORE = 50;
const SCALE_PER_CLAIM = 50;
const CYBER_DOMAIN_MULTIPLIER = 1;
const CONTRADICTION_PENALTY = 0.5;
const CRITICAL_UNSUPPORTED_PENALTY = 2;
const SCORE_FORMULA =
  "final = clamp(0,100, round((((rawPoints / claimCount) * 50) + 50) * 1))";
const REVIEW_TIME_FORMULA =
  "minutes = 1.5 + (claimCount*0.6) + (weak*0.9) + (unsupported*1.4) + (criticalUnsupported*1.1)";

function scoreForVerdict(verdict: ClaimVerdict["verdict"]): number {
  if (verdict === "supported") {
    return 1;
  }

  if (verdict === "weak") {
    return 0.5;
  }

  return 0;
}

interface ScoreDetails {
  breakdown: TrustScoreBreakdown;
  risks: string[];
  impactMetrics: ImpactMetrics;
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function computeImpactMetrics(
  claims: Claim[],
  claimVerdicts: ClaimVerdict[],
): ImpactMetrics {
  const claimCount = claims.length;
  const verdictMap = new Map(claimVerdicts.map((verdict) => [verdict.claimId, verdict]));

  let supported = 0;
  let weak = 0;
  let unsupported = 0;
  let criticalUnsupported = 0;

  for (const claim of claims) {
    const status = verdictMap.get(claim.id)?.verdict ?? "pending";
    if (status === "supported") {
      supported += 1;
    } else if (status === "weak") {
      weak += 1;
    } else if (status === "unsupported") {
      unsupported += 1;
      if (claim.criticality === "high") {
        criticalUnsupported += 1;
      }
    }
  }

  const supportedRatePct =
    claimCount === 0 ? 0 : Math.round((supported / claimCount) * 100);
  const estimatedReviewMinutes = roundToOneDecimal(
    1.5 + claimCount * 0.6 + weak * 0.9 + unsupported * 1.4 + criticalUnsupported * 1.1,
  );

  return {
    claimCount,
    supportedRatePct,
    criticalUnsupportedCount: criticalUnsupported,
    estimatedReviewMinutes,
    reviewTimeFormula: REVIEW_TIME_FORMULA,
  };
}

function computeScoreDetails(claims: Claim[], claimVerdicts: ClaimVerdict[]): ScoreDetails {
  const verdictMap = new Map(claimVerdicts.map((verdict) => [verdict.claimId, verdict]));

  let rawPoints = 0;
  const risks: string[] = [];
  const normalizationClaimCount = Math.max(claims.length, 1);
  const counts = {
    claimCount: normalizationClaimCount,
    supported: 0,
    weak: 0,
    unsupported: 0,
    pending: 0,
    contradictions: 0,
    criticalUnsupported: 0,
  };
  const claimContributions: TrustScoreBreakdown["claimContributions"] = [];

  for (const claim of claims) {
    const verdict = verdictMap.get(claim.id);
    const status = verdict?.verdict ?? "pending";
    const contradictionFound = verdict?.contradictionFound === true;
    const basePoints = scoreForVerdict(status);
    let penaltyPoints = 0;
    const reasonParts: string[] = [`Verdict "${status}" contributes ${basePoints.toFixed(2)} point(s).`];

    if (status === "supported") {
      counts.supported += 1;
    } else if (status === "weak") {
      counts.weak += 1;
    } else if (status === "unsupported") {
      counts.unsupported += 1;
    } else {
      counts.pending += 1;
    }

    if (status === "unsupported" && claim.criticality === "high") {
      counts.criticalUnsupported += 1;
      penaltyPoints += CRITICAL_UNSUPPORTED_PENALTY;
      reasonParts.push(
        `High criticality unsupported penalty: -${CRITICAL_UNSUPPORTED_PENALTY.toFixed(2)}.`,
      );
      risks.push(`High-criticality unsupported claim: ${claim.text}`);
    }

    if (contradictionFound) {
      counts.contradictions += 1;
      penaltyPoints += CONTRADICTION_PENALTY;
      reasonParts.push(`Contradiction penalty: -${CONTRADICTION_PENALTY.toFixed(2)}.`);
      risks.push(`Contradiction detected for claim: ${claim.text}`);
    }

    if (status === "weak") {
      risks.push(`Weak evidence claim: ${claim.text}`);
    }

    if (status === "unsupported" && claim.criticality !== "high") {
      risks.push(`Unsupported claim: ${claim.text}`);
    }

    const netPoints = basePoints - penaltyPoints;
    rawPoints += netPoints;

    claimContributions.push({
      claimId: claim.id,
      claimText: claim.text,
      verdict: status,
      criticality: claim.criticality,
      basePoints,
      penaltyPoints,
      netPoints,
      reason: reasonParts.join(" "),
    });
  }

  const normalizedScore =
    ((rawPoints / normalizationClaimCount) * SCALE_PER_CLAIM + BASELINE_SCORE) *
    CYBER_DOMAIN_MULTIPLIER;
  const finalTrustScore = Math.max(0, Math.min(100, Math.round(normalizedScore)));

  return {
    breakdown: {
      formula: SCORE_FORMULA,
      rawPoints,
      normalizedScore,
      finalTrustScore,
      weights: {
        supported: 1,
        weak: 0.5,
        unsupported: 0,
        pending: 0,
        contradictionPenalty: CONTRADICTION_PENALTY,
        criticalUnsupportedPenalty: CRITICAL_UNSUPPORTED_PENALTY,
        baseline: BASELINE_SCORE,
        scalePerClaim: SCALE_PER_CLAIM,
        domainMultiplier: CYBER_DOMAIN_MULTIPLIER,
      },
      counts,
      claimContributions,
    },
    risks,
    impactMetrics: computeImpactMetrics(claims, claimVerdicts),
  };
}

export function computeTrustScoreBreakdown(
  claims: Claim[],
  claimVerdicts: ClaimVerdict[],
): TrustScoreBreakdown {
  return computeScoreDetails(claims, claimVerdicts).breakdown;
}

/**
 * Computes deterministic trust score (0-100) and top risks from claim verdicts.
 */
export function scoreReport(claims: Claim[], claimVerdicts: ClaimVerdict[]): TrustReport {
  const details = computeScoreDetails(claims, claimVerdicts);
  const { breakdown } = details;

  return {
    trustScore: breakdown.finalTrustScore,
    supportedCount: breakdown.counts.supported,
    weakCount: breakdown.counts.weak,
    unsupportedCount: breakdown.counts.unsupported,
    topRisks: details.risks.slice(0, 3),
    scoreBreakdown: breakdown,
    impactMetrics: details.impactMetrics,
  };
}
