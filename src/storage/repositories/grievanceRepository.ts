import { STORAGE_KEYS } from '../storageKeys';
import { storageService } from '../storageService';
import { GrievanceItem, GrievanceStatus, INITIAL_GRIEVANCES, DepartmentName } from '../../data/grievances';
import { userRepository } from './userRepository';
import { staffCategoryRepository } from './staffCategoryRepository';

export const grievanceRepository = {
  getAll(): GrievanceItem[] {
    const list = storageService.getItem<GrievanceItem[]>(STORAGE_KEYS.GRIEVANCES);
    if (!list || !Array.isArray(list)) {
      return INITIAL_GRIEVANCES;
    }
    return list;
  },

  getById(id: string): GrievanceItem | null {
    const all = this.getAll();
    const cleanId = id.trim().toUpperCase();
    return all.find((g) => g.id.toUpperCase() === cleanId) || null;
  },

  getByCitizenId(citizenId: string): GrievanceItem[] {
    const all = this.getAll();
    return all.filter((g) => g.citizenId === citizenId);
  },

  getByWardId(wardId: number): GrievanceItem[] {
    const all = this.getAll();
    // Strictly ward-isolated query: never return cross-ward records
    return all.filter((g) => g.wardId === wardId);
  },

  getByDepartment(deptName: string): GrievanceItem[] {
    const all = this.getAll();
    const query = deptName.toLowerCase();
    return all.filter(
      (g) =>
        (g.department && g.department.toLowerCase().includes(query)) ||
        (g.departmentId && g.departmentId.toLowerCase().includes(query)) ||
        g.category.toLowerCase().includes(query)
    );
  },

  create(newItem: Partial<GrievanceItem>, citizenName?: string, corporatorName?: string): GrievanceItem {
    const all = this.getAll();
    // #GRV2024-XXXXX, unique among stored complaints
    let id = newItem.id || '';
    while (!id || all.some((g) => g.id === id)) {
      id = `#GRV2024-${Math.floor(10000 + Math.random() * 90000)}`;
    }
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const wardNum = newItem.wardId || 27;

    const dept = newItem.department || newItem.departmentId || 'Engineering';
    const deptId = newItem.departmentId || dept.toLowerCase().replace(/[^a-z]/g, '-');
    const categoryName = newItem.category || 'Drainage Issue';
    const requiredStaffCategory =
      newItem.requiredStaffCategory ||
      staffCategoryRepository.findRequiredCategoryForGrievance(categoryName, dept).name;

    // Validate staff assignment if assignedTo or assignedFieldStaffId provided
    let assignedFieldStaffId = newItem.assignedFieldStaffId;
    let assignedTo = newItem.assignedTo;
    if (assignedTo || assignedFieldStaffId) {
      try {
        const validStaff = staffCategoryRepository.validateAssignment(
          assignedFieldStaffId || assignedTo!,
          wardNum,
          { category: categoryName, department: dept, requiredStaffCategory }
        );
        assignedFieldStaffId = validStaff.id;
        assignedTo = validStaff.displayName;
      } catch {
        // Keep assigned officer/staff if assignment is to a section officer rather than ground field staff
      }
    }

    const fullItem: GrievanceItem = {
      id,
      citizenId: newItem.citizenId || 'USR-CITIZEN-01',
      citizenName: citizenName || newItem.citizenName || 'Resident Citizen',
      category: categoryName,
      department: dept as DepartmentName,
      departmentId: deptId,
      requiredStaffCategory,
      description: newItem.description || 'Grievance submitted by citizen.',
      location: newItem.location || `Ward ${wardNum}`,
      wardId: wardNum,
      reportedOn: `${dateStr}, ${timeStr}`,
      createdAt: newItem.createdAt || now.toISOString(),
      status: 'Pending',
      priority: newItem.priority || 'Medium',
      slaHours: newItem.slaHours || 48,
      assignedTo,
      assignedFieldStaffId,
      assignedOfficerId: newItem.assignedOfficerId,
      taskId: newItem.taskId,
      escalationLevel: 1,
      latitude: newItem.latitude,
      longitude: newItem.longitude,
      beforePhoto: newItem.beforePhoto || newItem.beforePhotos?.[0]?.src,
      beforePhotos: newItem.beforePhotos,
      timeline: [
        {
          time: `${dateStr}, ${timeStr}`,
          title: 'Complaint Registered',
          note: `Registered via My Karimnagar Portal by ${citizenName || 'Resident'}. Auto-routing initiated.`,
          photo: newItem.beforePhotos?.[0]?.src || newItem.beforePhoto,
        },
        {
          time: `${dateStr}, ${timeStr}`,
          title: 'Auto-Routed to Ward Corporator & Department',
          note: `Forwarded to Ward ${wardNum} Corporator (${corporatorName || 'Ward Representative'}) & ${dept} Department.`,
        },
      ],
    };

    const updated = [fullItem, ...all];
    storageService.setItem(STORAGE_KEYS.GRIEVANCES, updated);
    return fullItem;
  },

  update(id: string, updates: Partial<GrievanceItem>): GrievanceItem | null {
    const all = this.getAll();
    const index = all.findIndex((g) => g.id.toUpperCase() === id.toUpperCase());
    if (index === -1) return null;

    const current = all[index];
    const targetWard = updates.wardId !== undefined ? updates.wardId : current.wardId;

    if (updates.assignedTo || updates.assignedFieldStaffId) {
      const validStaff = staffCategoryRepository.validateAssignment(
        updates.assignedFieldStaffId || updates.assignedTo!,
        targetWard,
        {
          category: updates.category || current.category,
          department: updates.department || current.department,
          requiredStaffCategory: updates.requiredStaffCategory || current.requiredStaffCategory,
        }
      );
      updates.assignedFieldStaffId = validStaff.id;
      updates.assignedTo = validStaff.displayName;
    }

    const updatedItem: GrievanceItem = {
      ...current,
      ...updates,
      timeline: updates.timeline || current.timeline,
    };

    all[index] = updatedItem;
    storageService.setItem(STORAGE_KEYS.GRIEVANCES, all);
    return updatedItem;
  },

  updateStatus(
    id: string,
    newStatus: GrievanceStatus,
    note?: string,
    officerOrWorker?: string,
    extra: Partial<GrievanceItem> & { timelineTitle?: string; timelinePhoto?: string } = {}
  ): GrievanceItem | null {
    const all = this.getAll();
    const index = all.findIndex((g) => g.id.toUpperCase() === id.toUpperCase());
    if (index === -1) return null;

    const current = all[index];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

    const { timelineTitle, timelinePhoto, ...fields } = extra;
    const timelineEntry = {
      time: `${dateStr}, ${timeStr}`,
      title: timelineTitle || `Status: ${newStatus}`,
      note: note || `Updated by ${officerOrWorker || 'Municipal Officer'}.`,
      ...(timelinePhoto ? { photo: timelinePhoto } : {}),
    };

    const updatedTimeline = current.timeline ? [...current.timeline, timelineEntry] : [timelineEntry];

    const updatedItem: GrievanceItem = {
      ...current,
      ...fields,
      status: newStatus,
      timeline: updatedTimeline,
    };

    all[index] = updatedItem;
    storageService.setItem(STORAGE_KEYS.GRIEVANCES, all);
    return updatedItem;
  },

  rateGrievance(id: string, rating: number, comment: string): GrievanceItem | null {
    const all = this.getAll();
    const index = all.findIndex((g) => g.id.toUpperCase() === id.toUpperCase());
    if (index === -1) return null;

    const current = all[index];
    const updatedItem: GrievanceItem = {
      ...current,
      citizenRating: rating,
      feedbackComment: comment,
      citizenFeedback: comment,
      status: 'Resolved',
    };

    all[index] = updatedItem;
    storageService.setItem(STORAGE_KEYS.GRIEVANCES, all);
    return updatedItem;
  },
};
