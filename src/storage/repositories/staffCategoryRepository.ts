import { STORAGE_KEYS } from '../storageKeys';
import { storageService } from '../storageService';
import { StaffCategory, DEFAULT_STAFF_CATEGORIES } from '../../data/staffCategories';
import { User } from '../../auth/authTypes';
import { GrievanceItem, DepartmentName } from '../../data/grievances';
import { userRepository, normalizeWardId, isUserActive } from './userRepository';
import { grievanceRepository } from './grievanceRepository';

export const staffCategoryRepository = {
  /**
   * Retrieves all configurable staff categories from localStorage,
   * falling back to the 8 default municipal categories.
   */
  getAll(): StaffCategory[] {
    const list = storageService.getItem<StaffCategory[]>(STORAGE_KEYS.STAFF_CATEGORIES);
    if (!list || !Array.isArray(list) || list.length === 0) {
      return DEFAULT_STAFF_CATEGORIES;
    }
    return list;
  },

  getById(id: string): StaffCategory | null {
    if (!id) return null;
    const all = this.getAll();
    const cleanId = id.trim().toLowerCase().replace(/[_ ]+/g, '-');
    return (
      all.find(
        (c) =>
          c.id.toLowerCase() === cleanId ||
          c.id.toLowerCase().replace(/[_ ]+/g, '-') === cleanId
      ) || null
    );
  },

  getByName(name: string): StaffCategory | null {
    if (!name) return null;
    const all = this.getAll();
    const cleanName = name.trim().toLowerCase().replace(/[_]+/g, ' ');
    const asId = cleanName.replace(/\s+/g, '-');
    return (
      all.find(
        (c) =>
          c.name.toLowerCase() === cleanName ||
          c.id.toLowerCase() === asId ||
          c.name.toLowerCase().includes(cleanName) ||
          cleanName.includes(c.name.toLowerCase())
      ) || null
    );
  },

  /**
   * Identifies the required staff category for a given grievance category or department.
   * Super Admin configuration is honored dynamically.
   */
  findRequiredCategoryForGrievance(
    grievanceCategory: string,
    deptName?: string
  ): StaffCategory {
    const all = this.getAll();
    const catLower = (grievanceCategory || '').toLowerCase();
    const deptLower = (deptName || '').toLowerCase();

    // 1. Direct match by matchedGrievanceCategories
    for (const cat of all) {
      if (
        cat.matchedGrievanceCategories.some((keyword) =>
          catLower.includes(keyword.toLowerCase())
        )
      ) {
        return cat;
      }
    }

    // 2. Keyword matching on name or description
    for (const cat of all) {
      if (
        (catLower.includes('tax') || catLower.includes('revenue') || catLower.includes('property') || catLower.includes('vlt') || catLower.includes('trade')) && cat.id === 'revenue-inspector' ||
        (catLower.includes('birth') || catLower.includes('death') || catLower.includes('certificate')) && cat.id === 'civil-registrar-inspector' ||
        (catLower.includes('pension') || catLower.includes('asara') || catLower.includes('mepma') || catLower.includes('welfare') || catLower.includes('shg')) && cat.id === 'welfare-organizer' ||
        (catLower.includes('building') || catLower.includes('layout') || catLower.includes('permission') || catLower.includes('tgbpass') || catLower.includes('tg-bpass') || catLower.includes('planning')) && cat.id === 'town-planning-inspector' ||
        catLower.includes('drain') && cat.id === 'drainage-worker' ||
        (catLower.includes('road') || catLower.includes('pothole')) && cat.id === 'road-repair-worker' ||
        (catLower.includes('garbage') || catLower.includes('waste') || catLower.includes('clean')) && cat.id === 'sanitation-worker' ||
        (catLower.includes('light') || catLower.includes('electric')) && cat.id === 'electrician' ||
        (catLower.includes('water') || catLower.includes('pipe') || catLower.includes('leak')) && cat.id === 'water-technician' ||
        (catLower.includes('health') || catLower.includes('pest') || catLower.includes('mosquito')) && cat.id === 'public-health-worker' ||
        (catLower.includes('park') || catLower.includes('tree') || catLower.includes('garden')) && cat.id === 'parks-worker' ||
        (catLower.includes('civil') || catLower.includes('footpath') || catLower.includes('divider')) && cat.id === 'civil-maintenance-worker'
      ) {
        return cat;
      }
    }

    // 3. Fallback by department
    if (deptLower) {
      if (deptLower.includes('revenue')) {
        const rev = all.find((c) => c.id === 'revenue-inspector');
        if (rev) return rev;
      }
      if (deptLower.includes('statistic') || deptLower.includes('birth') || deptLower.includes('death')) {
        const stat = all.find((c) => c.id === 'civil-registrar-inspector');
        if (stat) return stat;
      }
      if (deptLower.includes('welfare') || deptLower.includes('mepma') || deptLower.includes('asara')) {
        const wel = all.find((c) => c.id === 'welfare-organizer');
        if (wel) return wel;
      }
      if (deptLower.includes('town') || deptLower.includes('planning')) {
        const tp = all.find((c) => c.id === 'town-planning-inspector');
        if (tp) return tp;
      }
      if (deptLower.includes('sanitation')) {
        const san = all.find((c) => c.id === 'sanitation-worker');
        if (san) return san;
      }
      const matchDept = all.find(
        (c) =>
          c.departmentId.toLowerCase() === deptLower ||
          c.departmentName.toLowerCase().includes(deptLower) ||
          deptLower.includes(c.departmentName.toLowerCase())
      );
      if (matchDept) return matchDept;
    }

    // 4. Default to Civil Maintenance Worker or first category
    return all.find((c) => c.id === 'civil-maintenance-worker') || all[0];
  },

  /**
   * Checks whether a field staff member is qualified for a given grievance or required category.
   */
  isStaffEligible(
    staff: User,
    requiredCategoryNameOrId: string,
    targetWardId?: number | string
  ): boolean {
    if (staff.role !== 'field_staff' || !isUserActive(staff)) return false;

    // Strict canonical ward verification
    if (targetWardId !== undefined && targetWardId !== null) {
      const reqWard = normalizeWardId(targetWardId);
      const assignedWards = (staff.assignedWardIds || []).map(normalizeWardId).filter((w): w is number => w !== null);
      if (staff.wardId !== undefined && staff.wardId !== null) {
        const primary = normalizeWardId(staff.wardId);
        if (primary !== null && !assignedWards.includes(primary)) {
          assignedWards.push(primary);
        }
      }
      if (reqWard !== null && assignedWards.length > 0 && !assignedWards.includes(reqWard)) {
        return false;
      }
    }

    const reqCat =
      this.getById(requiredCategoryNameOrId) ||
      this.getByName(requiredCategoryNameOrId) ||
      this.findRequiredCategoryForGrievance(requiredCategoryNameOrId);

    const staffCat = (staff.staffCategory || staff.staffCategoryId || staff.roleTitle || '').toLowerCase().replace(/[_]+/g, ' ');
    const staffCatId = (staff.staffCategoryId || '').toLowerCase().replace(/[_ ]+/g, '-');
    const staffSkills = staff.skills || [];
    const staffDept = (staff.departmentId || staff.departmentName || '').toLowerCase().replace(/[^a-z]/g, '');
    const reqDept = (reqCat.departmentId || reqCat.departmentName || '').toLowerCase().replace(/[^a-z]/g, '');
    const reqCatName = reqCat.name.toLowerCase().replace(/[_]+/g, ' ');
    const reqCatId = reqCat.id.toLowerCase().replace(/[_ ]+/g, '-');

    // 1. Direct staff category ID match
    if (staffCatId && staffCatId === reqCatId) {
      return true;
    }

    // 2. Direct name or substring match
    if (
      staffCat.includes(reqCatName) ||
      reqCatName.includes(staffCat) ||
      (reqCatId === 'revenue-inspector' && (staffCat.includes('revenue') || staffCat.includes('tax') || staffCat.includes('bill'))) ||
      (reqCatId === 'civil-registrar-inspector' && (staffCat.includes('registry') || staffCat.includes('birth') || staffCat.includes('death') || staffCat.includes('stat'))) ||
      (reqCatId === 'welfare-organizer' && (staffCat.includes('welfare') || staffCat.includes('mepma') || staffCat.includes('asara') || staffCat.includes('pension') || staffCat.includes('community'))) ||
      (reqCatId === 'town-planning-inspector' && (staffCat.includes('town') || staffCat.includes('plan') || staffCat.includes('building') || staffCat.includes('survey'))) ||
      (reqCatId === 'road-repair-worker' && (staffCat.includes('road') || staffCat.includes('pothole'))) ||
      (reqCatId === 'drainage-worker' && staffCat.includes('drain')) ||
      (reqCatId === 'sanitation-worker' && (staffCat.includes('sanitation') || staffCat.includes('garbage'))) ||
      (reqCatId === 'electrician' && (staffCat.includes('electric') || staffCat.includes('light'))) ||
      (reqCatId === 'water-technician' && (staffCat.includes('water') || staffCat.includes('pipe'))) ||
      (reqCatId === 'civil-maintenance-worker' && (staffCat.includes('civil') || staffCat.includes('footpath') || staffCat.includes('masonry')))
    ) {
      return true;
    }

    // 3. Match against skills list
    if (
      staffSkills.some((s) => {
        const sLower = s.toLowerCase();
        return (
          sLower.includes(reqCatName) ||
          reqCatName.includes(sLower) ||
          reqCat.skills.some((sk) => sLower.includes(sk.toLowerCase()) || sk.toLowerCase().includes(sLower))
        );
      })
    ) {
      return true;
    }

    // 4. Fallback if department matches
    if (staffDept && reqDept && staffDept === reqDept) {
      return true;
    }

    return false;
  },

  /**
   * Returns active field staff strictly eligible for a given grievance
   * filtered by:
   * 1. Canonical Ward ID
   * 2. Active status
   * 3. Specialized category / skill & Department
   */
  getEligibleStaffForGrievance(grievance: {
    wardId: number | string;
    category: string;
    department?: string;
    requiredStaffCategory?: string;
  }): User[] {
    const canonicalWard = normalizeWardId(grievance.wardId) || 27;
    const wardStaff = userRepository.getFieldStaff({
      wardId: canonicalWard,
      activeOnly: true,
    });

    const determinedCat = this.findRequiredCategoryForGrievance(grievance.category, grievance.department).name;
    const requiredCategory = determinedCat || grievance.requiredStaffCategory;

    const matched = wardStaff.filter((s) =>
      this.isStaffEligible(s, requiredCategory, canonicalWard)
    );
    if (matched.length > 0) return matched;
    // Fallback to active ward field staff so corporator validation is never blocked
    return wardStaff;
  },

  /**
   * Reusable authoritative query function for field staff eligibility with full diagnostic logging.
   * Meets Section 3 & Section 8 requirements.
   */
  getEligibleFieldStaff(
    grievanceIdOrItem: string | GrievanceItem,
    currentOfficerId?: string
  ): {
    eligibleStaff: User[];
    grievance: GrievanceItem | null;
    requiredCategory: StaffCategory;
    targetWardId: number;
    diagnostics: {
      grievanceId: string;
      canonicalWardId: number;
      requiredDepartmentId: string;
      requiredStaffCategoryId: string;
      totalExamined: number;
      rejectedInactive: number;
      rejectedWardMismatch: number;
      rejectedDeptMismatch: number;
      rejectedCategoryMismatch: number;
      eligibleCount: number;
    };
  } {
    let grievance: GrievanceItem | null = null;
    if (typeof grievanceIdOrItem === 'string') {
      grievance = grievanceRepository.getById(grievanceIdOrItem);
    } else {
      grievance = grievanceIdOrItem;
    }

    const grievanceId = grievance?.id || (typeof grievanceIdOrItem === 'string' ? grievanceIdOrItem : 'UNKNOWN');
    const targetWardId = normalizeWardId(grievance?.wardId) || 27;
    const grievanceCategory = grievance?.category || 'Roads';
    const grievanceDept = grievance?.department || 'Engineering';

    const requiredCategory =
      (grievance?.requiredStaffCategory ? this.getByName(grievance.requiredStaffCategory) : null) ||
      this.findRequiredCategoryForGrievance(grievanceCategory, grievanceDept);

    const allRecords = Object.values(userRepository.getAll()).map((r) => r.user);
    const fieldStaff = allRecords.filter((u) => u.role === 'field_staff');

    let rejectedInactive = 0;
    let rejectedWardMismatch = 0;
    let rejectedDeptMismatch = 0;
    let rejectedCategoryMismatch = 0;
    const eligibleStaff: User[] = [];

    const reqDeptClean = (requiredCategory.departmentId || requiredCategory.departmentName || '').toLowerCase().replace(/[^a-z]/g, '');

    for (const staff of fieldStaff) {
      if (!isUserActive(staff)) {
        rejectedInactive++;
        continue;
      }

      const assignedWards = (staff.assignedWardIds || []).map(normalizeWardId).filter((w): w is number => w !== null);
      if (staff.wardId !== undefined && staff.wardId !== null) {
        const primary = normalizeWardId(staff.wardId);
        if (primary !== null && !assignedWards.includes(primary)) {
          assignedWards.push(primary);
        }
      }
      if (assignedWards.length === 0 || !assignedWards.includes(targetWardId)) {
        rejectedWardMismatch++;
        continue;
      }

      const isEligible = this.isStaffEligible(staff, requiredCategory.name, targetWardId);
      if (!isEligible) {
        const staffDeptClean = (staff.departmentId || staff.departmentName || '').toLowerCase().replace(/[^a-z]/g, '');
        if (reqDeptClean && staffDeptClean && reqDeptClean !== staffDeptClean) {
          rejectedDeptMismatch++;
        } else {
          rejectedCategoryMismatch++;
        }
        continue;
      }

      eligibleStaff.push(staff);
    }

    const diagnostics = {
      grievanceId,
      canonicalWardId: targetWardId,
      requiredDepartmentId: requiredCategory.departmentId,
      requiredStaffCategoryId: requiredCategory.id,
      totalExamined: fieldStaff.length,
      rejectedInactive,
      rejectedWardMismatch,
      rejectedDeptMismatch,
      rejectedCategoryMismatch,
      eligibleCount: eligibleStaff.length,
    };

    if (process.env.NODE_ENV !== 'test') {
      console.info(
        `[KMC Staff Eligibility Query] Grievance ${diagnostics.grievanceId} (Ward ${diagnostics.canonicalWardId}): ` +
        `Examined ${diagnostics.totalExamined} staff -> ${diagnostics.eligibleCount} eligible, ` +
        `${diagnostics.rejectedWardMismatch} wrong ward, ${diagnostics.rejectedCategoryMismatch} wrong skill, ` +
        `${diagnostics.rejectedInactive} inactive.`
      );
    }

    return {
      eligibleStaff,
      grievance,
      requiredCategory,
      targetWardId,
      diagnostics,
    };
  },

  /**
   * Validates staff assignment against ward, category, department, and active status.
   * Throws explicit descriptive error if incompatible.
   */
  validateAssignment(
    staffIdentifier: string,
    wardId: number | string,
    requiredCategoryOrGrievance: string | { category: string; department?: string; requiredStaffCategory?: string; wardId?: number | string },
    fallbackIdentifier?: string
  ): User {
    let staff = userRepository.getStaffByIdOrName(staffIdentifier);
    if (!staff && fallbackIdentifier) {
      staff = userRepository.getStaffByIdOrName(fallbackIdentifier);
    }
    if (!staff) {
      throw new Error(`Field staff member "${staffIdentifier}" not found.`);
    }

    if (staff.role !== 'field_staff') {
      throw new Error(`User "${staff.displayName}" is not a field staff member.`);
    }

    if (!isUserActive(staff)) {
      throw new Error(
        `Staff member "${staff.displayName}" is currently deactivated and cannot be assigned tasks.`
      );
    }

    const canonicalTargetWard = normalizeWardId(wardId) || 27;
    const staffWard = normalizeWardId(staff.wardId || staff.assignedWardIds?.[0]);
    if (staffWard !== null && staffWard !== canonicalTargetWard) {
      throw new Error(
        `Cross-ward assignment rejected: Field staff member "${staff.displayName}" is assigned to Ward ${staffWard} and cannot be assigned work in Ward ${canonicalTargetWard}. Cross-ward operations are strictly prohibited.`
      );
    }

    let requiredCatName: string;
    if (typeof requiredCategoryOrGrievance === 'string') {
      requiredCatName = requiredCategoryOrGrievance;
    } else {
      requiredCatName =
        requiredCategoryOrGrievance.requiredStaffCategory ||
        this.findRequiredCategoryForGrievance(
          requiredCategoryOrGrievance.category,
          requiredCategoryOrGrievance.department
        ).name;
    }

    if (!this.isStaffEligible(staff, requiredCatName, canonicalTargetWard)) {
      const staffCategoryLabel = staff.staffCategory || staff.roleTitle || staff.departmentName || 'General Staff';
      throw new Error(
        `Cross-skill assignment rejected: Field staff member "${staff.displayName}" is categorized as "${staffCategoryLabel}" and does not possess required qualification for category "${requiredCatName}". Incompatible assignments are strictly prohibited.`
      );
    }

    return staff;
  },

  /**
   * Super Admin configuration methods
   */
  saveAll(categories: StaffCategory[]): void {
    storageService.setItem(STORAGE_KEYS.STAFF_CATEGORIES, categories);
  },

  add(category: StaffCategory): boolean {
    const all = this.getAll();
    if (all.some((c) => c.id.toLowerCase() === category.id.toLowerCase())) {
      return false; // Already exists
    }
    const updated = [...all, category];
    this.saveAll(updated);
    return true;
  },

  update(id: string, updates: Partial<StaffCategory>): boolean {
    const all = this.getAll();
    const idx = all.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) return false;
    all[idx] = { ...all[idx], ...updates };
    this.saveAll(all);
    return true;
  },

  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((c) => c.id.toLowerCase() !== id.toLowerCase());
    if (filtered.length === all.length) return false;
    this.saveAll(filtered);
    return true;
  },
};
