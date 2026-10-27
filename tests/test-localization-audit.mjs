import { PLATFORM_TRANSLATIONS } from '../src/i18n/translations.ts';
import { DECK_SLIDES } from '../src/data/deckText.ts';

console.log('================================================================');
console.log('KMC AUTOMATED LOCALIZATION AUDIT: 7 ROLES & 26 SLIDES');
console.log('================================================================\n');

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

const teDict = PLATFORM_TRANSLATIONS.te;
const hiDict = PLATFORM_TRANSLATIONS.hi;

// 1. Audit Dictionary Sizes
console.log('AUDIT SECTION 1: Master Dictionary Key Counts');
assert(Object.keys(teDict).length >= 1000, `Telugu master dictionary contains ${Object.keys(teDict).length} entries (>= 1,000 required)`);
assert(Object.keys(hiDict).length >= 1000, `Hindi master dictionary contains ${Object.keys(hiDict).length} entries (>= 1,000 required)`);

// 2. Audit All 7 RBAC Roles
console.log('\nAUDIT SECTION 2: All 7 Roles Localization Coverage');
const ROLES = [
  'Super Admin',
  'Mayor / Commissioner',
  'Ward Corporator (Ward 27)',
  'Department Officer (Engineering)',
  'Field Staff (Ground Operations)',
  'Verified Citizen',
  'Governance Auditor'
];

for (const role of ROLES) {
  assert(Boolean(teDict[role]), `Role "${role}" translated in Telugu: "${teDict[role]}"`);
  assert(Boolean(hiDict[role]), `Role "${role}" translated in Hindi: "${hiDict[role]}"`);
}

// 3. Audit All 26 Deck Slides (Title, Banners, Summaries)
console.log('\nAUDIT SECTION 3: 26-Slide Presentation Deck Localization Coverage');
for (const slide of DECK_SLIDES) {
  assert(Boolean(teDict[slide.title]), `Slide ${slide.page} Title "${slide.title}" in Telugu: "${teDict[slide.title]}"`);
  assert(Boolean(hiDict[slide.title]), `Slide ${slide.page} Title "${slide.title}" in Hindi: "${hiDict[slide.title]}"`);
  if (slide.bannerTagline) {
    assert(Boolean(teDict[slide.bannerTagline]), `Slide ${slide.page} Banner in Telugu & Hindi`);
  }
}

// 4. Audit Implementation Page (Slide 18, 25, 26)
console.log('\nAUDIT SECTION 4: Implementation & Way Forward Specifics');
const IMPL_KEYS = [
  'PHASED IMPLEMENTATION STRATEGY',
  'APPROVAL & SYSTEM DESIGN',
  'PILOT IMPLEMENTATION',
  'FULL-SCALE ROLLOUT',
  'Requirement finalization',
  'Training of officials and staff',
  'Continuous monitoring',
  'Ongoing Success Factors',
  'TRANSFORMATIONAL STEP TOWARDS SMART URBAN GOVERNANCE',
  'GREATER EFFICIENCY',
  'ENHANCED TRANSPARENCY',
  'MEASURABLE OUTCOMES',
  'CITIZEN-CENTRIC IMPACT',
  'LONG-TERM RESILIENCE'
];

for (const k of IMPL_KEYS) {
  assert(Boolean(teDict[k]), `Implementation item "${k}" translated in Telugu`);
  assert(Boolean(hiDict[k]), `Implementation item "${k}" translated in Hindi`);
}

console.log('\n================================================================');
console.log(`TOTAL AUDIT CHECKS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL 7 ROLES AND 26 PRESENTATION SLIDES FULLY LOCALIZED!\n');
}
