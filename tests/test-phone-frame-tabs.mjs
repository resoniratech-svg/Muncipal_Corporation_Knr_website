import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================================================');
console.log(' KMC PLATFORM TEST: PHONE FRAME BOTTOM TABS (HOME, SERVICES, ALERTS, PROFILE)');
console.log('========================================================================\n');

const phoneFramePath = path.join(__dirname, '../src/components/common/PhoneFrame.tsx');
const phoneFrameContent = fs.readFileSync(phoneFramePath, 'utf8');

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

// 1. All 4 Bottom Buttons Present
check('PhoneFrame has 4 bottom tabs (Home, Services, Alerts, Profile)', () => {
  assert(phoneFrameContent.includes("handleTabClick('home')"), 'Missing Home tab click handler');
  assert(phoneFrameContent.includes("handleTabClick('services')"), 'Missing Services tab click handler');
  assert(phoneFrameContent.includes("handleTabClick('alerts')"), 'Missing Alerts tab click handler');
  assert(phoneFrameContent.includes("handleTabClick('profile')"), 'Missing Profile tab click handler');
});

// 2. Home Tab Content
check('Home tab displays children view (Report a Problem, Track, and SMS Feed)', () => {
  assert(phoneFrameContent.includes("currentTab === 'home'"), 'Missing Home tab conditional rendering');
  assert(phoneFrameContent.includes('{children}'), 'Missing children rendering in Home tab');
});

// 3. Services Tab Content
check('Services tab provides searchable civic categories and fast report action', () => {
  assert(phoneFrameContent.includes("currentTab === 'services'"), 'Missing Services tab conditional rendering');
  assert(phoneFrameContent.includes('Water Supply'), 'Missing Water Supply in services list');
  assert(phoneFrameContent.includes('Streetlights'), 'Missing Streetlights in services list');
  assert(phoneFrameContent.includes('Sanitation'), 'Missing Sanitation in services list');
  assert(phoneFrameContent.includes('Drainage'), 'Missing Drainage in services list');
  assert(phoneFrameContent.includes('Roads'), 'Missing Roads in services list');
  assert(phoneFrameContent.includes('Town Planning'), 'Missing Town Planning in services list');
});

// 4. Alerts Tab Content
check('Alerts tab displays real-time grievance timeline updates and ward notices', () => {
  assert(phoneFrameContent.includes("currentTab === 'alerts'"), 'Missing Alerts tab conditional rendering');
  assert(phoneFrameContent.includes('Grievance #GRV2024-00234 Resolved'), 'Missing resolved alert');
  assert(phoneFrameContent.includes('Ward 27 Drinking Water Supply'), 'Missing ward water notice alert');
  assert(phoneFrameContent.includes('alertFilter'), 'Missing filter support in alerts');
});

// 5. Profile Tab Content
check('Profile tab displays verified citizen badge, language switcher, and account details', () => {
  assert(phoneFrameContent.includes("currentTab === 'profile'"), 'Missing Profile tab conditional rendering');
  assert(phoneFrameContent.includes('Verified Citizen'), 'Missing verified citizen badge');
  assert(phoneFrameContent.includes('setLang'), 'Missing language switcher in profile');
  assert(phoneFrameContent.includes('logout'), 'Missing sign out handler in profile');
});

console.log('\n========================================================================');
console.log(`TOTAL AUDIT CHECKS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL PHONE FRAME TAB TESTS PASSED!\n');
}
