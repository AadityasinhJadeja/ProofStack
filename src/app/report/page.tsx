"use client";

import { useEffect, useMemo, useState } from "react";

import { mockVerificationSession } from "@/lib/mock/mockSession";
import type { ClaimVerdict, EvidenceSnippet, VerificationSession } from "@/lib/types/proofstack";

function VerdictBadge({ verdict }: { verdict: ClaimVerdict["verdict"] | "pending" }) {
  const className =
    verdict === "supported"
      ? "badge badge-supported"
      : verdict === "weak"
        ? "badge badge-weak"
        : verdict === "unsupported"
          ? "badge badge-unsupported"
          : "badge";

  return <span className={className}>{verdict}</span>;
}

function ScoreCard({ session }: { session: VerificationSession }) {
  return (
    <div className="panel stack">
      <h2>Trust Score</h2>
      <p className="score-value">{session.trustReport.trustScore}</p>
      <p>
        Supported: <strong>{session.trustReport.supportedCount}</strong> | Weak: <strong>{session.trustReport.weakCount}</strong> | Unsupported: <strong>{session.trustReport.unsupportedCount}</strong>
      </p>
      <p>
        Session: <code>{session.id}</code>
      </p>
    </div>
  );
}

export default function ReportPage() {
  const [session, setSession] = useState<VerificationSession>(mockVerificationSession);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedClaimId, setSelectedClaimId] = useState<string>(mockVerificationSession.claims[0]?.id ?? "");
  const [loadStatus, setLoadStatus] = useState<string>("Using fallback mock session.");

  useEffect(() => {
    let cancelled = false;

    async function loadLatestSession() {
      try {
        const response = await fetch("/api/verify/latest", { method: "GET" });

        if (!response.ok) {
          if (!cancelled) {
            setLoadStatus("No live session found. Showing fallback mock session.");
          }
          return;
        }

        const latest = (await response.json()) as VerificationSession;
        if (cancelled) {
          return;
        }

        setSession(latest);
        setSelectedClaimId(latest.claims[0]?.id ?? "");
        setLoadStatus("Loaded latest verification session.");
      } catch {
        if (!cancelled) {
          setLoadStatus("Could not load latest session. Showing fallback mock session.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadLatestSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const verdictByClaimId = useMemo(() => {
    const map = new Map<string, ClaimVerdict>();

    for (const verdict of session.claimVerdicts) {
      map.set(verdict.claimId, verdict);
    }

    return map;
  }, [session]);

  const evidenceByClaimId = useMemo(() => {
    const map = new Map<string, EvidenceSnippet[]>();

    for (const snippet of session.evidenceSnippets) {
      const existing = map.get(snippet.claimId) ?? [];
      existing.push(snippet);
      map.set(snippet.claimId, existing);
    }

    return map;
  }, [session]);

  const sourceNameById = useMemo(() => {
    const map = new Map<string, string>();

    for (const source of session.sources) {
      map.set(source.id, source.fileName);
    }

    return map;
  }, [session]);

  const selectedClaim = session.claims.find((claim) => claim.id === selectedClaimId);
  const selectedVerdict = selectedClaim ? verdictByClaimId.get(selectedClaim.id) : undefined;
  const selectedEvidence = selectedClaim ? evidenceByClaimId.get(selectedClaim.id) ?? [] : [];

  return (
    <section className="stack">
      <h1>Trust Report</h1>
      <p>{isLoading ? "Loading latest session..." : loadStatus}</p>

      <div className="report-summary-grid">
        <ScoreCard session={session} />

        <div className="panel stack">
          <h2>Top Risks</h2>
          {session.trustReport.topRisks.length > 0 ? (
            <ul>
              {session.trustReport.topRisks.map((risk, index) => (
                <li key={`${risk}-${index}`}>{risk}</li>
              ))}
            </ul>
          ) : (
            <p>No risks reported.</p>
          )}
        </div>
      </div>

      <div className="results-layout">
        <div className="panel stack">
          <h2>Claims</h2>
          <table>
            <thead>
              <tr>
                <th align="left">Claim</th>
                <th align="left">Verdict</th>
                <th align="left">Confidence</th>
                <th align="left">Inspect</th>
              </tr>
            </thead>
            <tbody>
              {session.claims.map((claim) => {
                const verdict = verdictByClaimId.get(claim.id);

                return (
                  <tr key={claim.id}>
                    <td>{claim.text}</td>
                    <td>
                      <VerdictBadge verdict={verdict?.verdict ?? "pending"} />
                    </td>
                    <td>{verdict ? verdict.confidence.toFixed(2) : "-"}</td>
                    <td>
                      <button type="button" onClick={() => setSelectedClaimId(claim.id)}>
                        Open
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <aside className="panel stack evidence-drawer">
          <h2>Claim Inspector</h2>

          {selectedClaim ? (
            <>
              <p>
                <strong>Claim</strong>
              </p>
              <pre>{selectedClaim.text}</pre>

              <p>
                <strong>Verdict</strong>
              </p>
              <VerdictBadge verdict={selectedVerdict?.verdict ?? "pending"} />

              <p>
                <strong>Confidence</strong>
              </p>
              <p>{selectedVerdict ? selectedVerdict.confidence.toFixed(2) : "-"}</p>

              <p>
                <strong>Explanation</strong>
              </p>
              <pre>{selectedVerdict?.explanation ?? "No explanation provided."}</pre>

              <p>
                <strong>Evidence Snippets</strong>
              </p>
              {selectedEvidence.length > 0 ? (
                selectedEvidence.map((snippet) => (
                  <div className="panel stack" key={snippet.id}>
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
            <p>Select a claim from the table.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
