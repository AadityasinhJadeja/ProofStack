import type { ClaimVerdict } from "@/lib/types/proofstack";

export interface RedlineOutput {
  verifiedText: string;
  diffText: string;
}

/**
 * Rewrites the draft answer using only supported evidence and returns a diff artifact.
 */
export async function redlineAnswer(
  draftText: string,
  verificationResults: ClaimVerdict[],
): Promise<RedlineOutput> {
  // TODO(Phase 8): rewrite using only supported claims and caveat weak claims.
  // TODO(Phase 8): remove unsupported content and compute a draft-vs-verified diff.
  void draftText;
  void verificationResults;
  return { verifiedText: "", diffText: "" };
}
