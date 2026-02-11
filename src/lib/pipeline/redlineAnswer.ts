import type { Claim, ClaimVerdict, EvidenceSnippet } from "@/lib/types/proofstack";

export interface RedlineOutput {
  verifiedText: string;
  diffText: string;
}

function toSentence(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "";
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function createEvidenceLabeler() {
  const labelBySnippetId = new Map<string, string>();
  let next = 1;

  function labelFor(snippetId: string): string {
    const existing = labelBySnippetId.get(snippetId);
    if (existing) {
      return existing;
    }

    const label = `E${next}`;
    next += 1;
    labelBySnippetId.set(snippetId, label);
    return label;
  }

  return {
    labelFor,
    entries(): Array<[string, string]> {
      return Array.from(labelBySnippetId.entries());
    },
  };
}

function refsForClaim(
  verdict: ClaimVerdict | undefined,
  evidenceById: Map<string, EvidenceSnippet>,
  labelFor: (snippetId: string) => string,
): string {
  const ids = verdict?.evidenceSnippetIds ?? [];
  const validIds = ids.filter((id) => evidenceById.has(id));

  if (validIds.length === 0) {
    return "";
  }

  return ` ${validIds.map((id) => `[${labelFor(id)}]`).join(" ")}`;
}

/**
 * Rewrites the draft answer into a verified answer based on claim verdicts and evidence links.
 */
export function redlineAnswer(
  draftText: string,
  claims: Claim[],
  claimVerdicts: ClaimVerdict[],
  evidenceSnippets: EvidenceSnippet[],
): RedlineOutput {
  const verdictByClaimId = new Map(claimVerdicts.map((verdict) => [verdict.claimId, verdict]));
  const evidenceById = new Map(evidenceSnippets.map((snippet) => [snippet.id, snippet]));
  const labeler = createEvidenceLabeler();

  const supportedLines: string[] = [];
  const weakLines: string[] = [];
  const unsupportedLines: string[] = [];

  for (const claim of claims) {
    const verdict = verdictByClaimId.get(claim.id);
    const refs = refsForClaim(verdict, evidenceById, labeler.labelFor);
    const base = toSentence(claim.text);

    if (!base) {
      continue;
    }

    if (verdict?.verdict === "supported") {
      supportedLines.push(`- ${base}${refs}`);
      continue;
    }

    if (verdict?.verdict === "weak") {
      weakLines.push(`- Likely: ${base} (insufficient evidence for full confidence).${refs}`);
      continue;
    }

    unsupportedLines.push(`- Uncertain: ${base} (not supported by available evidence).${refs}`);
  }

  const sections: string[] = [];

  sections.push("Verified Answer");
  sections.push("");

  if (supportedLines.length > 0) {
    sections.push("Evidence-supported points:");
    sections.push(...supportedLines);
    sections.push("");
  } else {
    sections.push(
      "No claims are currently evidence-supported enough for a definitive verified answer.",
    );
    sections.push("");
  }

  if (weakLines.length > 0) {
    sections.push("Qualified points (weak evidence):");
    sections.push(...weakLines);
    sections.push("");
  }

  if (unsupportedLines.length > 0) {
    sections.push("Uncertain or unsupported points:");
    sections.push(...unsupportedLines);
    sections.push("");
  }

  const evidenceIndex = labeler.entries();
  if (evidenceIndex.length > 0) {
    sections.push("Evidence index:");
    sections.push(...evidenceIndex.map(([snippetId, label]) => `[${label}] = ${snippetId}`));
  }

  const verifiedText = sections.join("\n").trim();
  const diffText = `Draft length: ${draftText.length} chars\nVerified length: ${verifiedText.length} chars`;

  return { verifiedText, diffText };
}
