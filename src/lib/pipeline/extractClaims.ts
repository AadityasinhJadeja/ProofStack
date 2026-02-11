export type ClaimType = "fact" | "number" | "recommendation";
export type Criticality = "low" | "medium" | "high";

export interface ExtractedClaim {
  id: string;
  claimText: string;
  claimType: ClaimType;
  criticality: Criticality;
}

/**
 * Converts a draft answer into atomic verification claims.
 */
export async function extractClaims(draftText: string): Promise<ExtractedClaim[]> {
  // TODO(Phase 3): enforce strict JSON output for claim extraction.
  // TODO(Phase 3): cap extracted claims to a maximum of 12 for latency control.
  void draftText;
  return [];
}
