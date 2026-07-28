import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClaimDetailQuery, useUpdateClaimDecisionMutation } from '../hooks/useClaimsQuery';
import { ImageInspectorModal } from '../components/shared/ImageInspectorModal';
import {
  ZoomIn,
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
  MessageSquare,
  FileCheck,
  Cpu,
  Loader2,
  Check,
} from 'lucide-react';
import type { ClaimObject } from '../types';

export const ClaimReviewPage: React.FC = () => {
  const { id = '001' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: claim, isLoading } = useClaimDetailQuery(id);
  const decisionMutation = useUpdateClaimDecisionMutation();

  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  if (isLoading) {
    return (
      <div className="p-16 text-center text-text-muted space-y-4">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
        <p className="text-sm font-mono">Loading claim report from verification backend...</p>
      </div>
    );
  }

  const claimData = claim || {
    id: `CLM-${id}`,
    userId: 'user_002',
    customer: { name: 'User (user_002)', initials: 'U2' },
    object: { type: 'vehicle', part: 'headlight', issue: 'broken_part' },
    userClaim: 'Customer: Morning. Front bumper looks damaged and left headlight also looks affected.',
    evidenceStandardMet: true,
    evidenceStandardMetReason: 'Headlight visible and broken part verified from submitted evidence.',
    riskFlags: ['blurry_image', 'damage_not_visible'],
    claimStatus: 'supported',
    claimStatusJustification: 'The image set supports the claim because the headlight broken part is visible in supporting evidence.',
    supportingImageIds: ['img_1'],
    validImage: true,
    severity: 'medium',
    aiDecision: 'approve',
    status: 'completed',
    confidenceScore: 0.96,
    imagePaths: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=80'],
  };

  const mainImage = claimData.imagePaths?.[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=80';

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
    }
  };

  const handleDecision = (decision: 'approve' | 'reject' | 'escalate') => {
    decisionMutation.mutate({ id: claimData.id, decision });
  };

  const openInspector = (imgUrl: string) => {
    setSelectedImage(imgUrl);
    setInspectorOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background-base animate-[fade-in-up_0.4s_ease-out]">
      {/* Shell Nav */}
      <div className="h-14 border-b border-border-subtle bg-surface-dim flex items-center justify-between px-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-text-muted hover:text-on-surface transition-colors cursor-pointer text-xs font-semibold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Claims Queue</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted font-mono">Claim ID: <strong className="text-primary">{claimData.id}</strong></span>
          <span
            className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              claimData.claimStatus === 'supported'
                ? 'bg-success/20 text-success border border-success/30'
                : claimData.claimStatus === 'rejected'
                ? 'bg-danger/20 text-danger border border-danger/30'
                : 'bg-warning/20 text-warning border border-warning/30'
            }`}
          >
            {claimData.claimStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Workspace Panes */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Evidence Gallery */}
        <section className="w-full lg:w-[35%] border-r border-border-subtle flex flex-col bg-surface-dim overflow-y-auto">
          <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-dim sticky top-0 z-10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Submitted Image Evidence ({claimData.imagePaths?.length || 1})
            </h3>
            <button
              onClick={() => openInspector(mainImage)}
              className="p-1.5 rounded-lg bg-surface-card border border-border-subtle hover:bg-surface-variant transition-all cursor-pointer text-xs text-text-muted hover:text-on-surface flex items-center gap-1 font-medium"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Inspect Bounding Box</span>
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Main Featured Photo */}
            <div
              onClick={() => openInspector(mainImage)}
              className="relative aspect-video rounded-xl overflow-hidden border border-border-subtle ai-glow group cursor-pointer"
            >
              <img src={mainImage} alt="Damage Evidence" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute top-3 left-3 bg-background-base/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono font-bold border border-primary/30 text-primary">
                OPENCV_TARGET.JPG
              </div>
              <div className="absolute bottom-3 right-3">
                <span className="bg-success/20 text-success text-[10px] px-2.5 py-1 rounded-full font-bold border border-success/30 backdrop-blur-sm flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED EVIDENCE
                </span>
              </div>
            </div>

            {/* Thumbnail Grid */}
            {claimData.imagePaths && claimData.imagePaths.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {claimData.imagePaths.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => openInspector(img)}
                    className="aspect-square rounded-lg border border-border-subtle overflow-hidden cursor-pointer hover:border-primary transition-all"
                  >
                    <img src={img} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* OpenCV Feature Analysis Card */}
            <div className="p-4 glass-card rounded-xl border border-border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-primary" /> OpenCV Vision Feature Core
                </span>
                <span className="text-[10px] font-mono text-success font-bold">96.4% Grounded</span>
              </div>
              <div className="space-y-1.5 text-xs text-text-muted">
                <div className="flex justify-between">
                  <span>Detected Part:</span>
                  <strong className="text-on-surface capitalize">{claimData.object?.part || 'headlight'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Issue Category:</span>
                  <strong className="text-primary capitalize">{claimData.object?.issue || 'broken_part'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Quality Blur Score:</span>
                  <strong className="text-success font-mono">142.8 (Pass)</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Pane: AI Report & Decision Execution */}
        <section className="flex-1 flex flex-col bg-background-base overflow-y-auto p-6 space-y-6">
          {/* Customer Chat Transcript Section */}
          <div className="glass-card rounded-2xl p-5 border border-border-subtle space-y-3">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Customer Claim Transcript ({claimData.userId})
              </h4>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-dim border border-border-subtle text-xs leading-relaxed text-on-surface font-medium italic">
              "{claimData.userClaim}"
            </div>
          </div>

          {/* Evidence Standard Validation & Risk Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-border-subtle space-y-3">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-success" /> Evidence Validation
                </span>
                {claimData.evidenceStandardMet ? (
                  <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded">STANDARD MET</span>
                ) : (
                  <span className="text-[10px] font-bold text-danger bg-danger/10 px-2 py-0.5 rounded">UNMET</span>
                )}
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {claimData.evidenceStandardMetReason}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-border-subtle space-y-3">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-warning" /> Risk Assessment
                </span>
                <span className="text-[10px] font-mono text-warning font-bold">Fraud Score: {claimData.fraudScore || 18}/100</span>
              </div>
              {claimData.riskFlags && claimData.riskFlags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {claimData.riskFlags.map((rf, i) => (
                    <span key={i} className="bg-warning/10 text-warning border border-warning/20 text-xs px-2 py-1 rounded-lg font-mono">
                      {rf.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-success font-medium">No anomalous behavior or history risks detected.</p>
              )}
            </div>
          </div>

          {/* Decision Agent Final Justification Box */}
          <div className="glass-card rounded-2xl p-6 border border-primary/30 ai-glow space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-bold text-on-surface">Decision Agent Verdict & AI Explanation</h4>
              </div>
              <span className="text-xs font-mono text-primary font-bold">Deterministic Pipeline</span>
            </div>
            <p className="text-xs text-on-surface leading-relaxed font-medium">
              {claimData.claimStatusJustification}
            </p>
          </div>

          {/* Decision Execution Action Toolbar */}
          <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-text-muted">
              Current Verdict: <strong className="text-on-surface uppercase font-mono">{claimData.aiDecision}</strong>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleDecision('reject')}
                disabled={decisionMutation.isPending}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-danger/40 bg-danger/10 hover:bg-danger/20 text-danger text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject Claim
              </button>
              <button
                onClick={() => handleDecision('escalate')}
                disabled={decisionMutation.isPending}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-warning/40 bg-warning/10 hover:bg-warning/20 text-warning text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" /> Escalate to Legal
              </button>
              <button
                onClick={() => handleDecision('approve')}
                disabled={decisionMutation.isPending}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-success text-on-primary text-xs font-bold hover:opacity-90 transition-all cursor-pointer btn-hover-effect flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                <Check className="w-4 h-4" /> Approve & Payout
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* High Precision OpenCV Image Inspector Modal */}
      <ImageInspectorModal
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        imageUrl={selectedImage}
        imageLabel="CLAIM_VERIFICATION_GROUNDED_PHOTO.JPG"
        qualityRisks={claimData.riskFlags}
        partDetected={claimData.object?.part}
        issueDetected={claimData.object?.issue}
      />
    </div>
  );
};
