export interface SourceDocument {
  sourceId: string;
  rawText: string;
}

export interface TextChunk {
  chunkId: string;
  sourceId: string;
  text: string;
}

/**
 * Splits source documents into indexable text chunks.
 */
export async function chunkSources(sources: SourceDocument[]): Promise<TextChunk[]> {
  // TODO(Phase 1): support paste text and PDF upload ingestion paths.
  // TODO(Phase 1): chunk text at ~500-800 tokens and preserve source IDs.
  // TODO(Phase 1): surface source health metrics (chunk count and word count).
  void sources;
  return [];
}
