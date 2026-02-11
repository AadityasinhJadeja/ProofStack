import type { TextChunk } from "./chunkSources";

export interface IndexedChunk {
  chunkId: string;
  sourceId: string;
  vectorId: string;
}

/**
 * Embeds chunks and stores them in a searchable index.
 */
export async function embedIndex(chunks: TextChunk[]): Promise<IndexedChunk[]> {
  // TODO(Phase 1): generate embeddings for each chunk.
  // TODO(Phase 1): store vectors in local FAISS/Chroma index for deterministic demo behavior.
  void chunks;
  return [];
}
