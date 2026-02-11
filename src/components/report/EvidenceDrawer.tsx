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
          <div className="section-header">
            <p className="kicker">Claim</p>
            <pre>{claim.text}</pre>
          </div>

          <div className="section-header">
            <p className="kicker">Verdict</p>
            <VerdictBadge verdict={verdict?.verdict ?? "pending"} />
          </div>

          <div className="section-header">
            <p className="kicker">Confidence</p>
            <p>{verdict ? verdict.confidence.toFixed(2) : "-"}</p>
          </div>

          <div className="section-header">
            <p className="kicker">Explanation</p>
            <pre>{verdict?.explanation ?? "No explanation provided."}</pre>
          </div>

          <p className="kicker">Evidence Snippets</p>
          {evidence.length > 0 ? (
            evidence.map((snippet) => (
              <div className="evidence-item stack" key={snippet.id}>
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
            <p className="drawer-empty">No evidence snippets found for this claim.</p>
          )}
        </>
      ) : (
        <p className="drawer-empty">Select a claim to inspect supporting evidence.</p>
      )}
    </aside>
  );
}
