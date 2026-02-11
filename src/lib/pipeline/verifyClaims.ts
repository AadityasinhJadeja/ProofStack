import { callOpenAIChat } from "@/lib/llm/openaiChat";
import type { Claim, EvidenceSnippet } from "@/lib/types/proofstack";
import { debugLog } from "@/lib/utils/debug";

type Verdict = "supported" | "weak" | "unsupported";

export interface VerificationResult {
  claimId: string;
  verdict: Verdict;
  confidence: number;
  reason: string;
  evidenceIds: string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function validateVerifyOutput(raw: string): Omit<VerificationResult, "claimId"> | null {
  try {
    const parsed = JSON.parse(raw) as Partial<Omit<VerificationResult, "claimId">>;

    if (
      parsed.verdict !== "supported" &&
      parsed.verdict !== "weak" &&
      parsed.verdict !== "unsupported"
    ) {
      return null;
    }

    if (typeof parsed.confidence !== "number") {
      return null;
    }

    if (typeof parsed.reason !== "string" || parsed.reason.trim().length === 0) {
      return null;
    }

    if (
      !Array.isArray(parsed.evidenceIds) ||
      !parsed.evidenceIds.every((id: unknown) => typeof id === "string")
    ) {
      return null;
    }

    return {
      verdict: parsed.verdict,
      confidence: clamp(parsed.confidence, 0, 1),
      reason: parsed.reason.trim(),
      evidenceIds: parsed.evidenceIds,
    };
  } catch {
    return null;
  }
}

function fallbackVerdict(claim: Claim, snippets: EvidenceSnippet[]): VerificationResult {
  const maxScore = snippets.reduce((max, snippet) => Math.max(max, snippet.relevanceScore), 0);

  let verdict: VerificationResult["verdict"] = "unsupported";
  if (maxScore >= 0.55) {
    verdict = "supported";
  } else if (maxScore >= 0.3) {
    verdict = "weak";
  }

  return {
    claimId: claim.id,
    verdict,
    confidence: clamp(maxScore, 0.2, 0.85),
    reason: "Fallback verdict based on keyword overlap score (LLM verification unavailable).",
    evidenceIds: snippets.map((snippet) => snippet.id),
  };
}

async function verifySingleClaim(claim: Claim, snippets: EvidenceSnippet[]): Promise<VerificationResult> {
  if (snippets.length === 0) {
    return {
      claimId: claim.id,
      verdict: "unsupported",
      confidence: 0,
      reason: "No evidence snippets were retrieved for this claim.",
      evidenceIds: [],
    };
  }

  const evidenceBlock = snippets
    .map(
      (snippet) =>
        `ID: ${snippet.id}\nSOURCE: ${snippet.sourceId}\nRELEVANCE: ${snippet.relevanceScore.toFixed(3)}\nTEXT: ${snippet.snippet.slice(0, 900)}`,
    )
    .join("\n\n---\n\n");

  try {
    const completion = await callOpenAIChat(
      [
        {
          role: "system",
          content:
            "You are a strict claim verifier. Judge support only from provided snippets. Never use outside knowledge.",
        },
        {
          role: "user",
          content:
            "Return strict JSON only: " +
            '{"verdict":"supported|weak|unsupported","confidence":0..1,"reason":"string","evidenceIds":["snippet-id"]}.\n\n' +
            `CLAIM:\n${claim.text}\n\nEVIDENCE SNIPPETS:\n${evidenceBlock}\n\n` +
            "Only include evidenceIds that appear in provided snippet IDs.",
        },
      ],
      { temperature: 0.1, jsonMode: true, maxTokens: 350 },
    );

    const parsed = validateVerifyOutput(completion);
    if (!parsed) {
      debugLog("verifyClaims", "invalid_json_fallback", { claimId: claim.id });
      return fallbackVerdict(claim, snippets);
    }

    const allowedIds = new Set(snippets.map((snippet) => snippet.id));
    const evidenceSnippetIds = parsed.evidenceIds.filter((id) => allowedIds.has(id)).slice(0, 3);

    return {
      claimId: claim.id,
      verdict: parsed.verdict,
      confidence: parsed.confidence,
      reason: parsed.reason,
      evidenceIds: evidenceSnippetIds,
    };
  } catch (error) {
    debugLog("verifyClaims", "llm_error_fallback", {
      claimId: claim.id,
      error: error instanceof Error ? error.message : "unknown",
    });
    return fallbackVerdict(claim, snippets);
  }
}

/**
 * Verifies each claim against top evidence snippets using an LLM with strict JSON parsing.
 */
export async function verifyClaims(
  claims: Claim[],
  evidenceByClaimId: Map<string, EvidenceSnippet[]>,
): Promise<VerificationResult[]> {
  const results = await Promise.all(
    claims.map((claim) => verifySingleClaim(claim, evidenceByClaimId.get(claim.id) ?? [])),
  );

  return results;
}
