/**
 * Storage keys for Karimnagar Municipal Corporation (KMC) Digital Governance Platform.
 * All keys are strictly namespaced under 'kmc:' to prevent collisions.
 */

export const STORAGE_KEYS = {
  META: 'kmc:meta',
  USERS: 'kmc:users',
  SESSION: 'kmc:session',
  WARDS: 'kmc:wards',
  DEPARTMENTS: 'kmc:departments',
  STAFF_CATEGORIES: 'kmc:staff-categories',
  GRIEVANCES: 'kmc:grievances',
  TASKS: 'kmc:tasks',
  NOTIFICATIONS: 'kmc:notifications',
  FEEDBACK: 'kmc:feedback',
  BUDGETS: 'kmc:budgets',
  PROJECTS: 'kmc:projects',
  ESCALATION_RULES: 'kmc:escalation-rules',
  AUDIT_LOG: 'kmc:audit-log',
  SETTINGS: 'kmc:settings',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export const CURRENT_SCHEMA_VERSION = '1.6.0';
export const STORAGE_EVENT_NAME = 'kmc:storage_changed';
