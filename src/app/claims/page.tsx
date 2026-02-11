"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ClaimTable } from "@/components/report/ClaimTable";
import { EvidenceDrawer } from "@/components/report/EvidenceDrawer";
import { getLastSession } from "@/lib/sessionStore";
import type { Claim, ClaimVerdict, EvidenceSnippet, VerificationSession } from "@/lib/types/proofstack";

type ClaimFilter = "all" | "supported" | "weak" | "unsupported";

export default function ClaimsPage() {
  const [session, setSession] = useState<VerificationSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<ClaimFilter>("all");
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

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

  const filteredClaims = useMemo(() => {
    if (!session) {
      return [] as Claim[];
    }

    if (filter === "all") {
      return session.claims;
    }

    return session.claims.filter((claim) => verdictByClaimId.get(claim.id)?.verdict === filter);
  }, [filter, session, verdictByClaimId]);

  const selectedClaim = session?.claims.find((claim) => claim.id === selectedClaimId) ?? null;
  const selectedVerdict = selectedClaim ? verdictByClaimId.get(selectedClaim.id) : undefined;
  const selectedEvidence = selectedClaim ? evidenceByClaimId.get(selectedClaim.id) ?? [] : [];

  if (isLoading) {
    return (
      <section className="stack">
        <h1 className="page-heading">Claims</h1>
        <p className="helper-line">Loading latest session...</p>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="stack">
        <h1 className="page-heading">Claims</h1>
        <div className="panel stack empty-state">
          <p>No verification session found.</p>
          <p className="helper-line">Run verification on Home first, then return here to review claim evidence.</p>
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
      <div className="section-header">
        <p className="kicker">Claim Audit</p>
        <h1 className="page-heading">Claims</h1>
        <p className="page-subtitle">
          Filter and inspect claim verdicts. Click any row to open supporting evidence in the drawer.
        </p>
      </div>

      <div className="panel stack">
        <h2>Filter</h2>
        <div className="filter-row">
          {(["all", "supported", "weak", "unsupported"] as ClaimFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              className={filter === option ? "filter-button filter-button-active" : "filter-button"}
              onClick={() => setFilter(option)}
            >
              {option === "all" ? "All" : option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="results-layout">
        <div className="panel stack">
          <h2>Claims Table</h2>
          <p className="helper-line">Showing {filteredClaims.length} claim(s) for the selected filter.</p>
          <ClaimTable
            claims={filteredClaims}
            verdictByClaimId={verdictByClaimId}
            onViewEvidence={(claimId) => setSelectedClaimId(claimId)}
            selectedClaimId={selectedClaimId}
            emptyText="No claims match this filter."
          />
        </div>

        <EvidenceDrawer
          claim={selectedClaim}
          verdict={selectedVerdict}
          evidence={selectedEvidence}
          sourceNameById={sourceNameById}
        />
      </div>
    </section>
  );
}
