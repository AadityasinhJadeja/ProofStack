import { readdir } from "node:fs/promises";
import path from "node:path";

type HomePageProps = {
  searchParams?: Promise<{
    loadSample?: string;
  }>;
};

async function getDatasetFileNames(): Promise<string[]> {
  const datasetsPath = path.join(process.cwd(), "datasets");

  try {
    const entries = await readdir(datasetsPath, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  } catch {
    return [];
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const shouldLoadSamples = resolvedSearchParams?.loadSample === "1";
  const sampleFiles = shouldLoadSamples ? await getDatasetFileNames() : [];

  return (
    <section className="stack">
      <h1>ProofStack Home</h1>

      <div className="panel stack">
        <h2>Upload</h2>
        <p>Phase 1 placeholder for source ingestion UI.</p>
        <input type="file" disabled aria-label="Upload source documents" />
      </div>

      <div className="panel stack">
        <h2>Ask</h2>
        <p>Phase 1 placeholder for question and draft answer generation.</p>
        <textarea rows={4} placeholder="Ask a cybersecurity question..." />
      </div>

      <div className="panel stack">
        <h2>Sample Dataset</h2>
        <form method="get">
          <input type="hidden" name="loadSample" value="1" />
          <button type="submit">Load sample dataset</button>
        </form>

        {shouldLoadSamples ? (
          sampleFiles.length > 0 ? (
            <ul>
              {sampleFiles.map((fileName) => (
                <li key={fileName}>{fileName}</li>
              ))}
            </ul>
          ) : (
            <p>No files found in /datasets.</p>
          )
        ) : (
          <p>Click the button to read file names from /datasets.</p>
        )}
      </div>
    </section>
  );
}
