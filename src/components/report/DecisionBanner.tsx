"use client";

import Link from "next/link";

import type { ReportDecision } from "@/lib/report/decision";

interface DecisionBannerProps {
  decision: ReportDecision;
}

export function DecisionBanner({ decision }: DecisionBannerProps) {
  const isHold = decision.status === "hold";

  return (
    <div className={isHold ? "panel stack decision-banner decision-banner-hold" : "panel stack decision-banner decision-banner-safe"}>
      <div className="decision-row">
        <div className="stack decision-copy">
          <p className="kicker">Go/No-Go Decision</p>
          <h2>{isHold ? "HOLD" : "SAFE TO SHARE"}</h2>
          <p className="helper-line">{decision.reason}</p>
        </div>
        <div className="stack decision-actions">
          <Link href="/claims" className={isHold ? "button-primary" : "button-secondary"}>
            {decision.actionLabel}
          </Link>
          <p className="section-note">{decision.actionNote}</p>
        </div>
      </div>
    </div>
  );
}
