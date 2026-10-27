import { STORAGE_KEYS } from '../storageKeys';
import { storageService } from '../storageService';
import { DemoUserRecord } from '../../auth/mockUsers';
import { User } from '../../auth/authTypes';
import { EXTENDED_DEMO_USERS } from '../storageMigration';
import { TaskAssignment } from '../../data/grievances';
import { Ward } from '../../data/wards';
import { AuditLogEntry } from '../storageSchemas';

export function normalizeWardId(val: any): number | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  if (typeof val === 'string') {
    const match = val.match(/\d+/);
    if (match) return parseInt(match[0], 10);
  }
  return null;
}

export function isUserActive(u: any): boolean {
  if (!u) return false;
  if (u.isActive !== undefined) {
    return u.isActive === true || u.isActive === 'true' || u.isActive === 'active';
  }
  if (u.active !== undefined) {
    return u.active === true || u.active === 'true' || u.active === 'active';
  }
  if (u.status !== undefined) {
    return String(u.status).toLowerCase() === 'active';
  }
  return true;
}

export const userRepository = {
  getAll(): Record<string, DemoUserRecord> {
    const users = storageService.getItem<Record<string, DemoUserRecord>>(STORAGE_KEYS.USERS);
    const raw = (!users || Object.keys(users).length === 0) ? EXTENDED_DEMO_USERS : users;
    // Normalize users so .name and .displayName are both guaranteed without deleting data
    for (const key of Object.keys(raw)) {
      if (raw[key]?.user) {
        if (!raw[key].user.name && raw[key].user.displayName) {
          raw[key].user.name = raw[key].user.displayName;
        }
        if (!raw[key].user.displayName && raw[key].user.name) {
          raw[key].user.displayName = raw[key].user.name;
        }
      }
    }
    return raw;
  },

  getByEmail(email: string): DemoUserRecord | null {
    const all = this.getAll();
    const normalized = email.toLowerCase().trim();
    return all[normalized] || null;
  },

  getById(id: string): User | null {
    const all = this.getAll();
    const found = (Object.values(all) as DemoUserRecord[]).find((r) => r.user.id === id);
    return found ? found.user : null;
  },

  getStaffByIdOrName(identifier: string): User | null {
    if (!identifier) return null;
    const all = this.getAll();
    const clean = identifier.trim().toLowerCase();
    const records = (Object.values(all) as DemoUserRecord[]).map((r) => r.user);

    // 1. Exact ID match
    let found = records.find((u) => u.id.toLowerCase() === clean);
    if (found) return found;

    // 2. Exact display name or username match
    found = records.find(
      (u) =>
        u.displayName.toLowerCase() === clean ||
        u.username.toLowerCase() === clean
    );
    if (found) return found;

    // 3. Field staff match by name or first word (strictly prioritize field_staff)
    const firstWord = clean.split(/[\s(._-]/)[0];
    found = records.find(
      (u) =>
        u.role === 'field_staff' &&
        (u.displayName.toLowerCase().includes(clean) ||
          clean.includes(u.displayName.toLowerCase()) ||
          (firstWord.length >= 3 && u.displayName.toLowerCase().includes(firstWord)))
    );
    if (found) return found;

    // 4. Any user substring match
    found = records.find(
      (u) =>
        u.displayName.toLowerCase().includes(clean) ||
        clean.includes(u.displayName.toLowerCase())
    );
    if (found) return found;

    return null;
  },

  /**
   * Retrieves field staff strictly matching ward, department, category, and skill filters.
   * If a wardId is provided, ONLY staff whose authorized operational ward matches are returned.
   */
  getFieldStaff(filters?: {
    wardId?: number | string;
    departmentId?: string;
    staffCategory?: string;
    skill?: string;
    activeOnly?: boolean;
  }): User[] {
    const all = this.getAll();
    const activeOnly = filters?.activeOnly !== false;
    const records = (Object.values(all) as DemoUserRecord[]).map((r) => r.user);
    const targetWard = filters?.wardId !== undefined ? normalizeWardId(filters.wardId) : null;

    return records.filter((u) => {
      if (u.role !== 'field_staff') return false;
      if (activeOnly && !isUserActive(u)) return false;

      // Strict canonical ward filter
      if (targetWard !== null) {
        const staffWard = normalizeWardId(u.wardId || u.assignedWardIds?.[0]);
        if (staffWard !== targetWard) return false;
      }

      // Department filter
      if (filters?.departmentId) {
        const deptFilter = filters.departmentId.toLowerCase().replace(/[^a-z]/g, '');
        const userDept = (u.departmentId || u.departmentName || '').toLowerCase().replace(/[^a-z]/g, '');
        if (!userDept.includes(deptFilter) && !deptFilter.includes(userDept)) {
          return false;
        }
      }

      // Staff category filter
      if (filters?.staffCategory) {
        const catFilter = filters.staffCategory.toLowerCase().trim();
        const userCat = (u.staffCategory || u.staffCategoryId || u.roleTitle || '').toLowerCase();
        const matchesCategory = userCat.includes(catFilter) || catFilter.includes(userCat);
        const matchesSkills = (u.skills || []).some(
          (s) => s.toLowerCase().includes(catFilter) || catFilter.includes(s.toLowerCase())
        );
        if (!matchesCategory && !matchesSkills) {
          return false;
        }
      }

      // Skill filter
      if (filters?.skill) {
        const skillFilter = filters.skill.toLowerCase().trim();
        const hasSkill = (u.skills || []).some((s) => s.toLowerCase().includes(skillFilter));
        if (!hasSkill) return false;
      }

      return true;
    });
  },

  /**
   * Super Admin authorized flow for reassigning a field staff member to another ward.
   * Enforces business rule: Incompatible active tasks in current ward block reassignment.
   */
  reassignStaffWard(
    staffId: string,
    newWardId: number,
    actorName = 'Municipal Administrator'
  ): { success: boolean; message?: string; error?: string } {
    const allUsers = this.getAll();
    const userKey = Object.keys(allUsers).find(
      (k) => allUsers[k].user.id === staffId || allUsers[k].user.displayName === staffId
    );

    if (!userKey) {
      return { success: false, error: `Field staff member with ID "${staffId}" not found.` };
    }

    const staffUser = allUsers[userKey].user;
    if (staffUser.role !== 'field_staff') {
      return { success: false, error: 'Target user is not a field staff member.' };
    }

    const currentWardId = staffUser.wardId || staffUser.assignedWardIds?.[0];
    if (currentWardId === newWardId) {
      return { success: true, message: `Staff is already assigned to Ward ${newWardId}.` };
    }

    // Check for active incomplete tasks assigned to this worker in their current ward
    const tasks = storageService.getItem<TaskAssignment[]>(STORAGE_KEYS.TASKS) || [];
    const activeTasks = tasks.filter(
      (t) =>
        t.wardId === currentWardId &&
        t.status !== 'Completed' &&
        (t.assignedFieldStaffId === staffUser.id ||
          t.assignedTo.toLowerCase() === staffUser.displayName.toLowerCase() ||
          t.assignedTo.toLowerCase().includes(staffUser.displayName.split(' ')[0].toLowerCase()))
    );

    if (activeTasks.length > 0) {
      return {
        success: false,
        error: `Cannot reassign ${staffUser.displayName} to Ward ${newWardId}. They have ${activeTasks.length} active incomplete task(s) in Ward ${currentWardId}. Resolve or transfer active tasks before reassigning.`,
      };
    }

    // Atomic update of user record
    staffUser.wardId = newWardId;
    staffUser.assignedWardIds = [newWardId];
    staffUser.assignedWardName = `Ward ${newWardId}`;
    staffUser.roleTitle = staffUser.roleTitle.replace(/Ward \d+/, `Ward ${newWardId}`);
    allUsers[userKey].user = staffUser;
    storageService.setItem(STORAGE_KEYS.USERS, allUsers);

    // Sync with ward records
    const wards = storageService.getItem<Ward[]>(STORAGE_KEYS.WARDS) || [];
    let wardsChanged = false;
    for (const w of wards) {
      if (w.id === currentWardId && w.assignedStaffIds) {
        w.assignedStaffIds = w.assignedStaffIds.filter((id) => id !== staffUser.id);
        wardsChanged = true;
      }
      if (w.id === newWardId) {
        const staffList = w.assignedStaffIds || [];
        if (!staffList.includes(staffUser.id)) {
          w.assignedStaffIds = [...staffList, staffUser.id];
          wardsChanged = true;
        }
      }
    }
    if (wardsChanged) {
      storageService.setItem(STORAGE_KEYS.WARDS, wards);
    }

    // Record in Audit Trail
    const auditLogs = storageService.getItem<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOG) || [];
    const auditEntry: AuditLogEntry = {
      id: `AUDIT-REASSIGN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: 'ADMIN',
      actorName: actorName,
      role: 'super_admin',
      action: 'STAFF_REASSIGNMENT',
      resource: 'users',
      resourceId: staffUser.id,
      details: `Reassigned ${staffUser.displayName} from Ward ${currentWardId} to Ward ${newWardId}. Previous tasks verified clean.`,
    };
    storageService.setItem(STORAGE_KEYS.AUDIT_LOG, [auditEntry, ...auditLogs]);

    return { success: true, message: `Successfully reassigned ${staffUser.displayName} from Ward ${currentWardId} to Ward ${newWardId}.` };
  },

  saveUser(record: DemoUserRecord): void {
    const all = this.getAll();
    const email = record.user.username.toLowerCase().trim();
    all[email] = record;
    storageService.setItem(STORAGE_KEYS.USERS, all);
  },

  toggleActive(email: string): boolean {
    const all = this.getAll();
    const key = email.toLowerCase().trim();
    if (!all[key]) return false;
    all[key].user.isActive = !all[key].user.isActive;
    storageService.setItem(STORAGE_KEYS.USERS, all);
    return all[key].user.isActive;
  },

  createUser(newRecord: DemoUserRecord): boolean {
    const all = this.getAll();
    const key = newRecord.user.username.toLowerCase().trim();
    if (all[key]) {
      return false; // User already exists
    }
    all[key] = newRecord;
    storageService.setItem(STORAGE_KEYS.USERS, all);
    return true;
  },

  updateUser(email: string, updates: Partial<User>): boolean {
    const all = this.getAll();
    const key = email.toLowerCase().trim();
    if (!all[key]) return false;
    all[key].user = { ...all[key].user, ...updates };
    storageService.setItem(STORAGE_KEYS.USERS, all);
    return true;
  },
};
