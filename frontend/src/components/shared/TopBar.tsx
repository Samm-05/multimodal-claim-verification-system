import React from 'react';
import { Search, Bell, Settings2, Sparkles, Plus } from 'lucide-react';
import { useClaimsStore } from '../../store/useClaimsStore';
import { useThemeStore } from '../../store/useThemeStore';

export const TopBar: React.FC = () => {
  const { searchQuery, setSearchQuery, setUploadModalOpen } = useClaimsStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="h-16 flex justify-between items-center px-page-margin-desktop w-full sticky top-0 z-40 bg-background-base/80 backdrop-blur-md border-b border-border-subtle">
      {/* Search Input */}
      <div className="flex items-center gap-stack-lg flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-border-subtle rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm text-on-surface placeholder:text-text-muted"
            placeholder="Search claims, user IDs, issues..."
          />
        </div>
      </div>

      {/* System Status & Actions */}
      <div className="flex items-center gap-4">
        {/* Backend Live Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-dim border border-border-subtle text-[11px] font-mono font-medium text-text-muted">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          <span>FastAPI • OpenCV Active</span>
        </div>

        {/* Submit Claim Action */}
        <button
          onClick={() => setUploadModalOpen(true)}
          className="bg-primary text-on-primary font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-all btn-hover-effect flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,124,255,0.2)]"
        >
          <Plus className="w-4 h-4" />
          <span>New Claim</span>
        </button>

        <div className="h-8 w-[1px] bg-border-subtle mx-1"></div>

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 text-primary font-bold text-xs flex items-center justify-center font-mono">
            AS
          </div>
          <div className="hidden lg:block text-right">
            <p className="text-xs font-bold leading-tight text-on-surface">Alex Sterling</p>
            <p className="text-[10px] text-text-muted">Senior Claim Adjuster</p>
          </div>
        </div>
      </div>
    </header>
  );
};
