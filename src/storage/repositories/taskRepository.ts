import { STORAGE_KEYS } from '../storageKeys';
import { storageService } from '../storageService';
import { TaskAssignment, INITIAL_TASKS, GrievanceItem } from '../../data/grievances';
import { userRepository } from './userRepository';
import { staffCategoryRepository } from './staffCategoryRepository';
import { AuditLogEntry } from '../storageSchemas';

export const taskRepository = {
  getAll(): TaskAssignment[] {
    const list = storageService.getItem<TaskAssignment[]>(STORAGE_KEYS.TASKS);
    if (!list || !Array.isArray(list)) {
      return INITIAL_TASKS;
    }
    return list;
  },

  getById(id: string): TaskAssignment | null {
    const all = this.getAll();
    return all.find((t) => t.id.toUpperCase() === id.toUpperCase()) || null;
  },

  getByStaffName(identifier: string): TaskAssignment[] {
    const all = this.getAll();
    const query = identifier.toLowerCase();
    return all.filter(
      (t) =>
        t.assignedTo.toLowerCase().includes(query) ||
        t.role.toLowerCase().includes(query) ||
        (query.includes('field') && t.role.toLowerCase().includes('field'))
    );
  },

  getByWardId(wardId: number): TaskAssignment[] {
    const all = this.getAll();
    // Strict ward filter: NEVER fallback to all tasks!
    return all.filter((t) => t.wardId === wardId);
  },

  /**
   * Retrieves tasks for a specific field staff member within their authorized ward.
   * Strict security: Staff can ONLY see tasks assigned to them in their assigned ward.
   */
  getStaffTasks(staffIdentifier: string, wardId?: number): TaskAssignment[] {
    const all = this.getAll();
    const staff = userRepository.getStaffByIdOrName(staffIdentifier);
    const authorizedWard = wardId ?? (staff ? staff.wardId || staff.assignedWardIds?.[0] : undefined);
    const staffName = staff?.displayName.toLowerCase() || staffIdentifier.toLowerCase();
    const staffId = staff?.id;

    return all.filter((t) => {
      // Must match staff's authorized ward
      if (authorizedWard !== undefined && t.wardId !== authorizedWard) {
        return false;
      }
      // Must be assigned to this staff member
      const matchesId = staffId && t.assignedFieldStaffId === staffId;
      const matchesName = t.assignedTo.toLowerCase() === staffName || t.assignedTo.toLowerCase().includes(staffName.split(' ')[0]);
      return matchesId || matchesName;
    });
  },

  create(newTask: Partial<TaskAssignment>): TaskAssignment {
    const all = this.getAll();
    const wardId = newTask.wardId || 27;

    // Find linked grievance if any to determine required staff category & department
    let linkedGrievance: GrievanceItem | undefined;
    if (newTask.grievanceId) {
      const grievances = storageService.getItem<GrievanceItem[]>(STORAGE_KEYS.GRIEVANCES) || [];
      linkedGrievance = grievances.find((g) => g.id.toUpperCase() === newTask.grievanceId?.toUpperCase());
      if (linkedGrievance && linkedGrievance.wardId !== wardId) {
        throw new Error(
          `Cross-ward conflict: Grievance "${linkedGrievance.id}" belongs to Ward ${linkedGrievance.wardId}, but task was targeted for Ward ${wardId}.`
        );
      }
    }

    // Determine required staff category and department
    const reqCategory =
      newTask.requiredStaffCategory ||
      (linkedGrievance ? linkedGrievance.requiredStaffCategory : undefined) ||
      (linkedGrievance ? staffCategoryRepository.findRequiredCategoryForGrievance(linkedGrievance.category, linkedGrievance.department).name : undefined);

    // Validate field staff assignment if assignedTo or assignedFieldStaffId provided
    let assignedFieldStaffId = newTask.assignedFieldStaffId;
    let assignedTo = newTask.assignedTo || 'Ramesh (Field Staff)';
    let departmentId = newTask.departmentId || linkedGrievance?.departmentId;
    let staffCategory = newTask.staffCategory;

    if (assignedTo || assignedFieldStaffId) {
      const staffIdentifier = assignedFieldStaffId || assignedTo;
      if (reqCategory) {
        const validStaff = staffCategoryRepository.validateAssignment(
          assignedFieldStaffId || assignedTo,
          wardId,
          reqCategory,
          assignedTo
        );
        assignedFieldStaffId = validStaff.id;
        assignedTo = validStaff.displayName;
        departmentId = departmentId || validStaff.departmentId;
        staffCategory = validStaff.staffCategory;
      } else {
        let staff = assignedFieldStaffId ? userRepository.getStaffByIdOrName(assignedFieldStaffId) : null;
        if (!staff && assignedTo) {
          staff = userRepository.getStaffByIdOrName(assignedTo);
        }
        if (staff && staff.role === 'field_staff') {
          const staffWard = staff.wardId || staff.assignedWardIds?.[0];
          if (staffWard !== undefined && staffWard !== wardId) {
            throw new Error(
              `Cross-ward assignment rejected: Field staff member "${staff.displayName}" is assigned to Ward ${staffWard} and cannot be assigned tasks in Ward ${wardId}. Cross-ward operations are strictly prohibited.`
            );
          }
          if (!staff.isActive) {
            throw new Error(`Field staff member "${staff.displayName}" is deactivated and cannot be assigned tasks.`);
          }
          assignedFieldStaffId = staff.id;
          assignedTo = staff.displayName;
          departmentId = departmentId || staff.departmentId;
          staffCategory = staff.staffCategory;
        }
      }
    }

    // Prevent duplicate tasks for the same grievance (Section 5.6 & Test I)
    if (newTask.grievanceId) {
      const existingTask = all.find(
        (t) => t.grievanceId && t.grievanceId.toUpperCase() === newTask.grievanceId?.toUpperCase()
      );
      if (existingTask) {
        const updatedTask: TaskAssignment = {
          ...existingTask,
          ...newTask,
          id: existingTask.id,
          assignedTo,
          assignedFieldStaffId,
          departmentId,
          role: newTask.role || existingTask.role || 'Field Staff',
          staffCategory,
          requiredStaffCategory: reqCategory,
          dueDate: newTask.dueDate || existingTask.dueDate,
          dueAt: newTask.dueAt || newTask.dueDate || existingTask.dueAt,
          status: newTask.status || existingTask.status || 'Pending',
          wardId,
          grievanceId: newTask.grievanceId,
        };
        const updatedList = all.map((t) => (t.id === existingTask.id ? updatedTask : t));
        storageService.setItem(STORAGE_KEYS.TASKS, updatedList);
        return updatedTask;
      }
    }

    let nextNum = all.length + 1;
    while (all.some((t) => t.id === `TASK-${String(nextNum).padStart(2, '0')}`)) nextNum++;
    const id = newTask.id || `TASK-${String(nextNum).padStart(2, '0')}`;

    const fullTask: TaskAssignment = {
      id,
      task: newTask.task || 'Civic repair assignment',
      assignedTo,
      assignedFieldStaffId,
      departmentId,
      role: newTask.role || 'Field Staff',
      staffCategory,
      requiredStaffCategory: reqCategory,
      dueDate: newTask.dueDate || '24 May 2024',
      dueAt: newTask.dueAt || newTask.dueDate || '24 May 2024',
      createdAt: newTask.createdAt || new Date().toISOString(),
      priority: newTask.priority || 'Medium',
      status: newTask.status || 'Pending',
      wardId,
      grievanceId: newTask.grievanceId,
    };

    const updated = [fullTask, ...all];
    storageService.setItem(STORAGE_KEYS.TASKS, updated);
    return fullTask;
  },

  updateStatus(
    id: string,
    status: 'Pending' | 'In Progress' | 'Completed',
    notes?: string,
    photo?: string,
    actorStaffIdentifier?: string
  ): TaskAssignment | null {
    const all = this.getAll();
    const index = all.findIndex((t) => t.id.toUpperCase() === id.toUpperCase());
    if (index === -1) return null;

    const current = all[index];

    // Security check: If actor is a field staff member, ensure they are authorized for this task
    if (actorStaffIdentifier) {
      const actor = userRepository.getStaffByIdOrName(actorStaffIdentifier);
      if (actor && actor.role === 'field_staff') {
        const actorWard = actor.wardId || actor.assignedWardIds?.[0];
        if (actorWard !== undefined && actorWard !== current.wardId) {
          // Log unauthorized attempt to audit log
          const auditLogs = storageService.getItem<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOG) || [];
          auditLogs.unshift({
            id: `AUDIT-UNAUTH-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actorId: actor.id,
            actorName: actor.displayName,
            role: 'field_staff',
            action: 'REJECTED_CROSS_WARD_TASK_UPDATE',
            resource: 'tasks',
            resourceId: current.id,
            details: `Unauthorized attempt by ${actor.displayName} (Ward ${actorWard}) to update task ${current.id} in Ward ${current.wardId}. Access denied.`,
          });
          storageService.setItem(STORAGE_KEYS.AUDIT_LOG, auditLogs);
          return null;
        }
      }
    }

    const updatedTask: TaskAssignment = {
      ...current,
      status,
      notes: notes !== undefined ? notes : current.notes,
      completionNotes: notes !== undefined ? notes : current.completionNotes,
      photo: photo !== undefined ? photo : current.photo,
    };

    all[index] = updatedTask;
    storageService.setItem(STORAGE_KEYS.TASKS, all);
    return updatedTask;
  },

  update(id: string, updates: Partial<TaskAssignment>): TaskAssignment | null {
    const all = this.getAll();
    const index = all.findIndex((t) => t.id.toUpperCase() === id.toUpperCase());
    if (index === -1) return null;

    const current = all[index];
    const targetWard = updates.wardId !== undefined ? updates.wardId : current.wardId;

    // Validate staff assignment if assignedTo or assignedFieldStaffId updated
    if (updates.assignedTo || updates.assignedFieldStaffId) {
      const reqCat =
        updates.requiredStaffCategory ||
        current.requiredStaffCategory ||
        (current.grievanceId
          ? (() => {
              const grievances = storageService.getItem<GrievanceItem[]>(STORAGE_KEYS.GRIEVANCES) || [];
              const g = grievances.find((x) => x.id.toUpperCase() === current.grievanceId?.toUpperCase());
              return g ? (g.requiredStaffCategory || staffCategoryRepository.findRequiredCategoryForGrievance(g.category, g.department).name) : undefined;
            })()
          : undefined);

      if (reqCat) {
        const validStaff = staffCategoryRepository.validateAssignment(
          updates.assignedFieldStaffId || updates.assignedTo!,
          targetWard,
          reqCat
        );
        updates.assignedFieldStaffId = validStaff.id;
        updates.assignedTo = validStaff.displayName;
        updates.staffCategory = validStaff.staffCategory;
      } else {
        const staff = userRepository.getStaffByIdOrName(updates.assignedFieldStaffId || updates.assignedTo!);
        if (staff && staff.role === 'field_staff') {
          const staffWard = staff.wardId || staff.assignedWardIds?.[0];
          if (staffWard !== undefined && staffWard !== targetWard) {
            throw new Error(
              `Cross-ward assignment rejected: Field staff member "${staff.displayName}" is assigned to Ward ${staffWard} and cannot be assigned tasks in Ward ${targetWard}.`
            );
          }
          if (!staff.isActive) {
            throw new Error(`Field staff member "${staff.displayName}" is deactivated and cannot be assigned tasks.`);
          }
          updates.assignedFieldStaffId = staff.id;
          updates.assignedTo = staff.displayName;
          updates.staffCategory = staff.staffCategory;
        }
      }
    }

    const updatedTask: TaskAssignment = {
      ...current,
      ...updates,
    };

    all[index] = updatedTask;
    storageService.setItem(STORAGE_KEYS.TASKS, all);
    return updatedTask;
  },
};
