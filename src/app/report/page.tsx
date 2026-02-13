"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { ScoreExplainabilityPanel } from "@/components/report/ScoreExplainabilityPanel";
import { ScoreCard } from "@/components/report/ScoreCard";
import { computeImpactMetrics, computeTrustScoreBreakdown } from "@/lib/pipeline/scoreReport";
import { clearLastSession, getLastSession } from "@/lib/sessionStore";
import type { Claim, ClaimVerdict, VerificationSession } from "@/lib/types/proofstack";

interface EvidenceLineageItem {
  label: string;
  snippetId: string;
  claimId: string;
  sourceName: string;
  relevanceScore: number;
  chunkIds: string[];
  snippetText: string;
}

function parseEvidenceLabelMap(verifiedAnswer: string): Map<string, string> {
  const map = new Map<string, string>();
  const lines = verifiedAnswer.split("\n");

  for (const line of lines) {
    const match = line.trim().match(/^\[(E\d+)\]\s*=\s*(.+)$/);
    if (!match) {
      continue;
    }

    const [, label, snippetId] = match;
    map.set(label, snippetId.trim());
  }

  return map;
}

function stripEvidenceIndexSection(verifiedAnswer: string): string {
  const marker = "\nEvidence index:";
  const markerIndex = verifiedAnswer.indexOf(marker);

  if (markerIndex === -1) {
    return verifiedAnswer;
  }

  return verifiedAnswer.slice(0, markerIndex).trimEnd();
}

function sortEvidenceLabels(labels: string[]): string[] {
  return labels.sort((a, b) => {
    const aNum = Number.parseInt(a.replace(/[^\d]/g, ""), 10);
    const bNum = Number.parseInt(b.replace(/[^\d]/g, ""), 10);

    if (Number.isFinite(aNum) && Number.isFinite(bNum) && aNum !== bNum) {
      return aNum - bNum;
    }

    return a.localeCompare(b);
  });
}

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
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [infoMessage, setInfoMessage] = useState<string>("");
  const [selectedEvidenceLabel, setSelectedEvidenceLabel] = useState<string | null>(null);
  const evidenceLineageRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const latest = getLastSession();
    setSession(latest);
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

  const snippetById = useMemo(() => {
    const map = new Map<string, VerificationSession["evidenceSnippets"][number]>();

    if (!session) {
      return map;
    }

    for (const snippet of session.evidenceSnippets) {
      map.set(snippet.id, snippet);
    }

    return map;
  }, [session]);

  const evidenceLabelToSnippetId = useMemo(() => {
    if (!session) {
      return new Map<string, string>();
    }

    if (Array.isArray(session.evidenceReferences) && session.evidenceReferences.length > 0) {
      return new Map(session.evidenceReferences.map((reference) => [reference.label, reference.snippetId]));
    }

    // Backward compatibility for previously-saved sessions.
    return parseEvidenceLabelMap(session.verifiedAnswer);
  }, [session]);

  const evidenceLabels = useMemo(
    () => sortEvidenceLabels(Array.from(evidenceLabelToSnippetId.keys())),
    [evidenceLabelToSnippetId],
  );

  const evidenceLineageByLabel = useMemo(() => {
    const map = new Map<string, EvidenceLineageItem>();

    if (!session) {
      return map;
    }

    for (const [label, snippetId] of evidenceLabelToSnippetId.entries()) {
      const snippet = snippetById.get(snippetId);
      if (!snippet) {
        continue;
      }

      const chunkIds = session.chunks
        .filter((chunk) => chunk.sourceId === snippet.sourceId && chunk.text === snippet.snippet)
        .map((chunk) => chunk.id);

      map.set(label, {
        label,
        snippetId,
        claimId: snippet.claimId,
        sourceName: sourceNameById.get(snippet.sourceId) ?? snippet.sourceId,
        relevanceScore: snippet.relevanceScore,
        chunkIds,
        snippetText: snippet.snippet,
      });
    }

    return map;
  }, [session, evidenceLabelToSnippetId, snippetById, sourceNameById]);

  const selectedEvidenceLineage = selectedEvidenceLabel
    ? evidenceLineageByLabel.get(selectedEvidenceLabel) ?? null
    : null;

  function openEvidenceLineage(label: string): void {
    setSelectedEvidenceLabel(label);
    window.requestAnimationFrame(() => {
      evidenceLineageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function renderVerifiedAnswerWithRefs(text: string) {
    const parts = text.split(/(\[E\d+\])/g);

    return parts.map((part, index) => {
      const match = part.match(/^\[(E\d+)\]$/);
      if (!match) {
        return part;
      }

      const label = match[1];
      if (!evidenceLineageByLabel.has(label)) {
        return part;
      }

      const isActive = selectedEvidenceLabel === label;

      return (
        <button
          key={`${label}-${index}`}
          type="button"
          className={isActive ? "evidence-ref-button evidence-ref-button-active" : "evidence-ref-button"}
          onClick={() => openEvidenceLineage(label)}
          aria-label={`Open evidence lineage for ${part}`}
        >
          {part}
        </button>
      );
    });
  }

  const weakCount = session?.trustReport.weakCount ?? 0;
  const unsupportedCount = session?.trustReport.unsupportedCount ?? 0;
  const riskClaim = session ? highestRiskClaim(session.claims, verdictByClaimId) : null;
  const scoreBreakdown = useMemo(() => {
    if (!session) {
      return null;
    }

    return session.trustReport.scoreBreakdown ?? computeTrustScoreBreakdown(session.claims, session.claimVerdicts);
  }, [session]);
  const impactMetrics = useMemo(() => {
    if (!session) {
      return null;
    }

    return session.trustReport.impactMetrics ?? computeImpactMetrics(session.claims, session.claimVerdicts);
  }, [session]);
  const verifiedAnswerForDisplay = useMemo(
    () => (session ? stripEvidenceIndexSection(session.verifiedAnswer) : ""),
    [session],
  );
  const createdAtLabel = useMemo(() => {
    if (!session) {
      return "";
    }

    const createdAtDate = new Date(session.createdAt);
    if (Number.isNaN(createdAtDate.getTime())) {
      return session.createdAt;
    }

    return createdAtDate.toLocaleString();
  }, [session]);

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

  async function handleClearReport() {
    if (!session || isClearing) {
      return;
    }

    setIsClearing(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      clearLastSession();
      const response = await fetch("/api/verify/latest", { method: "DELETE" });
      if (!response.ok) {
        throw new Error(`Clear failed with status ${response.status}`);
      }
      setSession(null);
      setSelectedEvidenceLabel(null);
      setInfoMessage("Report cleared. You can run your next analysis when ready.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to clear report.");
    } finally {
      setIsClearing(false);
    }
  }

  if (isLoading) {
    return (
      <section className="stack">
        <h1 className="page-heading">Trust Report</h1>
        <p className="helper-line">Loading latest session...</p>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="stack">
        <h1 className="page-heading">Trust Report</h1>
        {infoMessage ? <p className="status-banner">{infoMessage}</p> : null}
        <div className="panel stack empty-state">
          <p>No verification session found.</p>
          <p className="helper-line">Run verification on Home first, then return here to inspect the report.</p>
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
      <div className="panel panel-raised report-hero-shell">
        <div className="report-hero-copy stack">
          <p className="kicker">Report Artifact</p>
          <h1 className="page-heading">Trust Report</h1>
          <p className="page-subtitle report-hero-subtitle">
            Review score, claim-level verdicts, and source evidence before sharing conclusions.
          </p>
          <div className="report-meta-row">
            <span className="report-meta-pill">Session: {session.id.slice(0, 8)}</span>
            <span className="report-meta-pill">Created: {createdAtLabel}</span>
            <span className="report-meta-pill">Domain: {session.domain}</span>
            <span className="report-meta-pill">Strictness: {session.strictness}</span>
            <span className="report-meta-pill report-meta-pill-strong">
              Trust Score: {session.trustReport.trustScore}/100
            </span>
            {session.challengeMode ? (
              <span className="report-meta-pill report-meta-pill-warn">Challenge mode</span>
            ) : null}
          </div>
        </div>

        <div className="report-hero-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={handleExport}
            disabled={isExporting || isClearing}
          >
            {isExporting ? "Exporting..." : "Export Report"}
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={handleClearReport}
            disabled={isClearing || isExporting}
          >
            {isClearing ? "Clearing..." : "Clear Report"}
          </button>
        </div>
      </div>

      {errorMessage ? (
        <p role="alert" className="alert">
          {errorMessage}
        </p>
      ) : null}
      {infoMessage ? <p className="status-banner">{infoMessage}</p> : null}

      {session.challengeMode ? (
        <p className="status-banner">
          Challenge demo mode active: one intentionally false claim was injected to validate that ProofStack flags unsupported/contradictory output.
        </p>
      ) : null}

      <div className="report-summary-grid">
        <ScoreCard session={session} />

        <div className="panel stack">
          <h2>Top Risks</h2>
          <p className="helper-line">
            Focus on weak and unsupported claims first. These are the likely failure points for downstream decisions.
          </p>
          <p>
            Weak claims: <strong>{weakCount}</strong>
          </p>
          <p>
            Unsupported claims: <strong>{unsupportedCount}</strong>
          </p>
          <p>
            Highest-risk claim: <strong>{riskClaim ? riskClaim.text : "None"}</strong>
          </p>
          <p className="section-note">
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

      {impactMetrics ? (
        <div className="panel stack">
          <h2>Quantified Impact</h2>
          <p className="helper-line">
            Converts verification output into decision metrics your reviewers can act on quickly.
          </p>
          <div className="metric-row">
            <span className="metric-pill">Supported claims: {impactMetrics.supportedRatePct}%</span>
            <span className="metric-pill">
              Critical unsupported: {impactMetrics.criticalUnsupportedCount}
            </span>
            <span className="metric-pill">
              Estimated review time: {impactMetrics.estimatedReviewMinutes} min
            </span>
          </div>
          <p className="section-note">
            Review-time estimate formula: <code>{impactMetrics.reviewTimeFormula}</code>
          </p>
        </div>
      ) : null}

      {scoreBreakdown ? <ScoreExplainabilityPanel breakdown={scoreBreakdown} /> : null}

      <div className="panel stack panel-raised">
        <div style={{ borderLeft: '4px solid var(--accent)', paddingLeft: '16px' }}>
          <h2>Audit Outcome: Draft vs Verified</h2>
          <p className="helper-line">
            See how the verification engine qualified the initial AI response based on ground-truth evidence.
          </p>
        </div>
        <div className="compare-grid" style={{ marginTop: '12px' }}>
          <div className="compare-block" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <span>📝</span> Draft Answer (Unverified)
            </h3>
            <pre style={{ marginTop: '12px', fontSize: '1rem', color: 'var(--text-secondary)', opacity: 0.8 }}>{session.draftAnswer}</pre>
          </div>
          <div className="compare-block" style={{ background: 'var(--success-soft)', border: '1px solid var(--success)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--success)', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Verified</div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
              <span>🛡️</span> Verified Answer
            </h3>
            <pre style={{ marginTop: '12px', fontSize: '1rem', fontWeight: 500 }}>
              {renderVerifiedAnswerWithRefs(verifiedAnswerForDisplay)}
            </pre>
          </div>
        </div>
      </div>

      {selectedEvidenceLineage ? (
        <section ref={evidenceLineageRef} className="panel stack evidence-lineage-panel">
          <div className="evidence-lineage-header">
            <div>
              <h2>Evidence Lineage</h2>
              <p className="helper-line">
                You opened [{selectedEvidenceLineage.label}] from the verified answer.
              </p>
            </div>
            <button
              type="button"
              className="button-secondary"
              onClick={() => setSelectedEvidenceLabel(null)}
            >
              Close
            </button>
          </div>

          <div className="evidence-item stack">
            <p>
              <strong>Reference:</strong> [{selectedEvidenceLineage.label}]
            </p>
            <p>
              <strong>Snippet ID:</strong> {selectedEvidenceLineage.snippetId}
            </p>
            <p>
              <strong>Claim ID:</strong> {selectedEvidenceLineage.claimId}
            </p>
            <p>
              <strong>Source:</strong> {selectedEvidenceLineage.sourceName}
            </p>
            <p>
              <strong>Relevance:</strong> {selectedEvidenceLineage.relevanceScore.toFixed(3)}
            </p>
            <p>
              <strong>Chunk IDs:</strong>{" "}
              {selectedEvidenceLineage.chunkIds.length > 0
                ? selectedEvidenceLineage.chunkIds.join(", ")
                : "Unavailable"}
            </p>
            <pre>{selectedEvidenceLineage.snippetText}</pre>
          </div>
        </section>
      ) : evidenceLabels.length > 0 ? (
        <p className="helper-line">
          Click any <code>[E#]</code> citation in Verified Answer to open its evidence lineage.
        </p>
      ) : (
        <p className="drawer-empty">No evidence references were found in the verified answer.</p>
      )}

      <details className="panel">
        <summary>Show debug details</summary>
        <div className="stack debug-block">
          <p>
            Sources loaded: <strong>{session.sources.length}</strong> | Total chunks:{" "}
            <strong>{session.chunks.length}</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Chunks</th>
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
        </div>
      </details>
    </section>
  );
}
