import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClaimsStore } from '../store/useClaimsStore';
import {
  ZoomIn,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  Smartphone,
  Building2,
  Package,
  Car,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import {
  evidenceImages,
  claimExifData,
  detectedIssues,
  riskIndicators,
  costEstimate,
  aiReasoningSummary,
} from '../constants/mockData';
import { getDecisionStyles, getSeverityStyles } from '../lib/utils';
import type { ClaimObject } from '../types';

export const ClaimReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { claims, approveClaim, rejectClaim, escalateClaim } = useClaimsStore();

  // Find the selected claim or fallback to mock
  const claim = claims.find((c) => c.id.replace('#', '') === id) || claims[0];

  // Selected image state
  const [focusedImage, setFocusedImage] = useState(evidenceImages[0]);

  if (!claim) {
    return (
      <div className="p-8 text-center text-text-muted">
        <p>Claim not found.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-primary underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Resolve object icon
  const getObjectIcon = (type: ClaimObject) => {
    switch (type) {
      case 'vehicle':
        return <Car className="w-5 h-5 text-text-muted" />;
      case 'electronics':
        return <Smartphone className="w-5 h-5 text-text-muted" />;
      case 'property':
        return <Building2 className="w-5 h-5 text-text-muted" />;
      case 'package':
        return <Package className="w-5 h-5 text-text-muted" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background-base animate-[fade-in-up_0.4s_ease-out]">
      {/* Detail Shell Navigation */}
      <div className="h-14 border-b border-border-subtle bg-surface-dim flex items-center justify-between px-page-margin-desktop">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-text-muted hover:text-on-surface transition-colors cursor-pointer text-sm font-semibold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Claims Queue</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted font-mono uppercase">Status:</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              claim.status === 'completed' || claim.status === 'finalizing'
                ? 'bg-success/20 text-success'
                : claim.status === 'flagged'
                ? 'bg-danger/20 text-danger'
                : 'bg-warning/20 text-warning'
            }`}
          >
            {claim.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Evidence Gallery */}
        <section className="w-full md:w-[30%] border-r border-border-subtle flex flex-col bg-surface-dim overflow-y-auto custom-scrollbar">
          <div className="p-stack-md border-b border-border-subtle flex justify-between items-center bg-surface-dim/80 backdrop-blur sticky top-0 z-10">
            <h2 className="font-label-md text-label-md uppercase tracking-wider text-text-muted font-bold">
              Evidence Gallery ({evidenceImages.length})
            </h2>
            <div className="flex gap-2">
              <button className="p-1.5 rounded bg-surface-container border border-border-subtle hover:bg-surface-variant transition-all cursor-pointer text-text-muted hover:text-on-surface">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded bg-surface-container border border-border-subtle hover:bg-surface-variant transition-all cursor-pointer text-text-muted hover:text-on-surface">
                <GitCompare className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-stack-md space-y-stack-md">
            {/* Main Focused Image */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-border-subtle ai-glow group cursor-zoom-in">
              <img
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                src={focusedImage.src}
                alt={focusedImage.alt}
              />
              <div className="absolute top-3 left-3 bg-background-base/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold border border-primary/30 text-primary">
                {focusedImage.label || 'IMAGE_PREVIEW.JPG'}
              </div>
              {focusedImage.verified && (
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <span className="bg-success/20 text-success text-[10px] px-2 py-1 rounded-full font-bold border border-success/30 backdrop-blur-sm">
                    VERIFIED BY AI
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails Grid */}
            <div className="grid grid-cols-4 gap-stack-sm">
              {evidenceImages.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setFocusedImage(img)}
                  className={`aspect-square rounded-lg border overflow-hidden cursor-pointer transition-all ${
                    focusedImage.id === img.id
                      ? 'border-primary scale-[0.98]'
                      : 'border-border-subtle hover:border-primary/50'
                  }`}
                >
                  <img className="w-full h-full object-cover" src={img.src} alt={img.alt} />
                </div>
              ))}
            </div>

            {/* EXIF Data Panel */}
            <div className="p-stack-md bg-surface-card rounded-xl border border-border-subtle">
              <span className="text-label-sm text-text-muted mb-3 block uppercase font-bold tracking-wider">
                EXIF Data Integrity
              </span>
              <div className="space-y-2">
                <div className="flex justify-between text-body-sm text-sm">
                  <span className="text-text-muted">Timestamp</span>
                  <span className="text-on-surface font-semibold">{claimExifData.timestamp}</span>
                </div>
                <div className="flex justify-between text-body-sm text-sm">
                  <span className="text-text-muted">Location</span>
                  <span className="text-on-surface font-semibold">{claimExifData.location}</span>
                </div>
                <div className="flex justify-between text-body-sm text-sm">
                  <span className="text-text-muted">Device</span>
                  <span className="text-on-surface font-semibold">{claimExifData.device}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Center Panel: AI Analysis & Insights */}
        <section className="flex-1 flex flex-col border-r border-border-subtle overflow-y-auto custom-scrollbar">
          <div className="p-stack-md border-b border-border-subtle flex justify-between items-center bg-background-base/80 backdrop-blur sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary fill-primary/10" />
              <h2 className="font-headline-md text-headline-md font-bold">AI Analysis</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-text-muted text-xs font-semibold">Model: ClaimVision-v4.2</span>
              <span className="w-2 h-2 rounded-full bg-success"></span>
            </div>
          </div>

          <div className="p-stack-lg space-y-stack-lg">
            {/* Confidence Score Hero */}
            <div className="bg-surface-card rounded-2xl p-8 border border-border-subtle relative overflow-hidden animate-ai-thinking flex flex-col items-center">
              <span className="text-label-md text-text-muted uppercase tracking-widest mb-2 font-bold text-xs">
                Confidence Score
              </span>
              <div className="text-[72px] font-extrabold text-primary leading-none mb-2 relative">
                <span>98</span>
                <span className="text-3xl absolute -top-1 -right-6">%</span>
              </div>
              <div className="w-full max-w-xs h-1.5 bg-secondary-container rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-primary w-[98%] shadow-[0_0_10px_rgba(192,193,255,0.5)]"></div>
              </div>
              <p className="text-body-sm text-text-muted mt-6 text-center max-w-sm text-sm">
                High confidence match between submitted photos and the reported incident details. No significant anomalies detected in metadata.
              </p>
            </div>

            {/* Detected Issues List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-md">
              {detectedIssues.map((issue, i) => (
                <div
                  key={i}
                  className="bg-surface-card border border-border-subtle rounded-xl p-stack-md hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded">
                      {issue.label}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                  <h3 className="font-label-md text-on-surface mb-1 font-bold">{issue.title}</h3>
                  <p className="text-body-sm text-text-muted text-xs leading-relaxed">{issue.description}</p>
                </div>
              ))}
            </div>

            {/* AI Explanation / Reasoning Summary */}
            <div className="space-y-stack-sm">
              <h3 className="text-label-md text-text-muted uppercase font-bold text-xs">Reasoning Summary</h3>
              <div className="bg-surface-dim rounded-xl p-stack-md border border-border-subtle text-body-md text-on-surface leading-relaxed italic text-sm text-primary/95">
                {aiReasoningSummary}
              </div>
            </div>

            {/* Risk Flags */}
            <div className="space-y-stack-sm">
              <h3 className="text-label-md text-text-muted uppercase font-bold text-xs">Risk Indicators</h3>
              <div className="bg-surface-card rounded-xl border border-border-subtle divide-y divide-border-subtle">
                {riskIndicators.map((risk, i) => (
                  <div key={i} className="p-stack-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {risk.icon === 'AlertTriangle' ? (
                        <ShieldAlert className="w-5 h-5 text-warning" />
                      ) : (
                        <ShieldCheck className="w-5 h-5 text-success" />
                      )}
                      <div>
                        <div className="text-sm font-semibold text-on-surface">{risk.title}</div>
                        <div className="text-[12px] text-text-muted mt-0.5">{risk.description}</div>
                      </div>
                    </div>
                    <span className={`text-label-sm font-bold ${risk.statusColor}`}>{risk.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel: Metadata & Actions */}
        <section className="w-full md:w-[25%] flex flex-col bg-surface-dim overflow-y-auto custom-scrollbar border-l border-border-subtle justify-between">
          <div className="flex-1 flex flex-col">
            <div className="p-stack-md border-b border-border-subtle flex justify-between items-center bg-surface-dim/80 backdrop-blur sticky top-0 z-10">
              <h2 className="font-label-md text-label-md uppercase tracking-wider text-text-muted font-bold">
                Claim Metadata
              </h2>
              <span className="bg-secondary-container text-on-surface text-[10px] px-2 py-1 rounded font-mono font-bold">
                {claim.id}
              </span>
            </div>

            <div className="p-stack-md space-y-stack-lg">
              {/* Customer Info */}
              <div className="space-y-stack-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full border border-border-subtle overflow-hidden flex items-center justify-center bg-surface-container-high text-lg font-bold">
                    {claim.customer.initials}
                  </div>
                  <div>
                    <div className="text-body-md font-bold text-on-surface">{claim.customer.name}</div>
                    <div className="text-xs text-text-muted">Member since 2018</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-surface-card p-3 rounded-lg border border-border-subtle">
                    <div className="text-[11px] text-text-muted uppercase mb-1 font-bold">Object Info</div>
                    <div className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                      {getObjectIcon(claim.object.type)}
                      <span>{claim.object.name}</span>
                    </div>
                    <div className="text-xs text-text-muted mt-1 font-mono">
                      VIN: WP0AA2Y1XNSA*****
                    </div>
                  </div>

                  <div className="bg-surface-card p-3 rounded-lg border border-border-subtle">
                    <div className="text-[11px] text-text-muted uppercase mb-1 font-bold">Policy Status</div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-semibold text-on-surface">Premium Comprehensive</div>
                      <span className="text-success text-[10px] font-bold">ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estimate Table */}
              <div className="space-y-stack-sm">
                <h3 className="text-label-md text-text-muted uppercase font-bold text-xs">Projected Costs</h3>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border-subtle">
                    {costEstimate.map((item, i) => (
                      <tr key={i} className="py-2">
                        <td className={`py-2 ${item.isTotal ? 'font-bold text-primary pt-4' : 'text-text-muted'}`}>
                          {item.label}
                        </td>
                        <td
                          className={`py-2 text-right ${
                            item.isTotal ? 'font-bold text-primary pt-4 text-base' : 'text-on-surface'
                          }`}
                        >
                          {item.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="p-stack-md bg-background-base border-t border-border-subtle space-y-stack-sm sticky bottom-0 z-10">
            <button
              onClick={() => {
                approveClaim(claim.id);
                navigate('/dashboard');
              }}
              className="w-full py-4 bg-primary text-on-primary-container font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer btn-hover-effect"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Approve Claim</span>
            </button>
            <div className="flex gap-stack-sm">
              <button
                onClick={() => {
                  escalateClaim(claim.id);
                  navigate('/dashboard');
                }}
                className="flex-1 py-3 border border-border-subtle text-on-surface font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-surface-variant transition-all active:scale-[0.98] cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span>Escalate</span>
              </button>
              <button
                onClick={() => {
                  rejectClaim(claim.id);
                  navigate('/dashboard');
                }}
                className="flex-1 py-3 border border-border-subtle text-danger font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-danger/10 transition-all active:scale-[0.98] cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
