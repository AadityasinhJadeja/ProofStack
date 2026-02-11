"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ClaimTable } from "@/components/report/ClaimTable";
import { EvidenceDrawer } from "@/components/report/EvidenceDrawer";
import { ScoreCard } from "@/components/report/ScoreCard";
import { getLastSession } from "@/lib/sessionStore";
import type { Claim, ClaimVerdict, EvidenceSnippet, VerificationSession } from "@/lib/types/proofstack";

function highestRiskClaim(claims: Claim[], verdictByClaimId: Map<string, ClaimVerdict>): Claim | null {
  const rank = (claim: Claim): number => {
    const verdict = verdictByClaimId.get(claim.id)?.verdict ?? "pending";

    if (verdict === "unsupported" && claim.criticality === "high") {
      return 4;
    }

    if (verdict === "unsupported") {
      return 3;
    }

    if (verdict === "weak" && claim.criticality === "high") {
      return 2;
    }

    if (verdict === "weak") {
      return 1;
    }

    return 0;
  };

  const sorted = [...claims].sort((a, b) => rank(b) - rank(a));
  return sorted[0] ?? null;
}

export default function ReportPage() {
  const [session, setSession] = useState<VerificationSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const latest = getLastSession();
    setSession(latest);
    setSelectedClaimId(latest?.claims[0]?.id ?? null);
    setIsLoading(false);
  }, []);

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

  const sourceNameById = useMemo(() => {
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

  const selectedClaim = session?.claims.find((claim) => claim.id === selectedClaimId) ?? null;
  const selectedVerdict = selectedClaim ? verdictByClaimId.get(selectedClaim.id) : undefined;
  const selectedEvidence = selectedClaim ? evidenceByClaimId.get(selectedClaim.id) ?? [] : [];

  const weakCount = session?.trustReport.weakCount ?? 0;
  const unsupportedCount = session?.trustReport.unsupportedCount ?? 0;
  const riskClaim = session ? highestRiskClaim(session.claims, verdictByClaimId) : null;

  async function handleExport() {
    if (!session) {
      return;
    }

    setIsExporting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(session),
      });

      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const contentDisposition = response.headers.get("Content-Disposition") ?? "";
      const fileNameMatch = contentDisposition.match(/filename=\"([^\"]+)\"/i);
      const fileName = fileNameMatch?.[1] ?? `proofstack-trust-report-${session.id}.md`;

      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = fileName;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setIsExporting(false);
    }
  }

  if (isLoading) {
    return (
      <section className="stack">
        <h1>Trust Report</h1>
        <p>Loading latest session...</p>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="stack">
        <h1>Trust Report</h1>
        <div className="panel stack">
          <p>No verification session found.</p>
          <div>
            <Link href="/" className="button-link">
              Go to Home to run verification
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="stack">
      <h1>Trust Report</h1>

      <div>
        <button type="button" onClick={handleExport} disabled={isExporting}>
          {isExporting ? "Exporting..." : "Export Report"}
        </button>
      </div>
      {errorMessage ? <p role="alert">{errorMessage}</p> : null}

      <div className="report-summary-grid">
        <ScoreCard session={session} />

        <div className="panel stack">
          <h2>Top Risks</h2>
          <p>
            Weak claims: <strong>{weakCount}</strong>
          </p>
          <p>
            Unsupported claims: <strong>{unsupportedCount}</strong>
          </p>
          <p>
            Highest-risk claim: <strong>{riskClaim ? riskClaim.text : "None"}</strong>
          </p>
          <p>
            Risk note: Claims with weak or unsupported verdicts require manual analyst review before action.
          </p>
          {session.trustReport.topRisks.length > 0 ? (
            <ul>
              {session.trustReport.topRisks.map((risk, index) => (
                <li key={`${risk}-${index}`}>{risk}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="panel stack">
        <h2>Draft vs Verified</h2>
        <div className="compare-grid">
          <div className="compare-block">
            <h3>Draft Answer</h3>
            <pre>{session.draftAnswer}</pre>
          </div>
          <div className="compare-block">
            <h3>Verified Answer</h3>
            <pre>{session.verifiedAnswer}</pre>
          </div>
        </div>
      </div>

      <div className="results-layout">
        <div className="panel stack">
          <h2>Claims</h2>
          <ClaimTable
            claims={session.claims}
            verdictByClaimId={verdictByClaimId}
            onViewEvidence={(claimId) => setSelectedClaimId(claimId)}
            selectedClaimId={selectedClaimId}
          />
        </div>

        <EvidenceDrawer
          claim={selectedClaim}
          verdict={selectedVerdict}
          evidence={selectedEvidence}
          sourceNameById={sourceNameById}
        />
      </div>

      <details className="panel">
        <summary>Show debug details</summary>
        <div className="stack" style={{ marginTop: "12px" }}>
          <p>
            Sources loaded: <strong>{session.sources.length}</strong> | Total chunks: <strong>{session.chunks.length}</strong>
          </p>
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
        </div>
      </details>
    </section>
  );
}
