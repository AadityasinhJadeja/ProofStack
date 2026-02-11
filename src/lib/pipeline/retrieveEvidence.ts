import type { ExtractedClaim } from "./extractClaims";

export interface EvidenceSnippet {
  sourceId: string;
  snippet: string;
  relevanceScore: number;
}

export interface ClaimEvidence {
  claimId: string;
  candidates: EvidenceSnippet[];
}

/**
 * Retrieves top evidence candidates for each claim.
 */
export async function retrieveEvidence(claims: ExtractedClaim[]): Promise<ClaimEvidence[]> {
  // TODO(Phase 4): embed each claim and retrieve top-k=3 relevant chunks.
  // TODO(Phase 4): persist evidence candidates for claims table and evidence drawer UI.
  void claims;
  return [];
}
