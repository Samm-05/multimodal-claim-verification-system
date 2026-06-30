import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { Logo } from './Logo';
import { sidebarNavItems, sidebarBottomItems } from '../../constants/mockData';
import { useClaimsStore } from '../../store/useClaimsStore';
import type { ClaimObject, Severity } from '../../types';

export const Sidebar: React.FC = () => {
  const addNewClaim = useClaimsStore((state) => state.addNewClaim);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClaim, setNewClaim] = useState({
    customerName: '',
    objectName: '',
    objectType: 'vehicle' as ClaimObject,
    severity: 'medium' as Severity,
    fraudScore: 10,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaim.customerName || !newClaim.objectName) return;

    addNewClaim({
      customer: {
        name: newClaim.customerName,
        initials: newClaim.customerName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      },
      object: {
        type: newClaim.objectType,
        name: newClaim.objectName,
        icon: newClaim.objectType === 'vehicle' ? 'Car' : newClaim.objectType === 'electronics' ? 'Smartphone' : newClaim.objectType === 'property' ? 'Building2' : 'Package',
      },
      aiDecision: 'reviewing',
      severity: newClaim.severity,
      fraudScore: newClaim.fraudScore,
      status: 'in_review',
    });

    setIsModalOpen(false);
    setNewClaim({
      customerName: '',
      objectName: '',
      objectType: 'vehicle',
      severity: 'medium',
      fraudScore: 10,
    });
  };

  return (
    <>
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-dim border-r border-border-subtle flex flex-col p-stack-md gap-component-gap z-50">
        <div className="px-2 py-4">
          <Logo />
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {sidebarNavItems.map((item) => {
            // Dynamically resolve lucide icons
            const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.HelpCircle;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg duration-200 ease-in-out font-label-md text-label-md ${
                    isActive
                      ? 'bg-secondary-container text-on-surface'
                      : 'text-text-muted hover:text-on-surface hover:bg-surface-variant/50'
                  }`
                }
              >
                <IconComponent className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-border-subtle pt-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-primary text-on-primary-container font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 active:scale-95 duration-200 mb-4 cursor-pointer btn-hover-effect"
          >
            <LucideIcons.Plus className="w-4 h-4" />
            <span>New Claim</span>
          </button>

          {sidebarBottomItems.map((item) => {
            const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.HelpCircle;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-text-muted hover:text-on-surface transition-all font-label-md text-label-md ${
                    isActive ? 'text-on-surface' : ''
                  }`
                }
              >
                <IconComponent className="w-4 h-4 text-text-muted" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </aside>

      {/* New Claim Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-base/80 backdrop-blur-sm p-4">
          <div className="bg-surface-card border border-border-subtle rounded-xl max-w-md w-full p-stack-lg shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-on-surface transition-colors"
            >
              <LucideIcons.X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <LucideIcons.FilePlus2 className="text-primary" />
              <span>Create New Claim</span>
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={newClaim.customerName}
                  onChange={(e) => setNewClaim({ ...newClaim, customerName: e.target.value })}
                  placeholder="e.g. Jonathan Doe"
                  className="w-full bg-surface-container border border-border-subtle rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Object / Product Name
                </label>
                <input
                  type="text"
                  required
                  value={newClaim.objectName}
                  onChange={(e) => setNewClaim({ ...newClaim, objectName: e.target.value })}
                  placeholder="e.g. Tesla Model 3"
                  className="w-full bg-surface-container border border-border-subtle rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    value={newClaim.objectType}
                    onChange={(e) => setNewClaim({ ...newClaim, objectType: e.target.value as ClaimObject })}
                    className="w-full bg-surface-container border border-border-subtle rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface transition-all"
                  >
                    <option value="vehicle">Vehicle</option>
                    <option value="electronics">Electronics</option>
                    <option value="property">Property</option>
                    <option value="package">Package</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Severity
                  </label>
                  <select
                    value={newClaim.severity}
                    onChange={(e) => setNewClaim({ ...newClaim, severity: e.target.value as Severity })}
                    className="w-full bg-surface-container border border-border-subtle rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Initial Fraud Score (0-100)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newClaim.fraudScore}
                    onChange={(e) => setNewClaim({ ...newClaim, fraudScore: parseInt(e.target.value) })}
                    className="flex-1 accent-primary"
                  />
                  <span className="w-8 font-mono text-sm text-right">{newClaim.fraudScore}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary-container font-bold py-2.5 rounded-lg active:scale-95 duration-200 transition-all btn-hover-effect cursor-pointer"
                >
                  Create Claim Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
