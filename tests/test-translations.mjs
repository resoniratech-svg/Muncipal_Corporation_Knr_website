import assert from 'node:assert';
import { PLATFORM_TRANSLATIONS } from '../src/i18n/translations.ts';

console.log('================================================================');
console.log('KMC LOCALIZATION COMPREHENSIVE AUTOMATED VERIFICATION SUITE');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function check(desc, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${desc}: ${err.message}`);
    failed++;
  }
}

// TEST 1: Dictionary Integrity
console.log('TEST 1: Localization Dictionary Completeness');
check('Telugu and Hindi dictionaries are defined', () => {
  assert(PLATFORM_TRANSLATIONS.te, 'Telugu dictionary must exist');
  assert(PLATFORM_TRANSLATIONS.hi, 'Hindi dictionary must exist');
  assert(Object.keys(PLATFORM_TRANSLATIONS.te).length >= 100, 'Telugu dictionary should have >= 100 entries');
  assert(Object.keys(PLATFORM_TRANSLATIONS.hi).length >= 100, 'Hindi dictionary should have >= 100 entries');
});

// TEST 2: Core Platform & Navigation Header
console.log('\nTEST 2: Core Platform & Navigation Localization');
const coreNavKeys = [
  'Karimnagar Municipal Corporation',
  'Digital Governance Platform',
  'Official Government Platform • Telangana State',
  'Overview',
  'Leadership',
  'Wards',
  'Departments',
  'Field Tasks',
  'Citizen App',
  'Performance',
  'Workflow',
  'Notifications',
  'Monitoring',
  'Roadmap',
  'User Management',
  'QA Checklist',
  'Sign In',
  'Sign out',
  'Select Ward',
  '26 Slides',
];

coreNavKeys.forEach((k) => {
  check(`Key "${k}" translated in Telugu & Hindi`, () => {
    assert(PLATFORM_TRANSLATIONS.te[k], `Missing Telugu for "${k}"`);
    assert(PLATFORM_TRANSLATIONS.hi[k], `Missing Hindi for "${k}"`);
  });
});

// TEST 3: Leadership Dashboard Keys (User Screenshots Resolution)
console.log('\nTEST 3: Leadership Dashboard Localization (Fixing Screenshot Gaps)');
const leadershipKeys = [
  '4.1 Tier 1: Leadership Dashboard',
  'A high-level command interface for policy oversight and administrative control',
  'Total Population',
  'TOTAL POPULATION',
  'Karimnagar City',
  'Total Wards',
  'TOTAL WARDS',
  'Administrative Divisions',
  '66 Administrative Divisions',
  'Total Complaints',
  'TOTAL COMPLAINTS',
  'Today',
  'In Progress',
  'IN PROGRESS',
  'Field Assignments',
  'Resolved',
  'RESOLVED',
  'Completed with Proof',
  'Resolution Rate',
  'RESOLUTION RATE',
  'Target: ≥ 85%',
  'Reopened by Citizens – Escalated',
  'Citizens said "Not solved". Each complaint moved one level up the escalation ladder.',
  'Recent Complaints',
  'Tap a complaint to see its before and after photos.',
  'All Wards',
  'All Wards (Search or select)',
];

leadershipKeys.forEach((k) => {
  check(`Leadership item "${k}" translated in Telugu & Hindi`, () => {
    assert(PLATFORM_TRANSLATIONS.te[k], `Missing Telugu for "${k}"`);
    assert(PLATFORM_TRANSLATIONS.hi[k], `Missing Hindi for "${k}"`);
  });
});

// TEST 4: Seed Grievance Descriptions & Ground Categories
console.log('\nTEST 4: Seed Complaint Descriptions & Dynamic Redressal Localization');
const seedComplaintKeys = [
  'Drain Overflow near main intersection',
  'Road potholes',
  'Drain water is overflowing on the road.',
  'Garbage heap not cleared for 3 days',
  'Three street lights not working',
  'Broken bench and dry grass in the colony park',
  'Water leakage on Road, Booth Colony',
  'Street Light Not Working on main stretch',
  'Water leakage',
  'Garbage not cleared',
  'Big pothole near the bus stop',
  'Drain blocked, bad smell',
  'Clean garbage at Santoshnagar',
  'Repair street light',
  'Desilt drain at Green Park Colony',
  'Fill potholes on SRR Thota Road',
  'Fix water leakage at Green Park Colony',
  'Repair water pipe leak on Booth Colony road',
];

seedComplaintKeys.forEach((k) => {
  check(`Seed item "${k}" localized in Telugu & Hindi`, () => {
    assert(PLATFORM_TRANSLATIONS.te[k], `Missing Telugu for "${k}"`);
    assert(PLATFORM_TRANSLATIONS.hi[k], `Missing Hindi for "${k}"`);
  });
});

// TEST 5: Specialized Field Staff Categories
console.log('\nTEST 5: Municipal Field Staff Categories Localization');
const categoryKeys = [
  'Electrician / Streetlight Technician',
  'Drainage Worker',
  'Sanitation Worker',
  'Road Repair Worker',
  'Water Supply Technician',
  'Public Health / Pest Control Worker',
  'Parks and Horticulture Worker',
  'Civil Maintenance Worker',
];

categoryKeys.forEach((k) => {
  check(`Staff category "${k}" localized in Telugu & Hindi`, () => {
    assert(PLATFORM_TRANSLATIONS.te[k], `Missing Telugu for "${k}"`);
    assert(PLATFORM_TRANSLATIONS.hi[k], `Missing Hindi for "${k}"`);
  });
});

// TEST 6: Login & Role Badges
console.log('\nTEST 6: Login & Demo Account Experience');
const loginKeys = [
  'Email or username',
  'Password',
  'Forgot password?',
  'Keep me signed in on this device',
  'Sign in',
  'Or continue with a demo role',
  'Super Admin',
  'Mayor / Commissioner',
  'Ward Corporator (Ward 27)',
  'Department Officer (Engineering)',
  'Field Staff (Ground Operations)',
  'Verified Citizen',
  'Governance Auditor',
];

loginKeys.forEach((k) => {
  check(`Login/Role item "${k}" localized in Telugu & Hindi`, () => {
    assert(PLATFORM_TRANSLATIONS.te[k], `Missing Telugu for "${k}"`);
    assert(PLATFORM_TRANSLATIONS.hi[k], `Missing Hindi for "${k}"`);
  });
});

console.log('\n================================================================');
console.log(`TOTAL LOCALIZATION CHECKS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
