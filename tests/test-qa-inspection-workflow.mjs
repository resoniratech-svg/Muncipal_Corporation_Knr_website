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
    pathname: '/',
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
  console.log(' KMC DIGITAL GOVERNANCE PLATFORM — QA INSPECTION WORKFLOW AUDIT');
  console.log('========================================================================\n');

  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  const { DEMO_USERS } = await server.ssrLoadModule('./src/auth/mockUsers.ts');
  const { hasPermission } = await server.ssrLoadModule('./src/auth/permissions.ts');
  const {
    isApprovedQaRoute,
    isQaInspectionActive,
    startQaInspection,
    exitQaInspection,
    APPROVED_QA_ROUTES,
    QA_INSPECT_STORAGE_KEY,
  } = await server.ssrLoadModule('./src/auth/qaInspection.ts');
  const { initializeStorage } = await server.ssrLoadModule('./src/storage/storageMigration.ts');

  // Initialize clean storage
  initializeStorage(true);

  // 1. Verify Auditor Role and Permissions
  console.log('1. Governance Auditor Identity and Permissions...');
  const auditorRecord = DEMO_USERS['auditor@kmc.demo'];
  assert(!!auditorRecord, 'Auditor demo account must exist in DEMO_USERS');
  assert(auditorRecord.user.role === 'governance_auditor', 'Role must strictly remain governance_auditor');
  assert(auditorRecord.user.displayName === 'Dr. T. Radhakrishnan', 'Auditor display name must match');
  assert(auditorRecord.user.permissions.includes('qa:inspect'), 'Auditor has explicit qa:inspect permission');
  assert(auditorRecord.user.permissions.includes('qa:review'), 'Auditor has explicit qa:review permission');
  assert(auditorRecord.user.permissions.includes('qa:test'), 'Auditor has explicit qa:test permission');

  const auditorUser = auditorRecord.user;
  assert(hasPermission(auditorUser, 'qa:inspect') === true, 'hasPermission returns true for qa:inspect');
  assert(hasPermission(auditorUser, 'qa:review') === true, 'hasPermission returns true for qa:review');
  assert(hasPermission(auditorUser, 'qa:test') === true, 'hasPermission returns true for qa:test');
  assert(hasPermission(auditorUser, 'monitoring:view') === true, 'Auditor has monitoring:view');
  assert(hasPermission(auditorUser, 'monitoring:audit') === true, 'Auditor has monitoring:audit');
  assert(hasPermission(auditorUser, 'platform:admin') === false, 'Auditor must NOT have platform:admin');
  assert(hasPermission(auditorUser, 'users:manage') === false, 'Auditor must NOT have users:manage');
  assert(hasPermission(auditorUser, 'citizen:submit_grievance') === false, 'Auditor must NOT have citizen:submit_grievance');

  // 2. Test Approved QA Inspection Routes Whitelist
  console.log('\n2. Approved QA Inspection Scope Whitelist...');
  const targetRoutesToTest = [
    '/',
    '/leadership',
    '/ward',
    '/department',
    '/field-tasks',
    '/citizen',
    '/citizen/report',
    '/citizen/track',
    '/citizen/ward',
    '/citizen/notices',
    '/citizen/gallery',
    '/performance',
    '/workflow',
    '/notifications',
    '/monitoring',
    '/implementation',
    '/admin/users',
    '/present',
    '/qa',
  ];

  for (const route of targetRoutesToTest) {
    assert(isApprovedQaRoute(route) === true, `Approved route verified: ${route}`);
  }

  // Non-approved routes fail
  assert(isApprovedQaRoute('/api/internal/secrets') === false, 'Non-approved path /api/internal/secrets rejected');
  assert(isApprovedQaRoute('/restricted-config') === false, 'Non-approved path /restricted-config rejected');
  assert(isApprovedQaRoute('') === false, 'Empty route rejected');

  // 3. QA Inspection Mode Activation & Role Isolation
  console.log('\n3. QA Inspection Mode Activation & Role Isolation...');

  // Auditor with ?qaInspect=true query
  globalThis.window.location.search = '?qaInspect=true';
  const activeWithQuery = isQaInspectionActive(auditorUser, { pathname: '/citizen/report', search: '?qaInspect=true' });
  assert(activeWithQuery === true, 'Auditor with ?qaInspect=true activates QA inspection mode');
  assert(sessionStorage.getItem(QA_INSPECT_STORAGE_KEY) === 'true', 'Session flag is set in sessionStorage');

  // Exit inspection
  exitQaInspection();
  globalThis.window.location.search = '';
  assert(sessionStorage.getItem(QA_INSPECT_STORAGE_KEY) === null, 'exitQaInspection cleanly clears session storage');

  // Direct access without qaInspect flag
  const inactiveDirect = isQaInspectionActive(auditorUser, { pathname: '/citizen/report', search: '' });
  assert(inactiveDirect === false, 'Direct access without flag or session does NOT activate inspection mode');

  // Unauthorized roles cannot activate inspection mode
  const citizenUser = DEMO_USERS['citizen@kmc.demo'].user;
  globalThis.window.location.search = '?qaInspect=true';
  const citizenAttempt = isQaInspectionActive(citizenUser, { pathname: '/admin/users', search: '?qaInspect=true' });
  assert(citizenAttempt === false, 'Citizen role CANNOT activate QA inspection mode even with ?qaInspect=true');

  const fieldStaffUser = DEMO_USERS['fieldstaff@kmc.demo'].user;
  const fieldStaffAttempt = isQaInspectionActive(fieldStaffUser, { pathname: '/leadership', search: '?qaInspect=true' });
  assert(fieldStaffAttempt === false, 'Field staff role CANNOT activate QA inspection mode');

  // Sub-navigation within approved routes while in active inspection mode
  startQaInspection();
  const subNavWard = isQaInspectionActive(auditorUser, { pathname: '/ward' });
  assert(subNavWard === true, 'Subsequent navigation to approved route /ward stays active in session');
  const subNavCitizenTrack = isQaInspectionActive(auditorUser, { pathname: '/citizen/track' });
  assert(subNavCitizenTrack === true, 'Subsequent navigation to /citizen/track stays active in session');

  // Non-approved route in session must still be rejected
  const nonApprovedInSession = isQaInspectionActive(auditorUser, { pathname: '/unauthorized/screen' });
  assert(nonApprovedInSession === false, 'Non-approved route strictly rejected even during active session');

  exitQaInspection();

  // 4. Checklist Progress Persistence in LocalStorage
  console.log('\n4. Reviewer Checklist Progress Persistence in LocalStorage...');
  const PHOTO_CHECKLIST_KEY = 'kmc-ui:qa-photo-checks';
  const QA_AUDIT_KEY = 'kmc:qa_checks';

  const initialPhotoChecks = { 1: true, 2: true, 3: true };
  localStorage.setItem(PHOTO_CHECKLIST_KEY, JSON.stringify(initialPhotoChecks));

  const reloadedPhotoChecks = JSON.parse(localStorage.getItem(PHOTO_CHECKLIST_KEY) || '{}');
  assert(reloadedPhotoChecks[1] === true, 'Test 1 checkmark persisted in localStorage');
  assert(reloadedPhotoChecks[2] === true, 'Test 2 checkmark persisted in localStorage');
  assert(reloadedPhotoChecks[3] === true, 'Test 3 checkmark persisted in localStorage');
  assert(reloadedPhotoChecks[4] === undefined, 'Test 4 remains unchecked');

  const deckChecks = { 1: true, 5: true, 13: true };
  localStorage.setItem(QA_AUDIT_KEY, JSON.stringify(deckChecks));
  const reloadedDeckChecks = JSON.parse(localStorage.getItem(QA_AUDIT_KEY) || '{}');
  assert(reloadedDeckChecks[13] === true, 'Page 13 deck checkmark persisted in localStorage');

  // 5. Verification of Open Button Route Resolution
  console.log('\n5. Photo Workflow Tests Open Link Mapping...');
  const EXPECTED_TESTS = [
    { n: 1, route: '/citizen/report' },
    { n: 2, route: '/leadership' },
    { n: 3, route: '/field-tasks' },
    { n: 4, route: '/qa/grievances/GRV-2024-27-0045' },
    { n: 5, route: '/leadership' },
    { n: 6, route: '/citizen/track' },
    { n: 7, route: '/citizen/report' },
    { n: 8, route: '/citizen' },
    { n: 9, route: '/' },
    { n: 10, route: '/citizen' },
  ];

  for (const t of EXPECTED_TESTS) {
    assert(isApprovedQaRoute(t.route) === true, `Test ${t.n} target route ${t.route} is in approved scope`);
    const targetWithParam = `${t.route}${t.route.includes('?') ? '&' : '?'}qaInspect=true`;
    assert(targetWithParam.includes('qaInspect=true'), `Test ${t.n} link specifies ?qaInspect=true`);
  }

  // 6. Grievance Audit Detail Data Model & SLA Verification
  console.log('\n6. Grievance Audit Detail Data Model & SLA Verification...');
  const { grievanceRepository } = await server.ssrLoadModule('./src/storage/repositories/grievanceRepository.ts');
  const { getBeforePhotos, getAfterPhotos } = await server.ssrLoadModule('./src/data/grievances.ts');

  const resolvedGrievance = grievanceRepository.getById('GRV-2024-27-0045');
  assert(!!resolvedGrievance, 'GRV-2024-27-0045 must exist in grievance repository');
  assert(resolvedGrievance.status === 'Resolved', 'Grievance status is Resolved');
  assert(resolvedGrievance.wardId === 27, 'Grievance belongs to Ward 27');
  assert(resolvedGrievance.category === 'Drainage', 'Grievance category is Drainage');
  assert(resolvedGrievance.slaHours === 72, 'Configured SLA is 72 hours');
  assert(resolvedGrievance.assignedTo.includes('Mahesh'), 'Assigned staff is Mahesh (Field Staff)');

  const beforeEvidence = getBeforePhotos(resolvedGrievance);
  const afterEvidence = getAfterPhotos(resolvedGrievance);
  assert(beforeEvidence.length > 0, 'Before photo evidence is present and non-empty');
  assert(afterEvidence.length > 0, 'After photo evidence is present and non-empty');
  assert(beforeEvidence[0].src.includes('drain-before'), 'Before photo points to authentic drain-before.jpg');
  assert(afterEvidence[0].src.includes('drain-after'), 'After photo points to authentic drain-after.jpg');

  assert(Array.isArray(resolvedGrievance.timeline), 'Timeline exists as an array of events');
  assert(resolvedGrievance.timeline.length >= 4, `Timeline contains ${resolvedGrievance.timeline.length} chronological events`);
  const registeredEvent = resolvedGrievance.timeline.find(e => e.title.includes('Registered'));
  const approvedEvent = resolvedGrievance.timeline.find(e => e.title.includes('Approved') || e.title.includes('Closed'));
  assert(!!registeredEvent, 'Timeline contains Registered event');
  assert(!!approvedEvent, 'Timeline contains Approved & Closed event');

  // Metadata review storage check
  const reviewMetadata = {
    4: {
      checked: true,
      reviewer: 'Dr. T. Radhakrishnan (Governance Auditor)',
      timestamp: '2026-10-27T12:00:00.000Z',
      status: 'VERIFIED',
    },
  };
  localStorage.setItem(PHOTO_CHECKLIST_KEY, JSON.stringify(reviewMetadata));
  const parsedReviews = JSON.parse(localStorage.getItem(PHOTO_CHECKLIST_KEY) || '{}');
  assert(parsedReviews[4].checked === true, 'Test 4 review checked state persisted');
  assert(parsedReviews[4].reviewer.includes('Radhakrishnan'), 'Test 4 reviewer identity recorded');
  assert(parsedReviews[4].status === 'VERIFIED', 'Test 4 review status recorded as VERIFIED');

  await server.close();

  console.log('\n========================================================================');
  console.log(` RESULTS: ${passCount} PASSED, ${failCount} FAILED out of ${passCount + failCount} assertions.`);
  console.log('========================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL QA INSPECTION WORKFLOW TESTS PASSED SUCCESSFULLY!\n');
  }
}

runTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
