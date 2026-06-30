import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Cloud, Eye, BarChart3, ChevronRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // HTML5 Canvas Particle System for the "AI network / particle system" background
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

    // Particles config
    const particleCount = 60;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background glow
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(1, '#020202');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw lines between nearby particles
      ctx.strokeStyle = 'rgba(192, 193, 255, 0.05)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        ctx.fillStyle = `rgba(192, 193, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Update positions
        p.x += p.vx;
        p.y += p.vy;

        // Bounce walls
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
      <section className="relative z-10 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center overflow-hidden px-page-margin-mobile md:px-page-margin-desktop py-24 text-center">
        <div className="max-w-5xl w-full space-y-stack-lg flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-stack-sm bg-surface-container-low border border-border-subtle rounded-full px-4 py-1 animate-ai-border"
          >
            <span className="w-2 h-2 rounded-full bg-primary ai-glow animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
              Enterprise Alpha Release
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="font-display-lg text-display-lg md:text-[64px] md:leading-[72px] max-w-4xl mx-auto tracking-tight font-extrabold text-on-surface"
          >
            The Operating System for <span className="shimmer-text italic">Autonomous</span> Claims.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="text-text-muted font-body-lg text-body-lg max-w-2xl mx-auto"
          >
            Transform your claims processing with ClaimIQ AI. Real-time verification, computer vision assessment, and fraud detection built for high-performance insurance carriers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-stack-md pt-stack-lg w-full sm:w-auto"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto bg-primary text-on-primary font-bold text-label-md px-10 py-4 rounded-lg cursor-pointer transition-premium btn-hover-effect flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(192,193,255,0.2)]"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full sm:w-auto bg-transparent border border-border-subtle text-on-surface font-semibold text-label-md px-10 py-4 rounded-lg cursor-pointer transition-premium btn-hover-effect hover:bg-surface-variant/40">
              Explore Platform
            </button>
          </motion.div>

          {/* Hero Graphic Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
            className="mt-24 relative max-w-4xl w-full mx-auto"
          >
            <div className="glass-card rounded-xl p-1 shadow-2xl relative overflow-hidden group transition-premium">
              <img
                className="w-full h-auto rounded-lg object-cover transition-premium group-hover:scale-[1.01]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIpJL0QVTXUBVLbZlAWNRQC6QlR28KGvcYKC-broRwrDVkrhV9P2y3NyARwOQb9r7jXMF612FGoJkFMg1JiYGV0X9A372ru5KNnPoJ1j-G0_Ab1lwaB_LiRW_kMFMCRd2WsuEYVaQvElIfybRQOYNJJWZWmV9uzyoOkF49FhlrYcee0yRaQYz7k3MlF2kW391fVJAXCbtW3yUTPcVxI6yiZaQdmaPgsJENg6bsSWzBiUl-a1pwb8u-_ZCZa4qcGUuwtktXQbJ7saQ"
                alt="ClaimIQ AI Dashboard Preview"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-base/80 to-transparent flex items-end p-stack-lg">
                <div className="flex gap-stack-lg w-full">
                  <div className="bg-surface-dim/80 backdrop-blur border border-border-subtle p-stack-md rounded-lg flex-1 text-left transition-premium hover:bg-surface-dim/95 hover:border-primary/50">
                    <div className="text-primary font-bold text-headline-md font-headline-md">99.8%</div>
                    <div className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Verification Accuracy</div>
                  </div>
                  <div className="bg-surface-dim/80 backdrop-blur border border-border-subtle p-stack-md rounded-lg flex-1 text-left transition-premium hover:bg-surface-dim/95 hover:border-primary/50">
                    <div className="text-success font-bold text-headline-md font-headline-md">1.2s</div>
                    <div className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Processing Latency</div>
                  </div>
                  <div className="hidden sm:block bg-surface-dim/80 backdrop-blur border border-border-subtle p-stack-md rounded-lg flex-1 text-left transition-premium hover:bg-surface-dim/95 hover:border-primary/50">
                    <div className="text-warning font-bold text-headline-md font-headline-md">Flagged</div>
                    <div className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Fraud Signal 042</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 border-y border-border-subtle bg-surface-container-lowest/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-page-margin-desktop text-center">
          <p className="font-label-sm text-label-sm text-text-muted uppercase tracking-[0.2em] mb-stack-lg">
            Trusted by Enterprise Leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="h-8 w-32 bg-on-surface/20 rounded"></div>
            <div className="h-8 w-40 bg-on-surface/20 rounded"></div>
            <div className="h-8 w-28 bg-on-surface/20 rounded"></div>
            <div className="h-8 w-36 bg-on-surface/20 rounded"></div>
            <div className="h-8 w-32 bg-on-surface/20 rounded"></div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="platform" className="py-32 px-page-margin-desktop max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-stack-lg mb-20">
          <div className="max-w-2xl">
            <h2 className="font-headline-lg text-headline-lg mb-stack-md">
              Advanced AI Infrastructure for Global Carriers.
            </h2>
            <p className="text-text-muted text-body-md">
              Our modular architecture integrates seamlessly into your existing tech stack, providing surgical precision in automated decision-making.
            </p>
          </div>
          <button className="bg-transparent border border-border-subtle text-on-surface font-semibold text-label-md px-6 py-3 rounded-lg flex items-center gap-2 transition-premium btn-hover-effect group cursor-pointer">
            <span>View Technical Documentation</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Fraud Detection - Large Bento Card */}
          <div className="md:col-span-8 group relative overflow-hidden bg-surface-card border border-border-subtle rounded-xl p-stack-lg hover:border-primary/50 transition-premium hover:scale-[1.02] hover:shadow-2xl flex flex-col justify-between min-h-[300px]">
            <div>
              <Shield className="w-10 h-10 text-primary mb-stack-lg group-hover:-translate-y-1 transition-transform fill-primary/10" />
              <h3 className="font-headline-md text-headline-md mb-stack-sm font-bold">
                Intelligent Fraud Detection
              </h3>
              <p className="text-text-muted max-w-md">
                Multi-layer verification engine that identifies anomalies in claimant behavior, metadata, and cross-platform history using neural pattern matching.
              </p>
            </div>
            <div className="pt-stack-lg border-t border-border-subtle mt-6">
              <div className="flex justify-between text-label-sm mb-2 font-bold">
                <span>Detection Confidence</span>
                <span className="text-primary">98.2%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary ai-glow" style={{ width: '98.2%' }}></div>
              </div>
            </div>
          </div>

          {/* Cloud Platform - Small Bento Card */}
          <div className="md:col-span-4 bg-surface-card border border-border-subtle rounded-xl p-stack-lg flex flex-col hover:border-primary/50 transition-premium group hover:scale-[1.02] hover:shadow-2xl justify-between min-h-[300px]">
            <div>
              <Cloud className="w-10 h-10 text-primary mb-stack-lg group-hover:-translate-y-1 transition-transform" />
              <h3 className="font-headline-md text-headline-md mb-stack-sm font-bold">
                SaaS Deployment
              </h3>
              <p className="text-text-muted text-body-sm">
                Zero-footprint integration with 99.99% uptime SLA. Built on high-performance serverless infrastructure.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-4">
              <span className="px-2 py-1 rounded bg-surface-container-high border border-border-subtle text-[10px] uppercase font-bold text-text-muted">
                REST API
              </span>
              <span className="px-2 py-1 rounded bg-surface-container-high border border-border-subtle text-[10px] uppercase font-bold text-text-muted">
                GraphQL
              </span>
            </div>
          </div>

          {/* Computer Vision - Medium Card */}
          <div className="md:col-span-6 bg-surface-card border border-border-subtle rounded-xl overflow-hidden flex flex-col hover:border-primary/50 transition-premium group hover:scale-[1.02] hover:shadow-2xl min-h-[400px]">
            <div className="h-48 bg-surface-dim relative overflow-hidden">
              <img
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtv4jarccw3EJJjTTIPvqP7eygm5nk1fu5xFpDvf8DD_rOk98nhw4256n8G0SrOfrpzIZP_DwMANCrd3oP6xGnWxFj5f5mCSaBrrPYXu7VG9NacpNV1fGbUsowjMmJVFjHiT-3y-i78nNLT5oittK3mi2cJJVIZgNi-y0JCIA2J6qrRSkSVcq3YmgcSJoDgdWAHYWKmDLLM7nojkG1T8Is8J07KtVYRts2ReFOyQ-4RyHghjecd0qy1z69ZVP_LJRoIt9cZ5e6VmI"
                alt="Computer Vision Claim Scan"
              />
            </div>
            <div className="p-stack-lg flex-1 flex flex-col justify-center">
              <h3 className="font-headline-md text-headline-md mb-stack-sm font-bold">
                Computer Vision Assessment
              </h3>
              <p className="text-text-muted text-body-sm">
                Proprietary vision models trained on millions of damage images to automate estimate generation and severity scoring in milliseconds.
              </p>
            </div>
          </div>

          {/* Global Analytics - Medium Card */}
          <div className="md:col-span-6 bg-surface-card border border-border-subtle rounded-xl p-stack-lg relative overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-premium group hover:scale-[1.02] hover:shadow-2xl min-h-[400px]">
            <div>
              <BarChart3 className="w-10 h-10 text-primary mb-stack-lg group-hover:-translate-y-1 transition-transform" />
              <h3 className="font-headline-md text-headline-md mb-stack-sm font-bold">
                Global Data Intelligence
              </h3>
              <p className="text-text-muted text-body-sm">
                Aggregated insights from across the claim lifecycle to help risk managers identify emerging trends and adjust policy underwriting in real-time.
              </p>
            </div>
            <div className="flex gap-4 pt-6">
              <div className="flex-1 p-stack-sm bg-background-base rounded-lg border border-border-subtle">
                <div className="text-[10px] text-text-muted uppercase font-bold">Risk Index</div>
                <div className="text-headline-md font-bold text-danger text-headline-md mt-1">High</div>
              </div>
              <div className="flex-1 p-stack-sm bg-background-base rounded-lg border border-border-subtle">
                <div className="text-[10px] text-text-muted uppercase font-bold">Global Trend</div>
                <div className="text-headline-md font-bold text-success text-headline-md mt-1">+12%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-page-margin-desktop relative z-10">
        <div className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden p-[1px]">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20"></div>
          <div className="relative bg-surface-card rounded-[22px] border border-border-subtle py-24 px-page-margin-mobile text-center overflow-hidden transition-premium hover:border-primary/30">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            <h2 className="font-headline-lg text-headline-lg mb-stack-lg max-w-2xl mx-auto font-bold">
              Ready to automate your claims ecosystem?
            </h2>
            <p className="text-text-muted font-body-lg text-body-lg max-w-xl mx-auto mb-12">
              Join 50+ enterprise carriers leveraging ClaimIQ AI to reduce loss adjustment expenses by up to 40%.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-stack-md">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto bg-primary text-on-primary font-bold text-label-md px-10 py-4 rounded-lg cursor-pointer transition-premium btn-hover-effect shadow-[0_0_20px_rgba(192,193,255,0.2)]"
              >
                Book a Demo
              </button>
              <button className="w-full sm:w-auto bg-transparent border border-border-subtle text-on-surface font-semibold text-label-md px-10 py-4 rounded-lg cursor-pointer transition-premium btn-hover-effect hover:bg-surface-variant/40">
                Speak to Sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
