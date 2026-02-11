import { callOpenAIChat } from "@/lib/llm/openaiChat";
import type { DomainPreset, SourceDoc, StrictnessPreset } from "@/lib/types/proofstack";
import { debugLog } from "@/lib/utils/debug";

export interface DraftAnswerInput {
  question: string;
  template?: string;
  domain?: DomainPreset;
  strictness?: StrictnessPreset;
  sources?: SourceDoc[];
}

export interface DraftAnswerOutput {
  draftText: string;
}

function fallbackDraftAnswer(input: DraftAnswerInput): DraftAnswerOutput {
  const sourceNames = (input.sources ?? []).map((source) => source.fileName).join(", ");

  return {
    draftText:
      "Draft answer fallback (LLM unavailable). " +
      `Question: ${input.question}. ` +
      (sourceNames ? `Sources loaded: ${sourceNames}. ` : "No sources loaded. ") +
      "The incident appears to involve suspicious authentication traffic, temporary containment actions, and unresolved risk requiring verification.",
  };
}

/**
 * Produces the first-pass answer that will be verified downstream.
 */
export async function draftAnswer(input: DraftAnswerInput): Promise<DraftAnswerOutput> {
  const sourcesBlock = (input.sources ?? [])
    .map((source) => `SOURCE: ${source.fileName}\n${source.content.slice(0, 2500)}`)
    .join("\n\n");

  const strictness = input.strictness ?? "Balanced";

  try {
    const completion = await callOpenAIChat(
      [
        {
          role: "system",
          content:
            "You are a cybersecurity incident analyst. Produce a concise, structured draft answer grounded in the provided sources. Do not fabricate facts.",
        },
        {
          role: "user",
          content:
            `Domain: ${input.domain ?? "Cyber/Security"}\n` +
            `Strictness: ${strictness}\n` +
            `Question: ${input.question}\n\n` +
            "Use only these source excerpts:\n" +
            `${sourcesBlock || "(No source excerpts provided)"}\n\n` +
            "Return plain text only, 2-4 short paragraphs with concrete claims that can be verified.",
        },
      ],
      { temperature: 0.2, maxTokens: 700 },
    );

    return { draftText: completion.trim() };
  } catch (error) {
    debugLog("draftAnswer", "fallback_used", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return fallbackDraftAnswer(input);
  }
}
