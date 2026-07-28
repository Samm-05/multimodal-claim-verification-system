import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Sparkles, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useVerifyClaimMutation } from '../../hooks/useClaimsQuery';

interface ClaimUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClaimUploadModal: React.FC<ClaimUploadModalProps> = ({ isOpen, onClose }) => {
  const [claimObject, setClaimObject] = useState('vehicle');
  const [userClaimText, setUserClaimText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [pipelineStep, setPipelineStep] = useState<number>(0);

  const verifyMutation = useVerifyClaimMutation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const urls = files.map((file) => URL.createObjectURL(file));
      setSelectedImages((prev) => [...prev, ...urls]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const urls = files.map((file) => URL.createObjectURL(file));
      setSelectedImages((prev) => [...prev, ...urls]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userClaimText.trim()) return;

    setPipelineStep(1); // 1. Claim Extraction
    await new Promise((r) => setTimeout(r, 600));

    setPipelineStep(2); // 2. OpenCV Vision Analysis
    await new Promise((r) => setTimeout(r, 700));

    setPipelineStep(3); // 3. Evidence Validation & Risk Scoring
    await new Promise((r) => setTimeout(r, 600));

    setPipelineStep(4); // 4. Decision Engine Verdict

    verifyMutation.mutate(
      {
        userClaim: userClaimText,
        claimObject: claimObject,
        imagePaths: selectedImages.length > 0 ? selectedImages : undefined,
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            setPipelineStep(0);
            setUserClaimText('');
            setSelectedImages([]);
            onClose();
          }, 800);
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-[#141720] border border-[rgba(255,255,255,0.08)] rounded-3xl p-8 shadow-2xl relative overflow-hidden ai-glow"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#8B7BFF]/15 border border-[#8B7BFF]/30 text-[#8B7BFF]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F8FAFC]">Execute Multi-Agent Claim Verification</h3>
                <p className="text-xs text-[#A1A1AA]">Real-time Python verification engine execution</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#0F1117] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {pipelineStep > 0 ? (
            /* Live Laser Scanning AI Pipeline Execution Progress */
            <div className="py-12 space-y-8 text-center relative overflow-hidden">
              {/* Laser Line */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#8B7BFF] to-transparent animate-[pulse_1.5s_infinite]"></div>
              </div>

              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#8B7BFF]/15 border border-[#8B7BFF]/40 text-[#8B7BFF] ai-glow-strong animate-pulse">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-extrabold text-[#F8FAFC]">
                  {pipelineStep === 1 && '1/4 Extracting Customer Claim Terms...'}
                  {pipelineStep === 2 && '2/4 Running OpenCV Vision & Quality Core...'}
                  {pipelineStep === 3 && '3/4 Validating Evidence & History Risks...'}
                  {pipelineStep === 4 && '4/4 Generating AI Explanation & Verdict...'}
                </h4>
                <p className="text-xs text-[#A1A1AA] font-mono">
                  Python backend multi-agent pipeline processing in background
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <div className="h-2 w-full bg-[#0F1117] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B7BFF] to-[#6D5DF6] transition-all duration-500"
                    style={{ width: `${(pipelineStep / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            /* Hero Image Upload & Claim Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Domain Selection */}
              <div>
                <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-2 font-mono">
                  1. Select Claim Domain
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
                      className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        claimObject === item.id
                          ? 'border-[#8B7BFF] bg-[#8B7BFF]/15 text-[#8B7BFF] shadow-[0_0_15px_rgba(139,123,255,0.2)]'
                          : 'border-[rgba(255,255,255,0.08)] bg-[#0F1117] text-[#A1A1AA] hover:border-[rgba(255,255,255,0.15)]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Chat Transcript Statement */}
              <div>
                <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-2 font-mono">
                  2. Ground-Truth Customer Statement
                </label>
                <textarea
                  rows={3}
                  value={userClaimText}
                  onChange={(e) => setUserClaimText(e.target.value)}
                  placeholder="e.g. Customer: Morning. Front bumper looks dented and left headlight shattered..."
                  className="w-full bg-[#0F1117] border border-[rgba(255,255,255,0.08)] rounded-xl p-3.5 text-xs text-[#F8FAFC] focus:ring-2 focus:ring-[#8B7BFF] focus:border-[#8B7BFF] outline-none transition-all resize-none"
                  required
                />
              </div>

              {/* Hero Image Upload Zone */}
              <div>
                <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-2 font-mono">
                  3. Damage Image Evidence (Hero Drag &amp; Drop)
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-[rgba(255,255,255,0.12)] hover:border-[#8B7BFF]/60 rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#0F1117]/60 relative overflow-hidden group"
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />

                  {selectedImages.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap justify-center gap-3">
                        {selectedImages.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-xl border border-[rgba(255,255,255,0.15)] overflow-hidden shadow-lg">
                            <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-[#22C55E] font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> {selectedImages.length} Image(s) Attached (Click or drag to add more)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-[#8B7BFF]/10 text-[#8B7BFF] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-[#F8FAFC] font-bold">
                          Drag &amp; drop claim photos here, or <span className="text-[#8B7BFF] underline">browse files</span>
                        </p>
                        <p className="text-[11px] text-[#A1A1AA] mt-1">Supports JPG, PNG, WEBP • Auto Quality &amp; Blur Compression Check</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-transparent text-[#A1A1AA] text-xs font-semibold hover:text-[#F8FAFC] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!userClaimText.trim() || verifyMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-[#8B7BFF] text-[#050505] font-bold text-xs hover:opacity-90 transition-all cursor-pointer btn-hover-effect flex items-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(139,123,255,0.3)]"
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
