import { User } from './authTypes';

export const QA_INSPECT_STORAGE_KEY = 'kmc_qa_inspect_active';

/**
 * Whitelist of approved application routes available for QA inspection
 * by the Governance Auditor during compliance and quality assurance audits.
 */
export const APPROVED_QA_ROUTES: string[] = [
  '/',
  '/leadership',
  '/ward',
  '/department',
  '/field-tasks',
  '/citizen',
  '/citizen/report',
  '/citizen/track',
  '/citizen/ward',
  '/citizen/notices',
  '/citizen/gallery',
  '/performance',
  '/workflow',
  '/notifications',
  '/monitoring',
  '/implementation',
  '/admin/users',
  '/present',
  '/qa',
];

/**
 * User-friendly names for each approved QA inspection screen
 */
export const QA_ROUTE_LABELS: Record<string, string> = {
  '/': 'Super Admin Platform Overview',
  '/leadership': 'Mayor / Commissioner Leadership Dashboard',
  '/ward': 'Ward & Corporator Portal (Ward 27)',
  '/department': 'Department Officer Operations',
  '/field-tasks': 'Field Staff Execution & After-Photo Upload',
  '/citizen': 'Citizen Engagement Portal Home',
  '/citizen/report': 'Citizen Grievance Submission Wizard',
  '/citizen/track': 'Citizen Complaint Tracking & SLA View',
  '/citizen/ward': 'Citizen Ward Councillor & Committee Info',
  '/citizen/notices': 'Citizen Public Notices & Announcements',
  '/citizen/gallery': 'Fixed Problems Before & After Gallery',
  '/performance': 'Ward Performance Evaluation & Rankings',
  '/workflow': 'Department Workflows & Escalation SLA',
  '/notifications': 'Public Notifications & SMS Broadcasts',
  '/monitoring': 'Central Governance & SLA Monitoring',
  '/implementation': 'Implementation Roadmap & Phasing',
  '/admin/users': 'User Management & Role Governance',
  '/present': 'Fullscreen Governance Deck',
  '/qa': 'Compliance QA Checklist',
};

/**
 * Returns whether a given path is an authorized QA inspection destination.
 */
export function isApprovedQaRoute(pathname: string): boolean {
  if (!pathname) return false;
  const cleanPath = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  if (APPROVED_QA_ROUTES.includes(cleanPath)) return true;
  if (cleanPath.startsWith('/citizen')) return true;
  return false;
}

/**
 * Resolves a friendly title for an inspected path.
 */
export function getQaRouteLabel(pathname: string): string {
  const cleanPath = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  if (QA_ROUTE_LABELS[cleanPath]) return QA_ROUTE_LABELS[cleanPath];
  if (cleanPath.startsWith('/citizen/')) return 'Citizen Portal Module';
  return 'Application Screen';
}

/**
 * Checks whether QA inspection mode is currently active for the given user and location.
 */
export function isQaInspectionActive(
  user: User | null,
  location?: { pathname: string; search?: string; state?: any }
): boolean {
  if (!user || !user.isActive) return false;

  const hasInspectPermission =
    user.role === 'governance_auditor' ||
    user.role === 'super_admin' ||
    (Array.isArray(user.permissions) && user.permissions.includes('qa:inspect'));

  if (!hasInspectPermission) return false;

  // If a location is provided, verify it is in the approved QA scope
  if (location && !isApprovedQaRoute(location.pathname)) {
    return false;
  }

  // Check URL query param, hash param, or route state
  const hasQueryParam =
    (location?.search && location.search.includes('qaInspect=true')) ||
    (typeof window !== 'undefined' &&
      (window.location.hash.includes('qaInspect=true') || window.location.search.includes('qaInspect=true')));

  const hasRouteState = !!(location?.state as any)?.qaInspect;

  let hasSessionFlag = false;
  try {
    if (typeof window !== 'undefined') {
      hasSessionFlag = window.sessionStorage.getItem(QA_INSPECT_STORAGE_KEY) === 'true';
    }
  } catch {}

  // If explicitly requested via query/state, mark session active
  if (hasQueryParam || hasRouteState) {
    startQaInspection();
    return true;
  }

  return hasSessionFlag;
}

/**
 * Activates QA inspection mode in session storage.
 */
export function startQaInspection(): void {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(QA_INSPECT_STORAGE_KEY, 'true');
    }
  } catch {}
}

/**
 * Deactivates QA inspection mode in session storage.
 */
export function exitQaInspection(): void {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(QA_INSPECT_STORAGE_KEY);
    }
  } catch {}
}
