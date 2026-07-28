import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/shared/Sidebar';
import { TopBar } from '../components/shared/TopBar';
import { ClaimUploadModal } from '../components/shared/ClaimUploadModal';
import { useClaimsStore } from '../store/useClaimsStore';

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isUploadModalOpen, setUploadModalOpen } = useClaimsStore();

  return (
    <div className="min-h-screen bg-[#050505] text-[#F8FAFC] flex">
      {/* Sidebar Navigation */}
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top App Bar */}
        <TopBar />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Hero Claim Upload Modal */}
      <ClaimUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
};
