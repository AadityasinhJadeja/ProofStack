import type { VerificationSession } from "@/lib/types/proofstack";

/**
 * Fallback session used when no runtime verification session is available yet.
 */
export const mockVerificationSession: VerificationSession = {
  id: "mock-session",
  createdAt: new Date(2026, 1, 11, 9, 30, 0).toISOString(),
  question: "Analyze this incident and recommend remediation steps.",
  draftAnswer:
    "The incident appears consistent with credential stuffing against authentication endpoints. Containment controls reduced immediate abuse, but evidence confidence differs by claim.",
  verifiedAnswer:
    "Verified Answer\n\nEvidence-supported points:\n- The incident aligns with credential stuffing behavior. [E1]\n\nQualified points (weak evidence):\n- Likely: Rate limiting and step-up MFA reduced abusive login attempts. (insufficient evidence for full confidence). [E2]\n\nUncertain or unsupported points:\n- Uncertain: No confirmed data exfiltration exists in the reviewed timeline. (not supported by available evidence). [E3]\n\nEvidence index:\n[E1] = claim-1-evidence-1\n[E2] = claim-2-evidence-1\n[E3] = claim-3-evidence-1",
  domain: "Cyber/Security",
  strictness: "Balanced",
  useDemoDataset: true,
  sources: [
    {
      id: "source-incident-report",
      fileName: "demo1/incident_report.md",
      content: "",
      isDemo: true,
    },
    {
      id: "source-security-policy",
      fileName: "demo1/security_policy.md",
      content: "",
      isDemo: true,
    },
    {
      id: "source-logs",
      fileName: "demo1/logs.txt",
      content: "",
      isDemo: true,
    },
  ],
  chunks: [],
  claims: [
    {
      id: "claim-1",
      text: "The incident aligns with credential stuffing behavior.",
      claimType: "fact",
      criticality: "high",
    },
    {
      id: "claim-2",
      text: "Rate limiting and step-up MFA reduced abusive login attempts.",
      claimType: "fact",
      criticality: "medium",
    },
    {
      id: "claim-3",
      text: "No confirmed data exfiltration exists in the reviewed timeline.",
      claimType: "fact",
      criticality: "high",
    },
  ],
  evidenceSnippets: [
    {
      id: "claim-1-evidence-1",
      claimId: "claim-1",
      sourceId: "source-incident-report",
      snippet: "Observed spikes in failed login attempts and credential stuffing indicators.",
      relevanceScore: 0.79,
    },
    {
      id: "claim-2-evidence-1",
      claimId: "claim-2",
      sourceId: "source-logs",
      snippet: "Policy RATE_LIMIT_APPLIED and STEP_UP_MFA_TRIGGERED events were recorded.",
      relevanceScore: 0.71,
    },
    {
      id: "claim-3-evidence-1",
      claimId: "claim-3",
      sourceId: "source-incident-report",
      snippet: "No evidence of data exfiltration was found in logs reviewed.",
      relevanceScore: 0.48,
    },
  ],
  claimVerdicts: [
    {
      claimId: "claim-1",
      verdict: "supported",
      confidence: 0.82,
      explanation: "Incident summary and logs both indicate automated failed-login bursts.",
      evidenceSnippetIds: ["claim-1-evidence-1"],
    },
    {
      claimId: "claim-2",
      verdict: "weak",
      confidence: 0.58,
      explanation: "Controls were applied, but long-term containment efficacy is not fully proven.",
      evidenceSnippetIds: ["claim-2-evidence-1"],
    },
    {
      claimId: "claim-3",
      verdict: "unsupported",
      confidence: 0.36,
      explanation: "Absence of evidence is limited to reviewed windows and does not prove full absence.",
      evidenceSnippetIds: ["claim-3-evidence-1"],
    },
  ],
  trustReport: {
    trustScore: 64,
    supportedCount: 1,
    weakCount: 1,
    unsupportedCount: 1,
    topRisks: [
      "One high-criticality claim remains unsupported.",
      "Containment evidence is partial for long-horizon attacker behavior.",
      "No verified redlined answer has been generated yet.",
    ],
  },
};
