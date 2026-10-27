import { createServer } from 'vite';

// Mock browser localStorage for Node testing environment
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  get length() {
    return Object.keys(this.store).length;
  }
  key(i) {
    return Object.keys(this.store)[i] || null;
  }
}

globalThis.window = {
  localStorage: new LocalStorageMock(),
  sessionStorage: new LocalStorageMock(),
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
};
globalThis.localStorage = globalThis.window.localStorage;
globalThis.sessionStorage = globalThis.window.sessionStorage;

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failCount++;
  }
}

async function run() {
  console.log('================================================================');
  console.log('KMC WARD-WISE FIELD STAFF ASSIGNMENT & STRICT ISSUE ISOLATION');
  console.log('COMPREHENSIVE AUTOMATED VERIFICATION SUITE (TESTS A - J)');
  console.log('================================================================\n');

  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  const { storageService } = await server.ssrLoadModule('./src/storage/storageService.ts');
  const { STORAGE_KEYS, CURRENT_SCHEMA_VERSION } = await server.ssrLoadModule('./src/storage/storageKeys.ts');
  const { initializeStorage } = await server.ssrLoadModule('./src/storage/storageMigration.ts');
  const { userRepository } = await server.ssrLoadModule('./src/storage/repositories/userRepository.ts');
  const { grievanceRepository } = await server.ssrLoadModule('./src/storage/repositories/grievanceRepository.ts');
  const { taskRepository } = await server.ssrLoadModule('./src/storage/repositories/taskRepository.ts');
  const { wardRepository } = await server.ssrLoadModule('./src/storage/repositories/wardRepository.ts');
  const { auditRepository } = await server.ssrLoadModule('./src/storage/repositories/auditRepository.ts');

  // Seed storage freshly
  initializeStorage(true);

  // -------------------------------------------------------------
  // TEST A: Ward Selector Filtering
  // -------------------------------------------------------------
  console.log('TEST A: Ward Selector Filtering (Ward 27 vs Ward 12 Staff Isolation)');
  const ward27Staff = userRepository.getFieldStaff({ wardId: 27, activeOnly: true });
  const ward12Staff = userRepository.getFieldStaff({ wardId: 12, activeOnly: true });
  const ward8Staff = userRepository.getFieldStaff({ wardId: 8, activeOnly: true });
  const ward33Staff = userRepository.getFieldStaff({ wardId: 33, activeOnly: true });

  assert(ward27Staff.length === 4, `Ward 27 has exactly 4 assigned ground staff (found: ${ward27Staff.length})`);
  assert(ward12Staff.length === 4, `Ward 12 has exactly 4 assigned ground staff (found: ${ward12Staff.length})`);
  assert(ward8Staff.length === 2, `Ward 8 has exactly 2 assigned ground staff (found: ${ward8Staff.length})`);
  assert(ward33Staff.length === 2, `Ward 33 has exactly 2 assigned ground staff (found: ${ward33Staff.length})`);

  // Verify no cross-ward contamination in Ward 27 staff roster
  const ward27StaffNames = ward27Staff.map((s) => s.displayName);
  assert(ward27StaffNames.includes('Ramesh (Field Staff)'), 'Ramesh is in Ward 27 roster');
  assert(ward27StaffNames.includes('Mahesh (Field Staff)'), 'Mahesh is in Ward 27 roster');
  assert(!ward27StaffNames.includes('Naresh (Field Staff)'), 'Naresh (Ward 12) is NOT in Ward 27 roster');
  assert(!ward27StaffNames.includes('Kiran (Field Staff)'), 'Kiran (Ward 12) is NOT in Ward 27 roster');

  // Verify no cross-ward contamination in Ward 12 staff roster
  const ward12StaffNames = ward12Staff.map((s) => s.displayName);
  assert(ward12StaffNames.includes('Naresh (Field Staff)'), 'Naresh is in Ward 12 roster');
  assert(ward12StaffNames.includes('Kiran (Field Staff)'), 'Kiran is in Ward 12 roster');
  assert(!ward12StaffNames.includes('Ramesh (Field Staff)'), 'Ramesh (Ward 27) is NOT in Ward 12 roster');
  assert(!ward12StaffNames.includes('Mahesh (Field Staff)'), 'Mahesh (Ward 27) is NOT in Ward 12 roster');

  // Verify all staff have authorized operational wardId matching their ward
  assert(ward27Staff.every((s) => (s.wardId || s.assignedWardIds?.[0]) === 27), 'All Ward 27 staff records have authorized wardId = 27');
  assert(ward12Staff.every((s) => (s.wardId || s.assignedWardIds?.[0]) === 12), 'All Ward 12 staff records have authorized wardId = 12');

  // -------------------------------------------------------------
  // TEST B: Issue Submission Ward Tagging
  // -------------------------------------------------------------
  console.log('\nTEST B: Issue Submission Ward Tagging & Validated Routing');
  const grievanceWard27 = grievanceRepository.create({
    citizenId: 'USR-CITIZEN-01',
    category: 'Garbage & Sanitation',
    description: 'Overflowing garbage bin on Green Park main road near Community Hall',
    location: 'Green Park Colony, Ward 27',
    wardId: 27,
    departmentId: 'Sanitation',
    priority: 'High',
  });
  assert(grievanceWard27.wardId === 27, `Grievance submitted in Ward 27 has validated wardId = 27 (id: ${grievanceWard27.id})`);
  assert(grievanceWard27.departmentId === 'Sanitation', 'Grievance mapped to Sanitation department');

  const grievanceWard12 = grievanceRepository.create({
    citizenId: 'USR-CITIZEN-01',
    category: 'Water Pipeline Leakage',
    description: 'Underground drinking water pipe burst near market stall #14',
    location: 'Mukarrampura Market, Ward 12',
    wardId: 12,
    departmentId: 'Water Supply',
    priority: 'Critical',
  });
  assert(grievanceWard12.wardId === 12, `Grievance submitted in Ward 12 has validated wardId = 12 (id: ${grievanceWard12.id})`);
  assert(grievanceWard12.departmentId === 'Water Supply', 'Grievance mapped to Water Supply department');

  // -------------------------------------------------------------
  // TEST C: Task Assignment Restriction (Cross-Ward Assignment Blocked)
  // -------------------------------------------------------------
  console.log('\nTEST C: Task Assignment Restriction (Strict Same-Ward Enforced)');
  // 1. Assign Ward 27 task to Ward 27 staff -> Must succeed
  const validTask = taskRepository.create({
    grievanceId: grievanceWard27.id,
    task: `Clear Garbage - ${grievanceWard27.location}`,
    assignedTo: 'Ramesh (Field Staff)',
    assignedFieldStaffId: 'USR-FIELD-01',
    role: 'Field Staff',
    dueDate: 'Tomorrow, 05:00 PM',
    status: 'Pending',
    wardId: 27,
    departmentId: 'Sanitation',
  });
  assert(validTask.id && validTask.wardId === 27, 'Task assignment to eligible Ward 27 staff succeeds');

  // 2. Attempt to assign a Ward 27 task to a Ward 12 staff member -> Must be rejected with Error
  let crossWardRejected = false;
  let rejectionErrorMessage = '';
  try {
    taskRepository.create({
      grievanceId: grievanceWard27.id,
      task: `Illegal Cross-Ward Task Assignment`,
      assignedTo: 'Naresh (Field Staff)', // Naresh belongs to Ward 12!
      assignedFieldStaffId: 'USR-FIELD-02',
      role: 'Field Staff',
      dueDate: 'Tomorrow, 05:00 PM',
      status: 'Pending',
      wardId: 27, // Task is in Ward 27
    });
  } catch (err) {
    crossWardRejected = true;
    rejectionErrorMessage = err.message;
  }
  assert(crossWardRejected, 'Attempt to assign Ward 27 task to Ward 12 field worker rejected before persistence');
  assert(
    rejectionErrorMessage.includes('Cross-ward assignment rejected'),
    `Rejection error message is explicit: "${rejectionErrorMessage}"`
  );

  // -------------------------------------------------------------
  // TEST D: Field Staff Portal Isolation
  // -------------------------------------------------------------
  console.log('\nTEST D: Field Staff Portal Isolation');
  // Logged in as Ramesh (Ward 27)
  const rameshTasks = taskRepository.getStaffTasks('Ramesh', 27);
  assert(rameshTasks.length > 0, `Ramesh has assigned tasks in Ward 27 (count: ${rameshTasks.length})`);
  assert(rameshTasks.every((t) => t.wardId === 27), 'All tasks in Ramesh view strictly belong to Ward 27');

  // Verify Ward 12 tasks are NOT returned for Ramesh
  const allTasks = taskRepository.getAll();
  const ward12Tasks = allTasks.filter((t) => t.wardId === 12);
  assert(
    !rameshTasks.some((t) => t.wardId === 12),
    'Ward 12 tasks are completely invisible in Ramesh task roster'
  );

  // -------------------------------------------------------------
  // TEST E: Direct Route Cross-Ward Access Protection
  // -------------------------------------------------------------
  console.log('\nTEST E: Direct Route Cross-Ward Access & Security Auditing');
  // Create a legitimate task in Ward 12 for Naresh
  const ward12Task = taskRepository.create({
    grievanceId: grievanceWard12.id,
    task: `Repair Water Leak - ${grievanceWard12.location}`,
    assignedTo: 'Naresh (Field Staff)',
    assignedFieldStaffId: 'USR-FIELD-02',
    role: 'Field Staff',
    dueDate: 'Tomorrow, 05:00 PM',
    status: 'Pending',
    wardId: 12,
    departmentId: 'Water Supply',
  });

  // Simulate Ramesh (Ward 27 field staff) attempting to directly update Ward 12 task
  const unauthorizedUpdateResult = taskRepository.updateStatus(
    ward12Task.id,
    'In Progress',
    'Tampered update by wrong ward staff',
    undefined,
    'Ramesh (Field Staff)' // Actor from Ward 27
  );

  assert(unauthorizedUpdateResult === null, 'Cross-ward task update rejected by repository security guard (returns null)');

  // Verify task status was NOT modified
  const refreshedWard12Task = taskRepository.getById(ward12Task.id);
  assert(refreshedWard12Task.status === 'Pending', 'Ward 12 task status preserved intact as Pending');

  // Verify security incident logged in audit log
  const auditLogs = auditRepository.getAll();
  const securityIncident = auditLogs.find(
    (l) => l.action === 'REJECTED_CROSS_WARD_TASK_UPDATE' || l.action === 'UNAUTHORIZED_CROSS_WARD_ACCESS'
  );
  assert(
    !!securityIncident,
    `Security violation incident logged in municipal audit trail (${securityIncident?.action})`
  );

  // -------------------------------------------------------------
  // TEST F: Storage Manipulation Resilience
  // -------------------------------------------------------------
  console.log('\nTEST F: Storage Manipulation Resilience');
  let updateManipulationBlocked = false;
  try {
    taskRepository.update(validTask.id, {
      assignedTo: 'Naresh (Field Staff)', // Trying to swap Ward 27 task assignee to Ward 12 worker
      assignedFieldStaffId: 'USR-FIELD-02',
    });
  } catch (err) {
    updateManipulationBlocked = true;
  }
  assert(updateManipulationBlocked, 'Unauthorized client payload attempting cross-ward reassignment via taskRepository.update() blocked');

  // Verify task assignee was NOT altered
  const intactValidTask = taskRepository.getById(validTask.id);
  assert(
    intactValidTask.assignedTo === 'Ramesh (Field Staff)',
    'Data integrity preserved: assignee remains Ramesh (Field Staff)'
  );

  // -------------------------------------------------------------
  // TEST G: Super Admin Staff Reassignment Workflow & Incomplete Tasks Check
  // -------------------------------------------------------------
  console.log('\nTEST G: Super Admin Staff Reassignment & Incomplete Tasks Safety Guard');
  // 1. Attempt to reassign Ramesh while he has active tasks in Ward 27 -> Must be blocked
  const reassignBlockedResult = userRepository.reassignStaffWard(
    'USR-FIELD-01', // Ramesh
    12, // Transfer to Ward 12
    'Super Admin'
  );
  assert(!reassignBlockedResult.success, 'Reassignment blocked when staff member has active incomplete tasks in current ward');
  assert(
    reassignBlockedResult.error?.includes('active incomplete task'),
    `Safety guard error: "${reassignBlockedResult.error}"`
  );

  // 2. Complete Ramesh's active tasks in Ward 27
  const rameshActiveTasks = taskRepository.getAll().filter(
    (t) => t.wardId === 27 && t.status !== 'Completed' && t.assignedTo.includes('Ramesh')
  );
  for (const t of rameshActiveTasks) {
    taskRepository.updateStatus(t.id, 'Completed', 'Road repair completed with hot-mix asphalt', 'data:image/sample');
  }

  // 3. Re-attempt reassignment -> Must now succeed
  const reassignSuccessResult = userRepository.reassignStaffWard(
    'USR-FIELD-01', // Ramesh
    12, // Transfer to Ward 12
    'Super Admin'
  );
  assert(reassignSuccessResult.success, `Authorized reassignment of Ramesh to Ward 12 succeeded: ${reassignSuccessResult.message}`);

  // Verify Ramesh now appears in Ward 12 and NO LONGER appears in Ward 27
  const newWard27Staff = userRepository.getFieldStaff({ wardId: 27, activeOnly: true });
  const newWard12Staff = userRepository.getFieldStaff({ wardId: 12, activeOnly: true });
  assert(!newWard27Staff.some((s) => s.id === 'USR-FIELD-01'), 'Ramesh is no longer in Ward 27 roster');
  assert(newWard12Staff.some((s) => s.id === 'USR-FIELD-01'), 'Ramesh is now active in Ward 12 roster');

  // Past completed tasks in Ward 27 MUST remain associated with Ward 27
  const pastCompletedTask = taskRepository.getById(validTask.id);
  assert(pastCompletedTask.wardId === 27, 'Historical completed task remains permanently tagged to Ward 27');
  assert(pastCompletedTask.status === 'Completed', 'Historical task status remains Completed');

  // Revert Ramesh back to Ward 27 for subsequent clean state
  userRepository.reassignStaffWard('USR-FIELD-01', 27, 'Super Admin');

  // -------------------------------------------------------------
  // TEST H: Cross-Portal Synchronization
  // -------------------------------------------------------------
  console.log('\nTEST H: Cross-Portal Real-Time Synchronization');
  // 1. Citizen submits grievance in Ward 27
  const syncGrievance = grievanceRepository.create({
    citizenId: 'USR-CITIZEN-01',
    category: 'Street Lighting',
    description: 'Dark junction near bus stop due to faulty sodium lamp',
    location: 'Sector 3 Junction, Ward 27',
    wardId: 27,
    departmentId: 'Electrical',
    priority: 'Medium',
  });

  // 2. Officer assigns to Suresh (Electrical technician in Ward 27)
  const syncTask = taskRepository.create({
    grievanceId: syncGrievance.id,
    task: `Replace Sodium Lamp - ${syncGrievance.location}`,
    assignedTo: 'Suresh (Electrical Tech)',
    assignedFieldStaffId: 'USR-STAFF-27-03',
    role: 'Field Staff',
    dueDate: 'Tomorrow, 06:00 PM',
    status: 'Pending',
    wardId: 27,
    departmentId: 'Electrical',
  });
  grievanceRepository.updateStatus(syncGrievance.id, 'In Progress', 'Assigned to Suresh (Electrical Tech)', 'Er. Venkateshwarlu');

  // 3. Field worker marks in progress and then completes with proof photo
  taskRepository.updateStatus(syncTask.id, 'In Progress', 'Ladder setup and wiring inspection', undefined, 'Suresh (Electrical Tech)');
  const proofPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  taskRepository.updateStatus(syncTask.id, 'Completed', 'LED luminaire installed and tested', proofPhoto, 'Suresh (Electrical Tech)');
  grievanceRepository.updateStatus(syncGrievance.id, 'Completed', 'Field work verified and operational', 'Suresh (Electrical Tech)');

  // 4. Verify instantaneous synchronization across all portals:
  // Citizen View:
  const citizenGrievanceView = grievanceRepository.getByCitizenId('USR-CITIZEN-01').find((g) => g.id === syncGrievance.id);
  assert(citizenGrievanceView?.status === 'Completed', 'Citizen portal immediately reflects status: Completed');

  // Department Officer View:
  const deptGrievanceView = grievanceRepository.getByDepartment('Electrical').find((g) => g.id === syncGrievance.id);
  assert(deptGrievanceView?.status === 'Completed', 'Electrical Department console immediately reflects status: Completed');

  // Corporator View:
  const corporatorWardTasks = taskRepository.getByWardId(27);
  const corporatorTaskView = corporatorWardTasks.find((t) => t.id === syncTask.id);
  assert(corporatorTaskView?.status === 'Completed', 'Corporator Ward 27 portal immediately reflects task status: Completed');
  assert(corporatorTaskView?.photo === proofPhoto, 'Corporator has immediate access to resolution proof photo');

  // Leadership View:
  const leadershipAllGrievances = grievanceRepository.getAll();
  const leaderView = leadershipAllGrievances.find((g) => g.id === syncGrievance.id);
  assert(leaderView?.status === 'Completed', 'Mayor / Commissioner command metrics reflect completed ticket');

  // -------------------------------------------------------------
  // TEST I: Browser Refresh Persistence
  // -------------------------------------------------------------
  console.log('\nTEST I: Browser Refresh Persistence Across Simulated Reload');
  // Re-read storage directly from localStorage as fresh repository instances would on page reload
  const persistedTasks = storageService.getItem(STORAGE_KEYS.TASKS);
  const persistedGrievances = storageService.getItem(STORAGE_KEYS.GRIEVANCES);
  const persistedUsers = storageService.getItem(STORAGE_KEYS.USERS);
  const persistedWards = storageService.getItem(STORAGE_KEYS.WARDS);

  assert(Array.isArray(persistedTasks) && persistedTasks.length > 0, 'Tasks collection persists in localStorage');
  assert(Array.isArray(persistedGrievances) && persistedGrievances.length > 0, 'Grievances collection persists in localStorage');
  assert(typeof persistedUsers === 'object', 'Users collection persists in localStorage');
  assert(Array.isArray(persistedWards) && persistedWards.length === 66, 'Wards collection persists in localStorage');

  const reloadedTask = persistedTasks.find((t) => t.id === syncTask.id);
  assert(reloadedTask?.status === 'Completed', 'Completed task status persists after simulated reload');
  assert(reloadedTask?.photo === proofPhoto, 'Evidence photo persists after simulated reload');

  // -------------------------------------------------------------
  // TEST J: Issue in Ward with No Eligible Staff (Awaiting Assignment Queue)
  // -------------------------------------------------------------
  console.log('\nTEST J: Ward with Zero Assigned Staff (Awaiting Assignment State)');
  // Ward 4 and Ward 6 have 0 field staff assigned in demo dataset
  const ward4Staff = userRepository.getFieldStaff({ wardId: 4, activeOnly: true });
  assert(ward4Staff.length === 0, `Ward 4 confirmed to have exactly 0 assigned staff (count: ${ward4Staff.length})`);

  // Submit issue in Ward 4
  const unassignedGrievance = grievanceRepository.create({
    citizenId: 'USR-CITIZEN-01',
    category: 'Water Supply',
    description: 'Pipeline leakage on colony road',
    location: 'Kothirampur Main Road, Ward 4',
    wardId: 4,
    departmentId: 'Water Supply',
    priority: 'High',
  });
  assert(unassignedGrievance.wardId === 4, 'Grievance created with wardId = 4');
  assert(unassignedGrievance.status === 'Pending', 'Grievance remains in Awaiting Assignment (Pending) status');
  assert(!unassignedGrievance.assignedFieldStaffId, 'Grievance has no assigned field staff');

  // Verify that cross-ward assignment to a Ward 27 staff is strictly rejected
  let unassignedWardDispatchBlocked = false;
  try {
    taskRepository.create({
      grievanceId: unassignedGrievance.id,
      task: `Repair Pipeline - ${unassignedGrievance.location}`,
      assignedTo: 'Ramesh (Field Staff)', // Ramesh belongs to Ward 27
      assignedFieldStaffId: 'USR-STAFF-27-01',
      role: 'Field Staff',
      dueDate: 'Tomorrow, 05:00 PM',
      status: 'Pending',
      wardId: 4, // Grievance is in Ward 4
    });
  } catch (err) {
    unassignedWardDispatchBlocked = true;
  }
  assert(unassignedWardDispatchBlocked, 'Task dispatch to non-ward staff strictly blocked when ward has zero assigned workers');

  console.log('\n================================================================');
  console.log(`TOTAL ISOLATION CHECKS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('================================================================\n');

  await server.close();
  if (failCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
