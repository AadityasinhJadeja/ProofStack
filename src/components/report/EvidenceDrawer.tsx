import type { Claim, ClaimVerdict, EvidenceSnippet } from "@/lib/types/proofstack";

import { VerdictBadge } from "@/components/report/VerdictBadge";

interface EvidenceDrawerProps {
  claim: Claim | null;
  verdict?: ClaimVerdict;
  evidence: EvidenceSnippet[];
  sourceNameById: Map<string, string>;
}

export function EvidenceDrawer({ claim, verdict, evidence, sourceNameById }: EvidenceDrawerProps) {
  return (
    <aside className="panel stack evidence-drawer">
      <h2>Evidence Drawer</h2>

      {claim ? (
        <>
          <p>
            <strong>Claim</strong>
          </p>
          <pre>{claim.text}</pre>

          <p>
            <strong>Verdict</strong>
          </p>
          <VerdictBadge verdict={verdict?.verdict ?? "pending"} />

          <p>
            <strong>Confidence</strong>
          </p>
          <p>{verdict ? verdict.confidence.toFixed(2) : "-"}</p>

          <p>
            <strong>Explanation</strong>
          </p>
          <pre>{verdict?.explanation ?? "No explanation provided."}</pre>

          <p>
            <strong>Evidence Snippets</strong>
          </p>
          {evidence.length > 0 ? (
            evidence.map((snippet) => (
              <div className="panel stack" key={snippet.id}>
                <p>
                  <strong>ID:</strong> {snippet.id}
                </p>
                <p>
                  <strong>Source:</strong> {sourceNameById.get(snippet.sourceId) ?? snippet.sourceId}
                </p>
                <p>
                  <strong>Relevance:</strong> {snippet.relevanceScore.toFixed(3)}
                </p>
                <pre>{snippet.snippet}</pre>
              </div>
            ))
          ) : (
            <p>No evidence snippets found for this claim.</p>
          )}
        </>
      ) : (
        <p>Select a claim to inspect supporting evidence.</p>
      )}
    </aside>
  );
}
