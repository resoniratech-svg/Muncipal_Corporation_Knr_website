import { User } from '../auth/authTypes';
import { DemoUserRecord } from '../auth/mockUsers';
import { GrievanceItem, TaskAssignment } from '../data/grievances';
import { Ward } from '../data/wards';
import { Department } from '../data/departments';
import { StaffCategory } from '../data/staffCategories';
import { NotificationItem } from '../data/notifications';
import { ProjectItem } from '../data/budget';

export interface StorageMeta {
  version: string;
  initializedAt: string;
  lastUpdatedAt: string;
}

export interface FeedbackItem {
  id: string;
  grievanceId: string;
  citizenId: string;
  citizenName?: string;
  rating: number; // 1 to 5
  comment: string;
  submittedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  role: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
}

export interface AppSettings {
  dataMode: 'deck-exact' | 'harmonized';
  autoEscalationSimulation: boolean;
  smsSimulationActive: boolean;
}

export interface ExportBundle {
  version: string;
  exportedAt: string;
  meta: StorageMeta;
  users: Record<string, DemoUserRecord>;
  wards: Ward[];
  departments: Department[];
  staffCategories?: StaffCategory[];
  grievances: GrievanceItem[];
  tasks: TaskAssignment[];
  notifications: NotificationItem[];
  feedback: FeedbackItem[];
  projects: ProjectItem[];
  auditLog: AuditLogEntry[];
  settings: AppSettings;
}

/**
 * Validation helper for loaded or imported data
 */
export function validateStoragePayload(bundle: unknown): bundle is ExportBundle {
  if (!bundle || typeof bundle !== 'object') return false;
  const b = bundle as Record<string, unknown>;
  return (
    typeof b.version === 'string' &&
    Array.isArray(b.grievances) &&
    Array.isArray(b.tasks) &&
    Array.isArray(b.wards) &&
    typeof b.users === 'object' && b.users !== null
  );
}
