import type { Claim, ClaimVerdict } from "@/lib/types/proofstack";

import { VerdictBadge } from "@/components/report/VerdictBadge";

interface ClaimTableProps {
  claims: Claim[];
  verdictByClaimId: Map<string, ClaimVerdict>;
  onViewEvidence?: (claimId: string) => void;
  selectedClaimId?: string | null;
  emptyText?: string;
}

export function ClaimTable({
  claims,
  verdictByClaimId,
  onViewEvidence,
  selectedClaimId,
  emptyText = "No claims available.",
}: ClaimTableProps) {
  if (claims.length === 0) {
    return <p>{emptyText}</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th align="left">Claim</th>
          <th align="left">Verdict</th>
          <th align="left">Confidence</th>
          <th align="left">Evidence</th>
        </tr>
      </thead>
      <tbody>
        {claims.map((claim) => {
          const verdict = verdictByClaimId.get(claim.id);

          return (
            <tr key={claim.id} className={selectedClaimId === claim.id ? "row-selected" : ""}>
              <td>{claim.text}</td>
              <td>
                <VerdictBadge verdict={verdict?.verdict ?? "pending"} />
              </td>
              <td>{verdict ? verdict.confidence.toFixed(2) : "-"}</td>
              <td>
                {onViewEvidence ? (
                  <button type="button" onClick={() => onViewEvidence(claim.id)}>
                    View evidence
                  </button>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
