import type { Claim, Chunk, EvidenceSnippet } from "@/lib/types/proofstack";

const TOP_K = 3;

function toTokenSet(value: string): Set<string> {
  return new Set(value.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 1));
}

/**
 * Retrieves top evidence snippets for a claim using deterministic keyword-overlap scoring.
 */
export function retrieveEvidence(claim: Claim, chunks: Chunk[], topK: number = TOP_K): EvidenceSnippet[] {
  const claimTokens = toTokenSet(claim.text);
  const denominator = claimTokens.size || 1;

  const ranked = chunks
    .map((chunk) => {
      const chunkTokens = toTokenSet(chunk.text);
      let overlap = 0;

      for (const token of claimTokens) {
        if (chunkTokens.has(token)) {
          overlap += 1;
        }
      }

      const relevanceScore = overlap / denominator;

      return {
        chunk,
        relevanceScore,
      };
    })
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }

      return a.chunk.id.localeCompare(b.chunk.id);
    })
    .slice(0, topK);

  return ranked.map(({ chunk, relevanceScore }, index) => ({
    id: `${claim.id}-evidence-${index + 1}`,
    claimId: claim.id,
    sourceId: chunk.sourceId,
    snippet: chunk.text,
    relevanceScore,
  }));
}
