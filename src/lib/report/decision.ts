import type { Claim, ClaimVerdict } from "@/lib/types/proofstack";

export type ReportDecisionStatus = "hold" | "safe";

export interface ReportDecision {
  status: ReportDecisionStatus;
  unsupportedCount: number;
  criticalWeakCount: number;
  reason: string;
  actionLabel: string;
  actionNote: string;
}

export function countCriticalWeakClaims(
  claims: Claim[],
  verdictByClaimId: Map<string, ClaimVerdict>,
): number {
  return claims.filter(
    (claim) => claim.criticality === "high" && verdictByClaimId.get(claim.id)?.verdict === "weak",
  ).length;
}

export function buildReportDecision(params: {
  unsupportedCount: number;
  criticalWeakCount: number;
}): ReportDecision {
  const { unsupportedCount, criticalWeakCount } = params;
  const isHold = unsupportedCount > 0 || criticalWeakCount > 0;

  if (unsupportedCount > 0 && criticalWeakCount > 0) {
    return {
      status: "hold",
      unsupportedCount,
      criticalWeakCount,
      reason: `${unsupportedCount} unsupported claim(s) and ${criticalWeakCount} high-critical weak claim(s) require analyst review.`,
      actionLabel: "Review blocking claims",
      actionNote: "Do not publish externally until blocking claims are resolved.",
    };
  }

  if (unsupportedCount > 0) {
    return {
      status: "hold",
      unsupportedCount,
      criticalWeakCount,
      reason: `${unsupportedCount} unsupported claim(s) block safe sharing until reviewed.`,
      actionLabel: "Review blocking claims",
      actionNote: "Do not publish externally until blocking claims are resolved.",
    };
  }

  if (criticalWeakCount > 0) {
    return {
      status: "hold",
      unsupportedCount,
      criticalWeakCount,
      reason: `${criticalWeakCount} high-critical weak claim(s) need manual validation before release.`,
      actionLabel: "Review blocking claims",
      actionNote: "Do not publish externally until blocking claims are resolved.",
    };
  }

  return {
    status: "safe",
    unsupportedCount,
    criticalWeakCount,
    reason: "No unsupported claims and no high-critical weak claims detected in this run.",
    actionLabel: "Open claims review",
    actionNote: "Proceed with sharing, then run a final analyst spot-check for critical actions.",
  };
}
