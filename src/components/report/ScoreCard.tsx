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

  return (
    <div className="panel stack">
      <h2>Trust Score</h2>
      <p className="score-value">{session.trustReport.trustScore}</p>
      <p>
        <strong>{label} trust</strong>
      </p>
      <p>{microcopy(label)}</p>
      <p>
        Supported: <strong>{session.trustReport.supportedCount}</strong> | Weak: <strong>{session.trustReport.weakCount}</strong> | Unsupported: <strong>{session.trustReport.unsupportedCount}</strong>
      </p>
      <p>
        Session ID: <code>{session.id}</code>
      </p>
    </div>
  );
}
