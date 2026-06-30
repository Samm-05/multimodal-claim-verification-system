import React from 'react';
import { Search, Bell, Settings2, Globe, Moon, Sun } from 'lucide-react';
import { useClaimsStore } from '../../store/useClaimsStore';
import { useThemeStore } from '../../store/useThemeStore';

export const TopBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useClaimsStore();
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
            placeholder="Search claims, customers, or IDs..."
          />
        </div>
      </div>

      {/* Quick Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 text-text-muted hover:bg-surface-variant/50 hover:text-on-surface rounded-lg transition-colors cursor-pointer active:scale-95"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="p-2 text-text-muted hover:bg-surface-variant/50 hover:text-on-surface rounded-lg transition-colors cursor-pointer active:scale-95 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger animate-pulse"></span>
        </button>

        <button className="p-2 text-text-muted hover:bg-surface-variant/50 hover:text-on-surface rounded-lg transition-colors cursor-pointer active:scale-95">
          <Settings2 className="w-5 h-5" />
        </button>

        <button className="p-2 text-text-muted hover:bg-surface-variant/50 hover:text-on-surface rounded-lg transition-colors cursor-pointer active:scale-95">
          <Globe className="w-5 h-5" />
        </button>

        <div className="h-8 w-[1px] bg-border-subtle mx-2"></div>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-2">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhG4gwrpxrKlpPj2w44v1BdJ7fTK2TOxUHfQzqSqQzKo5rkRUYEnZxpQc2lgk20uX3ChFAV0pmuTyjbzASYRL5yP-t7RHUTM_h0PMcCRktJ1pOF6_oSqlCVG-kqlGycneZ7qzIYpv-7jlp854agukzIIDE1fbLa6hJQKnee3vWXBp6se2Nb66f6Y6Ee1zP5RmL9g7A-sD7btgWccnOrJShFn-QiRDdPJco3jTa9o_k1s47DKLj1-xz3qjEjs1peNuOboDNvqNSAfY"
            alt="Alex Sterling"
            className="w-8 h-8 rounded-full border border-border-subtle object-cover"
          />
          <div className="hidden lg:block text-right">
            <p className="text-xs font-bold leading-tight text-on-surface">Alex Sterling</p>
            <p className="text-[10px] text-text-muted">Chief Adjuster</p>
          </div>
        </div>
      </div>
    </header>
  );
};
