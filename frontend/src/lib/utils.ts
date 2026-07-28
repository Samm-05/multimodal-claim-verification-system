// ============================================================================
// ClaimIQ AI — Utility Functions
// ============================================================================

import type { AiDecision, ClaimStatus, Severity } from '../types';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getDecisionStyles(decision: AiDecision): {
  bg: string;
  text: string;
  icon: string;
  label: string;
} {
  switch (decision) {
    case 'approve':
      return {
        bg: 'bg-success/10 border-success/20',
        text: 'text-success',
        icon: 'CheckCircle2',
        label: 'Approve',
      };
    case 'reject':
      return {
        bg: 'bg-danger/10 border-danger/20',
        text: 'text-danger',
        icon: 'XCircle',
        label: 'Reject',
      };
    case 'reviewing':
      return {
        bg: 'bg-warning/10 border-warning/20',
        text: 'text-warning',
        icon: 'Clock',
        label: 'Reviewing',
      };
    case 'escalate':
      return {
        bg: 'bg-primary/10 border-primary/20',
        text: 'text-primary',
        icon: 'AlertTriangle',
        label: 'Escalate',
      };
    default:
      return {
        bg: 'bg-primary/10 border-primary/20',
        text: 'text-primary',
        icon: 'CheckCircle2',
        label: 'Approve',
      };
  }
}

export function getSeverityStyles(severity: Severity): {
  bg: string;
  text: string;
  label: string;
} {
  switch (severity) {
    case 'critical':
      return { bg: 'bg-danger/10', text: 'text-danger', label: 'Critical' };
    case 'high':
      return { bg: 'bg-danger/10', text: 'text-danger', label: 'High' };
    case 'medium':
      return { bg: 'bg-warning/10', text: 'text-warning', label: 'Med' };
    case 'low':
      return { bg: 'bg-surface-dim', text: 'text-text-muted', label: 'Low' };
    default:
      return { bg: 'bg-surface-dim', text: 'text-text-muted', label: 'Medium' };
  }
}

export function getStatusStyles(status: ClaimStatus): {
  dotColor: string;
  label: string;
  animate?: boolean;
} {
  switch (status) {
    case 'supported':
      return { dotColor: 'bg-success', label: 'Supported' };
    case 'completed':
      return { dotColor: 'bg-success', label: 'Completed' };
    case 'flagged':
      return { dotColor: 'bg-danger', label: 'Flagged' };
    case 'rejected':
      return { dotColor: 'bg-danger', label: 'Rejected' };
    case 'not_enough_information':
      return { dotColor: 'bg-warning', label: 'Insufficient Info' };
    case 'in_review':
      return { dotColor: 'bg-primary', label: 'In Review', animate: true };
    case 'escalated':
      return { dotColor: 'bg-primary', label: 'Escalated' };
    default:
      return { dotColor: 'bg-success', label: 'Active' };
  }
}

export function getFraudScoreColor(score: number): string {
  if (score >= 70) return 'bg-danger';
  if (score >= 40) return 'bg-warning';
  return 'bg-success';
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}
