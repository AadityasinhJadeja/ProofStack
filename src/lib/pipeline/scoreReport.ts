import type { VerificationResult } from "./verifyClaims";

export interface TrustScoreReport {
  trustScore: number;
  topRisks: string[];
}

/**
 * Computes the deterministic Trust Score and summarizes the highest risks.
 */
export function scoreReport(results: VerificationResult[]): TrustScoreReport {
  // TODO(Phase 7): apply deterministic scoring weights for supported/weak/unsupported claims.
  // TODO(Phase 7): penalize contradictions and critical unsupported claims, then normalize to 0-100.
  void results;
  return { trustScore: 0, topRisks: [] };
}
