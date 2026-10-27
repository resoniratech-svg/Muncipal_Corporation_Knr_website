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
  console.log('KMC SPECIALIZED MUNICIPAL FIELD STAFF CATEGORIES & GOVERNANCE');
  console.log('COMPREHENSIVE AUTOMATED VERIFICATION SUITE');
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

  // Seed storage freshly
  initializeStorage(true);

  // -------------------------------------------------------------
  // TEST 1: Configurable Staff Categories Master
  // -------------------------------------------------------------
  console.log('TEST 1: Municipal Field Staff Categories Master & Super Admin Configuration');
  const categories = staffCategoryRepository.getAll();
  assert(categories.length >= 8, `Loaded ${categories.length} municipal staff categories (minimum 8 required)`);

  const categoryNames = categories.map((c) => c.name);
  assert(categoryNames.includes('Electrician / Streetlight Technician'), 'Category 1: Electrician / Streetlight Technician present');
  assert(categoryNames.includes('Drainage Worker'), 'Category 2: Drainage Worker present');
  assert(categoryNames.includes('Sanitation Worker'), 'Category 3: Sanitation Worker present');
  assert(categoryNames.includes('Road Repair Worker'), 'Category 4: Road Repair Worker present');
  assert(categoryNames.includes('Water Supply Technician'), 'Category 5: Water Supply Technician present');
  assert(categoryNames.includes('Public Health / Pest Control Worker'), 'Category 6: Public Health / Pest Control Worker present');
  assert(categoryNames.includes('Parks and Horticulture Worker'), 'Category 7: Parks and Horticulture Worker present');
  assert(categoryNames.includes('Civil Maintenance Worker'), 'Category 8: Civil Maintenance Worker present');

  // Super Admin adds a new configurable category
  const added = staffCategoryRepository.add({
    id: 'solar-lighting-technician',
    name: 'Solar Lighting Technician',
    departmentId: 'electrical',
    departmentName: 'Electrical',
    description: 'Maintenance of municipal solar powered street lights and rooftop panels',
    matchedGrievanceCategories: ['Solar', 'Solar Light', 'Solar Panel'],
    skills: ['Solar PV Repair', 'Battery Testing', 'Inverter Maintenance'],
    slaHours: 48,
  });
  assert(added, 'Super Admin successfully registered new configurable staff category');
  const solarCat = staffCategoryRepository.getById('solar-lighting-technician');
  assert(solarCat !== null && solarCat.name === 'Solar Lighting Technician', 'Newly created staff category persisted in repository');

  // -------------------------------------------------------------
  // TEST 2: Dynamic Grievance Issue to Staff Category Resolution
  // -------------------------------------------------------------
  console.log('\nTEST 2: Dynamic Grievance Issue to Staff Category Resolution');
  const catDrain = staffCategoryRepository.findRequiredCategoryForGrievance('Drainage Overflow', 'Engineering');
  assert(catDrain.name === 'Drainage Worker', `Drainage grievance maps to "${catDrain.name}"`);

  const catRoad = staffCategoryRepository.findRequiredCategoryForGrievance('Pothole on Road', 'Engineering');
  assert(catRoad.name === 'Road Repair Worker', `Road pothole grievance maps to "${catRoad.name}"`);

  const catGarbage = staffCategoryRepository.findRequiredCategoryForGrievance('Garbage Dump Clearance', 'Sanitation');
  assert(catGarbage.name === 'Sanitation Worker', `Garbage grievance maps to "${catGarbage.name}"`);

  const catLight = staffCategoryRepository.findRequiredCategoryForGrievance('Street Light Not Working', 'Electrical');
  assert(catLight.name === 'Electrician / Streetlight Technician', `Street light grievance maps to "${catLight.name}"`);

  const catWater = staffCategoryRepository.findRequiredCategoryForGrievance('Water Pipe Leakage', 'Water Supply');
  assert(catWater.name === 'Water Supply Technician', `Water supply grievance maps to "${catWater.name}"`);

  const catHealth = staffCategoryRepository.findRequiredCategoryForGrievance('Mosquito Fogging Request', 'Health');
  assert(catHealth.name === 'Public Health / Pest Control Worker', `Public health grievance maps to "${catHealth.name}"`);

  const catParks = staffCategoryRepository.findRequiredCategoryForGrievance('Park Tree Trimming Needed', 'Town Planning');
  assert(catParks.name === 'Parks and Horticulture Worker', `Parks grievance maps to "${catParks.name}"`);

  const catCivil = staffCategoryRepository.findRequiredCategoryForGrievance('Broken Pedestrian Footpath', 'Engineering');
  assert(catCivil.name === 'Civil Maintenance Worker', `Footpath grievance maps to "${catCivil.name}"`);

  // -------------------------------------------------------------
  // TEST 3: Ward + Category Filtering in Dropdowns & Rosters
  // -------------------------------------------------------------
  console.log('\nTEST 3: Ward + Specialized Category Filtering');
  // In Ward 27:
  // - Ramesh: Sanitation Worker
  // - Mahesh: Drainage Worker
  // - Suresh: Electrician / Streetlight Technician
  // - Venkatesh: Road Repair Worker
  const ward27DrainageEligible = staffCategoryRepository.getEligibleStaffForGrievance({
    wardId: 27,
    category: 'Drainage Issue',
    department: 'Engineering',
  });
  assert(ward27DrainageEligible.length === 1, `Ward 27 has exactly 1 Drainage Worker (found: ${ward27DrainageEligible.length})`);
  assert(ward27DrainageEligible[0].displayName.includes('Mahesh'), 'Eligible staff member is Mahesh (Drainage Worker)');

  const ward27SanitationEligible = staffCategoryRepository.getEligibleStaffForGrievance({
    wardId: 27,
    category: 'Garbage Collection',
    department: 'Sanitation',
  });
  assert(ward27SanitationEligible.length === 1, `Ward 27 has exactly 1 Sanitation Worker (found: ${ward27SanitationEligible.length})`);
  assert(ward27SanitationEligible[0].displayName.includes('Ramesh'), 'Eligible staff member is Ramesh (Sanitation Worker)');

  const ward27LightEligible = staffCategoryRepository.getEligibleStaffForGrievance({
    wardId: 27,
    category: 'Street Light Fault',
    department: 'Electrical',
  });
  assert(ward27LightEligible.length === 1, `Ward 27 has exactly 1 Electrician (found: ${ward27LightEligible.length})`);
  assert(ward27LightEligible[0].displayName.includes('Suresh'), 'Eligible staff member is Suresh (Electrician)');

  const ward27RoadEligible = staffCategoryRepository.getEligibleStaffForGrievance({
    wardId: 27,
    category: 'Roads & Potholes',
    department: 'Engineering',
  });
  assert(ward27RoadEligible.length === 1, `Ward 27 has exactly 1 Road Repair Worker (found: ${ward27RoadEligible.length})`);
  assert(ward27RoadEligible[0].displayName.includes('Venkatesh'), 'Eligible staff member is Venkatesh (Road Repair Worker)');

  // In Ward 12:
  // - Naresh: Water Supply Technician
  // - Kiran: Sanitation Worker
  // - Raju: Civil Maintenance Worker
  // - Satish: Electrician / Streetlight Technician
  const ward12WaterEligible = staffCategoryRepository.getEligibleStaffForGrievance({
    wardId: 12,
    category: 'Water Leak',
    department: 'Water Supply',
  });
  assert(ward12WaterEligible.length === 1, `Ward 12 has exactly 1 Water Supply Technician (found: ${ward12WaterEligible.length})`);
  assert(ward12WaterEligible[0].displayName.includes('Naresh'), 'Eligible staff member is Naresh (Water Supply Technician)');

  const ward12CivilEligible = staffCategoryRepository.getEligibleStaffForGrievance({
    wardId: 12,
    category: 'Broken Footpath & Divider',
    department: 'Engineering',
  });
  assert(ward12CivilEligible.length === 1, `Ward 12 has exactly 1 Civil Maintenance Worker (found: ${ward12CivilEligible.length})`);
  assert(ward12CivilEligible[0].displayName.includes('Raju'), 'Eligible staff member is Raju (Civil Maintenance Worker)');

  // -------------------------------------------------------------
  // TEST 4: Data-Access Layer Rejection of Cross-Skill Assignments
  // -------------------------------------------------------------
  console.log('\nTEST 4: Data-Access Layer Rejection of Cross-Skill Assignments');
  const drainageGrievance = grievanceRepository.create({
    citizenId: 'USR-CITIZEN-01',
    category: 'Drainage Issue',
    description: 'Blocked drain in Ward 27',
    location: 'Green Park Colony, Ward 27',
    wardId: 27,
    department: 'Engineering',
  });
  assert(drainageGrievance.requiredStaffCategory === 'Drainage Worker', `Grievance tagged with requiredStaffCategory: "${drainageGrievance.requiredStaffCategory}"`);

  // Attempt to assign Drainage task to Ramesh (who is a Sanitation Worker) -> Must throw Error
  let crossSkillRejected = false;
  let crossSkillMessage = '';
  try {
    taskRepository.create({
      grievanceId: drainageGrievance.id,
      task: `Desilt Drain - ${drainageGrievance.location}`,
      assignedTo: 'Ramesh (Field Staff)', // Sanitation Worker!
      assignedFieldStaffId: 'USR-FIELD-01',
      wardId: 27,
    });
  } catch (err) {
    crossSkillRejected = true;
    crossSkillMessage = err.message;
  }
  assert(crossSkillRejected, 'Assigning Drainage task to Sanitation Worker rejected by data-access layer');
  assert(crossSkillMessage.includes('Cross-skill assignment rejected'), `Descriptive rejection message: "${crossSkillMessage}"`);

  // Attempt to assign Streetlight task to Venkatesh (Road Repair Worker) -> Must throw Error
  let electricMismatchRejected = false;
  try {
    taskRepository.create({
      task: 'Fix Street Light in Ward 27',
      assignedTo: 'Venkatesh (Field Staff)', // Road Repair Worker!
      requiredStaffCategory: 'Electrician / Streetlight Technician',
      wardId: 27,
    });
  } catch (err) {
    electricMismatchRejected = true;
  }
  assert(electricMismatchRejected, 'Assigning Streetlight task to Road Repair Worker rejected by data-access layer');

  // Attempt to assign task to deactivated staff -> Must throw Error
  userRepository.toggleActive('fieldstaff@kmc.demo'); // Deactivate Ramesh
  let inactiveRejected = false;
  try {
    taskRepository.create({
      task: 'Sanitation cleaning',
      assignedTo: 'Ramesh (Field Staff)',
      requiredStaffCategory: 'Sanitation Worker',
      wardId: 27,
    });
  } catch (err) {
    inactiveRejected = true;
  }
  assert(inactiveRejected, 'Assigning task to deactivated field worker rejected by data-access layer');
  userRepository.toggleActive('fieldstaff@kmc.demo'); // Reactivate Ramesh

  // -------------------------------------------------------------
  // TEST 5: Awaiting Assignment Queue for Unmatched Categories
  // -------------------------------------------------------------
  console.log('\nTEST 5: Awaiting Assignment Queue for Wards Lacking Required Skill');
  // In Ward 27, no Water Supply technician is deployed
  const ward27WaterEligible = staffCategoryRepository.getEligibleStaffForGrievance({
    wardId: 27,
    category: 'Water Pipe Leakage',
    department: 'Water Supply',
  });
  assert(ward27WaterEligible.length === 0, 'Ward 27 has 0 deployed Water Supply Technicians');

  // When citizen registers a water supply issue in Ward 27, it remains unassigned in Pending status
  const unassignedWaterGrievance = grievanceRepository.create({
    citizenId: 'USR-CITIZEN-01',
    category: 'Water Pipe Burst',
    description: 'Main pipeline leak flooding the road',
    location: 'Green Park Colony, Ward 27',
    wardId: 27,
    department: 'Water Supply',
  });
  assert(unassignedWaterGrievance.status === 'Pending', 'Grievance remains in Pending state');
  assert(!unassignedWaterGrievance.assignedFieldStaffId, 'Grievance has no assigned field staff');
  assert(unassignedWaterGrievance.requiredStaffCategory === 'Water Supply Technician', 'Tagged with required category "Water Supply Technician"');

  // -------------------------------------------------------------
  // TEST 6: Field Staff Role-Based Task Visibility Scope
  // -------------------------------------------------------------
  console.log('\nTEST 6: Field Staff Role-Based Task Visibility Scope');
  // Assign task to Mahesh (Drainage Worker)
  const maheshTask = taskRepository.create({
    grievanceId: drainageGrievance.id,
    task: `Desilt Drain - ${drainageGrievance.location}`,
    assignedTo: 'Mahesh (Field Staff)',
    assignedFieldStaffId: 'USR-FIELD-03',
    requiredStaffCategory: 'Drainage Worker',
    wardId: 27,
    departmentId: 'Engineering',
  });
  assert(maheshTask.id && maheshTask.assignedFieldStaffId === 'USR-FIELD-03', 'Task created and assigned to Mahesh');

  const maheshTaskList = taskRepository.getStaffTasks('Mahesh (Field Staff)', 27);
  assert(maheshTaskList.some((t) => t.id === maheshTask.id), 'Task is visible in Mahesh operational queue');

  const rameshTaskList = taskRepository.getStaffTasks('Ramesh (Field Staff)', 27);
  assert(!rameshTaskList.some((t) => t.id === maheshTask.id), 'Mahesh task is NOT visible in Ramesh sanitation queue');

  // -------------------------------------------------------------
  // TEST 7: Complete Grievance Lifecycle with Specialized Category
  // -------------------------------------------------------------
  console.log('\nTEST 7: Complete Grievance Lifecycle & Photo Verification');
  // Worker begins task
  taskRepository.updateStatus(maheshTask.id, 'In Progress', 'Desilting culvert using suction jet machine', undefined, 'Mahesh (Field Staff)');
  grievanceRepository.updateStatus(drainageGrievance.id, 'In Progress', 'Field work underway by Mahesh', 'Mahesh (Field Staff)');

  let checkGrievance = grievanceRepository.getById(drainageGrievance.id);
  assert(checkGrievance.status === 'In Progress', 'Grievance status synchronized to In Progress');

  // Worker completes task with after photo
  const afterPhotoToken = 'demo-photo:drain-after';
  taskRepository.updateStatus(maheshTask.id, 'Completed', 'Desilting finished, flow cleared', afterPhotoToken, 'Mahesh (Field Staff)');
  grievanceRepository.updateStatus(drainageGrievance.id, 'Completed', 'Work finished; after photo uploaded', 'Mahesh (Field Staff)', {
    afterPhoto: afterPhotoToken,
    timelineTitle: 'Work Completed – Waiting for Verification',
  });

  checkGrievance = grievanceRepository.getById(drainageGrievance.id);
  assert(checkGrievance.status === 'Completed', 'Grievance placed in Completed queue waiting for verification');

  // Corporator / Officer approves & closes
  grievanceRepository.updateStatus(drainageGrievance.id, 'Resolved', 'Approved by Ward 27 Corporator', 'Sri. K. Ramesh Rao', {
    timelineTitle: 'Approved & Closed',
  });
  checkGrievance = grievanceRepository.getById(drainageGrievance.id);
  assert(checkGrievance.status === 'Resolved', 'Grievance successfully signed off and marked Resolved');

  // Citizen rates 5 stars
  grievanceRepository.rateGrievance(drainageGrievance.id, 5, 'Excellent quick response by drainage crew');
  checkGrievance = grievanceRepository.getById(drainageGrievance.id);
  assert(checkGrievance.citizenRating === 5, 'Citizen 5-star rating persisted');
  assert(checkGrievance.feedbackComment === 'Excellent quick response by drainage crew', 'Citizen feedback comment persisted');

  console.log('\n================================================================');
  console.log(`TOTAL SPECIALIZED CATEGORY CHECKS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('================================================================\n');

  await server.close();

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
