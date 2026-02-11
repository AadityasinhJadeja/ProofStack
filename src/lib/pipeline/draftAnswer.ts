export interface DraftAnswerInput {
  question: string;
  template?: string;
}

export interface DraftAnswerOutput {
  draftText: string;
}

/**
 * Produces the first-pass answer that will be verified downstream.
 */
export async function draftAnswer(input: DraftAnswerInput): Promise<DraftAnswerOutput> {
  // TODO(Phase 2): add question input templates for incident analysis and risk summary.
  // TODO(Phase 2): generate a human-readable draft answer and store it in session state.
  void input;
  return { draftText: "" };
}
