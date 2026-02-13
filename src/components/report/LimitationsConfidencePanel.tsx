"use client";

interface LimitationsConfidencePanelProps {
  trustScore: number;
  sourceCount: number;
  evidenceReferenceCount: number;
}

export function LimitationsConfidencePanel({
  trustScore,
  sourceCount,
  evidenceReferenceCount,
}: LimitationsConfidencePanelProps) {
  return (
    <div className="panel stack limitations-panel">
      <h2>Limitations & Confidence</h2>
      <p className="helper-line">
        This defines where ProofStack is reliable and where human judgment remains mandatory.
      </p>
      <ul className="limitations-list">
        <li>
          <strong>Can verify:</strong> Claim-to-evidence alignment against the uploaded sources.
        </li>
        <li>
          <strong>Cannot verify:</strong> Facts not present in the provided files or events outside this dataset.
        </li>
        <li>
          <strong>Human review required:</strong> Any unsupported claim, high-critical weak claim, or high-impact response path.
        </li>
      </ul>
      <div className="metric-row">
        <span className="metric-pill">Trust score: {trustScore}/100</span>
        <span className="metric-pill">Sources analyzed: {sourceCount}</span>
        <span className="metric-pill">Evidence references: {evidenceReferenceCount}</span>
      </div>
    </div>
  );
}
