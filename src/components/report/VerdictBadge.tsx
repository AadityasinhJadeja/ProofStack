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
          : "badge";

  return <span className={className}>{verdict}</span>;
}
