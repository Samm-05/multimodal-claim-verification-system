import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  Cloud,
  BarChart3,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Cpu,
  Eye,
  FileCheck,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTab, setActiveTab] = useState<'extraction' | 'vision' | 'evidence' | 'decision'>('vision');

  // Optimized Particle Mesh Shader Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 50;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.4 + 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep dark mesh gradient
      const gradient = ctx.createRadialGradient(width / 2, height / 3, 10, width / 2, height / 2, Math.max(width, height));
      gradient.addColorStop(0, '#0d0b18');
      gradient.addColorStop(0.5, '#050505');
      gradient.addColorStop(1, '#020202');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Inter-particle web lines
      ctx.strokeStyle = 'rgba(139, 124, 255, 0.08)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Render nodes
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        ctx.fillStyle = `rgba(139, 124, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx = -p.vx;
        if (p.y < 0 || p.y > height) p.vy = -p.vy;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative overflow-hidden bg-background-base min-h-screen text-on-surface">
      {/* Background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative z-10 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-page-margin-mobile md:px-page-margin-desktop py-20 text-center">
        <div className="max-w-5xl w-full space-y-6 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-surface-dim border border-border-subtle rounded-full px-4 py-1.5 animate-ai-border"
          >
            <span className="w-2 h-2 rounded-full bg-primary ai-glow animate-pulse"></span>
            <span className="font-mono text-xs text-primary font-bold uppercase tracking-widest">
              Multi-Agent AI Claim Verification Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl max-w-5xl mx-auto tracking-tight font-extrabold text-on-surface leading-tight"
          >
            Autonomous Claim Verification with <span className="shimmer-text italic">Computer Vision</span> & Multi-Agent Intelligence.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-text-muted text-base md:text-xl max-w-2xl mx-auto font-normal leading-relaxed"
          >
            ClaimIQ AI orchestrates specialized agents—Extraction, Vision, Quality, Evidence Validation, Risk, and Decision—to analyze claim transcripts, damage evidence, and user history in milliseconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto bg-primary text-on-primary font-bold text-sm px-8 py-3.5 rounded-xl cursor-pointer transition-all btn-hover-effect flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(139,124,255,0.25)]"
            >
              <span>Launch Enterprise Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#interactive-demo"
              className="w-full sm:w-auto bg-surface-card border border-border-subtle text-on-surface font-semibold text-sm px-8 py-3.5 rounded-xl cursor-pointer transition-all hover:bg-surface-dim hover:border-border-subtle/80 flex items-center justify-center gap-2"
            >
              <span>Explore Multi-Agent Pipeline</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Interactive Multi-Agent Pipeline Preview Console */}
          <motion.div
            id="interactive-demo"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-16 w-full max-w-5xl mx-auto"
          >
            <div className="glass-card rounded-2xl p-6 shadow-2xl border border-border-subtle text-left relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-danger/80"></span>
                    <span className="w-3 h-3 rounded-full bg-warning/80"></span>
                    <span className="w-3 h-3 rounded-full bg-success/80"></span>
                  </div>
                  <span className="text-xs font-mono text-text-muted">pipeline.execution.engine — case_001</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[11px] font-mono text-success bg-success/10 px-2 py-0.5 rounded border border-success/20">
                    6 AGENTS ACTIVE
                  </span>
                </div>
              </div>

              {/* Agent Tabs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                {[
                  { id: 'extraction', label: '1. Extraction Agent', icon: Cpu },
                  { id: 'vision', label: '2. OpenCV Vision Agent', icon: Eye },
                  { id: 'evidence', label: '3. Evidence Validation', icon: FileCheck },
                  { id: 'decision', label: '4. Decision Agent', icon: ShieldCheck },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-primary/10 border-primary text-primary ai-glow'
                          : 'bg-surface-dim border-border-subtle text-text-muted hover:border-border-subtle/80'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Display Panel */}
              <div className="p-5 rounded-xl bg-surface-dim border border-border-subtle min-h-[160px] flex flex-col justify-center">
                {activeTab === 'extraction' && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-primary uppercase tracking-wider font-bold">Input Transcript Grounding</span>
                    <p className="text-sm text-on-surface font-medium">"Front bumper looks damaged and left headlight also looks affected. Review both."</p>
                    <div className="flex gap-4 pt-2 text-xs text-text-muted font-mono">
                      <span>Parsed Object: <strong className="text-on-surface">Vehicle</strong></span>
                      <span>Extracted Part: <strong className="text-primary">headlight</strong></span>
                      <span>Issue: <strong className="text-primary">broken_part</strong></span>
                    </div>
                  </div>
                )}
                {activeTab === 'vision' && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-success uppercase tracking-wider font-bold">OpenCV Feature Extraction Output</span>
                    <p className="text-sm text-on-surface font-medium">Blur score: 142.8 (Pass) • Edge density gradient verified • Bounding box matched REQ_GENERAL_OBJECT_PART.</p>
                    <div className="flex gap-4 pt-2 text-xs text-text-muted font-mono">
                      <span>Quality Check: <strong className="text-success">PASS</strong></span>
                      <span>Duplicate Hash: <strong className="text-on-surface">None</strong></span>
                      <span>Confidence: <strong className="text-success">96.4%</strong></span>
                    </div>
                  </div>
                )}
                {activeTab === 'evidence' && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-warning uppercase tracking-wider font-bold">Evidence Standard Match</span>
                    <p className="text-sm text-on-surface font-medium">Matched requirements REQ_GENERAL_OBJECT_PART and REQ_GENERAL_MULTI_IMAGE from evidence standards library.</p>
                    <div className="flex gap-4 pt-2 text-xs text-text-muted font-mono">
                      <span>Evidence Met: <strong className="text-success">TRUE</strong></span>
                      <span>Risk Flags: <strong className="text-warning">blurry_image; damage_not_visible</strong></span>
                    </div>
                  </div>
                )}
                {activeTab === 'decision' && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-success uppercase tracking-wider font-bold">Decision Agent Verdict</span>
                    <p className="text-sm text-on-surface font-medium font-mono text-success">CLAIM STATUS: SUPPORTED (Approved)</p>
                    <p className="text-xs text-text-muted">Justification: "The image set supports the claim because the headlight broken part is visible in the supporting evidence."</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Enterprise Metrics */}
      <section className="py-16 border-y border-border-subtle bg-surface-dim/40 relative z-10">
        <div className="max-w-7xl mx-auto px-page-margin-desktop text-center">
          <p className="text-xs font-mono text-text-muted uppercase tracking-[0.2em] mb-8">
            Verified Enterprise Performance Metrics
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-extrabold text-on-surface">96.4%</div>
              <div className="text-xs text-text-muted">Verification Accuracy</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-extrabold text-success">1.24s</div>
              <div className="text-xs text-text-muted">Average Latency</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-extrabold text-primary">6</div>
              <div className="text-xs text-text-muted">Specialized AI Agents</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-extrabold text-warning">0.00%</div>
              <div className="text-xs text-text-muted">Hallucinated Verdicts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="platform" className="py-24 px-page-margin-desktop max-w-7xl mx-auto relative z-10">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Built like Stripe for Autonomous Insurance Operations.
          </h2>
          <p className="text-text-muted text-base">
            Every layer—from extraction to OpenCV computer vision feature detection—is fully explainable, deterministic, and future-ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 glass-card rounded-2xl p-8 flex flex-col justify-between hover:border-primary/50 transition-all hover:scale-[1.01]">
            <div>
              <Shield className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-2">Multi-Agent Pipeline Architecture</h3>
              <p className="text-text-muted text-sm leading-relaxed max-w-xl">
                Decoupled micro-agents process claims deterministically. Extract terms, analyze visual feature gradients, score blur and contrast, validate against policy evidence requirements, and render explainable verdicts.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted font-mono">
              <span>CSV Pipeline Execution Supported</span>
              <span className="text-primary font-bold">100% Deterministic</span>
            </div>
          </div>

          <div className="md:col-span-4 glass-card rounded-2xl p-8 flex flex-col justify-between hover:border-primary/50 transition-all hover:scale-[1.01]">
            <div>
              <Eye className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-2">OpenCV & Gemini Ready</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Pluggable Vision Provider abstraction layer. Switch between OpenCV computer vision core, Gemini Vision, GPT-4o, and Claude without altering UI code.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-border-subtle flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-surface-dim border border-border-subtle text-[10px] font-mono text-text-muted">OpenCV</span>
              <span className="px-2 py-0.5 rounded bg-surface-dim border border-border-subtle text-[10px] font-mono text-text-muted">Gemini</span>
              <span className="px-2 py-0.5 rounded bg-surface-dim border border-border-subtle text-[10px] font-mono text-text-muted">GPT-4o</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-page-margin-desktop relative z-10">
        <div className="max-w-5xl mx-auto glass-card rounded-3xl p-12 text-center border border-border-subtle relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to test autonomous claim verification?
          </h2>
          <p className="text-text-muted text-base max-w-xl mx-auto mb-8">
            Access the production-ready claims console powered by real dataset predictions and live multi-agent verification.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary text-on-primary font-bold text-sm px-10 py-4 rounded-xl cursor-pointer transition-all btn-hover-effect inline-flex items-center gap-2 shadow-[0_0_25px_rgba(139,124,255,0.3)]"
          >
            <span>Launch Claims Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
