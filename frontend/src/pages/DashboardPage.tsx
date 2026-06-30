import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClaimsStore } from '../store/useClaimsStore';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Timer,
  SlidersHorizontal,
  Download,
  Car,
  Smartphone,
  Building2,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { getDecisionStyles, getSeverityStyles, getStatusStyles } from '../lib/utils';
import type { Claim, ClaimObject } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredClaims,
    metrics,
    tasks,
    filters,
    setFilter,
    setActiveClaim,
  } = useClaimsStore();

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const handleRowClick = (claim: Claim) => {
    setActiveClaim(claim);
    navigate(`/claims/${claim.id.replace('#', '')}`);
  };

  // Resolve object icons
  const getObjectIcon = (type: ClaimObject) => {
    switch (type) {
      case 'vehicle':
        return <Car className="w-4 h-4 text-text-muted" />;
      case 'electronics':
        return <Smartphone className="w-4 h-4 text-text-muted" />;
      case 'property':
        return <Building2 className="w-4 h-4 text-text-muted" />;
      case 'package':
        return <Package className="w-4 h-4 text-text-muted" />;
    }
  };

  // Resolve general metric icons
  const getMetricIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-4 h-4" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Timer':
        return <Timer className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Chart data from Stitch HTML
  const chartDays = [
    { day: 'MON', val: '40%', acc: '88% Acc.' },
    { day: 'TUE', val: '55%', acc: '91% Acc.' },
    { day: 'WED', val: '65%', acc: '93% Acc.' },
    { day: 'THU', val: '80%', acc: '96% Acc.' },
    { day: 'FRI', val: '60%', acc: '89% Acc.' },
    { day: 'SAT', val: '75%', acc: '94% Acc.' },
    { day: 'SUN', val: '95%', acc: '98.4% Acc.' },
  ];

  return (
    <div className="p-page-margin-desktop max-w-[1600px] mx-auto flex flex-col gap-stack-lg animate-[fade-in-up_0.4s_ease-out]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">Claims Dashboard</h2>
          <p className="text-text-muted text-sm mt-1">Real-time analysis of active verification pipelines.</p>
        </div>
        <div className="flex gap-stack-sm">
          <button className="px-4 py-2 rounded-lg border border-border-subtle bg-surface-card hover:bg-surface-variant transition-all text-sm font-medium flex items-center gap-2 cursor-pointer">
            <SlidersHorizontal className="w-4 h-4" />
            <span>View Filters</span>
          </button>
          <button className="px-4 py-2 rounded-lg bg-primary text-on-primary-container font-bold hover:opacity-90 transition-all text-sm flex items-center gap-2 cursor-pointer btn-hover-effect">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Stitch 5-column grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-stack-md">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className={`bg-surface-card border border-border-subtle p-stack-md rounded-xl flex flex-col justify-between transition-all duration-300 ${
              metric.glowing ? 'ai-glow border-primary/20 hover:border-primary/50' : 'hover:border-border-subtle/80 hover:bg-surface-card/90'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{metric.label}</span>
              <div className={`p-1.5 rounded-lg ${metric.iconColor} ${metric.iconBg}`}>
                {getMetricIcon(metric.icon)}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-on-surface">{metric.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={`text-xs font-bold flex items-center gap-0.5 ${
                    metric.trend.direction === 'up'
                      ? 'text-success'
                      : metric.trend.direction === 'down'
                      ? 'text-danger'
                      : 'text-text-muted'
                  }`}
                >
                  {metric.trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
                  {metric.trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
                  {metric.trend.value}
                </span>
                <span className="text-[10px] text-text-muted">{metric.trend.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Data Table Container */}
      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden flex flex-col shadow-lg">
        {/* Table Filters & Controls */}
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card/50">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-border-subtle">
              <span className="text-xs text-text-muted font-bold">Object:</span>
              <select
                value={filters.objectType}
                onChange={(e) => setFilter('objectType', e.target.value)}
                className="bg-transparent border-none text-xs text-on-surface focus:ring-0 cursor-pointer p-0 font-medium outline-none"
              >
                <option value="All Types">All Types</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Property">Property</option>
                <option value="Electronics">Electronics</option>
                <option value="Package">Package</option>
              </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-border-subtle">
              <span className="text-xs text-text-muted font-bold">Severity:</span>
              <select
                value={filters.severity}
                onChange={(e) => setFilter('severity', e.target.value)}
                className="bg-transparent border-none text-xs text-on-surface focus:ring-0 cursor-pointer p-0 font-medium outline-none"
              >
                <option value="All">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-border-subtle">
              <span className="text-xs text-text-muted font-bold">Date Range:</span>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilter('dateRange', e.target.value)}
                className="bg-transparent border-none text-xs text-on-surface focus:ring-0 cursor-pointer p-0 font-medium outline-none"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Current Qtr">Current Qtr</option>
              </select>
            </div>
          </div>
          <div className="text-xs text-text-muted font-medium">
            Showing <span className="text-on-surface font-bold">1-{filteredClaims.length}</span> of{' '}
            <span className="text-on-surface font-bold">{filteredClaims.length}</span> claims
          </div>
        </div>

        {/* Claims Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle">
                  Claim ID
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle">
                  Customer
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle">
                  Object
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle">
                  AI Decision
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle">
                  Severity
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle">
                  Fraud Score
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle">
                  Date
                </th>
                <th className="px-6 py-4 border-b border-border-subtle w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredClaims.map((claim) => {
                const decision = getDecisionStyles(claim.aiDecision);
                const sev = getSeverityStyles(claim.severity);
                const stat = getStatusStyles(claim.status);

                return (
                  <tr
                    key={claim.id}
                    onClick={() => handleRowClick(claim)}
                    className="hover:bg-surface-variant/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono text-mono text-primary text-sm font-semibold">
                      {claim.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-[10px] font-extrabold border border-border-subtle text-on-surface">
                          {claim.customer.initials}
                        </div>
                        <div className="text-sm font-medium text-on-surface">{claim.customer.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getObjectIcon(claim.object.type)}
                        <span className="text-sm text-on-surface">{claim.object.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold border inline-flex items-center gap-1.5 ${decision.bg} ${decision.text}`}
                      >
                        {claim.aiDecision === 'approve' && <CheckCircle className="w-3 h-3" />}
                        {claim.aiDecision === 'reject' && <XCircle className="w-3 h-3" />}
                        {claim.aiDecision === 'reviewing' && <Clock className="w-3 h-3 animate-spin" />}
                        {claim.aiDecision === 'escalate' && <AlertTriangle className="w-3 h-3" />}
                        <span>{decision.label}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-xl text-[10px] font-bold uppercase tracking-tight ${sev.bg} ${sev.text}`}
                      >
                        {sev.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              claim.fraudScore >= 75
                                ? 'bg-danger'
                                : claim.fraudScore >= 40
                                ? 'bg-warning'
                                : 'bg-success'
                            }`}
                            style={{ width: `${claim.fraudScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-mono text-on-surface font-semibold">
                          {claim.fraudScore}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs text-on-surface">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${stat.dotColor} ${
                            stat.animate ? 'animate-pulse' : ''
                          }`}
                        ></span>
                        <span>{stat.label}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">{claim.date}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-1.5 hover:bg-surface-variant rounded-lg transition-colors text-text-muted hover:text-on-surface">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredClaims.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-text-muted">
                    No active claims found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border-subtle flex items-center justify-between bg-surface-card/30">
          <button
            className="px-3 py-1.5 rounded-lg border border-border-subtle text-xs font-bold hover:bg-surface-variant transition-all disabled:opacity-50 text-text-muted disabled:cursor-not-allowed"
            disabled
          >
            <ChevronLeft className="w-4 h-4 inline mr-1" />
            <span>Previous</span>
          </button>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg bg-primary text-on-primary-container text-xs font-bold">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-variant text-xs font-bold text-text-muted hover:text-on-surface">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-variant text-xs font-bold text-text-muted hover:text-on-surface">3</button>
            <span className="px-2 flex items-center text-text-muted text-xs">...</span>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-variant text-xs font-bold text-text-muted hover:text-on-surface">24</button>
          </div>
          <button className="px-3 py-1.5 rounded-lg border border-border-subtle text-xs font-bold hover:bg-surface-variant transition-all text-text-muted hover:text-on-surface">
            <span>Next</span>
            <ChevronRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>
      </div>

      {/* AI Performance Trend & Tasks (Two Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-lg">
        {/* Chart Panel */}
        <div className="lg:col-span-2 glass-panel p-stack-lg rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="w-16 h-16 text-primary" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary fill-primary/25" />
                <span>AI Performance Trend</span>
              </h3>
              <p className="text-text-muted text-sm max-w-lg mb-6">
                Neural networks are currently identifying new patterns in vehicle damage claims across coastal regions. Confidence scores have increased by 2.4% this cycle.
              </p>
            </div>

            {/* Custom Interactive CSS Bar Chart matching Stitch Design */}
            <div className="mt-auto">
              <div className="h-48 w-full flex items-end gap-3 px-2 border-b border-border-subtle pb-2 relative">
                {chartDays.map((item, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col justify-end items-center h-full relative"
                    onMouseEnter={() => setHoveredBarIndex(index)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Tooltip */}
                    <div
                      className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-bright text-on-surface text-[10px] font-bold px-2 py-1 rounded transition-opacity pointer-events-none whitespace-nowrap z-20 ${
                        hoveredBarIndex === index ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {item.acc}
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-sm transition-all duration-300 cursor-help ${
                        index === chartDays.length - 1
                          ? 'bg-primary shadow-[0_0_10px_rgba(192,193,255,0.4)]'
                          : 'bg-surface-container hover:bg-primary/40'
                      }`}
                      style={{ height: item.val }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-[10px] text-text-muted font-bold px-2">
                {chartDays.map((item, i) => (
                  <span key={i}>{item.day}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Panel */}
        <div className="bg-surface-card border border-border-subtle p-stack-lg rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-4 text-on-surface font-bold">Urgent Tasks</h3>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 bg-surface-container-low rounded-lg border-l-4 flex gap-3 ${
                    task.priority === 'danger'
                      ? 'border-danger'
                      : task.priority === 'warning'
                      ? 'border-warning'
                      : 'border-primary'
                  }`}
                >
                  <div className="mt-0.5">
                    {task.priority === 'danger' && <AlertCircle className="w-4 h-4 text-danger" />}
                    {task.priority === 'warning' && <Clock className="w-4 h-4 text-warning" />}
                    {task.priority === 'primary' && <Zap className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-on-surface">{task.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{task.description}</p>
                    <button className="mt-2 text-[10px] font-bold uppercase text-primary tracking-wider hover:underline cursor-pointer flex items-center gap-0.5">
                      <span>{task.action}</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
