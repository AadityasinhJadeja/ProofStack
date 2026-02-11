"use client";

import { FormEvent, useMemo, useState } from "react";

import type {
  ClaimVerdict,
  DomainPreset,
  EvidenceSnippet,
  StrictnessPreset,
  VerificationSession,
} from "@/lib/types/proofstack";

const DOMAIN_OPTIONS: DomainPreset[] = ["Cyber/Security"];
const STRICTNESS_OPTIONS: StrictnessPreset[] = ["Fast", "Balanced", "Strict"];
const DEFAULT_QUESTION = "Analyze this incident and recommend remediation steps.";

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

export default function HomePage() {
  const [question, setQuestion] = useState<string>(DEFAULT_QUESTION);
  const [domain, setDomain] = useState<DomainPreset>("Cyber/Security");
  const [strictness, setStrictness] = useState<StrictnessPreset>("Balanced");
  const [session, setSession] = useState<VerificationSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const verdictByClaimId = useMemo(() => {
    const map = new Map<string, ClaimVerdict>();

    if (!session) {
      return map;
    }

    for (const verdict of session.claimVerdicts) {
      map.set(verdict.claimId, verdict);
    }

    return map;
  }, [session]);

  const evidenceByClaimId = useMemo(() => {
    const map = new Map<string, EvidenceSnippet[]>();

    if (!session) {
      return map;
    }

    for (const snippet of session.evidenceSnippets) {
      const existing = map.get(snippet.claimId) ?? [];
      existing.push(snippet);
      map.set(snippet.claimId, existing);
    }

    return map;
  }, [session]);

  const sourceFileById = useMemo(() => {
    const map = new Map<string, string>();

    if (!session) {
      return map;
    }

    for (const source of session.sources) {
      map.set(source.id, source.fileName);
    }

    return map;
  }, [session]);

  const chunkCountBySourceId = useMemo(() => {
    const counts = new Map<string, number>();

    if (!session) {
      return counts;
    }

    for (const chunk of session.chunks) {
      counts.set(chunk.sourceId, (counts.get(chunk.sourceId) ?? 0) + 1);
    }

    return counts;
  }, [session]);

  const selectedEvidence = selectedClaimId ? evidenceByClaimId.get(selectedClaimId) ?? [] : [];
  const selectedClaim = selectedClaimId
    ? session?.claims.find((claim) => claim.id === selectedClaimId) ?? null
    : null;

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          useDemoDataset: true,
          domain,
          strictness,
        }),
      });

      if (!response.ok) {
        throw new Error(`Verify request failed with status ${response.status}`);
      }

      const data = (await response.json()) as VerificationSession;
      setSession(data);
      setSelectedClaimId(data.claims[0]?.id ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown verify error";
      setErrorMessage(message);
      setSession(null);
      setSelectedClaimId(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="stack">
      <h1>ProofStack Home</h1>

      <div className="panel stack">
        <h2>Upload</h2>
        <p>Phase 2 placeholder for source ingestion UI.</p>
        <input type="file" disabled aria-label="Upload source documents" />
      </div>

      <form className="panel stack" onSubmit={handleVerify}>
        <h2>Ask</h2>
        <p>Runs end-to-end verify pipeline on demo dataset.</p>

        <label htmlFor="question">Question</label>
        <textarea
          id="question"
          rows={4}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />

        <label htmlFor="domain">Domain</label>
        <select
          id="domain"
          value={domain}
          onChange={(event) => setDomain(event.target.value as DomainPreset)}
        >
          {DOMAIN_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label htmlFor="strictness">Strictness</label>
        <select
          id="strictness"
          value={strictness}
          onChange={(event) => setStrictness(event.target.value as StrictnessPreset)}
        >
          {STRICTNESS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Running verify pipeline..." : "Load sample dataset"}
        </button>

        {errorMessage ? <p role="alert">{errorMessage}</p> : null}
      </form>

      {session ? (
        <div className="stack">
          <div className="panel stack">
            <h2>Draft Answer</h2>
            <pre>{session.draftAnswer}</pre>
          </div>

          <div className="panel stack">
            <h2>Trust Report</h2>
            <p>
              Trust score: <strong>{session.trustReport.trustScore}</strong>
            </p>
            <p>
              Supported: <strong>{session.trustReport.supportedCount}</strong> | Weak: <strong>{session.trustReport.weakCount}</strong> | Unsupported: <strong>{session.trustReport.unsupportedCount}</strong>
            </p>
          </div>

          <div className="panel stack">
            <h2>Debug: Loaded Sources + Chunk Count</h2>
            {session.sources.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th align="left">Source</th>
                    <th align="left">Chunks</th>
                  </tr>
                </thead>
                <tbody>
                  {session.sources.map((source) => (
                    <tr key={source.id}>
                      <td>{source.fileName}</td>
                      <td>{chunkCountBySourceId.get(source.id) ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No demo sources loaded.</p>
            )}
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
                    <th align="left">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {session.claims.map((claim) => {
                    const verdict = verdictByClaimId.get(claim.id);
                    const evidenceCount = evidenceByClaimId.get(claim.id)?.length ?? 0;

                    return (
                      <tr key={claim.id}>
                        <td>{claim.text}</td>
                        <td>
                          <VerdictBadge verdict={verdict?.verdict ?? "pending"} />
                        </td>
                        <td>{verdict ? verdict.confidence.toFixed(2) : "-"}</td>
                        <td>
                          <button type="button" onClick={() => setSelectedClaimId(claim.id)}>
                            View ({evidenceCount})
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <aside className="panel stack evidence-drawer">
              <h3>Evidence Drawer</h3>
              {selectedClaim ? <p><strong>Claim:</strong> {selectedClaim.text}</p> : <p>Select a claim.</p>}

              {selectedEvidence.length > 0 ? (
                selectedEvidence.map((snippet) => (
                  <div className="panel stack" key={snippet.id}>
                    <p>
                      <strong>ID:</strong> {snippet.id}
                    </p>
                    <p>
                      <strong>Source:</strong> {sourceFileById.get(snippet.sourceId) ?? snippet.sourceId}
                    </p>
                    <p>
                      <strong>Relevance:</strong> {snippet.relevanceScore.toFixed(3)}
                    </p>
                    <pre>{snippet.snippet}</pre>
                  </div>
                ))
              ) : (
                <p>No evidence loaded for this claim.</p>
              )}
            </aside>
          </div>
        </div>
      ) : null}
    </section>
  );
}
