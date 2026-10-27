import React from 'react';
import { useAuth } from './AuthContext';
import { UserRole, Permission } from './authTypes';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: Permission;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  fallback = null,
}) => {
  const { currentUser, activeRole, hasPermission } = useAuth();

  if (!currentUser) return <>{fallback}</>;

  if (currentUser.role === 'super_admin') {
    return <>{children}</>;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!activeRole || !allowedRoles.includes(activeRole)) {
      return <>{fallback}</>;
    }
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
