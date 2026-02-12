import type { TrustScoreBreakdown } from "@/lib/types/proofstack";

interface ScoreExplainabilityPanelProps {
  breakdown: TrustScoreBreakdown;
}

function formatPoints(value: number): string {
  if (!Number.isFinite(value)) {
    return "-";
  }

  if (value > 0) {
    return `+${value.toFixed(2)}`;
  }

  return value.toFixed(2);
}

export function ScoreExplainabilityPanel({ breakdown }: ScoreExplainabilityPanelProps) {
  const topNegativeDrivers = [...breakdown.claimContributions]
    .filter((claim) => claim.netPoints < 0)
    .sort((a, b) => a.netPoints - b.netPoints)
    .slice(0, 3);

  return (
    <div className="panel stack">
      <h2>Score Explainability</h2>
      <p className="helper-line">
        This panel exposes the exact deterministic math behind the trust score.
      </p>

      <pre className="formula-code">{breakdown.formula}</pre>

      <div className="metric-row">
        <span className="metric-pill">Claim count: {breakdown.counts.claimCount}</span>
        <span className="metric-pill">Raw points: {breakdown.rawPoints.toFixed(2)}</span>
        <span className="metric-pill">Normalized: {breakdown.normalizedScore.toFixed(2)}</span>
        <span className="metric-pill">Final score: {breakdown.finalTrustScore}</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Weight Rule</th>
              <th>Value</th>
              <th>Observed Count</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Supported</td>
              <td>{formatPoints(breakdown.weights.supported)}</td>
              <td>{breakdown.counts.supported}</td>
            </tr>
            <tr>
              <td>Weak</td>
              <td>{formatPoints(breakdown.weights.weak)}</td>
              <td>{breakdown.counts.weak}</td>
            </tr>
            <tr>
              <td>Unsupported</td>
              <td>{formatPoints(breakdown.weights.unsupported)}</td>
              <td>{breakdown.counts.unsupported}</td>
            </tr>
            <tr>
              <td>Pending</td>
              <td>{formatPoints(breakdown.weights.pending)}</td>
              <td>{breakdown.counts.pending}</td>
            </tr>
            <tr>
              <td>Critical unsupported penalty</td>
              <td>-{breakdown.weights.criticalUnsupportedPenalty.toFixed(2)}</td>
              <td>{breakdown.counts.criticalUnsupported}</td>
            </tr>
            <tr>
              <td>Contradiction penalty</td>
              <td>-{breakdown.weights.contradictionPenalty.toFixed(2)}</td>
              <td>{breakdown.counts.contradictions}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {topNegativeDrivers.length > 0 ? (
        <div className="stack">
          <h3>Top Negative Drivers</h3>
          <ul>
            {topNegativeDrivers.map((driver) => (
              <li key={driver.claimId}>
                <strong>{driver.claimId}</strong> ({driver.netPoints.toFixed(2)}): {driver.claimText}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Claim</th>
              <th>Verdict</th>
              <th>Criticality</th>
              <th>Base</th>
              <th>Penalty</th>
              <th>Net</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.claimContributions.map((contribution) => (
              <tr key={contribution.claimId}>
                <td>{contribution.claimId}</td>
                <td>{contribution.verdict}</td>
                <td>{contribution.criticality}</td>
                <td>{formatPoints(contribution.basePoints)}</td>
                <td>{contribution.penaltyPoints.toFixed(2)}</td>
                <td
                  className={
                    contribution.netPoints < 0
                      ? "contribution-net contribution-net-negative"
                      : "contribution-net"
                  }
                >
                  {formatPoints(contribution.netPoints)}
                </td>
                <td>{contribution.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
