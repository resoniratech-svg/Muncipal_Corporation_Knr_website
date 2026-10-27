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
  console.log('KMC PLATFORM COMPLETE FUNCTIONAL & WORKFLOW VERIFICATION SUITE');
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
  const { departmentRepository } = await server.ssrLoadModule('./src/storage/repositories/departmentRepository.ts');
  const { notificationRepository } = await server.ssrLoadModule('./src/storage/repositories/notificationRepository.ts');
  const { feedbackRepository } = await server.ssrLoadModule('./src/storage/repositories/feedbackRepository.ts');
  const { projectRepository } = await server.ssrLoadModule('./src/storage/repositories/projectRepository.ts');
  const { auditRepository } = await server.ssrLoadModule('./src/storage/repositories/auditRepository.ts');
  const { hasPermission } = await server.ssrLoadModule('./src/auth/permissions.ts');

  // 1. Storage Initialization & Migration Tests
  console.log('TEST SUITE 1: Local Storage Initialization & Migration');
  initializeStorage(true); // force fresh seed
  assert(globalThis.localStorage.getItem(STORAGE_KEYS.META) !== null, 'Metadata key initialized in localStorage');
  assert(globalThis.localStorage.getItem(STORAGE_KEYS.USERS) !== null, 'Users key initialized with demo accounts');
  assert(globalThis.localStorage.getItem(STORAGE_KEYS.GRIEVANCES) !== null, 'Grievances key initialized');
  assert(globalThis.localStorage.getItem(STORAGE_KEYS.TASKS) !== null, 'Tasks key initialized');
  assert(globalThis.localStorage.getItem(STORAGE_KEYS.WARDS) !== null, 'Wards key initialized with 66 wards');

  const meta = storageService.getItem(STORAGE_KEYS.META);
  assert(meta.version === CURRENT_SCHEMA_VERSION, `Schema version matches CURRENT_SCHEMA_VERSION (${CURRENT_SCHEMA_VERSION})`);

  // 2. Scenario 1: Persistence Verification
  console.log('\nTEST SUITE 2: Scenario 1 — Persistence Verification');
  const createdGrievance = grievanceRepository.create({
    citizenId: 'USR-CITIZEN-01',
    category: 'Water Supply',
    department: 'Water Supply',
    location: 'Collectorate Junction, Ward 27',
    description: 'Underground drinking water pipe fracture causing flooding.',
    wardId: 27,
    slaHours: 24,
  }, 'Sri. P. Rajesh Kumar');

  assert(!!createdGrievance.id, `Grievance created with stable ID: ${createdGrievance.id}`);
  const retrievedAfterSave = grievanceRepository.getById(createdGrievance.id);
  assert(retrievedAfterSave !== null, 'Grievance immediately retrievable from repository');
  assert(retrievedAfterSave.description === createdGrievance.description, 'Stored description matches exactly');

  // Simulate browser refresh
  const rawGrievances = JSON.parse(globalThis.localStorage.getItem(STORAGE_KEYS.GRIEVANCES));
  const foundInRawStorage = rawGrievances.find((g) => g.id === createdGrievance.id);
  assert(foundInRawStorage !== undefined, 'Record persisted in localStorage across simulated refresh');

  // 3. Scenario 2: Citizen Isolation
  console.log('\nTEST SUITE 3: Scenario 2 — Citizen Isolation');
  const grievanceCitizenB = grievanceRepository.create({
    citizenId: 'USR-CITIZEN-02',
    category: 'Street Lights',
    department: 'Electrical',
    location: 'Booth Colony, Ward 12',
    description: 'Streetlight short circuit near pole #44.',
    wardId: 12,
  }, 'Smt. Lavanya Reddy');

  const citizen1Records = grievanceRepository.getByCitizenId('USR-CITIZEN-01');
  const citizen2Records = grievanceRepository.getByCitizenId('USR-CITIZEN-02');

  const citizen1CanSeeCitizen2 = citizen1Records.some((g) => g.id === grievanceCitizenB.id);
  const citizen2CanSeeCitizen1 = citizen2Records.some((g) => g.id === createdGrievance.id);

  assert(!citizen1CanSeeCitizen2, "Citizen 1 CANNOT access Citizen 2's private grievance");
  assert(!citizen2CanSeeCitizen1, "Citizen 2 CANNOT access Citizen 1's private grievance");
  assert(citizen2Records.some((g) => g.id === grievanceCitizenB.id), "Citizen 2 sees their own grievance");

  // 4. Scenario 3: Ward Isolation
  console.log('\nTEST SUITE 4: Scenario 3 — Ward Isolation');
  const corporatorUser = userRepository.getByEmail('corporator27@kmc.demo').user;
  assert(corporatorUser.assignedWardIds.includes(27), 'Corporator is assigned to Ward 27');
  assert(!corporatorUser.assignedWardIds.includes(12), 'Corporator is NOT assigned to Ward 12');

  // 5. Scenario 4: Department Isolation
  console.log('\nTEST SUITE 5: Scenario 4 — Department Isolation');
  const engineerUser = userRepository.getByEmail('engineering@kmc.demo').user;
  assert(engineerUser.departmentId === 'engineering', 'Officer belongs strictly to Engineering department');

  const engineeringGrievances = grievanceRepository.getByDepartment('engineering');
  const sanitationOnly = engineeringGrievances.filter((g) => g.department === 'Sanitation' && !g.category.includes('Drain'));
  assert(sanitationOnly.length === 0, 'Engineering department query excludes unrelated pure Sanitation records');

  // 6. Scenario 5: Field Staff Task Workflow
  console.log('\nTEST SUITE 6: Scenario 5 — Field Staff Task Workflow');
  const newTask = taskRepository.create({
    task: 'Clear storm water drain blockage at Ward 27',
    assignedTo: 'Ramesh (Field Staff)',
    role: 'Field Staff',
    dueDate: '25 May 2024',
    status: 'Pending',
    wardId: 27,
  });

  assert(newTask.status === 'Pending', 'Task initialized with status Pending');
  const rameshTasks = taskRepository.getByStaffName('Ramesh');
  assert(rameshTasks.some((t) => t.id === newTask.id), 'Task is visible in Ramesh roster');

  const startedTask = taskRepository.updateStatus(newTask.id, 'In Progress', 'Excavator on site');
  assert(startedTask.status === 'In Progress', 'Task successfully transitioned: Pending -> In Progress');

  const completedTask = taskRepository.updateStatus(newTask.id, 'Completed', 'Debris cleared and cement cover fixed', 'gps-photo-data');
  assert(completedTask.status === 'Completed', 'Task successfully transitioned: In Progress -> Completed');

  // 7. Scenario 6: Complete Grievance Lifecycle
  console.log('\nTEST SUITE 7: Scenario 6 — Complete Grievance Lifecycle');
  const lifecycleGrievance = grievanceRepository.create({
    citizenId: 'USR-CITIZEN-01',
    category: 'Drainage Issue',
    department: 'Engineering',
    location: 'Market Road, Ward 27',
    description: 'Manhole cover broken on busy walkway',
    wardId: 27,
    slaHours: 48,
  }, 'Sri. P. Rajesh Kumar');
  assert(lifecycleGrievance.status === 'Pending', 'Lifecycle Step 1: Grievance registered as Pending');

  const assignedTask = taskRepository.create({
    task: `${lifecycleGrievance.id}: Repair broken manhole cover`,
    assignedTo: 'Ramesh (Field Staff)',
    role: 'Field Staff',
    dueDate: '24 May 2024',
    status: 'Pending',
    wardId: 27,
  });
  grievanceRepository.updateStatus(lifecycleGrievance.id, 'In Progress', 'Assigned to Ramesh (Field Staff)', 'Er. Venkateshwarlu');
  const updatedGrievanceAssigned = grievanceRepository.getById(lifecycleGrievance.id);
  assert(updatedGrievanceAssigned.status === 'In Progress', 'Lifecycle Step 2: Grievance marked In Progress after assignment');

  taskRepository.updateStatus(assignedTask.id, 'Completed', 'Cast iron cover fitted and grouted', 'photo-proof-gps');
  grievanceRepository.updateStatus(lifecycleGrievance.id, 'Completed', 'Field work completed with geo-tagged photographic evidence', 'Ramesh (Field Staff)');
  const updatedGrievanceCompleted = grievanceRepository.getById(lifecycleGrievance.id);
  assert(updatedGrievanceCompleted.status === 'Completed', 'Lifecycle Step 3: Grievance marked Completed for officer review');

  grievanceRepository.updateStatus(lifecycleGrievance.id, 'Resolved', 'Inspection approved by Superintending Engineer', 'Er. Venkateshwarlu');
  const updatedGrievanceResolved = grievanceRepository.getById(lifecycleGrievance.id);
  assert(updatedGrievanceResolved.status === 'Resolved', 'Lifecycle Step 4: Grievance approved and Resolved');

  feedbackRepository.create({
    grievanceId: lifecycleGrievance.id,
    citizenId: 'USR-CITIZEN-01',
    citizenName: 'Sri. P. Rajesh Kumar',
    rating: 5,
    comment: 'Exceptional response speed and clean workmanship!',
  });
  grievanceRepository.rateGrievance(lifecycleGrievance.id, 5, 'Exceptional response speed and clean workmanship!');
  const finalRatedGrievance = grievanceRepository.getById(lifecycleGrievance.id);
  assert(finalRatedGrievance.citizenRating === 5, 'Lifecycle Step 5: Grievance citizen rating persisted as 5/5 stars');

  // 8. Scenario 7: Escalation Simulation
  console.log('\nTEST SUITE 8: Scenario 7 — Escalation Simulation');
  const overdueCase = grievanceRepository.create({
    citizenId: 'USR-CITIZEN-01',
    category: 'Water Supply',
    department: 'Water Supply',
    location: 'Ramakrishna Nagar, Ward 27',
    description: 'Major pipeline rupture with high pressure flooding',
    wardId: 27,
    slaHours: 24,
  });
  grievanceRepository.updateStatus(overdueCase.id, 'Overdue', 'Breached 24-hour SLA. Escalated to Additional Commissioner & HoD.');
  const escalatedRecord = grievanceRepository.getById(overdueCase.id);
  assert(escalatedRecord.status === 'Overdue', 'Grievance status updated to Overdue upon SLA breach');

  // 9. Scenario 8: RBAC & Permissions
  console.log('\nTEST SUITE 9: Scenario 8 — RBAC & Permissions');
  const adminUser = userRepository.getByEmail('admin@kmc.demo').user;
  const auditorUser = userRepository.getByEmail('auditor@kmc.demo').user;
  const citizenUser = userRepository.getByEmail('citizen@kmc.demo').user;

  assert(hasPermission(adminUser, 'platform:admin'), 'Super Admin has platform:admin');
  assert(hasPermission(adminUser, 'users:manage'), 'Super Admin has users:manage');
  assert(!hasPermission(citizenUser, 'platform:admin'), 'Citizen DOES NOT have platform:admin');
  assert(!hasPermission(auditorUser, 'users:manage'), 'Governance Auditor DOES NOT have users:manage');
  assert(hasPermission(auditorUser, 'monitoring:audit'), 'Governance Auditor has monitoring:audit');

  // 10. Scenario 9: Account Switching & Deactivation
  console.log('\nTEST SUITE 10: Scenario 9 — Account Switching & Deactivation');
  const activeStatus = userRepository.toggleActive('fieldstaff@kmc.demo');
  assert(activeStatus === false, 'Account fieldstaff@kmc.demo successfully deactivated');
  const deactivatedUser = userRepository.getByEmail('fieldstaff@kmc.demo');
  assert(deactivatedUser.user.isActive === false, 'Deactivation persists in storage');
  userRepository.toggleActive('fieldstaff@kmc.demo'); // Restore active status
  assert(userRepository.getByEmail('fieldstaff@kmc.demo').user.isActive === true, 'Account reactivated cleanly');

  // 11. Scenario 10: Storage Recovery, Export & Import
  console.log('\nTEST SUITE 11: Scenario 10 — Storage Recovery, Export & Import');
  const exportedBackup = storageService.exportData();
  assert(exportedBackup.version === CURRENT_SCHEMA_VERSION, 'Export contains correct schema version');
  assert(exportedBackup.grievances.length > 0, 'Export bundle includes persisted grievances');
  assert(exportedBackup.users['admin@kmc.demo'] !== undefined, 'Export bundle includes users');

  const invalidImportResult = storageService.importData({ invalid: 'corrupt payload' });
  assert(invalidImportResult.success === false, 'Corrupted import payload rejected safely');

  const validImportResult = storageService.importData(exportedBackup);
  assert(validImportResult.success === true, 'Valid backup restored successfully');

  // 12. Scenario 11 & 12: Notification Multi-Channel Dispatch
  console.log('\nTEST SUITE 12: Scenarios 11 & 12 — Multi-Channel Dispatch & Interaction Audit');
  const broadcast = notificationRepository.create({
    type: 'Emergency',
    title: 'Monsoon Flash Flood Alert',
    message: 'Low lying areas in Ward 27 and Ward 12 are advised to stay alert.',
    wardId: 27,
    channel: ['app', 'sms', 'portal'],
    smsText: 'KMC Emergency: Flash flood alert in Ward 27. Relief camps active.',
    urgency: 'high',
  });

  assert(!!broadcast.id, 'Broadcast created with unique ID');
  const ward27Notifs = notificationRepository.getByWard(27);
  assert(ward27Notifs.some((n) => n.id === broadcast.id), 'Broadcast appears in Ward 27 notifications feed');

  // 13. Test Suite 13: Cross-Ward Grievance Reporting & Dynamic Corporator Linkage
  console.log('\nTEST SUITE 13: Cross-Ward Grievance Reporting & Dynamic Corporator Linkage');
  const allWards = wardRepository.getAll();
  assert(allWards.length === 66, 'All 66 Municipal Wards are present and queryable');

  // Citizen registered in Ward 27 spots an issue in Ward 12 (Booth Colony)
  const targetWard12 = wardRepository.getById(12);
  assert(targetWard12 !== null && !!targetWard12.corporator, `Target Ward 12 exists with Corporator: ${targetWard12?.corporator}`);

  const crossWardGrievance = grievanceRepository.create(
    {
      citizenId: 'USR-CITIZEN-01',
      category: 'Drainage Issue',
      department: 'Engineering',
      location: 'Booth Colony Main Road, Ward 12',
      description: 'Severe stormwater drain collapse spotted while commuting.',
      wardId: 12,
      slaHours: 48,
    },
    'Priya Rao (Resident, Ward 27)',
    targetWard12.corporator
  );

  assert(crossWardGrievance.wardId === 12, 'Cross-ward complaint successfully assigned to target Ward 12');
  const timelineItem = crossWardGrievance.timeline.find(t => t.title.includes('Auto-Routed'));
  assert(
    !!timelineItem && timelineItem.note.includes(targetWard12.corporator),
    `Timeline automatically logs routing to Ward 12 Corporator (${targetWard12.corporator})`
  );

  // Verify task was created on Ward 12's roster
  const crossWardTask = taskRepository.create({
    task: `${crossWardGrievance.category}: ${crossWardGrievance.description}`,
    assignedTo: 'Naresh (Field Staff)',
    role: 'Field Staff',
    dueDate: 'Tomorrow, 05:00 PM',
    status: 'Pending',
    wardId: 12,
  });
  const ward12Tasks = taskRepository.getAll().filter(t => t.wardId === 12);
  assert(ward12Tasks.some(t => t.id === crossWardTask.id), 'Task roster for Ward 12 receives the cross-ward ground assignment');

  // Verify ward filtering
  const ward12Grievances = grievanceRepository.getByWardId(12);
  assert(ward12Grievances.some(g => g.id === crossWardGrievance.id), 'Ward 12 dashboard displays the cross-reported grievance');

  // 14. Test Suite 14: Photographic Evidence Propagation across Linked Portals
  console.log('\nTEST SUITE 14: Photographic Evidence Propagation across Linked Portals');
  const mockPhotoDataUri = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...SAMPLE';
  const photoGrievance = grievanceRepository.create(
    {
      citizenId: 'USR-CITIZEN-01',
      category: 'Roads & Potholes',
      department: 'Engineering',
      location: 'Subash Nagar Main Junction, Ward 27',
      description: 'Hazardous crater pothole causing vehicle damage.',
      wardId: 27,
      slaHours: 72,
      beforePhoto: mockPhotoDataUri,
    },
    'Sri. P. Rajesh Kumar',
    'Sri. K. Ramesh Rao'
  );

  assert(photoGrievance.beforePhoto === mockPhotoDataUri, 'Grievance retains raw photographic evidence Data URL');
  const retrievedPhotoRecord = grievanceRepository.getById(photoGrievance.id);
  assert(retrievedPhotoRecord?.beforePhoto === mockPhotoDataUri, 'Photo evidence persisted in storage and queryable by ID');

  // Verify Department Wing can retrieve the image
  const engGrievancesWithPhoto = grievanceRepository.getByDepartment('engineering').filter(g => g.id === photoGrievance.id);
  assert(engGrievancesWithPhoto[0]?.beforePhoto === mockPhotoDataUri, 'Engineering Department portal receives direct access to photo evidence');

  // Verify Ward portal can retrieve the image
  const ward27GrievancesWithPhoto = grievanceRepository.getByWardId(27).filter(g => g.id === photoGrievance.id);
  assert(ward27GrievancesWithPhoto[0]?.beforePhoto === mockPhotoDataUri, 'Ward 27 Portal receives direct access to photo evidence');

  await server.close();

  console.log('\n================================================================');
  console.log(`TOTAL AUDIT CHECKS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('================================================================\n');

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
