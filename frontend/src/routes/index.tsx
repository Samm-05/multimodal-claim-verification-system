import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LandingPage } from '../pages/LandingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ClaimReviewPage } from '../pages/ClaimReviewPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { SettingsPage } from '../pages/SettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Dashboard Protected Console */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/claims" element={<Navigate to="/dashboard" replace />} />
        <Route path="/claims/:id" element={<ClaimReviewPage />} />
        <Route path="/fraud" element={<Navigate to="/dashboard" replace />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/reports" element={<Navigate to="/dashboard" replace />} />
        <Route path="/help" element={<Navigate to="/dashboard" replace />} />
        <Route path="/api-docs" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
