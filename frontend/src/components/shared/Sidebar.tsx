import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
} from 'lucide-react';
import { Logo } from './Logo';
import { useClaimsStore } from '../../store/useClaimsStore';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const setUploadModalOpen = useClaimsStore((state) => state.setUploadModalOpen);

  const mainNavItems = [
    { label: 'Claims Console', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics & Risk', path: '/analytics', icon: BarChart3 },
    { label: 'Platform Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#0F1117] border-r border-[rgba(255,255,255,0.08)] flex flex-col transition-all duration-300 z-30 shrink-0 ${
        collapsed ? 'w-20 p-3' : 'w-64 p-5'
      }`}
    >
      {/* Brand & Collapse Toggle */}
      <div className="flex items-center justify-between pb-6 border-b border-[rgba(255,255,255,0.08)]">
        {!collapsed && <Logo />}
        {collapsed && (
          <div className="mx-auto font-extrabold text-lg text-[#8B7BFF] font-mono">
            CIQ
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141720] text-[#A1A1AA] hover:text-[#F8FAFC] hover:border-[#8B7BFF]/40 transition-all cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 flex flex-col gap-2 pt-6">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all font-semibold text-sm ${
                  isActive
                    ? 'bg-[#8B7BFF]/15 border border-[#8B7BFF]/40 text-[#8B7BFF] shadow-[0_0_15px_rgba(139,123,255,0.2)]'
                    : 'text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#141720]'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Action CTA & Pipeline Health Badge */}
      <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-[rgba(255,255,255,0.08)]">
        <button
          onClick={() => setUploadModalOpen(true)}
          className={`w-full bg-[#8B7BFF] text-[#050505] font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all btn-hover-effect shadow-[0_0_20px_rgba(139,123,255,0.3)] ${
            collapsed ? 'px-0' : 'px-4'
          }`}
          title="Execute Claim Verification"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>New Claim</span>}
        </button>

        {!collapsed && (
          <div className="p-3.5 rounded-xl bg-[#141720] border border-[rgba(255,255,255,0.08)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A1A1AA] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#22C55E]" /> System
              </span>
              <span className="text-[#22C55E] font-mono font-bold text-[11px]">OPERATIONAL</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
              <span>Engine: Python</span>
              <span>Vision: OpenCV</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
