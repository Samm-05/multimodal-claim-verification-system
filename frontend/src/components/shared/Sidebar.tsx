import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Plus,
} from 'lucide-react';
import { Logo } from './Logo';
import { useClaimsStore } from '../../store/useClaimsStore';

export const Sidebar: React.FC = () => {
  const setUploadModalOpen = useClaimsStore((state) => state.setUploadModalOpen);

  const mainNavItems = [
    { label: 'Claims Queue', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics & Risk', path: '/analytics', icon: BarChart3 },
    { label: 'Settings & Models', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-dim border-r border-border-subtle flex flex-col p-4 gap-4 z-50">
      <div className="px-2 py-3">
        <Logo />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col gap-1.5 pt-2">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs ${
                  isActive
                    ? 'bg-primary/10 border border-primary/30 text-primary font-bold ai-glow'
                    : 'text-text-muted hover:text-on-surface hover:bg-surface-card'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Action Button & Footer Nav */}
      <div className="mt-auto flex flex-col gap-3 border-t border-border-subtle pt-4">
        <button
          onClick={() => setUploadModalOpen(true)}
          className="w-full bg-primary text-on-primary font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all btn-hover-effect shadow-[0_0_20px_rgba(139,124,255,0.25)]"
        >
          <Plus className="w-4 h-4" />
          <span>Execute Claim Pipeline</span>
        </button>

        <div className="p-3 rounded-xl bg-surface-card border border-border-subtle space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-text-muted">Pipeline Engine</span>
            <span className="text-success font-mono font-bold">Python v1.0</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-text-muted">Vision Core</span>
            <span className="text-primary font-mono font-bold">OpenCV</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
