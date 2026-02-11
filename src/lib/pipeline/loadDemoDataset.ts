import { readFile } from "node:fs/promises";
import path from "node:path";

import type { SourceDoc } from "@/lib/types/proofstack";

interface DemoFileSpec {
  id: string;
  fileName: string;
}

const DEMO_DATASET_FILES: DemoFileSpec[] = [
  { id: "source-incident-report", fileName: "incident_report.md" },
  { id: "source-security-policy", fileName: "security_policy.md" },
  { id: "source-logs", fileName: "logs.txt" },
];

/**
 * Loads the fixed demo dataset from `/datasets/demo1` in deterministic file order.
 */
export async function loadDemoDataset(): Promise<SourceDoc[]> {
  const basePath = path.join(process.cwd(), "datasets", "demo1");

  const loaded = await Promise.all(
    DEMO_DATASET_FILES.map(async (spec): Promise<SourceDoc | null> => {
      const filePath = path.join(basePath, spec.fileName);

      try {
        const content = await readFile(filePath, "utf8");

        return {
          id: spec.id,
          fileName: path.join("demo1", spec.fileName),
          content,
          isDemo: true,
        };
      } catch {
        return null;
      }
    }),
  );

  return loaded.filter((source): source is SourceDoc => source !== null);
}
