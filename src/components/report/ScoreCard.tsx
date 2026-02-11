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
    <div className="panel stack" style={{ border: 'none', boxShadow: 'var(--shadow-md)', background: 'var(--app-surface)' }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Security Trust Score</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <p className="score-value" style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{session.trustReport.trustScore}</p>
        <div>
          <p className={scoreClass} style={{ marginBottom: '4px', borderRadius: '12px' }}>
            <span className="badge-dot" aria-hidden="true" />
            {label} Trust Level
          </p>
          <p className="score-microcopy" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>{microcopy(label)}</p>
        </div>
      </div>

      <div className="metric-row" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--canvas)', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Supported</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{session.trustReport.supportedCount}</span>
        </div>
        <div style={{ flex: 1, padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--canvas)', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Weak</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning)' }}>{session.trustReport.weakCount}</span>
        </div>
        <div style={{ flex: 1, padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--canvas)', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Unsupported</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>{session.trustReport.unsupportedCount}</span>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
        Audit Token: <code>{session.id}</code>
      </p>
    </div>
  );
}
