// ============================================================================
// ClaimIQ AI — Utility Functions
// ============================================================================

import type { AiDecision, ClaimStatus, Severity } from '../types';

/**
 * Conditionally join class names (simplified clsx)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get badge styles for AI decisions
 */
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
        bg: 'bg-tertiary/10 border-tertiary/20',
        text: 'text-tertiary',
        icon: 'AlertTriangle',
        label: 'Escalate',
      };
  }
}

/**
 * Get severity badge styles
 */
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
      return { bg: 'bg-secondary-container', text: 'text-text-muted', label: 'Low' };
  }
}

/**
 * Get status indicator styles
 */
export function getStatusStyles(status: ClaimStatus): {
  dotColor: string;
  label: string;
  animate?: boolean;
} {
  switch (status) {
    case 'finalizing':
      return { dotColor: 'bg-success', label: 'Finalizing', animate: true };
    case 'flagged':
      return { dotColor: 'bg-danger', label: 'Flagged' };
    case 'awaiting_data':
      return { dotColor: 'bg-warning', label: 'Awaiting Data' };
    case 'completed':
      return { dotColor: 'bg-success', label: 'Completed' };
    case 'in_review':
      return { dotColor: 'bg-primary', label: 'In Review', animate: true };
    case 'escalated':
      return { dotColor: 'bg-tertiary', label: 'Escalated' };
  }
}

/**
 * Get fraud score color based on value
 */
export function getFraudScoreColor(score: number): string {
  if (score >= 70) return 'bg-danger';
  if (score >= 40) return 'bg-warning';
  return 'bg-success';
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}
