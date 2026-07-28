import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClaimsStore } from '../store/useClaimsStore';
import { useClaimsQuery } from '../hooks/useClaimsQuery';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Timer,
  SlidersHorizontal,
  Car,
  Smartphone,
  Building2,
  Package,
  Plus,
  ChevronRight,
  TrendingUp,
  XCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import type { Claim, ClaimObject } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { searchQuery, filters, setFilter, setActiveClaim, setUploadModalOpen } = useClaimsStore();

  // Fetch real dataset claims from FastAPI / API Layer
  const { data, isLoading, error } = useClaimsQuery({
    query: searchQuery,
    object_type: filters.objectType,
    severity: filters.severity,
  });

  const claimsList: Claim[] = data?.claims || [];

  const handleRowClick = (claim: Claim) => {
    setActiveClaim(claim);
    navigate(`/claims/${claim.id.replace('#', '')}`);
  };

  const getObjectIcon = (type: ClaimObject) => {
    switch (type) {
      case 'vehicle':
        return <Car className="w-4 h-4 text-primary" />;
      case 'electronics':
        return <Smartphone className="w-4 h-4 text-primary" />;
      case 'property':
        return <Building2 className="w-4 h-4 text-primary" />;
      case 'package':
        return <Package className="w-4 h-4 text-primary" />;
      default:
        return <Car className="w-4 h-4 text-primary" />;
    }
  };

  // Metrics summary derived directly from claims dataset
  const totalCount = claimsList.length;
  const supportedCount = claimsList.filter((c) => c.claimStatus === 'supported').length;
  const flaggedCount = claimsList.filter((c) => c.riskFlags.length > 0).length;
  const avgConfidence = totalCount
    ? Math.round((claimsList.reduce((acc, c) => acc + (c.confidenceScore || 0.9), 0) / totalCount) * 100)
    : 94;

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 animate-[fade-in-up_0.4s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">Claims Verification Console</h2>
          <p className="text-text-muted text-xs md:text-sm mt-1">Real-time processing feed from multi-agent evaluation pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-xs md:text-sm flex items-center gap-2 cursor-pointer btn-hover-effect shadow-[0_0_20px_rgba(139,124,255,0.25)]"
          >
            <Plus className="w-4 h-4" />
            <span>Execute Claim Verification</span>
          </button>
        </div>
      </div>

      {/* Real Dataset Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card border border-border-subtle p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Claims Analyzed</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface">{totalCount}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-success font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real dataset records</span>
            </div>
          </div>
        </div>

        <div className="glass-card border border-border-subtle p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Supported Claims</span>
            <div className="p-2 rounded-lg bg-success/10 text-success">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-success">{supportedCount}</div>
            <div className="text-xs text-text-muted mt-1">Verified damage evidence</div>
          </div>
        </div>

        <div className="glass-card border border-border-subtle p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Flagged Risk Signals</span>
            <div className="p-2 rounded-lg bg-warning/10 text-warning">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-warning">{flaggedCount}</div>
            <div className="text-xs text-text-muted mt-1">Blurry / duplicate / history risks</div>
          </div>
        </div>

        <div className="glass-card border border-border-subtle p-5 rounded-2xl flex flex-col justify-between ai-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Avg Model Confidence</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-primary">{avgConfidence}%</div>
            <div className="text-xs text-text-muted mt-1">Grounded image verification</div>
          </div>
        </div>
      </div>

      {/* Table Filters Toolbar */}
      <div className="glass-card border border-border-subtle rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* Object Type Filter */}
          <select
            value={filters.objectType}
            onChange={(e) => setFilter('objectType', e.target.value)}
            className="bg-surface-dim border border-border-subtle rounded-lg py-1.5 px-3 text-xs text-on-surface focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer font-medium"
          >
            <option value="All">All Domains</option>
            <option value="vehicle">Vehicle</option>
            <option value="electronics">Electronics</option>
            <option value="package">Package</option>
            <option value="property">Property</option>
          </select>

          {/* Severity Filter */}
          <select
            value={filters.severity}
            onChange={(e) => setFilter('severity', e.target.value)}
            className="bg-surface-dim border border-border-subtle rounded-lg py-1.5 px-3 text-xs text-on-surface focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer font-medium"
          >
            <option value="All">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="text-xs font-mono text-text-muted">
          Showing <strong className="text-on-surface">{claimsList.length}</strong> claims
        </div>
      </div>

      {/* Claims Data Table */}
      <div className="glass-card border border-border-subtle rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-16 text-center text-text-muted space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-xs font-mono">Loading real claim dataset records...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-danger">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-bold">Failed to connect to backend dataset API.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-dim/60 text-text-muted uppercase tracking-wider font-mono text-[11px]">
                  <th className="py-3.5 px-4 font-semibold">Claim ID</th>
                  <th className="py-3.5 px-4 font-semibold">Claimant</th>
                  <th className="py-3.5 px-4 font-semibold">Domain & Part</th>
                  <th className="py-3.5 px-4 font-semibold">Evidence Status</th>
                  <th className="py-3.5 px-4 font-semibold">Risk Signals</th>
                  <th className="py-3.5 px-4 font-semibold">Confidence</th>
                  <th className="py-3.5 px-4 font-semibold">Decision</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {claimsList.map((claim) => (
                  <tr
                    key={claim.id}
                    onClick={() => handleRowClick(claim)}
                    className="hover:bg-surface-dim/80 transition-colors cursor-pointer group"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-primary group-hover:underline">
                      {claim.id}
                    </td>

                    {/* Claimant */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-on-surface">{claim.customer.name}</div>
                      <div className="text-[10px] text-text-muted font-mono">{claim.userId}</div>
                    </td>

                    {/* Domain & Part */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-on-surface capitalize">
                        {getObjectIcon(claim.object.type)}
                        <span>{claim.object.part || claim.object.type}</span>
                      </div>
                      <div className="text-[10px] text-text-muted capitalize">{claim.object.issue}</div>
                    </td>

                    {/* Evidence Status Badge */}
                    <td className="py-3.5 px-4">
                      {claim.claimStatus === 'supported' ? (
                        <span className="bg-success/15 text-success border border-success/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Supported
                        </span>
                      ) : claim.claimStatus === 'rejected' ? (
                        <span className="bg-danger/15 text-danger border border-danger/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      ) : (
                        <span className="bg-warning/15 text-warning border border-warning/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" /> Insufficient Info
                        </span>
                      )}
                    </td>

                    {/* Risk Signals */}
                    <td className="py-3.5 px-4">
                      {claim.riskFlags && claim.riskFlags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {claim.riskFlags.slice(0, 2).map((rf, i) => (
                            <span key={i} className="bg-warning/10 text-warning border border-warning/20 text-[9px] px-1.5 py-0.5 rounded font-mono">
                              {rf.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-text-muted font-mono">Clean</span>
                      )}
                    </td>

                    {/* Confidence Progress Bar */}
                    <td className="py-3.5 px-4">
                      <div className="w-24 space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span>{Math.round((claim.confidenceScore || 0.9) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-dim rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              claim.confidenceScore > 0.8 ? 'bg-success' : claim.confidenceScore > 0.5 ? 'bg-warning' : 'bg-danger'
                            }`}
                            style={{ width: `${(claim.confidenceScore || 0.9) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Decision Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          claim.aiDecision === 'approve'
                            ? 'bg-success/20 text-success'
                            : claim.aiDecision === 'reject'
                            ? 'bg-danger/20 text-danger'
                            : 'bg-warning/20 text-warning'
                        }`}
                      >
                        {claim.aiDecision}
                      </span>
                    </td>

                    {/* Action Link */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1 text-primary font-bold group-hover:translate-x-1 transition-transform">
                        <span>Review</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
