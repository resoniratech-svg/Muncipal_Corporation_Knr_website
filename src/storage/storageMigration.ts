import { STORAGE_KEYS, CURRENT_SCHEMA_VERSION } from './storageKeys';
import { storageService } from './storageService';
import { StorageMeta, FeedbackItem, AuditLogEntry, AppSettings } from './storageSchemas';
import { DEMO_USERS } from '../auth/mockUsers';
import { WARDS } from '../data/wards';
import { DEPARTMENTS } from '../data/departments';
import { DEFAULT_STAFF_CATEGORIES } from '../data/staffCategories';
import { INITIAL_GRIEVANCES, INITIAL_TASKS } from '../data/grievances';
import { INITIAL_NOTIFICATIONS } from '../data/notifications';
import { WARD_27_PROJECTS } from '../data/budget';
import { clearStoredPhotos, resolvePhoto } from '../photos/photoStore';

// Extended demo users including Citizen 2 for isolation testing
export const EXTENDED_DEMO_USERS = {
  ...DEMO_USERS,
  'citizen2@kmc.demo': {
    passwordHash: 'KmcCitizen2@123',
    roleDescription: 'Secondary resident citizen (Booth Colony, Ward 12) – For isolation & privacy testing',
    user: {
      id: 'USR-CITIZEN-02',
      username: 'citizen2@kmc.demo',
      displayName: 'Smt. Lavanya Reddy',
      role: 'citizen' as const,
      roleTitle: 'Registered Resident Citizen (Ward 12)',
      assignedWardIds: [12],
      assignedWardName: 'Ward 12 – Booth Colony',
      permissions: [
        'citizen:submit_grievance' as const,
        'citizen:view_own' as const,
      ],
      isActive: true,
      avatarInitials: 'LR',
    },
  },
};

const INITIAL_FEEDBACK: FeedbackItem[] = [
  {
    id: 'FB-01',
    grievanceId: '#GRV2024-00234',
    citizenId: 'USR-CITIZEN-01',
    citizenName: 'Sri. P. Rajesh Kumar',
    rating: 5,
    comment: 'Very prompt and effective action. Desilting completed and drain covered.',
    submittedAt: '20 May 2024, 05:30 PM',
  },
  {
    id: 'FB-02',
    grievanceId: 'GRV-2024-27-0045',
    citizenId: 'USR-CITIZEN-01',
    citizenName: 'Sri. P. Rajesh Kumar',
    rating: 5,
    comment: 'Drain overflow resolved within SLA. Clean before and after proof provided.',
    submittedAt: '17 May 2024, 05:00 PM',
  },
];

const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'AUDIT-INIT',
    timestamp: new Date().toISOString(),
    actorId: 'SYSTEM',
    actorName: 'KMC System Bootstrapper',
    role: 'system',
    action: 'INITIALIZE_SCHEMA',
    resource: 'storage',
    details: `Initialized KMC Digital Governance Platform database v${CURRENT_SCHEMA_VERSION} with 7 demo roles, 66 wards, and 8 departments.`,
  },
];

const INITIAL_SETTINGS: AppSettings = {
  dataMode: 'deck-exact',
  autoEscalationSimulation: false,
  smsSimulationActive: true,
};

function mergeSeed<T extends { id: string }>(key: string, seed: T[]): T[] {
  const stored = storageService.getItem<T[]>(key) || [];
  const seedIds = new Set(seed.map((item) => item.id));
  return [...stored.filter((item) => !seedIds.has(item.id)), ...seed];
}

/**
 * Ensures demo field staff users exist and have required categories and ward assignments.
 * Idempotent and non-destructive: preserves any customized fields, adds missing users/properties.
 */
export function healDemoUsers(): void {
  const existingUsers = storageService.getItem<Record<string, any>>(STORAGE_KEYS.USERS) || {};
  let changed = false;

  for (const [key, demoRecord] of Object.entries(EXTENDED_DEMO_USERS)) {
    if (!existingUsers[key]) {
      existingUsers[key] = demoRecord;
      changed = true;
    } else {
      // Ensure existing user has staffCategory, staffCategoryId, skills, wardId if missing
      const user = existingUsers[key].user;
      const demoUser = (demoRecord as any).user;
      let userChanged = false;
      if (!user.staffCategory && demoUser.staffCategory) {
        user.staffCategory = demoUser.staffCategory;
        userChanged = true;
      }
      if (!user.staffCategoryId && demoUser.staffCategoryId) {
        user.staffCategoryId = demoUser.staffCategoryId;
        userChanged = true;
      }
      if ((!user.skills || user.skills.length === 0) && demoUser.skills) {
        user.skills = demoUser.skills;
        userChanged = true;
      }
      if (user.wardId === undefined && demoUser.wardId !== undefined) {
        user.wardId = demoUser.wardId;
        userChanged = true;
      }
      if (user.isActive === undefined && demoUser.isActive !== undefined) {
        user.isActive = demoUser.isActive;
        userChanged = true;
      }
      if (!user.name && user.displayName) {
        user.name = user.displayName;
        userChanged = true;
      }
      if (userChanged) {
        changed = true;
      }
    }
  }

  if (changed) {
    storageService.setItem(STORAGE_KEYS.USERS, existingUsers);
  }
}

/**
 * Ensures any legacy stored grievances with demo-photo:* tokens are migrated to real photograph assets.
 * Preserves user-uploaded photos (kmc-photo:*, data:image/*) exactly as uploaded.
 */
export function healGrievancePhotos(): void {
  const grievances = storageService.getItem<any[]>(STORAGE_KEYS.GRIEVANCES);
  if (!Array.isArray(grievances)) return;

  let changed = false;
  const updated = grievances.map((g) => {
    let itemChanged = false;
    const item = { ...g };

    if (item.beforePhoto && item.beforePhoto.startsWith('demo-photo:')) {
      item.beforePhoto = resolvePhoto(item.beforePhoto);
      itemChanged = true;
    }
    if (item.afterPhoto && item.afterPhoto.startsWith('demo-photo:')) {
      item.afterPhoto = resolvePhoto(item.afterPhoto);
      itemChanged = true;
    }
    if (Array.isArray(item.beforePhotos)) {
      item.beforePhotos = item.beforePhotos.map((ev: any) => {
        if (ev?.src && ev.src.startsWith('demo-photo:')) {
          itemChanged = true;
          return { ...ev, src: resolvePhoto(ev.src) };
        }
        return ev;
      });
    }
    if (Array.isArray(item.afterPhotos)) {
      item.afterPhotos = item.afterPhotos.map((ev: any) => {
        if (ev?.src && ev.src.startsWith('demo-photo:')) {
          itemChanged = true;
          return { ...ev, src: resolvePhoto(ev.src) };
        }
        return ev;
      });
    }
    if (Array.isArray(item.timeline)) {
      item.timeline = item.timeline.map((entry: any) => {
        if (entry?.photo && entry.photo.startsWith('demo-photo:')) {
          itemChanged = true;
          return { ...entry, photo: resolvePhoto(entry.photo) };
        }
        return entry;
      });
    }

    if (itemChanged) {
      changed = true;
      return item;
    }
    return g;
  });

  if (changed) {
    storageService.setItem(STORAGE_KEYS.GRIEVANCES, updated);
  }
}

/**
 * Initializes the storage with seed data if not present, or performs version migrations.
 */
export function initializeStorage(forceReset = false): void {
  const meta = storageService.getItem<StorageMeta>(STORAGE_KEYS.META);

  if (!meta || forceReset) {
    console.info('KMC StorageMigration: Seeding fresh demo data to localStorage...');
    // A reset also removes uploaded photos (stored under their own kmc:photo:* keys)
    if (forceReset) clearStoredPhotos();

    const newMeta: StorageMeta = {
      version: CURRENT_SCHEMA_VERSION,
      initializedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };

    storageService.setItem(STORAGE_KEYS.META, newMeta);
    storageService.setItem(STORAGE_KEYS.USERS, EXTENDED_DEMO_USERS);
    storageService.setItem(STORAGE_KEYS.WARDS, WARDS);
    storageService.setItem(STORAGE_KEYS.DEPARTMENTS, DEPARTMENTS);
    storageService.setItem(STORAGE_KEYS.STAFF_CATEGORIES, DEFAULT_STAFF_CATEGORIES);
    storageService.setItem(STORAGE_KEYS.GRIEVANCES, INITIAL_GRIEVANCES);
    storageService.setItem(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    storageService.setItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    storageService.setItem(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK);
    storageService.setItem(STORAGE_KEYS.PROJECTS, WARD_27_PROJECTS);
    storageService.setItem(STORAGE_KEYS.AUDIT_LOG, INITIAL_AUDIT_LOG);
    storageService.setItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);

    console.info('KMC StorageMigration: Seed completed successfully.');
    return;
  }

  // Schema version migration check
  if (meta.version !== CURRENT_SCHEMA_VERSION) {
    console.info(`KMC StorageMigration: Migrating from v${meta.version} to v${CURRENT_SCHEMA_VERSION}...`);
    // Ensure all critical keys exist
    if (!storageService.getItem(STORAGE_KEYS.USERS)) {
      storageService.setItem(STORAGE_KEYS.USERS, EXTENDED_DEMO_USERS);
    }
    if (!storageService.getItem(STORAGE_KEYS.FEEDBACK)) {
      storageService.setItem(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK);
    }
    if (!storageService.getItem(STORAGE_KEYS.AUDIT_LOG)) {
      storageService.setItem(STORAGE_KEYS.AUDIT_LOG, INITIAL_AUDIT_LOG);
    }
    if (!storageService.getItem(STORAGE_KEYS.STAFF_CATEGORIES)) {
      storageService.setItem(STORAGE_KEYS.STAFF_CATEGORIES, DEFAULT_STAFF_CATEGORIES);
    }
    // v1.1.0: reference data corrected to the deck. Wards are reseeded; seeded projects and
    // notifications are replaced by id while records created in the app are kept.
    storageService.setItem(STORAGE_KEYS.WARDS, WARDS);
    storageService.setItem(STORAGE_KEYS.PROJECTS, mergeSeed(STORAGE_KEYS.PROJECTS, WARD_27_PROJECTS));
    storageService.setItem(STORAGE_KEYS.NOTIFICATIONS, mergeSeed(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS));
    // v1.2.0: 12 demo complaints with before/after photos, tasks linked to complaints by id
    storageService.setItem(STORAGE_KEYS.GRIEVANCES, mergeSeed(STORAGE_KEYS.GRIEVANCES, INITIAL_GRIEVANCES));
    storageService.setItem(STORAGE_KEYS.TASKS, mergeSeed(STORAGE_KEYS.TASKS, INITIAL_TASKS));
    // v1.3.0 & v1.4.0: Field staff categories, authoritative roster synchronization & healing
    healDemoUsers();
    // v1.5.0: Replace cartoon demo photos with authentic municipal photographs
    healGrievancePhotos();
    meta.version = CURRENT_SCHEMA_VERSION;
    meta.lastUpdatedAt = new Date().toISOString();
    storageService.setItem(STORAGE_KEYS.META, meta);
  } else {
    // Idempotent self-healing pass on active sessions
    healDemoUsers();
    healGrievancePhotos();
  }
}
