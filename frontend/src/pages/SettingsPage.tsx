import React, { useState } from 'react';
import { Shield, Sparkles, Sliders, Bell, HardDrive, Save, RefreshCw } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [geminiApiKey, setGeminiApiKey] = useState('************************************');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);
  const [duplicateThreshold, setDuplicateThreshold] = useState(0.7);
  const [modelType, setModelType] = useState('vision-multimodal');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifWebhook, setNotifWebhook] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1200);
  };

  return (
    <div className="p-page-margin-desktop max-w-[1200px] mx-auto flex flex-col gap-stack-lg animate-[fade-in-up_0.4s_ease-out]">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-on-surface">Settings</h2>
        <p className="text-text-muted text-sm mt-1">Configure model dependencies, threshold parameters, and webhooks.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg">
        {/* Settings Navigation / Sidebar Tabs */}
        <div className="space-y-2">
          <div className="bg-surface-card border border-border-subtle rounded-xl p-2 space-y-1">
            <button
              type="button"
              className="w-full text-left px-4 py-2.5 rounded-lg bg-secondary-container text-on-surface flex items-center gap-3 text-sm font-semibold"
            >
              <Sliders className="w-4 h-4 text-primary" />
              <span>Pipeline &amp; Models</span>
            </button>
            <button
              type="button"
              className="w-full text-left px-4 py-2.5 rounded-lg text-text-muted hover:text-on-surface hover:bg-surface-variant/40 flex items-center gap-3 text-sm"
            >
              <Shield className="w-4 h-4" />
              <span>Verification Policy</span>
            </button>
            <button
              type="button"
              className="w-full text-left px-4 py-2.5 rounded-lg text-text-muted hover:text-on-surface hover:bg-surface-variant/40 flex items-center gap-3 text-sm"
            >
              <Bell className="w-4 h-4" />
              <span>Notifications &amp; Alerts</span>
            </button>
            <button
              type="button"
              className="w-full text-left px-4 py-2.5 rounded-lg text-text-muted hover:text-on-surface hover:bg-surface-variant/40 flex items-center gap-3 text-sm"
            >
              <HardDrive className="w-4 h-4" />
              <span>Integrations &amp; Storage</span>
            </button>
          </div>
        </div>

        {/* Settings Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          {/* Section 1: AI Model Configuration */}
          <div className="bg-surface-card border border-border-subtle rounded-xl p-stack-lg space-y-6">
            <h3 className="text-lg font-bold text-on-surface border-b border-border-subtle pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary fill-primary/10" />
              <span>Gemini Vision Core</span>
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
                  className="w-full bg-surface-container-low border border-border-subtle rounded-lg py-2 px-3 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
                <span className="text-[11px] text-text-muted mt-1 block">
                  API key will be encrypted and saved in the localized environment file.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Default Multimodal Model
                  </label>
                  <select
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-full bg-surface-container-low border border-border-subtle rounded-lg py-2 px-3 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer"
                  >
                    <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Engine Type
                  </label>
                  <select
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    className="w-full bg-surface-container-low border border-border-subtle rounded-lg py-2 px-3 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer"
                  >
                    <option value="vision-multimodal">Vision Multimodal Port</option>
                    <option value="heuristic-fallback">Local Heuristics Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Verification Parameters */}
          <div className="bg-surface-card border border-border-subtle rounded-xl p-stack-lg space-y-6">
            <h3 className="text-lg font-bold text-on-surface border-b border-border-subtle pb-3">
              Verification Policy &amp; Thresholds
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  <span>Minimum AI Confidence Threshold</span>
                  <span className="text-primary font-mono">{Math.round(confidenceThreshold * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
                <span className="text-[11px] text-text-muted mt-1 block">
                  Any automated claims decision with confidence lower than this threshold is routed to human review.
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  <span>Duplicate Claim Check Sensitivity</span>
                  <span className="text-primary font-mono">{Math.round(duplicateThreshold * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="0.9"
                  step="0.05"
                  value={duplicateThreshold}
                  onChange={(e) => setDuplicateThreshold(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Alerts */}
          <div className="bg-surface-card border border-border-subtle rounded-xl p-stack-lg space-y-4">
            <h3 className="text-lg font-bold text-on-surface border-b border-border-subtle pb-3">
              Operational Alerts
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifEmail}
                  onChange={(e) => setNotifEmail(e.target.checked)}
                  className="rounded border-border-subtle bg-surface-container text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-sm font-semibold text-on-surface">Email alerts on high-risk fraud flags</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifWebhook}
                  onChange={(e) => setNotifWebhook(e.target.checked)}
                  className="rounded border-border-subtle bg-surface-container text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-sm font-semibold text-on-surface">Dispatch real-time webhooks on AI decisions</span>
              </label>
            </div>
          </div>

          {/* Save Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              className="px-5 py-2.5 rounded-lg border border-border-subtle bg-transparent text-on-surface font-semibold text-sm hover:bg-surface-variant/40 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-lg bg-primary text-on-primary-container font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer btn-hover-effect disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
