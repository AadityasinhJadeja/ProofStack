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
    return <p className="helper-line">{emptyText}</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Claim</th>
            <th>Verdict</th>
            <th>Confidence</th>
            <th>Evidence</th>
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
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => onViewEvidence(claim.id)}
                    >
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
    </div>
  );
}
