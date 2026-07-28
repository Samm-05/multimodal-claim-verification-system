import React, { useState } from 'react';
import { Shield, Sparkles, Sliders, Save, CheckCircle2, Eye } from 'lucide-react';
import { claimsApi } from '../services/api';
import { VisionProviderFactory } from '../services/visionProvider';
import type { VisionProviderType } from '../types';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'policy' | 'vision'>('pipeline');
  const [geminiApiKey, setGeminiApiKey] = useState('************************************');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);
  const [duplicateThreshold, setDuplicateThreshold] = useState(0.7);
  const [visionProvider, setVisionProvider] = useState<VisionProviderType>('opencv');
  const [maxRetries, setMaxRetries] = useState(2);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await claimsApi.updateSettings({
      geminiApiKey,
      geminiModel,
      confidenceThreshold,
      duplicateThreshold,
      visionProvider,
      maxRetries,
    });
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const currentProviderObj = VisionProviderFactory.getProvider(visionProvider);

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-6 animate-[fade-in-up_0.4s_ease-out]">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">Platform Settings</h2>
          <p className="text-text-muted text-xs md:text-sm mt-1">Configure multi-agent pipeline parameters and Vision Provider abstractions.</p>
        </div>
        {savedSuccess && (
          <div className="bg-success/15 border border-success/30 text-success text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4" /> Settings Saved to Environment
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar Tabs */}
        <div className="space-y-2">
          <div className="glass-card border border-border-subtle rounded-2xl p-2 space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('pipeline')}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pipeline'
                  ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(139,124,255,0.3)]'
                  : 'text-text-muted hover:text-on-surface hover:bg-surface-dim'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Pipeline &amp; Retries</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vision')}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'vision'
                  ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(139,124,255,0.3)]'
                  : 'text-text-muted hover:text-on-surface hover:bg-surface-dim'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Vision Provider Abstraction</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('policy')}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'policy'
                  ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(139,124,255,0.3)]'
                  : 'text-text-muted hover:text-on-surface hover:bg-surface-dim'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Verification Policy &amp; Thresholds</span>
            </button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === 'pipeline' && (
            <div className="glass-card border border-border-subtle rounded-2xl p-6 space-y-6">
              <h3 className="text-base font-bold text-on-surface border-b border-border-subtle pb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Multi-Agent Pipeline Configuration</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="w-full bg-surface-dim border border-border-subtle rounded-xl py-2.5 px-3 text-xs text-on-surface focus:ring-1 focus:ring-primary outline-none transition-all font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                      Gemini Vision Model
                    </label>
                    <select
                      value={geminiModel}
                      onChange={(e) => setGeminiModel(e.target.value)}
                      className="w-full bg-surface-dim border border-border-subtle rounded-xl py-2.5 px-3 text-xs text-on-surface focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer font-medium"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                      Max Pipeline Retries
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={maxRetries}
                      onChange={(e) => setMaxRetries(Number(e.target.value))}
                      className="w-full bg-surface-dim border border-border-subtle rounded-xl py-2.5 px-3 text-xs text-on-surface focus:ring-1 focus:ring-primary outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vision' && (
            <div className="glass-card border border-border-subtle rounded-2xl p-6 space-y-6">
              <h3 className="text-base font-bold text-on-surface border-b border-border-subtle pb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                <span>Vision Provider Abstraction Core</span>
              </h3>

              <div className="space-y-4">
                <p className="text-xs text-text-muted">
                  Select active vision analysis engine. The abstraction layer ensures zero UI modifications when switching models.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'opencv', label: 'OpenCV Computer Vision (Active Core)', desc: 'Local feature extraction & blur scoring' },
                    { id: 'gemini_vision', label: 'Google Gemini Vision', desc: 'Multimodal visual grounding & reasoning' },
                    { id: 'openai_vision', label: 'OpenAI GPT-4o Vision', desc: 'GPT-4o visual damage assessment' },
                    { id: 'claude_vision', label: 'Anthropic Claude 3.7 Sonnet', desc: 'Claude visual inspection engine' },
                  ].map((prov) => (
                    <div
                      key={prov.id}
                      onClick={() => setVisionProvider(prov.id as VisionProviderType)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        visionProvider === prov.id
                          ? 'border-primary bg-primary/10 text-on-surface ai-glow'
                          : 'border-border-subtle bg-surface-dim text-text-muted hover:border-border-subtle/80'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span>{prov.label}</span>
                        {visionProvider === prov.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                      <p className="text-[11px] text-text-muted mt-1">{prov.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-surface-dim border border-border-subtle text-xs space-y-1">
                  <span className="text-text-muted font-mono">Active Provider Instance:</span>
                  <p className="font-bold text-primary">{currentProviderObj.name}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="glass-card border border-border-subtle rounded-2xl p-6 space-y-6">
              <h3 className="text-base font-bold text-on-surface border-b border-border-subtle pb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Verification Policy Thresholds</span>
              </h3>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-text-muted uppercase tracking-wider">Confidence Approval Threshold</span>
                    <span className="text-primary font-mono">{Math.round(confidenceThreshold * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={0.99}
                    step={0.01}
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-text-muted uppercase tracking-wider">Duplicate Visual Hash Sensitivity</span>
                    <span className="text-primary font-mono">{Math.round(duplicateThreshold * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={0.95}
                    step={0.01}
                    value={duplicateThreshold}
                    onChange={(e) => setDuplicateThreshold(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all cursor-pointer btn-hover-effect flex items-center gap-2 shadow-[0_0_20px_rgba(139,124,255,0.25)]"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
