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

export interface EvidenceReference {
  label: string;
  snippetId: string;
}

export interface ClaimVerdict {
  claimId: string;
  verdict: ClaimVerdictStatus;
  confidence: number;
  explanation: string;
  evidenceSnippetIds: string[];
  contradictionFound?: boolean;
}

export interface TrustScoreWeights {
  supported: number;
  weak: number;
  unsupported: number;
  pending: number;
  contradictionPenalty: number;
  criticalUnsupportedPenalty: number;
  baseline: number;
  scalePerClaim: number;
  domainMultiplier: number;
}

export interface TrustScoreCounts {
  claimCount: number;
  supported: number;
  weak: number;
  unsupported: number;
  pending: number;
  contradictions: number;
  criticalUnsupported: number;
}

export interface ClaimScoreContribution {
  claimId: string;
  claimText: string;
  verdict: ClaimVerdictStatus;
  criticality: ClaimCriticality;
  basePoints: number;
  penaltyPoints: number;
  netPoints: number;
  reason: string;
}

export interface TrustScoreBreakdown {
  formula: string;
  rawPoints: number;
  normalizedScore: number;
  finalTrustScore: number;
  weights: TrustScoreWeights;
  counts: TrustScoreCounts;
  claimContributions: ClaimScoreContribution[];
}

export interface ImpactMetrics {
  claimCount: number;
  supportedRatePct: number;
  criticalUnsupportedCount: number;
  estimatedReviewMinutes: number;
  reviewTimeFormula: string;
}

export interface TrustReport {
  trustScore: number;
  supportedCount: number;
  weakCount: number;
  unsupportedCount: number;
  topRisks: string[];
  scoreBreakdown?: TrustScoreBreakdown;
  impactMetrics?: ImpactMetrics;
}

export interface VerificationSession {
  id: string;
  createdAt: string;
  question: string;
  draftAnswer: string;
  verifiedAnswer: string;
  challengeMode?: boolean;
  challengeInjectedClaimId?: string;
  domain: DomainPreset;
  strictness: StrictnessPreset;
  useDemoDataset: boolean;
  sources: SourceDoc[];
  chunks: Chunk[];
  claims: Claim[];
  evidenceSnippets: EvidenceSnippet[];
  evidenceReferences?: EvidenceReference[];
  claimVerdicts: ClaimVerdict[];
  trustReport: TrustReport;
}
