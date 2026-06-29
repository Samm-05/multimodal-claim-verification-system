// ============================================================================
// ClaimIQ AI — Type Definitions
// ============================================================================

export type ClaimStatus = 'finalizing' | 'flagged' | 'awaiting_data' | 'completed' | 'in_review' | 'escalated';
export type AiDecision = 'approve' | 'reject' | 'reviewing' | 'escalate';
export type Severity = 'high' | 'medium' | 'low' | 'critical';
export type ClaimObject = 'vehicle' | 'electronics' | 'property' | 'package';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Claim {
  id: string;
  customer: {
    name: string;
    initials: string;
    avatar?: string;
    memberSince?: string;
  };
  object: {
    type: ClaimObject;
    name: string;
    icon: string;
    vin?: string;
  };
  aiDecision: AiDecision;
  severity: Severity;
  fraudScore: number;
  status: ClaimStatus;
  date: string;
  confidenceScore?: number;
  policyStatus?: string;
  policyType?: string;
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

export interface DetectedIssue {
  label: string;
  title: string;
  description: string;
  verified: boolean;
}

export interface RiskIndicator {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  status: string;
  statusColor: string;
}

export interface CostItem {
  label: string;
  amount: string;
  isTotal?: boolean;
}

export interface EvidenceImage {
  id: string;
  src: string;
  alt: string;
  label?: string;
  verified?: boolean;
}

export interface ExifData {
  timestamp: string;
  location: string;
  device: string;
}

export interface AnalyticsKPI {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
}

export interface NavItem {
  icon: string;
  label: string;
  path: string;
  active?: boolean;
}
