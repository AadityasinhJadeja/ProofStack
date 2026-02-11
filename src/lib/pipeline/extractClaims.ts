import { callOpenAIChat } from "@/lib/llm/openaiChat";
import type { Claim, ClaimCriticality, ClaimType } from "@/lib/types/proofstack";
import { debugLog } from "@/lib/utils/debug";

const MAX_CLAIMS = 12;
const CLAIM_TYPES: ClaimType[] = ["fact", "number", "recommendation"];
const CRITICALITIES: ClaimCriticality[] = ["low", "medium", "high"];

interface ClaimsEnvelope {
  claims: Array<{
    text: string;
    claimType: ClaimType;
    criticality: ClaimCriticality;
  }>;
}

function isValidEnvelope(value: unknown): value is ClaimsEnvelope {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<ClaimsEnvelope>;
  if (!Array.isArray(candidate.claims)) {
    return false;
  }

  return candidate.claims.every((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }

    const typedItem = item as ClaimsEnvelope["claims"][number];

    return (
      typeof typedItem.text === "string" &&
      typedItem.text.trim().length > 0 &&
      CLAIM_TYPES.includes(typedItem.claimType) &&
      CRITICALITIES.includes(typedItem.criticality)
    );
  });
}

function toClaims(envelope: ClaimsEnvelope): Claim[] {
  return envelope.claims.slice(0, MAX_CLAIMS).map((item, index) => ({
    id: `claim-${index + 1}`,
    text: item.text.trim(),
    claimType: item.claimType,
    criticality: item.criticality,
  }));
}

function parseClaimsResponse(raw: string): Claim[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidEnvelope(parsed)) {
      return null;
    }

    return toClaims(parsed);
  } catch {
    return null;
  }
}

function fallbackClaims(draftText: string): Claim[] {
  const sentences = draftText
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 20)
    .slice(0, 3);

  const defaults =
    sentences.length > 0
      ? sentences
      : [
          "The incident shows high-volume failed login behavior requiring containment.",
          "Rate limiting and MFA controls appear to reduce immediate abuse.",
          "Evidence remains incomplete for full risk closure and needs verification.",
        ];

  return defaults.map((text, index) => ({
    id: `claim-${index + 1}`,
    text,
    claimType: "fact",
    criticality: index === 0 ? "high" : "medium",
  }));
}

async function extractClaimsAttempt(draftText: string): Promise<Claim[] | null> {
  const prompt =
    "Return strict JSON with this schema only: " +
    `{"claims":[{"text":"string","claimType":"fact|number|recommendation","criticality":"low|medium|high"}]}. ` +
    `Rules: max ${MAX_CLAIMS} claims, no markdown, no extra keys.`;

  const completion = await callOpenAIChat(
    [
      {
        role: "system",
        content: "Extract atomic, verifiable claims from cybersecurity analysis text.",
      },
      {
        role: "user",
        content: `${prompt}\n\nDRAFT ANSWER:\n${draftText}`,
      },
    ],
    { temperature: 0.1, jsonMode: true, maxTokens: 900 },
  );

  return parseClaimsResponse(completion);
}

/**
 * Converts a draft answer into atomic verification claims.
 * Includes strict JSON parsing guardrails, one retry, and deterministic fallback.
 */
export async function extractClaims(draftText: string): Promise<Claim[]> {
  try {
    const firstAttempt = await extractClaimsAttempt(draftText);
    if (firstAttempt && firstAttempt.length > 0) {
      return firstAttempt;
    }

    debugLog("extractClaims", "first_attempt_invalid_json");

    const retryAttempt = await extractClaimsAttempt(
      `${draftText}\n\nReminder: output must be valid strict JSON for the schema.`,
    );

    if (retryAttempt && retryAttempt.length > 0) {
      return retryAttempt;
    }
  } catch (error) {
    debugLog("extractClaims", "llm_attempt_failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
  }

  debugLog("extractClaims", "fallback_used");
  return fallbackClaims(draftText).slice(0, MAX_CLAIMS);
}
