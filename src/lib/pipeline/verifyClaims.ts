import type { ClaimEvidence } from "./retrieveEvidence";

export type Verdict = "supported" | "weak" | "unsupported";

export interface VerificationResult {
  claimId: string;
  verdict: Verdict;
  explanation: string;
  evidenceQuote: string;
  confidence: number;
  contradictionFlag?: boolean;
}

/**
 * Verifies claims against evidence snippets and returns structured verdicts.
 */
export async function verifyClaims(evidenceByClaim: ClaimEvidence[]): Promise<VerificationResult[]> {
  // TODO(Phase 5): return strict JSON verdict, explanation, evidence quote, and confidence per claim.
  // TODO(Phase 6): run adversarial disprove/contradiction checks and set contradiction flags.
  void evidenceByClaim;
  return [];
}
