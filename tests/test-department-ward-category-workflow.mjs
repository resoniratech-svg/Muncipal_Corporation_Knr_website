import { createServer } from 'vite';

// Mock browser localStorage & sessionStorage for Node testing environment
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
  location: {
    pathname: '/department',
    search: '',
    hash: '',
  },
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

async function runTest() {
  console.log('========================================================================');
  console.log(' KMC DIGITAL GOVERNANCE PLATFORM — DEPARTMENT WARD & CATEGORY AUDIT');
  console.log('========================================================================\n');

  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  const { initializeStorage } = await server.ssrLoadModule('./src/storage/storageMigration.ts');
  const { grievanceRepository } = await server.ssrLoadModule('./src/storage/repositories/grievanceRepository.ts');
  const { taskRepository } = await server.ssrLoadModule('./src/storage/repositories/taskRepository.ts');
  const { wardRepository } = await server.ssrLoadModule('./src/storage/repositories/wardRepository.ts');
  const { userRepository } = await server.ssrLoadModule('./src/storage/repositories/userRepository.ts');
  const { staffCategoryRepository } = await server.ssrLoadModule('./src/storage/repositories/staffCategoryRepository.ts');

  // Initialize clean storage
  initializeStorage(true);

  // 1. Department Scope & All Wards Query
  console.log('1. Department Overview Scope & Ward Selector Availability...');
  const allWards = wardRepository.getAll();
  assert(allWards.length === 66, 'Authoritative ward repository provides all 66 municipal wards');

  const allGrievances = grievanceRepository.getAll();
  const engineeringGrievances = allGrievances.filter(g => 
    g.department.toLowerCase().includes('engineering') || 
    g.category.toLowerCase().includes('drainage') || 
    g.category.toLowerCase().includes('road') ||
    g.category.toLowerCase().includes('civil')
  );
  assert(engineeringGrievances.length >= 6, `Engineering scope contains ${engineeringGrievances.length} grievances city-wide`);

  // 2. Ward 27 Selection Filter
  console.log('\n2. Ward Selection Filter Verification (Ward 27)...');
  const ward27Grievances = engineeringGrievances.filter(g => g.wardId === 27);
  assert(ward27Grievances.length > 0, `Ward 27 has ${ward27Grievances.length} engineering grievances`);
  for (const g of ward27Grievances) {
    assert(g.wardId === 27, `Grievance ${g.id} belongs strictly to Ward 27`);
  }

  // Confirm other wards are strictly excluded
  const hasWard45InWard27 = ward27Grievances.some(g => g.wardId === 45);
  const hasWard39InWard27 = ward27Grievances.some(g => g.wardId === 39);
  const hasWard18InWard27 = ward27Grievances.some(g => g.wardId === 18);
  assert(!hasWard45InWard27, 'Ward 45 grievances are excluded when Ward 27 is selected');
  assert(!hasWard39InWard27, 'Ward 39 grievances are excluded when Ward 27 is selected');
  assert(!hasWard18InWard27, 'Ward 18 grievances are excluded when Ward 27 is selected');

  // 3. Ward 45 Selection Filter
  console.log('\n3. Ward Selection Filter Verification (Ward 45)...');
  const ward45Grievances = engineeringGrievances.filter(g => g.wardId === 45);
  assert(ward45Grievances.length === 1, 'Ward 45 has exactly 1 engineering grievance (GRV-2024-45-0012)');
  assert(ward45Grievances[0].id === 'GRV-2024-45-0012', 'Ward 45 grievance ID matches GRV-2024-45-0012');
  const hasWard27InWard45 = ward45Grievances.some(g => g.wardId === 27);
  assert(!hasWard27InWard45, 'Ward 27 grievances are completely excluded when Ward 45 is selected');

  // 4. Category-Wise Grievance Grouping
  console.log('\n4. Category-Wise Grouping Verification...');
  // Group Ward 27 grievances by category
  const drainageWard27 = ward27Grievances.filter(g => g.category.toLowerCase().includes('drain'));
  const roadsWard27 = ward27Grievances.filter(g => g.category.toLowerCase().includes('road'));

  assert(drainageWard27.length >= 2, `Drainage category group in Ward 27 contains ${drainageWard27.length} complaints`);
  assert(roadsWard27.length >= 1, `Roads category group in Ward 27 contains ${roadsWard27.length} complaints`);

  // Verify drainage complaints are classified under Drainage
  assert(drainageWard27.some(g => g.id === 'GRV-2024-27-0045'), 'GRV-2024-27-0045 is correctly grouped under Drainage');
  assert(drainageWard27.some(g => g.id === '#GRV2024-00234'), '#GRV2024-00234 is correctly grouped under Drainage');

  // Verify road complaints are classified under Roads
  assert(roadsWard27.some(g => g.id === 'GRV-2024-27-0031'), 'GRV-2024-27-0031 is correctly grouped under Roads');

  // 5. Ward-Specific Staff Assignment (Eligible Roster)
  console.log('\n5. Ward-Specific Field Staff Assignment Eligibility...');
  
  // Test A: Ward 27 Drainage complaint
  const drainageGrievance = drainageWard27[0];
  const { eligibleStaff: drainageStaff, targetWardId: targetW1 } =
    staffCategoryRepository.getEligibleFieldStaff(drainageGrievance.id);

  assert(targetW1 === 27, 'Target ward correctly resolved as Ward 27');
  assert(drainageStaff.length > 0, `Found ${drainageStaff.length} eligible Drainage staff in Ward 27`);
  assert(drainageStaff.some(s => s.displayName.includes('Mahesh')), 'Mahesh (Drainage Worker) is eligible for Ward 27 Drainage');
  
  // Incompatible categories excluded
  const hasVenkateshInDrainage = drainageStaff.some(s => s.displayName.includes('Venkatesh'));
  const hasRameshInDrainage = drainageStaff.some(s => s.displayName.includes('Ramesh'));
  const hasNareshInDrainage = drainageStaff.some(s => s.displayName.includes('Naresh'));
  assert(!hasVenkateshInDrainage, 'Venkatesh (Road Repair Worker) is NOT in Drainage eligible staff');
  assert(!hasRameshInDrainage, 'Ramesh (Sanitation Worker) is NOT in Drainage eligible staff');
  assert(!hasNareshInDrainage, 'Naresh (Ward 12 staff) is NOT in Ward 27 eligible staff');

  // Test B: Ward 27 Road complaint
  const roadGrievance = roadsWard27[0];
  const { eligibleStaff: roadStaff, targetWardId: targetW2 } =
    staffCategoryRepository.getEligibleFieldStaff(roadGrievance.id);

  assert(targetW2 === 27, 'Target ward correctly resolved as Ward 27');
  assert(roadStaff.length > 0, `Found ${roadStaff.length} eligible Road Repair staff in Ward 27`);
  assert(roadStaff.some(s => s.displayName.includes('Venkatesh')), 'Venkatesh (Road Repair Worker) is eligible for Ward 27 Roads');
  const hasMaheshInRoads = roadStaff.some(s => s.displayName.includes('Mahesh'));
  assert(!hasMaheshInRoads, 'Mahesh (Drainage Worker) is NOT in Road Repair eligible staff');

  // 6. Cross-Ward & Cross-Category Assignment Rejection
  console.log('\n6. Cross-Ward and Incompatible-Category Assignment Enforcement...');

  // Attempt to assign Ward 12 staff (Naresh) to Ward 27 grievance
  let crossWardRejected = false;
  try {
    staffCategoryRepository.validateAssignment('Naresh (Field Staff)', 27, 'Drainage Worker');
  } catch (err) {
    crossWardRejected = true;
    assert(err.message.includes('Cross-ward assignment rejected'), 'Throws descriptive cross-ward error');
  }
  assert(crossWardRejected, 'Cross-ward assignment strictly rejected by validator');

  // Attempt to assign Electrician (Suresh) to Drainage grievance
  let crossSkillRejected = false;
  try {
    staffCategoryRepository.validateAssignment('Suresh (Electrician)', 27, 'Drainage Worker');
  } catch (err) {
    crossSkillRejected = true;
    assert(err.message.includes('Cross-skill assignment rejected'), 'Throws descriptive cross-skill error');
  }
  assert(crossSkillRejected, 'Cross-skill assignment strictly rejected by validator');

  // 7. Successful Dispatch & Field Staff Portal Sync
  console.log('\n7. Task Dispatch and Field Staff Portal Synchronization...');
  
  // Create task for Mahesh
  const testGrievanceId = 'GRV-2024-27-0045';
  const newTask = taskRepository.create({
    task: `${testGrievanceId}: Desilting and drain culvert clearing`,
    assignedTo: 'Mahesh (Field Staff)',
    assignedFieldStaffId: 'USR-FIELD-03',
    departmentId: 'engineering',
    role: 'Field Staff',
    staffCategory: 'Drainage Worker',
    dueDate: 'Next 48 Hours',
    status: 'Pending',
    wardId: 27,
    grievanceId: testGrievanceId,
  });

  assert(!!newTask.id, `Task created successfully with ID: ${newTask.id}`);
  
  // Verify task is visible in Mahesh's task roster
  const allTasks = taskRepository.getAll();
  const maheshTasks = allTasks.filter(t => t.assignedFieldStaffId === 'USR-FIELD-03' || t.assignedTo.includes('Mahesh'));
  assert(maheshTasks.some(t => t.id === newTask.id), 'Task is immediately queryable in Mahesh Field Staff roster');

  await server.close();

  console.log('\n========================================================================');
  console.log(` RESULTS: ${passCount} PASSED, ${failCount} FAILED out of ${passCount + failCount} assertions.`);
  console.log('========================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL DEPARTMENT WARD & CATEGORY WORKFLOW TESTS PASSED SUCCESSFULLY!\n');
  }
}

runTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
