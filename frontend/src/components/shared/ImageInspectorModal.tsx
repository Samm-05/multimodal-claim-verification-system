import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw, ShieldCheck, ShieldAlert, FileText, Camera, MapPin, Clock } from 'lucide-react';

interface ImageInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageLabel?: string;
  verified?: boolean;
  qualityRisks?: string[];
  partDetected?: string;
  issueDetected?: string;
}

export const ImageInspectorModal: React.FC<ImageInspectorModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageLabel = 'EVIDENCE_PREVIEW.JPG',
  verified = true,
  qualityRisks = [],
  partDetected = 'headlight',
  issueDetected = 'broken_part',
}) => {
  const [zoom, setZoom] = useState<number>(1);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-base/90 backdrop-blur-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-5xl h-[85vh] bg-surface-card border border-border-subtle rounded-2xl flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Top Bar */}
          <div className="h-14 border-b border-border-subtle px-6 flex items-center justify-between bg-surface-dim">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-on-surface font-mono">{imageLabel}</span>
              {verified ? (
                <span className="bg-success/20 text-success text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-success/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED EVIDENCE
                </span>
              ) : (
                <span className="bg-warning/20 text-warning text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-warning/30 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> UNVERIFIED
                </span>
              )}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(0.8, z - 0.2))}
                className="p-1.5 rounded-lg border border-border-subtle bg-surface-container text-text-muted hover:text-on-surface hover:bg-surface-variant transition-all cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-text-muted w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                className="p-1.5 rounded-lg border border-border-subtle bg-surface-container text-text-muted hover:text-on-surface hover:bg-surface-variant transition-all cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 rounded-lg border border-border-subtle bg-surface-container text-text-muted hover:text-on-surface hover:bg-surface-variant transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="ml-4 p-1.5 rounded-lg text-text-muted hover:text-on-surface hover:bg-surface-variant transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Inspection View */}
          <div className="flex-1 flex overflow-hidden">
            {/* Image Canvas Viewport */}
            <div className="flex-1 bg-black flex items-center justify-center p-6 overflow-auto relative">
              <div
                className="transition-transform duration-200 relative max-w-full max-h-full"
                style={{ transform: `scale(${zoom})` }}
              >
                <img src={imageUrl} alt={imageLabel} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl" />

                {/* OpenCV Vision Bounding Box Overlay */}
                <div className="absolute top-1/3 left-1/4 w-1/3 h-1/3 border-2 border-primary border-dashed rounded-lg bg-primary/10 pointer-events-none ai-glow flex items-start p-2">
                  <span className="bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase">
                    {partDetected}: {issueDetected} (94.2% Conf)
                  </span>
                </div>
              </div>
            </div>

            {/* Sidebar Metadata & Inspection Panel */}
            <div className="w-80 border-l border-border-subtle bg-surface-dim p-5 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                  OpenCV Detection Output
                </h4>
                <div className="p-3 rounded-xl bg-surface-card border border-border-subtle space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Target Part:</span>
                    <span className="font-semibold text-on-surface capitalize">{partDetected}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Issue Type:</span>
                    <span className="font-semibold text-primary capitalize">{issueDetected}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Blur Metric Score:</span>
                    <span className="font-semibold text-success font-mono">142.8 (Pass)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Edge Density:</span>
                    <span className="font-semibold text-on-surface font-mono">0.084</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                  Quality & Risk Flags
                </h4>
                {qualityRisks.length > 0 ? (
                  <div className="space-y-2">
                    {qualityRisks.map((risk, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs font-semibold flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span className="capitalize">{risk.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>No Quality Risks Detected</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                  EXIF & Image Metadata
                </h4>
                <div className="space-y-3 text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    <span>Apple iPhone 15 Pro (F/1.78)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>2026-07-28 14:22:04 UTC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>37.7749° N, 122.4194° W</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
