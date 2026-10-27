import { User, UserRole, Permission } from './authTypes.ts';

export const ROLE_DESTINATIONS: Record<UserRole, string> = {
  super_admin: '/',
  mayor_commissioner: '/leadership',
  corporator: '/ward',
  department_officer: '/department',
  field_staff: '/field-tasks',
  citizen: '/citizen',
  governance_auditor: '/monitoring',
};

export const ROLE_DISPLAY_NAMES: Record<UserRole, { title: string; color: string; bg: string }> = {
  super_admin: { title: 'Super Admin', color: 'text-amber-800', bg: 'bg-amber-100 border-amber-300' },
  mayor_commissioner: { title: 'Mayor / Commissioner', color: 'text-purple-800', bg: 'bg-purple-100 border-purple-300' },
  corporator: { title: 'Ward Corporator (Ward 27)', color: 'text-blue-800', bg: 'bg-blue-100 border-blue-300' },
  department_officer: { title: 'Department Officer (Engineering)', color: 'text-orange-800', bg: 'bg-orange-100 border-orange-300' },
  field_staff: { title: 'Field Staff (Ground Operations)', color: 'text-teal-800', bg: 'bg-teal-100 border-teal-300' },
  citizen: { title: 'Verified Citizen', color: 'text-emerald-800', bg: 'bg-emerald-100 border-emerald-300' },
  governance_auditor: { title: 'Governance Auditor', color: 'text-indigo-800', bg: 'bg-indigo-100 border-indigo-300' },
};

export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user || !user.isActive) return false;
  if (user.role === 'super_admin') return true;
  if (permission === 'qa:inspect' && user.role === 'governance_auditor') return true;
  return user.permissions.includes(permission);
};

export const hasAnyRole = (user: User | null, roles: UserRole[]): boolean => {
  if (!user || !user.isActive) return false;
  return roles.includes(user.role);
};
