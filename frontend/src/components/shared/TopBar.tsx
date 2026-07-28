import React from 'react';
import { Search, Plus } from 'lucide-react';
import { useClaimsStore } from '../../store/useClaimsStore';

export const TopBar: React.FC = () => {
  const { searchQuery, setSearchQuery, setUploadModalOpen } = useClaimsStore();

  return (
    <header className="h-16 flex items-center justify-between px-8 w-full sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)]">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0F1117] border border-[rgba(255,255,255,0.08)] rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-[#8B7BFF] focus:border-[#8B7BFF] outline-none transition-all text-sm text-[#F8FAFC] placeholder:text-[#A1A1AA]"
            placeholder="Search claims, user IDs, damage parts..."
          />
        </div>
      </div>

      {/* Action Controls & User Identity */}
      <div className="flex items-center gap-4">
        {/* Backend Pipeline Live Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F1117] border border-[rgba(255,255,255,0.08)] text-xs font-mono text-[#A1A1AA]">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span>FastAPI • OpenCV Core</span>
        </div>

        {/* New Claim Trigger */}
        <button
          onClick={() => setUploadModalOpen(true)}
          className="bg-[#8B7BFF] text-[#050505] font-bold text-xs px-4 py-2 rounded-xl cursor-pointer transition-all btn-hover-effect flex items-center gap-2 shadow-[0_0_20px_rgba(139,123,255,0.25)]"
        >
          <Plus className="w-4 h-4" />
          <span>Execute Claim Verification</span>
        </button>

        <div className="h-6 w-[1px] bg-[rgba(255,255,255,0.08)] mx-1"></div>

        {/* User Identity Pill */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#8B7BFF]/20 border border-[#8B7BFF]/40 text-[#8B7BFF] font-extrabold text-xs flex items-center justify-center font-mono">
            AS
          </div>
          <div className="hidden lg:block text-right">
            <p className="text-xs font-bold leading-tight text-[#F8FAFC]">Alex Sterling</p>
            <p className="text-[10px] text-[#A1A1AA]">Senior Claim Adjuster</p>
          </div>
        </div>
      </div>
    </header>
  );
};
