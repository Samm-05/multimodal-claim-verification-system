// ============================================================================
// ClaimIQ AI — Strict Type Definitions (Enterprise SaaS & Backend API Models)
// ============================================================================

export type ClaimStatus = 'supported' | 'not_enough_information' | 'rejected' | 'completed' | 'flagged' | 'in_review' | 'escalated';
export type AiDecision = 'approve' | 'reject' | 'reviewing' | 'escalate';
export type Severity = 'high' | 'medium' | 'low' | 'critical' | 'none';
export type ClaimObject = 'vehicle' | 'electronics' | 'property' | 'package';
export type VisionProviderType = 'opencv' | 'gemini_vision' | 'openai_vision' | 'claude_vision';

export interface CustomerHistory {
  past_claim_count: number;
  accept_claim: number;
  manual_review_claim?: number;
  rejected_claim?: number;
  history_flags?: string;
}

export interface CustomerInfo {
  name: string;
  initials: string;
  avatar?: string;
  memberSince?: string;
  history?: CustomerHistory;
}

export interface ObjectDetails {
  type: ClaimObject;
  name: string;
  part: string;
  issue: string;
  vin?: string;
}

export interface Claim {
  id: string;
  rawId?: number;
  userId: string;
  customer: CustomerInfo;
  object: ObjectDetails;
  userClaim: string;
  evidenceStandardMet: boolean;
  evidenceStandardMetReason: string;
  riskFlags: string[];
  claimStatus: ClaimStatus;
  claimStatusJustification: string;
  supportingImageIds: string[];
  validImage: boolean;
  severity: Severity;
  aiDecision: AiDecision;
  status: ClaimStatus;
  confidenceScore: number;
  fraudScore: number;
  date: string;
  imagePaths: string[];
}

export interface MetricData {
  label: string;
  value: string;
  trend: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    label: string;
  };
  icon: string;
  iconColor: string;
  iconBg: string;
  glowing?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  action: string;
  priority: 'danger' | 'warning' | 'primary';
  icon: string;
}

export interface AnalyticsSummary {
  totalClaims: number;
  supportedClaims: number;
  notEnoughInfoClaims: number;
  rejectedClaims: number;
  verificationAccuracy: string;
  averageLatency: string;
  automationRate: string;
}

export interface StatusBreakdownItem {
  name: string;
  value: number;
  color: string;
}

export interface ObjectBreakdownItem {
  name: string;
  value: number;
  color: string;
}

export interface RiskFlagCount {
  flag: string;
  count: number;
}

export interface SeverityCount {
  severity: string;
  count: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  statusBreakdown: StatusBreakdownItem[];
  objectBreakdown: ObjectBreakdownItem[];
  riskFlags: RiskFlagCount[];
  severityBreakdown: SeverityCount[];
}

export interface SystemSettings {
  geminiApiKey: string;
  geminiModel: string;
  confidenceThreshold: number;
  duplicateThreshold: number;
  visionProvider: VisionProviderType;
  maxRetries: number;
  activeProviders: string[];
}
