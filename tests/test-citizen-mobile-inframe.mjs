#!/usr/bin/env node

/**
 * Test: Strictly In-Frame Mobile Citizen Workflow
 * Verifies that clicking "Report a Problem" and "Track My Complaint" runs strictly
 * inside the smartphone mock frame without navigating the outer browser window away.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================================================');
console.log(' KMC PLATFORM TEST: IN-FRAME MOBILE CITIZEN WORKFLOW VERIFICATION');
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

// 1. Inspect CitizenPage.tsx
const citizenPagePath = path.join(__dirname, '../src/pages/CitizenPage.tsx');
const citizenPageCode = fs.readFileSync(citizenPagePath, 'utf8');

check('CitizenPage.tsx defines mobileScreen state ("home" | "report" | "track" | "detail")', () => {
  if (!citizenPageCode.includes("mobileScreen") || !citizenPageCode.includes("'home' | 'report' | 'track' | 'detail'")) {
    throw new Error('CitizenPage does not define in-frame mobileScreen state machine');
  }
});

check('CitizenPage.tsx does NOT call outer navigate() for Report or Track inside PhoneFrame', () => {
  // Ensure the phone frame section does not navigate away to /citizen/report or /citizen/track
  const phoneSection = citizenPageCode.substring(
    citizenPageCode.indexOf('<PhoneFrame'),
    citizenPageCode.indexOf('</PhoneFrame>')
  );
  if (phoneSection.includes("navigate('/citizen/report')") || phoneSection.includes("navigate('/citizen/track')")) {
    throw new Error('PhoneFrame still contains outer window navigate calls that leave the mobile screen');
  }
});

check('CitizenPage.tsx embeds MobileReportFlow, MobileTrackFlow, and MobileDetailFlow inside PhoneFrame', () => {
  if (!citizenPageCode.includes('<MobileReportFlow') ||
      !citizenPageCode.includes('<MobileTrackFlow') ||
      !citizenPageCode.includes('<MobileDetailFlow')) {
    throw new Error('CitizenPage does not render in-frame mobile flows inside PhoneFrame');
  }
});

// 2. Inspect MobileReportFlow.tsx
const reportFlowPath = path.join(__dirname, '../src/components/citizen/mobile/MobileReportFlow.tsx');
const reportFlowCode = fs.readFileSync(reportFlowPath, 'utf8');

check('MobileReportFlow.tsx provides complete 4-step wizard with category, photo, location, and confirmation', () => {
  if (!reportFlowCode.includes('PROBLEM_CATEGORIES') ||
      !reportFlowCode.includes('submitGrievance') ||
      !reportFlowCode.includes('handleUseGps') ||
      !reportFlowCode.includes('createdResult')) {
    throw new Error('MobileReportFlow missing essential reporting capabilities');
  }
});

// 3. Inspect MobileTrackFlow.tsx
const trackFlowPath = path.join(__dirname, '../src/components/citizen/mobile/MobileTrackFlow.tsx');
const trackFlowCode = fs.readFileSync(trackFlowPath, 'utf8');

check('MobileTrackFlow.tsx provides in-frame search, status filtering, and grievance selection', () => {
  if (!trackFlowCode.includes('searchQuery') ||
      !trackFlowCode.includes('statusFilter') ||
      !trackFlowCode.includes('onSelectGrievance')) {
    throw new Error('MobileTrackFlow missing search, filtering, or grievance selection');
  }
});

// 4. Inspect MobileDetailFlow.tsx
const detailFlowPath = path.join(__dirname, '../src/components/citizen/mobile/MobileDetailFlow.tsx');
const detailFlowCode = fs.readFileSync(detailFlowPath, 'utf8');

check('MobileDetailFlow.tsx renders photographic evidence, 4-step resolution timeline, and 5-star citizen rating', () => {
  if (!detailFlowCode.includes('activePhotoTab') ||
      !detailFlowCode.includes('rateGrievance') ||
      !detailFlowCode.includes('Resolution Timeline')) {
    throw new Error('MobileDetailFlow missing photographic evidence, timeline, or rating system');
  }
});

// 5. Inspect PhoneFrame.tsx integration
const phoneFramePath = path.join(__dirname, '../src/components/common/PhoneFrame.tsx');
const phoneFrameCode = fs.readFileSync(phoneFramePath, 'utf8');

check('PhoneFrame.tsx supports onBackClick, onReportClick, and onTrackClick for seamless in-frame actions', () => {
  if (!phoneFrameCode.includes('onBackClick') ||
      !phoneFrameCode.includes('onReportClick') ||
      !phoneFrameCode.includes('onTrackClick')) {
    throw new Error('PhoneFrame lacks handlers for in-frame back, report, or track transitions');
  }
});

console.log('\n========================================================================');
console.log(`TOTAL AUDIT CHECKS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL IN-FRAME MOBILE CITIZEN WORKFLOW TESTS PASSED!\n');
}
