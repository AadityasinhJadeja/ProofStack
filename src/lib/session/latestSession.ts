import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { VerificationSession } from "@/lib/types/proofstack";

const SESSION_DIR = path.join(process.cwd(), ".proofstack");
const SESSION_FILE = path.join(SESSION_DIR, "latest-session.json");

/**
 * Persists the most recent verification session for report-page retrieval.
 */
export async function setLatestSession(session: VerificationSession): Promise<void> {
  await mkdir(SESSION_DIR, { recursive: true });
  await writeFile(SESSION_FILE, JSON.stringify(session), "utf8");
}

/**
 * Returns the most recent verification session if one exists.
 */
export async function getLatestSession(): Promise<VerificationSession | null> {
  try {
    const content = await readFile(SESSION_FILE, "utf8");
    return JSON.parse(content) as VerificationSession;
  } catch {
    return null;
  }
}
