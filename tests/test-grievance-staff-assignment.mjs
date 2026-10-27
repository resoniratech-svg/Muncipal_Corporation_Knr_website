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
  console.log('KMC GRIEVANCE TO FIELD STAFF ASSIGNMENT REGRESSION SUITE (TESTS A - J)');
  console.log('================================================================\n');

  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  const { storageService } = await server.ssrLoadModule('./src/storage/storageService.ts');
  const { STORAGE_KEYS } = await server.ssrLoadModule('./src/storage/storageKeys.ts');
  const { initializeStorage } = await server.ssrLoadModule('./src/storage/storageMigration.ts');
  const { userRepository } = await server.ssrLoadModule('./src/storage/repositories/userRepository.ts');
  const { grievanceRepository } = await server.ssrLoadModule('./src/storage/repositories/grievanceRepository.ts');
  const { taskRepository } = await server.ssrLoadModule('./src/storage/repositories/taskRepository.ts');
  const { staffCategoryRepository } = await server.ssrLoadModule('./src/storage/repositories/staffCategoryRepository.ts');

  // Initialize storage freshly
  initializeStorage(true);

  // -------------------------------------------------------------
  // TEST A: Existing Eligible Staff Query (#GRV2024-78582)
  // -------------------------------------------------------------
  console.log('TEST A: Existing Eligible Staff Query for #GRV2024-78582');
  // Create citizen grievance #GRV2024-78582 exactly as reported
  const gRoad = grievanceRepository.create({
    id: '#GRV2024-78582',
    category: 'Roads problem reported by citizen',
    department: 'Engineering',
    location: 'main road, Ward 27 – Green Park Colony',
    wardId: 27,
  });
  assert(gRoad.id === '#GRV2024-78582', 'Grievance #GRV2024-78582 created in Ward 27');

  const eligibilityResult = staffCategoryRepository.getEligibleFieldStaff(gRoad.id);
  assert(eligibilityResult.requiredCategory.id === 'road-repair-worker', `Resolved required category: ${eligibilityResult.requiredCategory.name}`);
  assert(eligibilityResult.targetWardId === 27, `Canonical ward resolved to ${eligibilityResult.targetWardId}`);
  assert(eligibilityResult.eligibleStaff.length >= 1, `Found ${eligibilityResult.eligibleStaff.length} eligible staff member(s)`);
  const venkatesh = eligibilityResult.eligibleStaff.find((s) => s.displayName.includes('Venkatesh'));
  assert(Boolean(venkatesh), 'Venkatesh (Road Repair Worker) is returned in the eligible staff list');
  assert(eligibilityResult.diagnostics.rejectedWardMismatch >= 1, `Diagnostics logged: ${eligibilityResult.diagnostics.rejectedWardMismatch} staff rejected due to ward mismatch`);

  // -------------------------------------------------------------
  // TEST B: Successful Assignment Workflow
  // -------------------------------------------------------------
  console.log('\nTEST B: Successful Assignment to Eligible Field Worker');
  const assignedTask = taskRepository.create({
    grievanceId: gRoad.id,
    task: `${gRoad.id}: ${gRoad.description}`,
    assignedTo: venkatesh.displayName,
    assignedFieldStaffId: venkatesh.id,
    departmentId: 'engineering',
    wardId: 27,
    dueDate: 'Next 48 Hours',
    status: 'Pending',
  });
  assert(assignedTask.id.startsWith('TASK-'), `Task created with ID ${assignedTask.id}`);
  assert(assignedTask.assignedFieldStaffId === venkatesh.id, `Task assignedFieldStaffId matches ${venkatesh.id}`);
  assert(assignedTask.wardId === 27, 'Task wardId strictly set to 27');

  grievanceRepository.updateStatus(gRoad.id, 'In Progress', 'Assigned by Officer', 'Er. Venkateshwarlu', {
    assignedTo: venkatesh.displayName,
    assignedFieldStaffId: venkatesh.id,
    taskId: assignedTask.id,
  });
  const updatedG = grievanceRepository.getById(gRoad.id);
  assert(updatedG.status === 'In Progress', 'Grievance status transitioned to "In Progress"');
  assert(updatedG.assignedFieldStaffId === venkatesh.id, `Grievance assignedFieldStaffId synchronized to ${venkatesh.id}`);
  assert(updatedG.taskId === assignedTask.id, `Grievance taskId synchronized to ${assignedTask.id}`);

  // -------------------------------------------------------------
  // TEST C: Rejection of Cross-Ward Assignment (Ward 12 -> Ward 27)
  // -------------------------------------------------------------
  console.log('\nTEST C: Rejection of Cross-Ward Assignment');
  let crossWardRejected = false;
  try {
    staffCategoryRepository.validateAssignment('USR-FIELD-02', 27, gRoad);
  } catch (err) {
    crossWardRejected = true;
    assert(err.message.includes('Cross-ward assignment rejected'), `Correct error thrown: "${err.message}"`);
  }
  assert(crossWardRejected, 'Cross-ward assignment of Ward 12 worker to Ward 27 grievance strictly rejected');

  // -------------------------------------------------------------
  // TEST D: Rejection of Cross-Skill / Incompatible Category Assignment
  // -------------------------------------------------------------
  console.log('\nTEST D: Rejection of Cross-Skill Assignment (Electrician -> Road Repair)');
  let crossSkillRejected = false;
  try {
    // Suresh is an Electrician in Ward 27
    staffCategoryRepository.validateAssignment('USR-FIELD-04', 27, gRoad);
  } catch (err) {
    crossSkillRejected = true;
    assert(err.message.includes('Cross-skill assignment rejected'), `Correct error thrown: "${err.message}"`);
  }
  assert(crossSkillRejected, 'Electrician rejected for Road Repair grievance in Ward 27');

  // -------------------------------------------------------------
  // TEST E: Rejection of Inactive Worker
  // -------------------------------------------------------------
  console.log('\nTEST E: Rejection of Inactive Worker');
  const allUsers = userRepository.getAll();
  allUsers['venkatesh.field@kmc.demo'].user.isActive = false;
  storageService.setItem(STORAGE_KEYS.USERS, allUsers);

  let inactiveRejected = false;
  try {
    staffCategoryRepository.validateAssignment('USR-FIELD-05', 27, gRoad);
  } catch (err) {
    inactiveRejected = true;
    assert(err.message.includes('deactivated'), `Correct error thrown: "${err.message}"`);
  }
  assert(inactiveRejected, 'Inactive worker strictly rejected from task assignment');

  // Re-activate Venkatesh
  allUsers['venkatesh.field@kmc.demo'].user.isActive = true;
  storageService.setItem(STORAGE_KEYS.USERS, allUsers);

  // -------------------------------------------------------------
  // TEST F: Missing Staff in Ward (Accurate Empty State & Queue Retention)
  // -------------------------------------------------------------
  console.log('\nTEST F: Missing Staff in Ward (Ward with No Road Workers)');
  // Ward 45 has no Road Repair Worker
  const gWard45 = grievanceRepository.create({
    category: 'Roads & Potholes',
    department: 'Engineering',
    wardId: 45,
    location: 'Gandhi Chowk, Ward 45',
  });
  const resWard45 = staffCategoryRepository.getEligibleFieldStaff(gWard45.id);
  assert(resWard45.eligibleStaff.length === 0, 'Zero eligible staff returned for Ward 45');
  assert(gWard45.status === 'Pending', 'Grievance remains in Pending / Awaiting Assignment queue');

  // -------------------------------------------------------------
  // TEST G: Persistence Across Sessions
  // -------------------------------------------------------------
  console.log('\nTEST G: Persistence Across Sessions');
  // Re-read directly from storageService simulating browser reload
  const reloadedTasks = storageService.getItem(STORAGE_KEYS.TASKS);
  const foundTask = reloadedTasks.find((t) => t.grievanceId === gRoad.id);
  assert(Boolean(foundTask), `Task persisted in storage: ID ${foundTask.id}`);
  assert(foundTask.assignedFieldStaffId === venkatesh.id, 'Assigned worker ID persisted accurately');

  // -------------------------------------------------------------
  // TEST H: Staff Reassignment via Super Admin Flow
  // -------------------------------------------------------------
  console.log('\nTEST H: Staff Reassignment via Super Admin Flow');
  // Attempt to reassign worker with active task -> should be blocked
  const blockedReassign = userRepository.reassignStaffWard(venkatesh.id, 12, 'Super Admin');
  assert(!blockedReassign.success, 'Reassignment blocked when worker has incomplete active tasks');
  assert(blockedReassign.error.includes('active incomplete task'), `Blocked message: "${blockedReassign.error}"`);

  // Complete the task
  taskRepository.updateStatus(assignedTask.id, 'Completed');
  const allowedReassign = userRepository.reassignStaffWard(venkatesh.id, 12, 'Super Admin');
  assert(allowedReassign.success, 'Reassignment allowed once active tasks are complete');

  // Verify worker is now in Ward 12
  const venkateshAfter = userRepository.getById(venkatesh.id);
  assert(venkateshAfter.wardId === 12, `Venkatesh is now assigned to Ward ${venkateshAfter.wardId}`);

  // Transfer back to Ward 27 for platform consistency
  userRepository.reassignStaffWard(venkatesh.id, 27, 'Super Admin');
  assert(userRepository.getById(venkatesh.id).wardId === 27, 'Venkatesh restored to Ward 27');

  // -------------------------------------------------------------
  // TEST I: Repeated Submission / Duplicate Prevention
  // -------------------------------------------------------------
  console.log('\nTEST I: Repeated Submission / Duplicate Prevention');
  const tasksBeforeCount = taskRepository.getAll().length;
  // Submit same grievance assignment again
  const dupTask = taskRepository.create({
    grievanceId: gRoad.id,
    task: `${gRoad.id}: Re-assigned civic task`,
    assignedTo: venkatesh.displayName,
    assignedFieldStaffId: venkatesh.id,
    wardId: 27,
  });
  const tasksAfterCount = taskRepository.getAll().length;
  assert(tasksBeforeCount === tasksAfterCount, `No duplicate task created (count remained ${tasksAfterCount})`);
  assert(dupTask.id === assignedTask.id, `Updated existing task ${assignedTask.id} idempotently`);

  // -------------------------------------------------------------
  // TEST J: Complete Lifecycle (Citizen -> Officer -> Staff -> Resolution)
  // -------------------------------------------------------------
  console.log('\nTEST J: Complete End-to-End Lifecycle');
  // 1. Citizen submits
  const lifeGrievance = grievanceRepository.create({
    category: 'Drainage Issue',
    department: 'Engineering',
    location: 'Collectorate Road, Ward 27',
    wardId: 27,
  });
  assert(lifeGrievance.status === 'Pending', 'Step 1: Citizen submitted grievance (Status: Pending)');

  // 2. Department Officer assigns
  const lifeEligible = staffCategoryRepository.getEligibleFieldStaff(lifeGrievance.id);
  const drainageWorker = lifeEligible.eligibleStaff[0];
  assert(Boolean(drainageWorker), `Step 2: Department Officer finds eligible staff: ${drainageWorker.displayName}`);

  const lifeTask = taskRepository.create({
    grievanceId: lifeGrievance.id,
    task: `${lifeGrievance.id}: Clear drainage block`,
    assignedTo: drainageWorker.displayName,
    assignedFieldStaffId: drainageWorker.id,
    wardId: 27,
    status: 'Pending',
  });
  grievanceRepository.updateStatus(lifeGrievance.id, 'In Progress', 'Assigned by Officer', 'Er. Venkateshwarlu', {
    assignedTo: drainageWorker.displayName,
    assignedFieldStaffId: drainageWorker.id,
    taskId: lifeTask.id,
  });

  // 3. Field Staff starts and completes work
  taskRepository.updateStatus(lifeTask.id, 'In Progress');
  assert(taskRepository.getById(lifeTask.id).status === 'In Progress', 'Step 3a: Field worker started task (Status: In Progress)');

  taskRepository.updateStatus(lifeTask.id, 'Completed');
  assert(taskRepository.getById(lifeTask.id).status === 'Completed', 'Step 3b: Field worker uploaded proof & completed task (Status: Completed)');

  // 4. Officer reviews & completes grievance
  grievanceRepository.updateStatus(lifeGrievance.id, 'Resolved', 'Field work verified and signed off.', 'Er. Venkateshwarlu');
  const finalGrievance = grievanceRepository.getById(lifeGrievance.id);
  assert(finalGrievance.status === 'Resolved', 'Step 4: Department Officer approved and closed grievance (Status: Resolved)');
  assert(finalGrievance.timeline.length >= 3, `Grievance has complete timeline audit history (${finalGrievance.timeline.length} events)`);

  await server.close();

  console.log('\n================================================================');
  console.log(`TOTAL REGRESSION CHECKS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
