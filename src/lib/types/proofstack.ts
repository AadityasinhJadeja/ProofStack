export type DomainPreset = "Cyber/Security";

export type StrictnessPreset = "Fast" | "Balanced" | "Strict";

export type ClaimType = "fact" | "number" | "recommendation";

export type ClaimCriticality = "low" | "medium" | "high";

export type ClaimVerdictStatus = "supported" | "weak" | "unsupported" | "pending";

export interface SourceDoc {
  id: string;
  fileName: string;
  content: string;
  isDemo: boolean;
}

export interface Chunk {
  id: string;
  sourceId: string;
  text: string;
  tokenEstimate: number;
}

export interface Claim {
  id: string;
  text: string;
  claimType: ClaimType;
  criticality: ClaimCriticality;
}

export interface EvidenceSnippet {
  id: string;
  claimId: string;
  sourceId: string;
  snippet: string;
  relevanceScore: number;
}

export interface ClaimVerdict {
  claimId: string;
  verdict: ClaimVerdictStatus;
  confidence: number;
  explanation: string;
  evidenceSnippetIds: string[];
}

export interface TrustReport {
  trustScore: number;
  supportedCount: number;
  weakCount: number;
  unsupportedCount: number;
  topRisks: string[];
}

export interface VerificationSession {
  id: string;
  createdAt: string;
  question: string;
  draftAnswer: string;
  verifiedAnswer: string;
  domain: DomainPreset;
  strictness: StrictnessPreset;
  useDemoDataset: boolean;
  sources: SourceDoc[];
  chunks: Chunk[];
  claims: Claim[];
  evidenceSnippets: EvidenceSnippet[];
  claimVerdicts: ClaimVerdict[];
  trustReport: TrustReport;
}
