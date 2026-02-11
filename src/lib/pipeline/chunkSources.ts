import type { Chunk, SourceDoc } from "@/lib/types/proofstack";

const CHUNK_WORD_SIZE = 120;

/**
 * Deterministically splits each source document into fixed-size chunks.
 * Chunk IDs are stable across runs as long as source IDs and source text remain unchanged.
 */
export function chunkSources(sources: SourceDoc[]): Chunk[] {
  return sources.flatMap((source) => {
    const words = source.content.split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      return [];
    }

    const chunks: Chunk[] = [];

    for (let start = 0; start < words.length; start += CHUNK_WORD_SIZE) {
      const end = Math.min(start + CHUNK_WORD_SIZE, words.length);
      const chunkWords = words.slice(start, end);
      const chunkIndex = Math.floor(start / CHUNK_WORD_SIZE) + 1;

      chunks.push({
        id: `${source.id}-chunk-${String(chunkIndex).padStart(3, "0")}`,
        sourceId: source.id,
        text: chunkWords.join(" "),
        tokenEstimate: chunkWords.length,
      });
    }

    return chunks;
  });
}
