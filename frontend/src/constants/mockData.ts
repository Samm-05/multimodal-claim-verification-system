// ============================================================================
// ClaimIQ AI — Mock Data (Matches Stitch Design Exactly)
// ============================================================================

import type {
  Claim,
  MetricData,
  TaskItem,
  DetectedIssue,
  RiskIndicator,
  CostItem,
  EvidenceImage,
  ExifData,
  AnalyticsKPI,
  ChartDataPoint,
  NavItem,
} from '../types';

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
export const sidebarNavItems: NavItem[] = [
  { icon: 'LayoutDashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'FileText', label: 'Claims', path: '/claims' },
  { icon: 'Shield', label: 'Fraud Detection', path: '/fraud' },
  { icon: 'BarChart3', label: 'Analytics', path: '/analytics' },
  { icon: 'ClipboardList', label: 'Reports', path: '/reports' },
  { icon: 'Settings', label: 'Settings', path: '/settings' },
];

export const sidebarBottomItems: NavItem[] = [
  { icon: 'HelpCircle', label: 'Help Center', path: '/help' },
  { icon: 'Code', label: 'API Docs', path: '/api-docs' },
];

// ---------------------------------------------------------------------------
// Dashboard Metrics (Stitch: 5-col grid)
// ---------------------------------------------------------------------------
export const dashboardMetrics: MetricData[] = [
  {
    label: 'Total Claims',
    value: '12,842',
    trend: { direction: 'up', value: '12%', label: 'vs last month' },
    icon: 'FileText',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    glowing: true,
  },
  {
    label: 'Reviewed',
    value: '8,211',
    trend: { direction: 'up', value: '4%', label: '64% completion rate' },
    icon: 'CheckCircle2',
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
  },
  {
    label: 'Fraud Alerts',
    value: '142',
    trend: { direction: 'down', value: '2%', label: 'Requires manual review' },
    icon: 'AlertTriangle',
    iconColor: 'text-danger',
    iconBg: 'bg-danger/10',
  },
  {
    label: 'AI Accuracy %',
    value: '98.4%',
    trend: { direction: 'up', value: 'High', label: 'Target threshold 95%' },
    icon: 'Sparkles',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    glowing: true,
  },
  {
    label: 'Avg Time',
    value: '4.2m',
    trend: { direction: 'down', value: '1.1m', label: 'efficiency improved' },
    icon: 'Timer',
    iconColor: 'text-tertiary',
    iconBg: 'bg-tertiary/10',
  },
];

// ---------------------------------------------------------------------------
// Claims Table Data (Stitch: 4 rows shown)
// ---------------------------------------------------------------------------
export const claimsData: Claim[] = [
  {
    id: '#CLM-82109',
    customer: { name: 'Jonathan Doe', initials: 'JD' },
    object: { type: 'vehicle', name: 'Tesla Model 3', icon: 'Car' },
    aiDecision: 'approve',
    severity: 'high',
    fraudScore: 12,
    status: 'finalizing',
    date: 'Oct 24, 2023',
  },
  {
    id: '#CLM-82108',
    customer: { name: 'Sarah Waters', initials: 'SW' },
    object: { type: 'electronics', name: 'iPhone 15 Pro', icon: 'Smartphone' },
    aiDecision: 'reject',
    severity: 'low',
    fraudScore: 84,
    status: 'flagged',
    date: 'Oct 24, 2023',
  },
  {
    id: '#CLM-82107',
    customer: { name: 'Marcus Reed', initials: 'MR' },
    object: { type: 'property', name: 'Condo (Fire)', icon: 'Building2' },
    aiDecision: 'reviewing',
    severity: 'medium',
    fraudScore: 45,
    status: 'awaiting_data',
    date: 'Oct 23, 2023',
  },
  {
    id: '#CLM-82106',
    customer: { name: 'Linda Kim', initials: 'LK' },
    object: { type: 'electronics', name: 'MacBook Pro', icon: 'Laptop' },
    aiDecision: 'approve',
    severity: 'low',
    fraudScore: 5,
    status: 'completed',
    date: 'Oct 23, 2023',
  },
  {
    id: '#CLM-82105',
    customer: { name: 'Robert Chen', initials: 'RC' },
    object: { type: 'vehicle', name: 'BMW X5', icon: 'Car' },
    aiDecision: 'approve',
    severity: 'medium',
    fraudScore: 18,
    status: 'completed',
    date: 'Oct 22, 2023',
  },
  {
    id: '#CLM-82104',
    customer: { name: 'Emily Grant', initials: 'EG' },
    object: { type: 'package', name: 'Fragile Shipment', icon: 'Package' },
    aiDecision: 'reviewing',
    severity: 'low',
    fraudScore: 22,
    status: 'in_review',
    date: 'Oct 22, 2023',
  },
];

// ---------------------------------------------------------------------------
// Dashboard Tasks (Stitch: 3 urgent tasks)
// ---------------------------------------------------------------------------
export const urgentTasks: TaskItem[] = [
  {
    id: 't1',
    title: 'Manual Review Required',
    description: 'Claim #CLM-82108 flagged for potential document spoofing.',
    action: 'Launch Inspector',
    priority: 'danger',
    icon: 'AlertCircle',
  },
  {
    id: 't2',
    title: 'Data Incomplete',
    description: '3 claims pending customer photo upload verification.',
    action: 'Send Reminders',
    priority: 'warning',
    icon: 'Clock',
  },
  {
    id: 't3',
    title: 'New Batch Ready',
    description: '14 property claims processed by AI Core.',
    action: 'Batch Approve',
    priority: 'primary',
    icon: 'Zap',
  },
];

// ---------------------------------------------------------------------------
// AI Performance Chart (Stitch: 7-day bar chart)
// ---------------------------------------------------------------------------
export const aiPerformanceData: ChartDataPoint[] = [
  { name: 'MON', value: 88, label: '88% Acc.' },
  { name: 'TUE', value: 91, label: '91% Acc.' },
  { name: 'WED', value: 93, label: '93% Acc.' },
  { name: 'THU', value: 96, label: '96% Acc.' },
  { name: 'FRI', value: 89, label: '89% Acc.' },
  { name: 'SAT', value: 94, label: '94% Acc.' },
  { name: 'SUN', value: 98.4, label: '98.4% Acc.' },
];

// ---------------------------------------------------------------------------
// Claim Review — Evidence Gallery
// ---------------------------------------------------------------------------
export const evidenceImages: EvidenceImage[] = [
  {
    id: 'img1',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnALzSxE32w8jE8gC2HsReDJxKBpQuBfaravEWnu-8h0wXK8s2_Ylhslkx68D4Ci8CXxMS_1xB1IaK3wD0Rf8RTTFfzOT8skzOXQmx9m5iMV1tRTTAozEdzytA7zFsd10JKNv8wEaxOOEkxBG2lsldAtrK3cin9XNsTBTR9Gn7JRV8dOVaFqNB-hNM_NHQiXJdQ4QALrpyO4QGoG9jeKXr4feQG42pI9Zxq-yQN54L9DQ92w-hDKvh-2CmDLbTy46UOCXIOaV2F1M',
    alt: 'Front bumper scratches and dent',
    label: 'PRIMARY_01.JPG',
    verified: true,
  },
  {
    id: 'img2',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5kTVbcYJhRHUAs7YtpRNst1x-enVqWN3hrMjEwW0gr6cQgroSONOdoT0Iulq6UbLzmx3NTtDcrVva5rg8CelxCpKjiMZQcYR8HcYQLw3-fTBo45YBtjtWG3rGndiMAPuNcIH8_sYM0M3Pdutq6MY1Tq_RYhljEphdlD6AndXm5-T7vKeono2Lz3qyMQwmiRwrtd49VGfSUP3UI4WgRrA6m9fbSmOz8d9R3hKNuiscS9341r569VC5eibM0FZ8oX_l-0sMPfU7TJo',
    alt: 'Side door panel scratch',
  },
  {
    id: 'img3',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNgqUG9Tck3whKZiyyaBmQpJ1hjNuM9d9wF0en45_TtMuAloJd4CqTdcUgL7Qr1u_TWSCKVvs8R_6U1BWvHyXWcPnRucwWnFLyL0F8UlBPVV_QZIM1hrhfQ4yBo4L8h_enDFykjMN3ugHfPRngFh2LQ_e4w5u0hqWCMO3_F8fLizdCuo7Rl_uuykglbOVAlS13teyMRvXKhkYIUD7GKIc187HYC-97VX4m9oeZ_jXKWKhT9bl1Tp0LvE00d-I8pCY4k5d76c2a95g',
    alt: 'Shattered headlight',
  },
  {
    id: 'img4',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXrLog2dDo4LuiJJBbdDxYGlimLggqU0AHutE-hK0gqu6dr7Y9d8mMianTEbv15xQG_zbFkRFGmLXwdPVvK0wbBuDLrBTqURlCE9quKWlEmf5JmRMN_q2MYsx477dRFOH3tfLrf6xS7LAzilpBG-DO6nsb1HpJe6gPmtHp4GLmQd4w-_vb-hyUPEZNtowfWLk0j9Hhcq6CUbR8fL1IXrS5vs6aFdaaebcKp7vrtoZSmE7eSzc7AEsmIe_J6Np50VwroLIEaXRQScA',
    alt: 'Wheel well damage',
  },
  {
    id: 'img5',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5kCc8Yz6ontdspUYLsUnFIIy4hnhd0uAJEZpgb8iDOs7tq9S6pPrQzRjzhbXtGP6btGubgOaZ387wi3oJkqTIhGtZ61ShQpzhKVsW2_T00ZXRA857b-IftRPZshgvpV49ex1Csoc75G1aB22WfpgeMLcsf4S5gRTPkPMF3LBbEnv2v_TeStAqpyMH7KwsqL_iXq2RDXqOwYFIZdSMqOCyzqGW2j7MDry6xwE3LsT8sOVwxz1yiQ0Rn3NldI20jgdJEzsr6ml1fG0',
    alt: 'Rear chassis inspection',
  },
];

export const claimExifData: ExifData = {
  timestamp: '2023-10-24 14:22:10',
  location: 'San Francisco, CA',
  device: 'iPhone 15 Pro',
};

// ---------------------------------------------------------------------------
// Claim Review — AI Detected Issues
// ---------------------------------------------------------------------------
export const detectedIssues: DetectedIssue[] = [
  {
    label: 'DETECTED ISSUE',
    title: 'Surface Scratches',
    description: 'Multiple parallel scratches identified on front bumper. Depth: 0.2mm - 0.5mm.',
    verified: true,
  },
  {
    label: 'DETECTED ISSUE',
    title: 'Impact Deformation',
    description: 'Slight concave deformation (3.4cm) consistent with low-speed bollard impact.',
    verified: true,
  },
];

export const riskIndicators: RiskIndicator[] = [
  {
    icon: 'AlertTriangle',
    iconColor: 'text-warning',
    title: 'Duplicate Claim Check',
    description: 'License plate linked to closed claim #8821 in 2021.',
    status: 'LOW RISK',
    statusColor: 'text-warning',
  },
  {
    icon: 'ShieldCheck',
    iconColor: 'text-success',
    title: 'Metadata Authenticity',
    description: 'Image hashes match original upload. GPS tags valid.',
    status: 'PASS',
    statusColor: 'text-success',
  },
];

export const costEstimate: CostItem[] = [
  { label: 'Body Labor', amount: '$850.00' },
  { label: 'Paint Supplies', amount: '$320.00' },
  { label: 'Sensor Calibration', amount: '$1,100.00' },
  { label: 'Total Estimate', amount: '$2,270.00', isTotal: true },
];

export const aiReasoningSummary =
  '"The visual analysis correlates perfectly with the driver\'s statement regarding a low-visibility parking maneuver. The paint transfer pattern (Yellow-662C) matches municipal bollard specifications in the reported area. Structural integrity of the sub-frame appears nominal based on visual gaps between panels."';

// ---------------------------------------------------------------------------
// Analytics Page
// ---------------------------------------------------------------------------
export const analyticsKPIs: AnalyticsKPI[] = [
  {
    label: 'Claims Processed',
    value: '24,891',
    change: '+18.2%',
    changeType: 'positive',
    icon: 'FileText',
    color: 'primary',
  },
  {
    label: 'Avg Resolution Time',
    value: '3.8 min',
    change: '-24.5%',
    changeType: 'positive',
    icon: 'Timer',
    color: 'success',
  },
  {
    label: 'Fraud Detected',
    value: '342',
    change: '+5.1%',
    changeType: 'negative',
    icon: 'ShieldAlert',
    color: 'danger',
  },
  {
    label: 'Cost Savings',
    value: '$2.4M',
    change: '+32.8%',
    changeType: 'positive',
    icon: 'DollarSign',
    color: 'success',
  },
];

export const monthlyClaimsData: ChartDataPoint[] = [
  { name: 'Jan', value: 1800 },
  { name: 'Feb', value: 2200 },
  { name: 'Mar', value: 2600 },
  { name: 'Apr', value: 2400 },
  { name: 'May', value: 3100 },
  { name: 'Jun', value: 2900 },
  { name: 'Jul', value: 3400 },
  { name: 'Aug', value: 3200 },
  { name: 'Sep', value: 3800 },
  { name: 'Oct', value: 4100 },
  { name: 'Nov', value: 3900 },
  { name: 'Dec', value: 4500 },
];

export const claimsByTypeData: ChartDataPoint[] = [
  { name: 'Vehicle', value: 45 },
  { name: 'Property', value: 25 },
  { name: 'Electronics', value: 18 },
  { name: 'Package', value: 12 },
];

export const fraudTrendData: ChartDataPoint[] = [
  { name: 'Jan', value: 22 },
  { name: 'Feb', value: 28 },
  { name: 'Mar', value: 35 },
  { name: 'Apr', value: 31 },
  { name: 'May', value: 42 },
  { name: 'Jun', value: 38 },
  { name: 'Jul', value: 45 },
  { name: 'Aug', value: 41 },
  { name: 'Sep', value: 48 },
  { name: 'Oct', value: 52 },
  { name: 'Nov', value: 47 },
  { name: 'Dec', value: 55 },
];
