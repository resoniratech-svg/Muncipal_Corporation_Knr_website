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

async function runTest() {
  console.log('================================================================');
  console.log('END-TO-END TEST: CROSS-WARD GRIEVANCE WITH PHOTO EVIDENCE FLOW');
  console.log('================================================================\n');

  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  const { initializeStorage } = await server.ssrLoadModule('./src/storage/storageMigration.ts');
  const { grievanceRepository } = await server.ssrLoadModule('./src/storage/repositories/grievanceRepository.ts');
  const { taskRepository } = await server.ssrLoadModule('./src/storage/repositories/taskRepository.ts');
  const { wardRepository } = await server.ssrLoadModule('./src/storage/repositories/wardRepository.ts');
  const { notificationRepository } = await server.ssrLoadModule('./src/storage/repositories/notificationRepository.ts');
  const { auditRepository } = await server.ssrLoadModule('./src/storage/repositories/auditRepository.ts');

  // Step 1: Initialize Storage
  console.log('STEP 1: Fresh Storage Initialization');
  initializeStorage(true);
  const totalWards = wardRepository.getAll();
  assert(totalWards.length === 66, 'All 66 wards initialized in database');

  // Step 2: Citizen from Ward 27 spots an issue in Ward 12 with Photo Evidence
  console.log('\nSTEP 2: Citizen (Resident of Ward 27) Files Issue in Ward 12 with Camera Photo');
  const targetWard12 = wardRepository.getById(12);
  assert(targetWard12 !== null, 'Target Ward 12 found in ward registry');
  assert(targetWard12?.corporator === 'Smt. P. Lavanya', `Target Ward 12 Corporator confirmed as: ${targetWard12?.corporator}`);

  const samplePhotoUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  
  const createdGrievance = grievanceRepository.create(
    {
      citizenId: 'USR-CITIZEN-01',
      category: 'Drainage Issue',
      department: 'Engineering',
      location: 'Near Water Tank, Booth Colony, Ward 12',
      description: 'Sewage chamber broken and overflowing onto pedestrian walkway.',
      wardId: 12,
      slaHours: 48,
      beforePhoto: samplePhotoUri,
      latitude: 18.0012,
      longitude: 79.1345,
    },
    'Priya Rao (Citizen)',
    targetWard12.corporator
  );

  assert(!!createdGrievance.id, `Grievance registered with tracking ID: ${createdGrievance.id}`);
  assert(createdGrievance.wardId === 12, 'Grievance assigned to target Ward 12 (not home ward 27)');
  assert(createdGrievance.beforePhoto === samplePhotoUri, 'Citizen photo evidence data URI persisted in grievance record');

  // Verify auto-routing timeline entry
  const routeTimeline = createdGrievance.timeline.find(t => t.title.includes('Auto-Routed'));
  assert(!!routeTimeline, 'Timeline contains auto-routing entry');
  assert(routeTimeline.note.includes('Smt. P. Lavanya'), 'Timeline note explicitly mentions Ward 12 Corporator (Smt. P. Lavanya)');
  assert(routeTimeline.note.includes('Engineering'), 'Timeline note explicitly mentions Engineering Department');

  // Auto-generate linked task (as AppContext.submitGrievance does)
  const linkedTask = taskRepository.create({
    task: `${createdGrievance.category}: ${createdGrievance.description}`,
    assignedTo: 'Naresh (Field Staff)',
    role: 'Field Staff',
    dueDate: 'Tomorrow, 05:00 PM',
    status: 'Pending',
    wardId: 12,
  });
  assert(linkedTask.wardId === 12, 'Ground task assigned to Ward 12 operational roster');

  // Notification dispatch
  const notif = notificationRepository.create({
    type: 'WardUpdate',
    title: `Grievance ${createdGrievance.id} Registered in Ward 12`,
    message: `Citizen grievance reported at ${createdGrievance.location}. Auto-routed to Ward 12 Corporator (${targetWard12.corporator}) & Engineering Wing.`,
    wardId: 12,
    channel: ['app', 'sms', 'portal'],
    smsText: `KMC: Grievance ${createdGrievance.id} registered for Ward 12 (Corp. ${targetWard12.corporator}). Assigned to Engineering.`,
    urgency: 'info',
  });
  assert(notif.wardId === 12, 'SMS broadcast dispatched for Ward 12');

  // Step 3: Verify Ward Portal (Ward 12 Corporator View)
  console.log('\nSTEP 3: Ward Portal Verification (Ward 12 Corporator View)');
  const ward12Grievances = grievanceRepository.getByWardId(12);
  const foundInWard12 = ward12Grievances.find(g => g.id === createdGrievance.id);
  assert(!!foundInWard12, 'Grievance appears immediately in Ward 12 grievance stream');
  assert(foundInWard12?.beforePhoto === samplePhotoUri, 'Ward 12 portal receives access to citizen photo evidence');
  
  const ward12Tasks = taskRepository.getAll().filter(t => t.wardId === 12);
  assert(ward12Tasks.some(t => t.id === linkedTask.id), 'Ward 12 ground task table displays the new assignment');

  // Ward 27 (Home Ward) Isolation Check
  const ward27Grievances = grievanceRepository.getByWardId(27);
  const foundInWard27 = ward27Grievances.find(g => g.id === createdGrievance.id);
  assert(!foundInWard27, 'Grievance is NOT in Ward 27 (prevents polluting wrong ward dashboard)');

  // Step 4: Verify Department Portal (Superintending Engineer View)
  console.log('\nSTEP 4: Department Portal Verification (Engineering Wing View)');
  const engGrievances = grievanceRepository.getByDepartment('Engineering');
  const foundInEng = engGrievances.find(g => g.id === createdGrievance.id);
  assert(!!foundInEng, 'Grievance appears in Engineering Department command console');
  assert(foundInEng?.beforePhoto === samplePhotoUri, 'Engineering Officer has direct visibility of site photo');
  assert(foundInEng?.slaHours === 48, 'SLA target of 48 hours properly enforced');

  // Step 5: Verify Field Staff Portal (Ground Operations View)
  console.log('\nSTEP 5: Field Staff Portal Verification (Technician Mobile View)');
  const allTasks = taskRepository.getAll();
  const nareshTasks = allTasks.filter(t => t.assignedTo.includes('Naresh'));
  const foundNareshTask = nareshTasks.find(t => t.id === linkedTask.id);
  assert(!!foundNareshTask, 'Task appears on Naresh field staff roster for Ward 12');

  // Field Staff inspects site photo, performs repair, and uploads after photo
  const afterPhotoUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  taskRepository.updateStatus(linkedTask.id, 'Completed', 'Broken chamber rebuilt and high-grade concrete slab fitted.', afterPhotoUri);
  
  const updatedTask = taskRepository.getAll().find(t => t.id === linkedTask.id);
  assert(updatedTask?.status === 'Completed', 'Field staff advanced task status to Completed');
  assert(updatedTask?.photo === afterPhotoUri, 'Field staff uploaded after-resolution proof photo');

  // Synchronize status to grievance
  grievanceRepository.updateStatus(createdGrievance.id, 'Completed', 'Ground repairs completed. Ready for officer inspection.', 'Naresh (Field Staff)');
  const grievanceAfterFieldWork = grievanceRepository.getById(createdGrievance.id);
  assert(grievanceAfterFieldWork?.status === 'Completed', 'Grievance status synchronized to Completed');

  // Step 6: Department Officer Approves & Closes Grievance
  console.log('\nSTEP 6: Department Officer Inspection & Closure');
  grievanceRepository.updateStatus(createdGrievance.id, 'Resolved', 'Officer inspected before/after evidence and approved quality pass.', 'Er. P. Venkateshwarlu');
  const resolvedGrievance = grievanceRepository.getById(createdGrievance.id);
  assert(resolvedGrievance?.status === 'Resolved', 'Grievance officially approved and marked as Resolved');

  // Step 7: Citizen Verification & Feedback
  console.log('\nSTEP 7: Citizen Portal Verification (Tracking & Rating)');
  const citizenTickets = grievanceRepository.getByCitizenId('USR-CITIZEN-01');
  const foundCitizenTicket = citizenTickets.find(g => g.id === createdGrievance.id);
  assert(!!foundCitizenTicket, 'Citizen can view this ticket under "My Registered Grievances"');
  assert(foundCitizenTicket?.wardId === 12, 'Ticket clearly indicates Ward 12 badge');
  assert(foundCitizenTicket?.status === 'Resolved', 'Citizen sees status as Resolved');
  assert(foundCitizenTicket?.beforePhoto === samplePhotoUri, 'Citizen sees original uploaded photo in tracking record');

  // Citizen submits 5-star rating
  grievanceRepository.rateGrievance(createdGrievance.id, 5, 'Quick response! The drain was cleared and covered within 24 hours.');
  const finalGrievance = grievanceRepository.getById(createdGrievance.id);
  assert(finalGrievance?.citizenRating === 5, 'Citizen 5-star rating persisted');
  assert(finalGrievance?.citizenFeedback?.includes('Quick response'), 'Citizen feedback comment persisted');

  await server.close();

  console.log('\n================================================================');
  console.log(`TOTAL CHECKS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
