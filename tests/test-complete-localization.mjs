import assert from 'node:assert';
import en from '../src/i18n/en.json' with { type: 'json' };
import te from '../src/i18n/te.json' with { type: 'json' };
import hi from '../src/i18n/hi.json' with { type: 'json' };
import { PLATFORM_TRANSLATIONS } from '../src/i18n/translations.ts';

console.log('========================================================================');
console.log(' KMC PLATFORM AUTOMATED TEST: COMPLETE APPLICATION-WIDE LOCALIZATION');
console.log('========================================================================\n');

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

// 1. Recursive helper to extract all dotted paths in JSON dictionaries
function getDottedKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys = keys.concat(getDottedKeys(v, fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys;
}

const enKeys = getDottedKeys(en);
const teKeys = new Set(getDottedKeys(te));
const hiKeys = new Set(getDottedKeys(hi));

console.log('SECTION 1: Dotted Keys Integrity Across en.json, te.json, hi.json');

check(`en.json has at least 80 keys (found ${enKeys.length})`, () => {
  assert(enKeys.length >= 80, `Expected >= 80 keys in en.json, found ${enKeys.length}`);
});

const missingInTe = enKeys.filter(k => !teKeys.has(k));
const missingInHi = enKeys.filter(k => !hiKeys.has(k));

check('All en.json keys are translated in te.json', () => {
  assert.strictEqual(missingInTe.length, 0, `Missing in te.json: ${missingInTe.join(', ')}`);
});

check('All en.json keys are translated in hi.json', () => {
  assert.strictEqual(missingInHi.length, 0, `Missing in hi.json: ${missingInHi.join(', ')}`);
});

// 2. Specific required keys mentioned in specification
console.log('\nSECTION 2: Specification Required Dotted Translation Keys');

const REQUIRED_SPEC_KEYS = [
  'qa.resolvedGrievances',
  'qa.open',
  'qa.reviewerChecked',
  'qa.assignmentDetails',
  'qa.beforePhoto',
  'qa.afterPhoto',
  'grievance.status.resolved',
  'grievance.status.pending',
  'staff.assign',
  'common.cancel',
  'common.save',
  'common.back',
];

REQUIRED_SPEC_KEYS.forEach(key => {
  check(`Key "${key}" exists in en, te, and hi`, () => {
    const getVal = (dict, path) => path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);
    const enVal = getVal(en, key);
    const teVal = getVal(te, key);
    const hiVal = getVal(hi, key);

    assert(enVal && typeof enVal === 'string', `en.json missing "${key}"`);
    assert(teVal && typeof teVal === 'string', `te.json missing "${key}"`);
    assert(hiVal && typeof hiVal === 'string', `hi.json missing "${key}"`);
  });
});

// 3. Governance Auditor & QA Inspection Screen Keys
console.log('\nSECTION 3: Governance Auditor Screen Complete Hindi & Telugu Coverage');

const QA_SCREEN_KEYS = [
  'Resolved Grievances Audit Matrix',
  'Resolved Issues',
  'Mark All Audited',
  'Reset',
  'Open',
  'Reviewer checked',
  'Before & After Photos Available',
  'Solved by',
  'Corporator',
  'Audited by {{reviewer}}',
  'Grievance Audit Detail',
  'Compliance QA — Resolved Grievance Audit',
  'Audit Grievance',
  'Return to QA Checklist',
  'Exit Inspection',
  'Photographic Evidence — Before & After Verification',
  'Work Execution Timestamps & Audit Trail',
  'SLA & Escalation Compliance',
  'Verified by Ward Corporator',
  'Authentic Before Photo (Citizen Upload)',
  'Authentic After Photo (Ground Staff Upload)',
];

QA_SCREEN_KEYS.forEach(key => {
  check(`QA Audit key "${key}" translated in Telugu & Hindi`, () => {
    assert(PLATFORM_TRANSLATIONS.te[key], `Missing Telugu translation for "${key}"`);
    assert(PLATFORM_TRANSLATIONS.hi[key], `Missing Hindi translation for "${key}"`);
  });
});

// 4. All 7 Portals & Roles
console.log('\nSECTION 4: All 7 User Roles Coverage');

const SEVEN_ROLES = [
  'Super Admin',
  'Mayor / Commissioner',
  'Ward Corporator (Ward 27)',
  'Department Officer (Engineering)',
  'Field Staff (Ground Operations)',
  'Verified Citizen',
  'Governance Auditor',
];

SEVEN_ROLES.forEach(role => {
  check(`Role "${role}" translated in Telugu & Hindi`, () => {
    assert(PLATFORM_TRANSLATIONS.te[role], `Missing Telugu translation for "${role}"`);
    assert(PLATFORM_TRANSLATIONS.hi[role], `Missing Hindi translation for "${role}"`);
  });
});

// 5. Dynamic Data, Statuses and Categories
console.log('\nSECTION 5: Dynamic Categories, Statuses, and Operational Workflow');

const DYNAMIC_WORKFLOW_KEYS = [
  'Pending',
  'In Progress',
  'Completed',
  'Resolved',
  'Overdue',
  'Reopened',
  'Drainage',
  'Roads',
  'Streetlights',
  'Sanitation',
  'Water Supply',
  'Garbage',
  'Public Health',
  'Town Planning',
  'Engineering',
  'Task ID & Description',
  'Assigned To',
  'Due Date',
  'Status',
  'Action',
  'Start Work',
  'Mark as Done & Upload Photo',
  'Submit as Done (Resolved)',
  'Approve & Resolve',
  'Send Back',
  'Stronger Wards. Efficient Services. Happier Citizens.',
];

DYNAMIC_WORKFLOW_KEYS.forEach(item => {
  check(`Workflow entity "${item}" translated in Telugu & Hindi`, () => {
    assert(PLATFORM_TRANSLATIONS.te[item], `Missing Telugu translation for "${item}"`);
    assert(PLATFORM_TRANSLATIONS.hi[item], `Missing Hindi translation for "${item}"`);
  });
});

console.log('\n========================================================================');
console.log(`TOTAL AUDIT CHECKS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 COMPLETE MULTI-LANGUAGE LOCALIZATION VERIFIED ACROSS EN, TE, HI!\n');
}
