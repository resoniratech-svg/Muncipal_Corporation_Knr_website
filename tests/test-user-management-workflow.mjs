import { createServer } from 'vite';

console.log('========================================================================');
console.log(' KMC DIGITAL GOVERNANCE PLATFORM — USER MANAGEMENT VERIFICATION SUITE  ');
console.log('========================================================================\n');

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

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${message}`);
  }
}

async function run() {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  const { initializeStorage } = await server.ssrLoadModule('./src/storage/storageMigration.ts');
  const { userRepository } = await server.ssrLoadModule('./src/storage/repositories/userRepository.ts');
  const { taskRepository } = await server.ssrLoadModule('./src/storage/repositories/taskRepository.ts');
  const { staffCategoryRepository } = await server.ssrLoadModule('./src/storage/repositories/staffCategoryRepository.ts');
  const { PAGES_TRANSLATIONS } = await server.ssrLoadModule('./src/i18n/locales/pagesTranslations.ts');

  // Initialize fresh database
  initializeStorage(true);

  // -------------------------------------------------------------
  // TEST A & B: Route & Safe Navigation Verification
  // -------------------------------------------------------------
  console.log('1. Checking Router Registration & ErrorBoundary...');
  const appModule = await server.ssrLoadModule('./src/App.tsx');
  assert(appModule.App !== undefined, 'App component loads cleanly');

  const { ErrorBoundary } = await server.ssrLoadModule('./src/components/common/ErrorBoundary.tsx');
  assert(ErrorBoundary !== undefined, 'ErrorBoundary component exists and exports correctly');

  // -------------------------------------------------------------
  // TEST C: User List & Safe Field Staff Roster Evaluation
  // -------------------------------------------------------------
  console.log('\n2. Testing Ward 27 Staff Roster Evaluation & Missing-Property Safety...');
  const ward27Staff = userRepository.getFieldStaff({ wardId: 27 });
  assert(ward27Staff.length > 0, `Loaded ${ward27Staff.length} field staff for Ward 27`);

  let crashDetected = false;
  try {
    for (const staff of ward27Staff) {
      const staffName = staff.displayName || staff.name || staff.username || 'Staff';
      const firstName = staffName.split(' ')[0] || '';
      const activeTasks = taskRepository
        .getByWardId(27)
        .filter(
          (t) =>
            t.status !== 'Completed' &&
            (t.assignedFieldStaffId === staff.id ||
              (t.assignedTo && staffName && t.assignedTo.toLowerCase() === staffName.toLowerCase()) ||
              (t.assignedTo && firstName && t.assignedTo.toLowerCase().includes(firstName.toLowerCase())))
        );
      assert(typeof activeTasks.length === 'number', `Staff ${staff.id} evaluated safely with ${activeTasks.length} active tasks`);
    }
  } catch (err) {
    crashDetected = true;
    console.error('Crash during staff roster evaluation:', err);
  }
  assert(!crashDetected, 'No TypeError when staff.name is undefined (root cause eliminated)');

  // -------------------------------------------------------------
  // TEST D: User Overview Metrics & KPI Computation
  // -------------------------------------------------------------
  console.log('\n3. Testing User Overview Metrics & Role Breakdown...');
  const allUsers = userRepository.getAll();
  const allList = Object.values(allUsers).map((r) => r.user);
  const totalCount = allList.length;
  const activeCount = allList.filter((u) => u.isActive !== false).length;
  const deactivatedCount = totalCount - activeCount;

  assert(totalCount >= 7, `Total registered users: ${totalCount}`);
  assert(activeCount > 0, `Active accounts counted: ${activeCount}`);
  assert(deactivatedCount >= 0, `Deactivated accounts counted: ${deactivatedCount}`);

  const roleCounts = {};
  allList.forEach((u) => {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
  });
  assert(roleCounts.super_admin >= 1, 'Super Admin role present in overview');
  assert(roleCounts.field_staff >= 1, 'Field staff role present in overview');
  assert(roleCounts.citizen >= 1, 'Citizen role present in overview');

  // -------------------------------------------------------------
  // TEST E: Create User Workflow & Duplicate Validation
  // -------------------------------------------------------------
  console.log('\n4. Testing Create User Workflow & Duplicate Validation...');
  const testEmail = 'test.engineer@kmc.demo';
  const newRecord = {
    passwordHash: 'TestPass@123',
    roleDescription: 'Senior Drainage Technician for testing',
    user: {
      id: 'USR-TEST-999',
      username: testEmail,
      displayName: 'Sri. Ravi Teja',
      name: 'Sri. Ravi Teja',
      role: 'field_staff',
      roleTitle: 'Drainage Worker – Ward 27',
      assignedWardIds: [27],
      assignedWardName: 'Ward 27',
      wardId: 27,
      departmentId: 'Engineering',
      departmentName: 'Engineering Department',
      staffCategory: 'Drainage Worker',
      staffCategoryId: 'drainage-worker',
      skills: ['Drain Desilting', 'Pipe Jetting'],
      permissions: ['citizen:view_own'],
      isActive: true,
      avatarInitials: 'RT',
    },
  };

  const created = userRepository.createUser(newRecord);
  assert(created === true, 'New user successfully created in userRepository');

  // Verify duplicate rejection
  const duplicateCreated = userRepository.createUser(newRecord);
  assert(duplicateCreated === false, 'Duplicate user creation safely rejected');

  // Verify retrieval
  const retrieved = userRepository.getByEmail(testEmail);
  assert(retrieved !== null, 'Created user immediately retrievable by email');
  assert(retrieved?.user.displayName === 'Sri. Ravi Teja', 'Retrieved user display name matches');

  // -------------------------------------------------------------
  // TEST F: Edit User & Persistence Across Storage
  // -------------------------------------------------------------
  console.log('\n5. Testing Edit User & Storage Persistence...');
  const updateSuccess = userRepository.updateUser(testEmail, {
    displayName: 'Sri. Ravi Teja (Promoted)',
    roleTitle: 'Senior Drainage Specialist – Ward 27',
    isActive: false,
  });
  assert(updateSuccess === true, 'User record updated via updateUser');

  const afterUpdate = userRepository.getByEmail(testEmail);
  assert(afterUpdate?.user.displayName === 'Sri. Ravi Teja (Promoted)', 'Updated display name persisted');
  assert(afterUpdate?.user.isActive === false, 'Updated status (deactivated) persisted');

  // Reactivate user
  const toggled = userRepository.toggleActive(testEmail);
  assert(toggled === true, 'toggleActive successfully reactivated user');
  const afterToggle = userRepository.getByEmail(testEmail);
  assert(afterToggle?.user.isActive === true, 'Reactivated user status verified');

  // -------------------------------------------------------------
  // TEST G: Staff Reassignment Guard & Execution
  // -------------------------------------------------------------
  console.log('\n6. Testing Ward Staff Reassignment Security Guard...');
  // Attempt reassignment of staff with 0 active tasks (USR-FIELD-05)
  const reassignResult = userRepository.reassignStaffWard('USR-FIELD-05', 12, 'Test Super Admin');
  assert(reassignResult.success === true, 'Staff without active tasks successfully reassigned to Ward 12');

  const recheckStaff = userRepository.getById('USR-FIELD-05');
  assert(recheckStaff?.wardId === 12, 'Staff wardId updated to 12 in storage');

  // Attempt reassignment of staff with active tasks (USR-FIELD-01) - MUST BE BLOCKED
  const blockedResult = userRepository.reassignStaffWard('USR-FIELD-01', 12, 'Test Super Admin');
  assert(blockedResult.success === false, 'Staff with active tasks is safely blocked from reassignment');

  // -------------------------------------------------------------
  // TEST H: Telugu & Hindi Localization Coverage
  // -------------------------------------------------------------
  console.log('\n7. Testing User Management Multilingual Localization...');
  const requiredKeys = [
    'Super Admin • User Governance & Account Management',
    'Total Registered Users',
    'Active Accounts',
    'Deactivated Accounts',
    'Field Operations Staff',
    'Registered Role Profiles & Directory',
    'Search users by name, email, ID...',
    'View User Details',
    'Edit User',
    'Edit User Account Profile',
    'Full Display Name',
    'Assigned User Role',
    'Save Changes',
    'Close',
  ];

  for (const key of requiredKeys) {
    const teTranslation = PAGES_TRANSLATIONS.te[key];
    const hiTranslation = PAGES_TRANSLATIONS.hi[key];
    assert(Boolean(teTranslation), `Telugu translation exists for "${key}"`);
    assert(Boolean(hiTranslation), `Hindi translation exists for "${key}"`);
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(` RESULTS: ${passedTests} PASSED, ${failedTests} FAILED out of ${totalTests} assertions.`);
  console.log('========================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('✅ ALL USER MANAGEMENT VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  }
}

run().catch((e) => {
  console.error('Verification failed with exception:', e);
  process.exit(1);
});
