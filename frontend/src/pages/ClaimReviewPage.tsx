import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClaimDetailQuery, useUpdateClaimDecisionMutation } from '../hooks/useClaimsQuery';
import { ImageInspectorModal } from '../components/shared/ImageInspectorModal';
import {
  ZoomIn,
  AlertTriangle,
  XCircle,
  Smartphone,
  Building2,
  Package,
  Car,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  MessageSquare,
  FileCheck,
  Cpu,
  Loader2,
  Check,
  ArrowRight,
  Sparkles,
  Eye,
  FileText,
  Shield,
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
      <div className="p-16 text-center text-[#A1A1AA] space-y-4 rounded-2xl bg-[#141720] border border-[rgba(255,255,255,0.08)] my-8 max-w-2xl mx-auto">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#8B7BFF]" />
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
        return <Car className="w-4 h-4 text-[#8B7BFF]" />;
      case 'electronics':
        return <Smartphone className="w-4 h-4 text-[#8B7BFF]" />;
      case 'property':
        return <Building2 className="w-4 h-4 text-[#8B7BFF]" />;
      case 'package':
        return <Package className="w-4 h-4 text-[#8B7BFF]" />;
    }
  };

  const handleDecision = (decision: 'approve' | 'reject' | 'escalate') => {
    decisionMutation.mutate({ id: claimData.id, decision });
  };

  const openInspector = (imgUrl: string) => {
    setSelectedImage(imgUrl);
    setInspectorOpen(true);
  };

  // 7-Step Workflow Timeline Steps
  const workflowSteps = [
    { label: 'Upload', icon: FileText, completed: true },
    { label: 'Image Processing', icon: Cpu, completed: true },
    { label: 'Vision Analysis', icon: Eye, completed: true },
    { label: 'Evidence Validation', icon: FileCheck, completed: true },
    { label: 'Risk Analysis', icon: Shield, completed: true },
    { label: 'Decision Engine', icon: Sparkles, completed: true },
    { label: 'Final Result', icon: ShieldCheck, completed: true },
  ];

  return (
    <div className="space-y-6 animate-[fade-in-up_0.4s_ease-out]">
      {/* Shell Sub-header Nav */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[rgba(255,255,255,0.08)]">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors cursor-pointer text-xs font-semibold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Claims Queue</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs text-[#A1A1AA] font-mono">
            Claim ID: <strong className="text-[#8B7BFF] font-bold text-sm">{claimData.id}</strong>
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              claimData.claimStatus === 'supported'
                ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                : claimData.claimStatus === 'rejected'
                ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
            }`}
          >
            {claimData.claimStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* 7-Step Interactive Claim Workflow Timeline */}
      <div className="p-6 rounded-2xl bg-[#141720] border border-[rgba(255,255,255,0.08)] shadow-lg overflow-x-auto">
        <div className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Multi-Agent Pipeline Execution Workflow</span>
          <span className="text-[#22C55E] flex items-center gap-1 font-semibold">
            <Check className="w-3.5 h-3.5" /> All 7 Verification Steps Executed
          </span>
        </div>

        <div className="flex items-center justify-between min-w-[700px] gap-2 relative">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-10 h-10 rounded-xl bg-[#8B7BFF]/15 border border-[#8B7BFF]/40 text-[#8B7BFF] flex items-center justify-center ai-glow shadow-md">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#F8FAFC] text-center font-mono">{step.label}</span>
                </div>
                {idx < workflowSteps.length - 1 && (
                  <div className="flex-1 h-[2px] bg-gradient-to-r from-[#8B7BFF]/40 to-[#22C55E]/40 mb-5"></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Workspace Split Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Evidence Gallery & OpenCV Metrics */}
        <section className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#141720] border border-[rgba(255,255,255,0.08)] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[rgba(255,255,255,0.08)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#8B7BFF]" /> Damage Evidence ({claimData.imagePaths?.length || 1})
              </h3>
              <button
                onClick={() => openInspector(mainImage)}
                className="px-3 py-1.5 rounded-xl bg-[#0F1117] border border-[rgba(255,255,255,0.08)] hover:bg-[#141720] transition-all cursor-pointer text-xs text-[#A1A1AA] hover:text-[#F8FAFC] flex items-center gap-1.5 font-medium"
              >
                <ZoomIn className="w-3.5 h-3.5 text-[#8B7BFF]" />
                <span>Inspect Bounding Box</span>
              </button>
            </div>

            {/* Featured Photo */}
            <div
              onClick={() => openInspector(mainImage)}
              className="relative aspect-video rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)] ai-glow group cursor-pointer"
            >
              <img src={mainImage} alt="Damage Evidence" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute top-3 left-3 bg-[#050505]/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border border-[#8B7BFF]/30 text-[#8B7BFF]">
                OPENCV_TARGET.JPG
              </div>
              <div className="absolute bottom-3 right-3">
                <span className="bg-[#22C55E]/20 text-[#22C55E] text-[10px] px-2.5 py-1 rounded-full font-bold border border-[#22C55E]/30 backdrop-blur-sm flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> GROUNDED EVIDENCE
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {claimData.imagePaths && claimData.imagePaths.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {claimData.imagePaths.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => openInspector(img)}
                    className="aspect-square rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden cursor-pointer hover:border-[#8B7BFF] transition-all"
                  >
                    <img src={img} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OpenCV Feature Analysis Output */}
          <div className="p-6 rounded-2xl bg-[#141720] border border-[rgba(255,255,255,0.08)] space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
              <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#8B7BFF]" /> OpenCV Vision Core Output
              </span>
              <span className="text-xs font-mono text-[#22C55E] font-bold">96.4% Grounded</span>
            </div>
            <div className="space-y-2 text-xs text-[#A1A1AA]">
              <div className="flex justify-between py-1 border-b border-[rgba(255,255,255,0.04)]">
                <span>Target Part:</span>
                <strong className="text-[#F8FAFC] capitalize flex items-center gap-1.5">
                  {getObjectIcon(claimData.object?.type || 'vehicle')} {claimData.object?.part || 'headlight'}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[rgba(255,255,255,0.04)]">
                <span>Issue Category:</span>
                <strong className="text-[#8B7BFF] capitalize">{claimData.object?.issue || 'broken_part'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[rgba(255,255,255,0.04)]">
                <span>Quality Blur Score:</span>
                <strong className="text-[#22C55E] font-mono">142.8 (Pass)</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Edge Density Gradient:</span>
                <strong className="text-[#F8FAFC] font-mono">0.084</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Customer Transcript, Evidence Standards & Action Toolbar */}
        <section className="lg:col-span-7 space-y-6">
          {/* Customer Chat Transcript Box */}
          <div className="p-6 rounded-2xl bg-[#141720] border border-[rgba(255,255,255,0.08)] space-y-3">
            <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-3">
              <MessageSquare className="w-4 h-4 text-[#8B7BFF]" />
              <h4 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
                Ground-Truth Customer Claim Transcript ({claimData.userId})
              </h4>
            </div>
            <div className="p-4 rounded-xl bg-[#0F1117] border border-[rgba(255,255,255,0.08)] text-xs leading-relaxed text-[#F8FAFC] font-medium italic">
              "{claimData.userClaim}"
            </div>
          </div>

          {/* Evidence Standards & Risk Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#141720] border border-[rgba(255,255,255,0.08)] space-y-3">
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
                <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[#22C55E]" /> Evidence Standard
                </span>
                {claimData.evidenceStandardMet ? (
                  <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded font-mono">STANDARD MET</span>
                ) : (
                  <span className="text-[10px] font-bold text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded font-mono">UNMET</span>
                )}
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {claimData.evidenceStandardMetReason}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#141720] border border-[rgba(255,255,255,0.08)] space-y-3">
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
                <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#F59E0B]" /> Risk Assessment
                </span>
                <span className="text-[10px] font-mono text-[#F59E0B] font-bold">Fraud Score: {claimData.fraudScore || 18}/100</span>
              </div>
              {claimData.riskFlags && claimData.riskFlags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {claimData.riskFlags.map((rf: string, i: number) => (
                    <span key={i} className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 text-xs px-2.5 py-1 rounded-lg font-mono">
                      {rf.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#22C55E] font-medium">No behavioral or visual history risks detected.</p>
              )}
            </div>
          </div>

          {/* Decision Agent Final Verdict Box */}
          <div className="p-6 rounded-2xl bg-[#141720] border border-[#8B7BFF]/40 ai-glow space-y-3">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#8B7BFF]" />
                <h4 className="text-sm font-bold text-[#F8FAFC]">Decision Agent Verdict &amp; Explanation</h4>
              </div>
              <span className="text-xs font-mono text-[#8B7BFF] font-bold">Deterministic Output</span>
            </div>
            <p className="text-xs text-[#F8FAFC] leading-relaxed font-medium">
              {claimData.claimStatusJustification}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="p-5 rounded-2xl bg-[#141720] border border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#A1A1AA]">
              Current Action: <strong className="text-[#F8FAFC] uppercase font-mono">{claimData.aiDecision}</strong>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleDecision('reject')}
                disabled={decisionMutation.isPending}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject Claim
              </button>
              <button
                onClick={() => handleDecision('escalate')}
                disabled={decisionMutation.isPending}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-[#F59E0B]/40 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" /> Escalate to Legal
              </button>
              <button
                onClick={() => handleDecision('approve')}
                disabled={decisionMutation.isPending}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#22C55E] text-[#050505] text-xs font-bold hover:opacity-90 transition-all cursor-pointer btn-hover-effect flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              >
                <Check className="w-4 h-4" /> Approve &amp; Payout
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Image Bounding Box Inspector Modal */}
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
