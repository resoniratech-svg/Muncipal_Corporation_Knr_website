export type UserRole =
  | 'super_admin'
  | 'mayor_commissioner'
  | 'corporator'
  | 'department_officer'
  | 'field_staff'
  | 'citizen'
  | 'governance_auditor';

export type Permission =
  | 'platform:admin'
  | 'leadership:view'
  | 'ward:manage_all'
  | 'ward:manage_assigned'
  | 'department:manage_all'
  | 'department:manage_assigned'
  | 'tasks:execute'
  | 'tasks:assign'
  | 'citizen:submit_grievance'
  | 'citizen:view_own'
  | 'monitoring:view'
  | 'monitoring:audit'
  | 'budget:manage'
  | 'users:manage';

export interface User {
  id: string;
  username: string; // email format
  displayName: string;
  name?: string; // Convenience alias for displayName
  role: UserRole;
  roleTitle: string;
  departmentId?: string; // e.g. 'engineering', 'sanitation', 'electrical', 'water-supply'
  departmentName?: string;
  assignedWardIds?: number[]; // e.g. [27]
  assignedWardName?: string;
  wardId?: number; // Primary operational ward for field staff, corporator, citizen
  permissions: Permission[];
  isActive: boolean;
  avatarInitials: string;
  assignedTaskIds?: string[];
  skills?: string[];
  staffCategory?: string;
  staffCategoryId?: string;
  phone?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  loginTime: string;
  isRemembered: boolean;
}
