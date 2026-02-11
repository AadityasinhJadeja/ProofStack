import type { ClaimVerdict } from "@/lib/types/proofstack";

interface VerdictBadgeProps {
  verdict: ClaimVerdict["verdict"] | "pending";
}

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  const className =
    verdict === "supported"
      ? "badge badge-supported"
      : verdict === "weak"
        ? "badge badge-weak"
        : verdict === "unsupported"
          ? "badge badge-unsupported"
          : "badge badge-pending";

  return (
    <span className={className}>
      <span className="badge-dot" aria-hidden="true" />
      {verdict}
    </span>
  );
}
