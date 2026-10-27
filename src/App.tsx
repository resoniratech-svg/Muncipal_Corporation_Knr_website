import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TopNav } from './components/common/TopNav';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { HelpGuide } from './ui/HelpGuide';

// Lazy-loaded routes
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const AccessDeniedPage = lazy(() => import('./pages/AccessDeniedPage').then(m => ({ default: m.AccessDeniedPage })));
const DemoHome = lazy(() => import('./pages/DemoHome').then(m => ({ default: m.DemoHome })));
const LeadershipPage = lazy(() => import('./pages/LeadershipPage').then(m => ({ default: m.LeadershipPage })));
const WardPage = lazy(() => import('./pages/WardPage').then(m => ({ default: m.WardPage })));
const DepartmentDashboardPage = lazy(() => import('./pages/DepartmentDashboardPage').then(m => ({ default: m.DepartmentDashboardPage })));
const FieldStaffTasksPage = lazy(() => import('./pages/FieldStaffTasksPage').then(m => ({ default: m.FieldStaffTasksPage })));
const CitizenApp = lazy(() => import('./pages/citizen/CitizenApp').then(m => ({ default: m.CitizenApp })));
const PerformancePage = lazy(() => import('./pages/PerformancePage').then(m => ({ default: m.PerformancePage })));
const WorkflowPage = lazy(() => import('./pages/WorkflowPage').then(m => ({ default: m.WorkflowPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const MonitoringPage = lazy(() => import('./pages/MonitoringPage').then(m => ({ default: m.MonitoringPage })));
const ImplementationPage = lazy(() => import('./pages/ImplementationPage').then(m => ({ default: m.ImplementationPage })));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage').then(m => ({ default: m.UserManagementPage })));
const PresentationPage = lazy(() => import('./pages/PresentationPage').then(m => ({ default: m.PresentationPage })));
const QaAuditPage = lazy(() => import('./pages/QaAuditPage').then(m => ({ default: m.QaAuditPage })));

// Skeleton while a page's code loads (no spinner-only dead ends)
const LoadingFallback = () => (
  <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-4" role="status" aria-label="Loading">
    <div className="h-10 w-2/3 rounded-xl bg-slate-200 animate-pulse motion-reduce:animate-none" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-32 rounded-2xl bg-slate-200 animate-pulse motion-reduce:animate-none" />
      ))}
    </div>
    <div className="h-48 rounded-2xl bg-slate-200 animate-pulse motion-reduce:animate-none" />
  </div>
);

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-kmc-bg flex flex-col font-body selection:bg-kmc-navy selection:text-white">
      {/* TopNav is shown on standard pages, hidden on login and fullscreen presentation */}
      <Routes>
        <Route path="/login" element={null} />
        <Route path="/present" element={null} />
        <Route path="*" element={<TopNav />} />
      </Routes>

      <div className="flex-1 flex flex-col">
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/access-denied" element={<AccessDeniedPage />} />

            {/* Super Admin Landing / Platform Overview */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <DemoHome />
                </ProtectedRoute>
              }
            />

            {/* Mayor / Commissioner Leadership Dashboard */}
            <Route
              path="/leadership"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'mayor_commissioner']}>
                  <LeadershipPage />
                </ProtectedRoute>
              }
            />

            {/* Ward / Corporator Portal */}
            <Route
              path="/ward"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'corporator', 'mayor_commissioner']}>
                  <WardPage />
                </ProtectedRoute>
              }
            />

            {/* Department Officer Portal */}
            <Route
              path="/department"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'department_officer']}>
                  <DepartmentDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Field Staff Task Execution Portal */}
            <Route
              path="/field-tasks"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'field_staff']}>
                  <FieldStaffTasksPage />
                </ProtectedRoute>
              }
            />

            {/* Citizen Engagement Portal */}
            <Route
              path="/citizen/*"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'citizen']}>
                  <CitizenApp />
                </ProtectedRoute>
              }
            />

            {/* Ward Performance Evaluation & Rankings */}
            <Route
              path="/performance"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'mayor_commissioner', 'governance_auditor']}>
                  <PerformancePage />
                </ProtectedRoute>
              }
            />

            {/* Workflows & SLAs */}
            <Route
              path="/workflow"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'mayor_commissioner', 'department_officer']}>
                  <WorkflowPage />
                </ProtectedRoute>
              }
            />

            {/* Public Notifications & Broadcasts */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'mayor_commissioner', 'corporator']}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* Governance & Central Monitoring */}
            <Route
              path="/monitoring"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'mayor_commissioner', 'governance_auditor']}>
                  <MonitoringPage />
                </ProtectedRoute>
              }
            />

            {/* Implementation Strategy */}
            <Route
              path="/implementation"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'mayor_commissioner']}>
                  <ImplementationPage />
                </ProtectedRoute>
              }
            />

            {/* Super Admin User Management */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Fullscreen 26-Slide Presentation Deck */}
            <Route
              path="/present"
              element={
                <ProtectedRoute>
                  <PresentationPage />
                </ProtectedRoute>
              }
            />

            {/* Compliance QA Route */}
            <Route
              path="/qa"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'governance_auditor']}>
                  <QaAuditPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback to Home (which redirects to /login if unauthenticated) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </div>

      {/* Help is available on every screen */}
      <HelpGuide />
    </div>
  );
};

export default App;
