import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/shared/Sidebar';
import { TopBar } from '../components/shared/TopBar';
import { ClaimUploadModal } from '../components/shared/ClaimUploadModal';
import { useClaimsStore } from '../store/useClaimsStore';
import { useThemeStore } from '../store/useThemeStore';

export const DashboardLayout: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const { isUploadModalOpen, setUploadModalOpen } = useClaimsStore();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, [theme]);

  return (
    <div className="min-h-screen bg-background-base text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Top App Bar */}
        <TopBar />

        {/* Dashboard Pages */}
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Claim Upload / Multi-Agent Execution Modal */}
      <ClaimUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
};
