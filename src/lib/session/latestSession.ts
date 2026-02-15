import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { VerificationSession } from "@/lib/types/proofstack";

const SESSION_DIR =
  process.env.NODE_ENV === "production"
    ? path.join(os.tmpdir(), "proofstack-sessions")
    : path.join(process.cwd(), ".proofstack");

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
    const parsed = JSON.parse(content) as Partial<VerificationSession>;

    if (
      typeof parsed.id !== "string" ||
      typeof parsed.createdAt !== "string" ||
      typeof parsed.question !== "string" ||
      typeof parsed.draftAnswer !== "string"
    ) {
      return null;
    }

    return {
      ...(parsed as VerificationSession),
      verifiedAnswer:
        typeof parsed.verifiedAnswer === "string" && parsed.verifiedAnswer.trim().length > 0
          ? parsed.verifiedAnswer
          : parsed.draftAnswer,
    };
  } catch {
    return null;
  }
}

/**
 * Removes the persisted latest verification session if present.
 */
export async function clearLatestSession(): Promise<void> {
  try {
    await unlink(SESSION_FILE);
  } catch {
    // No-op if session file does not exist.
  }
}
