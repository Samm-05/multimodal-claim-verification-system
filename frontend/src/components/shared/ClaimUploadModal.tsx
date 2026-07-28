import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Sparkles, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useVerifyClaimMutation } from '../../hooks/useClaimsQuery';

interface ClaimUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClaimUploadModal: React.FC<ClaimUploadModalProps> = ({ isOpen, onClose }) => {
  const [claimObject, setClaimObject] = useState('vehicle');
  const [userClaimText, setUserClaimText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pipelineStep, setPipelineStep] = useState<number>(0);

  const verifyMutation = useVerifyClaimMutation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userClaimText.trim()) return;

    setPipelineStep(1); // Claim Extraction
    await new Promise((r) => setTimeout(r, 600));

    setPipelineStep(2); // Vision & Quality Analysis
    await new Promise((r) => setTimeout(r, 700));

    setPipelineStep(3); // Evidence Validation & Risk Assessment
    await new Promise((r) => setTimeout(r, 600));

    setPipelineStep(4); // Decision Agent

    verifyMutation.mutate(
      {
        userClaim: userClaimText,
        claimObject: claimObject,
        imagePaths: selectedImage ? [selectedImage] : undefined,
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            setPipelineStep(0);
            setUserClaimText('');
            setSelectedImage(null);
            onClose();
          }, 800);
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-base/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">Submit Claim for Multi-Agent Verification</h3>
                <p className="text-xs text-text-muted">Real-time processing via ClaimIQ Python pipeline</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-text-muted hover:text-on-surface hover:bg-surface-variant transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {pipelineStep > 0 ? (
            /* Live Pipeline Execution Progress */
            <div className="py-8 space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/30 text-primary ai-glow animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h4 className="text-xl font-bold text-on-surface">
                {pipelineStep === 1 && '1/4 Extracting Claim Intent...'}
                {pipelineStep === 2 && '2/4 Running OpenCV Vision & Quality Checks...'}
                {pipelineStep === 3 && '3/4 Validating Evidence & Assessing Risk...'}
                {pipelineStep === 4 && '4/4 Generating AI Final Justification...'}
              </h4>
              <div className="max-w-md mx-auto space-y-2">
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                    style={{ width: `${(pipelineStep / 4) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-text-muted">Multi-Agent pipeline executing safely in background</p>
              </div>
            </div>
          ) : (
            /* Claim Upload Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Claim Object Type */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Claim Object Domain
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { id: 'vehicle', label: 'Vehicle' },
                    { id: 'electronics', label: 'Electronics' },
                    { id: 'package', label: 'Package' },
                    { id: 'property', label: 'Property' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setClaimObject(item.id)}
                      className={`py-2.5 px-3 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
                        claimObject === item.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border-subtle bg-surface-dim text-text-muted hover:border-border-subtle/80'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Chat Transcript / Claim Description */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Customer Conversation / Claim Statement
                </label>
                <textarea
                  rows={3}
                  value={userClaimText}
                  onChange={(e) => setUserClaimText(e.target.value)}
                  placeholder="e.g. Customer: Front bumper hit while parking. Deep scratch and cracked headlight..."
                  className="w-full bg-surface-dim border border-border-subtle rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                  required
                />
              </div>

              {/* Drag & Drop Image Upload Zone */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Damage Image Evidence
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-border-subtle hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer transition-all bg-surface-dim/50 relative overflow-hidden"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {selectedImage ? (
                    <div className="flex items-center justify-center gap-4">
                      <img src={selectedImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-border-subtle" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-success flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Image Attached
                        </p>
                        <p className="text-[11px] text-text-muted">Click or drag to replace</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-text-muted" />
                      <p className="text-xs text-text-muted font-medium">
                        Drag and drop claim photos here, or <span className="text-primary font-bold">browse</span>
                      </p>
                      <p className="text-[10px] text-text-muted">Supports JPG, PNG, WEBP up to 25MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Action */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-border-subtle bg-transparent text-text-muted text-sm hover:text-on-surface transition-all cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!userClaimText.trim() || verifyMutation.isPending}
                  className="px-6 py-2 rounded-lg bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all cursor-pointer btn-hover-effect flex items-center gap-2 disabled:opacity-50"
                >
                  <span>Execute Verification Pipeline</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
