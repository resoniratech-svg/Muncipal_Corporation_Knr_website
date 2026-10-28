import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================================================');
console.log(' KMC PLATFORM TEST: LOGIN PAGE REDESIGN & FUNCTIONAL INTEGRITY');
console.log('========================================================================\n');

const loginPagePath = path.join(__dirname, '../src/pages/LoginPage.tsx');
const loginPageContent = fs.readFileSync(loginPagePath, 'utf8');

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

// 1. Structure: Clean, Centered Card
check('Login card has centered container with max-w-[440px]', () => {
  assert(loginPageContent.includes('max-w-[440px]'), 'Missing max-w-[440px] centered card');
  assert(loginPageContent.includes('flex items-center justify-center'), 'Missing vertical/horizontal centering');
});

// 2. Removal of Clutter
check('Promotional tier cards and heavy side panels are removed', () => {
  assert(!loginPageContent.includes('TIERS ='), 'TIERS array should be removed from login page');
  assert(!loginPageContent.includes('glass-panel-intro'), 'Promotional intro panel should be removed');
  assert(!loginPageContent.includes('grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]'), 'Two-column split with promotional left section should be removed');
});

// 3. Compact Demo Dropdown & Continue Button
check('Demo roles replaced with a compact dropdown selector', () => {
  assert(loginPageContent.includes('id="demo-role-select"'), 'Missing demo-role-select dropdown');
  assert(loginPageContent.includes('Try a demo account'), 'Missing "Try a demo account" label');
  assert(loginPageContent.includes('Select a demo account...'), 'Missing "Select a demo account..." default option');
  assert(loginPageContent.includes('Continue with demo'), 'Missing "Continue with demo" button');
});

// 4. Sign-Up Link & Policy Guidance
check('Sign-up link provided without exposing public backdoor registration', () => {
  assert(loginPageContent.includes("Don't have an account?"), 'Missing "Don\'t have an account?" prompt');
  assert(loginPageContent.includes('Municipal Account Registration'), 'Missing official registration guidance modal');
  assert(loginPageContent.includes('setSignUpModalOpen'), 'Missing modal handler for sign up');
});

// 5. Help Button & Municipal Support
check('Unobtrusive Help button and support guidance present', () => {
  assert(loginPageContent.includes('setHelpModalOpen'), 'Missing Help modal handler');
  assert(loginPageContent.includes('1800-425-4140'), 'Toll-free municipal helpline missing');
  assert(loginPageContent.includes('0878-2243444'), 'Control room number missing');
});

// 6. Preservation of Core Authentication & Features
check('Preserves login, password toggle, forgot password and remember me', () => {
  assert(loginPageContent.includes('showPassword ?'), 'Missing password visibility toggle');
  assert(loginPageContent.includes('setForgotPasswordOpen'), 'Missing forgot password functionality');
  assert(loginPageContent.includes('rememberMe'), 'Missing remember me state');
  assert(loginPageContent.includes('signIn(username, password)'), 'Missing primary sign in action');
});

// 7. Background Landmark Photo
check('Preserves Elgandal Fort background landmark photo with overlay', () => {
  assert(loginPageContent.includes('landmarks/elgandal-fort.jpg'), 'Missing Elgandal Fort background photo');
  assert(loginPageContent.includes('bg-slate-950/'), 'Missing subtle dark overlay');
});

// 8. Custom Dropdown Architecture & Logical Grouping
check('Organizes demo accounts into 5 logical categories with group headers', () => {
  assert(loginPageContent.includes("'Administration'"), 'Missing Administration group');
  assert(loginPageContent.includes("'Ward & Department'"), 'Missing Ward & Department group');
  assert(loginPageContent.includes("'Field Operations'"), 'Missing Field Operations group');
  assert(loginPageContent.includes("'Audit'"), 'Missing Audit group');
  assert(loginPageContent.includes("'Citizens'"), 'Missing Citizens group');
});

// 9. Custom Dropdown UI Styling & Interaction
check('Custom dropdown has role badges, checkmark, and keyboard/click-outside support', () => {
  assert(loginPageContent.includes('ROLE_BADGE'), 'Missing role badge colors');
  assert(loginPageContent.includes('avatarInitials'), 'Missing user avatar initials in dropdown');
  assert(loginPageContent.includes('max-h-[300px]'), 'Missing max height constraint on options panel');
  assert(loginPageContent.includes('handleClickOutside'), 'Missing click-outside handler');
  assert(loginPageContent.includes('handleButtonKeyDown'), 'Missing keyboard navigation handler');
  assert(loginPageContent.includes('Check className='), 'Missing selected account checkmark');
});

// 10. Transparent Glassmorphism Treatment
check('Uses transparent glassmorphism utilities for card and controls', () => {
  assert(loginPageContent.includes('glass-card-main'), 'Missing glass-card-main on login card');
  assert(loginPageContent.includes('glass-form-input'), 'Missing glass-form-input on text inputs');
  assert(loginPageContent.includes('glass-control-btn'), 'Missing glass-control-btn on dropdown and buttons');
});

console.log('\n========================================================================');
console.log(`TOTAL AUDIT CHECKS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL LOGIN PAGE REDESIGN TESTS PASSED!\n');
}
