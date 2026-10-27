import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { UserRole, Permission } from './authTypes';
import { isQaInspectionActive, isApprovedQaRoute, startQaInspection } from './qaInspection';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
  requiredPermission?: Permission;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission,
}) => {
  const { isAuthenticated, currentUser, activeRole, hasPermission } = useAuth();
  const location = useLocation();

  // 1. Unauthenticated users redirected to login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Super admin has platform-wide access
  if (currentUser.role === 'super_admin') {
    return children;
  }

  // 3. QA Inspection Mode for Governance Auditor
  // Allows authorized auditors to review approved QA target screens in read-only audit mode
  const isQaAuditor =
    currentUser.role === 'governance_auditor' || hasPermission('qa:inspect');

  if (isQaAuditor && isApprovedQaRoute(location.pathname)) {
    const isInspectionActive = isQaInspectionActive(currentUser, location);
    if (isInspectionActive) {
      startQaInspection();
      return children;
    }
  }

  // 4. Role check
  if (allowedRoles && allowedRoles.length > 0) {
    const roleMatches = activeRole && allowedRoles.includes(activeRole);
    if (!roleMatches) {
      return (
        <Navigate
          to="/access-denied"
          state={{
            requiredRoles: allowedRoles,
            attemptedPath: location.pathname + location.search,
          }}
          replace
        />
      );
    }
  }

  // 5. Permission check
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Navigate
        to="/access-denied"
        state={{
          requiredPermission,
          attemptedPath: location.pathname + location.search,
        }}
        replace
      />
    );
  }

  return children;
};
