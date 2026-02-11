import type { VerificationSession } from "@/lib/types/proofstack";

interface ScoreCardProps {
  session: VerificationSession;
}

function trustLabel(score: number): "High" | "Medium" | "Low" {
  if (score >= 75) {
    return "High";
  }

  if (score >= 45) {
    return "Medium";
  }

  return "Low";
}

function microcopy(label: "High" | "Medium" | "Low"): string {
  if (label === "High") {
    return "Most claims are well-supported by provided evidence.";
  }

  if (label === "Medium") {
    return "Some claims are supported, but caution is still needed.";
  }

  return "Evidence gaps remain significant; treat conclusions as provisional.";
}

export function ScoreCard({ session }: ScoreCardProps) {
  const label = trustLabel(session.trustReport.trustScore);
  const scoreClass =
    label === "High"
      ? "score-chip score-chip-high"
      : label === "Medium"
        ? "score-chip score-chip-medium"
        : "score-chip score-chip-low";

  return (
    <div className="panel stack panel-raised">
      <h3 className="kicker" style={{ color: 'var(--text-muted)' }}>Security Trust Score</h3>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <p className="score-value">{session.trustReport.trustScore}</p>
        <p className={scoreClass} style={{ marginBottom: '12px' }}>
          <span className="badge-dot" aria-hidden="true" />
          {label} Trust Level
        </p>
      </div>
      <p className="score-microcopy" style={{ fontSize: '1.1rem', lineHeight: '1.4' }}>{microcopy(label)}</p>

      <div className="metric-row" style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--success-soft)', border: '1px solid var(--success)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--success)' }}>Supported</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{session.trustReport.supportedCount}</span>
        </div>
        <div style={{ flex: 1, padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--warning-soft)', border: '1px solid var(--warning)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--warning)' }}>Weak</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{session.trustReport.weakCount}</span>
        </div>
        <div style={{ flex: 1, padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-soft)', border: '1px solid var(--danger)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--danger)' }}>Unsupported</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{session.trustReport.unsupportedCount}</span>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
        Audit Token: <code>{session.id}</code>
      </p>
    </div>
  );
}
