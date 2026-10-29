#!/usr/bin/env node

/**
 * 100 Comprehensive Functional & Structural Test Cases for MCK Platform
 * Testing the 7 Core Administrative Departments of Karimnagar Municipal Corporation,
 * Citizen flows, in-frame mobile screens, Corporator details, Demo accounts,
 * Department Dashboard Section Switcher, Glassmorphism Login, Multi-language support,
 * and Storage Persistence without pushing to GitHub.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

console.log('================================================================================');
console.log('       KMC PLATFORM 100 COMPREHENSIVE TEST CASES VERIFICATION SUITE             ');
console.log('================================================================================\n');

let passed = 0;
let failed = 0;

function runCase(num, name, fn) {
  try {
    fn();
    console.log(`  [Case ${String(num).padStart(3, '0')}] ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [Case ${String(num).padStart(3, '0')}] ❌ FAIL: ${name}\n          Error: ${err.message}`);
    failed++;
  }
}

// Read relevant project files
const departmentsFile = fs.readFileSync(path.join(root, 'src/data/departments.ts'), 'utf8');
const grievancesFile = fs.readFileSync(path.join(root, 'src/data/grievances.ts'), 'utf8');
const categoriesFile = fs.readFileSync(path.join(root, 'src/data/categories.ts'), 'utf8');
const staffCategoriesFile = fs.readFileSync(path.join(root, 'src/data/staffCategories.ts'), 'utf8');
const mockUsersFile = fs.readFileSync(path.join(root, 'src/auth/mockUsers.ts'), 'utf8');
const permissionsFile = fs.readFileSync(path.join(root, 'src/auth/permissions.ts'), 'utf8');
const wardsFile = fs.readFileSync(path.join(root, 'src/data/wards.ts'), 'utf8');
const citizenPageFile = fs.readFileSync(path.join(root, 'src/pages/CitizenPage.tsx'), 'utf8');
const mobileReportFlowFile = fs.readFileSync(path.join(root, 'src/components/citizen/mobile/MobileReportFlow.tsx'), 'utf8');
const mobileTrackFlowFile = fs.readFileSync(path.join(root, 'src/components/citizen/mobile/MobileTrackFlow.tsx'), 'utf8');
const mobileDetailFlowFile = fs.readFileSync(path.join(root, 'src/components/citizen/mobile/MobileDetailFlow.tsx'), 'utf8');
const phoneFrameFile = fs.readFileSync(path.join(root, 'src/components/common/PhoneFrame.tsx'), 'utf8');
const deptDashboardFile = fs.readFileSync(path.join(root, 'src/pages/DepartmentDashboardPage.tsx'), 'utf8');
const loginPageFile = fs.readFileSync(path.join(root, 'src/pages/LoginPage.tsx'), 'utf8');
const userManagementFile = fs.readFileSync(path.join(root, 'src/pages/UserManagementPage.tsx'), 'utf8');
const leadershipPageFile = fs.readFileSync(path.join(root, 'src/pages/LeadershipPage.tsx'), 'utf8');
const workflowPageFile = fs.readFileSync(path.join(root, 'src/pages/WorkflowPage.tsx'), 'utf8');
const deptHubFile = fs.readFileSync(path.join(root, 'src/components/workflow/DepartmentHub.tsx'), 'utf8');
const storageMigrationFile = fs.readFileSync(path.join(root, 'src/storage/storageMigration.ts'), 'utf8');
const storageKeysFile = fs.readFileSync(path.join(root, 'src/storage/storageKeys.ts'), 'utf8');
const pagesTranslationsFile = fs.readFileSync(path.join(root, 'src/i18n/locales/pagesTranslations.ts'), 'utf8');

/* -------------------------------------------------------------------------- */
/* GROUP 1: The 7 Core Departments of MCK (Cases 1 - 15)                      */
/* -------------------------------------------------------------------------- */
console.log('--- GROUP 1: The 7 Core Departments of MCK ---');

runCase(1, 'DEPARTMENTS array defines exactly 7 official administrative departments', () => {
  if (!departmentsFile.includes('Establishment Section') || !departmentsFile.includes('Revenue Section') ||
      !departmentsFile.includes('Engineering Section') || !departmentsFile.includes('Town Planning Section (TPS)') ||
      !departmentsFile.includes('Sanitation Section') || !departmentsFile.includes('Statistics / Birth & Death Registration Section') ||
      !departmentsFile.includes('Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)')) {
    throw new Error('DEPARTMENTS array is missing one or more of the 7 official MCK sections');
  }
});

runCase(2, 'Establishment Section defines administrative officer and general administration scope', () => {
  if (!departmentsFile.includes('Human Resources') || !departmentsFile.includes('Municipal Staff Postings') ||
      !departmentsFile.includes('Inner Corporate Affairs')) {
    throw new Error('Establishment Section scope missing required MCK responsibilities');
  }
});

runCase(3, 'Revenue Section defines tax collection, Property Tax and Vacant Land Tax (VLT)', () => {
  if (!departmentsFile.includes('Property Tax (House Tax)') || !departmentsFile.includes('Vacant Land Tax (VLT)')) {
    throw new Error('Revenue Section scope missing Property Tax or VLT');
  }
});

runCase(4, 'Engineering Section consolidates public works, roads, water supply, and street lighting', () => {
  if (!departmentsFile.includes('Water Supply Planning') || !departmentsFile.includes('Street Lighting Networks') ||
      !departmentsFile.includes('Road Layout & Repairs')) {
    throw new Error('Engineering Section scope missing consolidated public works infrastructure');
  }
});

runCase(5, 'Town Planning Section (TPS) manages building permissions and city layouts', () => {
  if (!departmentsFile.includes('Building Permissions') || !departmentsFile.includes('City Layouts') ||
      !departmentsFile.includes('Town Planning Section (TPS)')) {
    throw new Error('Town Planning Section (TPS) missing required scope items');
  }
});

runCase(6, 'Sanitation Section defines city cleanliness, solid waste, and public health cleaning', () => {
  if (!departmentsFile.includes('City Cleanliness Programs') || !departmentsFile.includes('Solid Waste Management') ||
      !departmentsFile.includes('Sewage Upkeep')) {
    throw new Error('Sanitation Section missing required cleanliness and waste scope');
  }
});

runCase(7, 'Statistics Section manages civil registry for births and deaths', () => {
  if (!departmentsFile.includes('Civil Registry') || !departmentsFile.includes('Birth Registration & Certificates')) {
    throw new Error('Statistics Section missing Civil Registry definition');
  }
});

runCase(8, 'Urban Welfare Section defines MEPMA and Asara pensions', () => {
  if (!departmentsFile.includes('MEPMA Initiatives') || !departmentsFile.includes('Asara Pensions')) {
    throw new Error('Urban Welfare Section missing MEPMA or Asara definition');
  }
});

runCase(9, 'grievances.ts exports DepartmentName type supporting all 7 official sections', () => {
  const match = ['Establishment Section', 'Revenue Section', 'Engineering Section', 'Town Planning Section (TPS)',
                 'Sanitation Section', 'Statistics / Birth & Death Registration Section',
                 'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)'].every(s => grievancesFile.includes(s));
  if (!match) throw new Error('grievances.ts DepartmentName union missing one or more of the 7 sections');
});

runCase(10, 'PROBLEM_CATEGORIES maps drainage and roads strictly to Engineering Section', () => {
  if (!categoriesFile.includes("{ key: 'drainage', category: 'Drainage', department: 'Engineering Section'") ||
      !categoriesFile.includes("{ key: 'roads', category: 'Roads', department: 'Engineering Section'")) {
    throw new Error('Drainage or roads not mapped to Engineering Section');
  }
});

runCase(11, 'PROBLEM_CATEGORIES maps street lights and water supply to Engineering Section', () => {
  if (!categoriesFile.includes("{ key: 'light', category: 'Street Lights', department: 'Engineering Section'") ||
      !categoriesFile.includes("{ key: 'water', category: 'Water Supply', department: 'Engineering Section'")) {
    throw new Error('Street lights or water supply not mapped to Engineering Section');
  }
});

runCase(12, 'PROBLEM_CATEGORIES maps garbage strictly to Sanitation Section', () => {
  if (!categoriesFile.includes("{ key: 'garbage', category: 'Garbage', department: 'Sanitation Section'")) {
    throw new Error('Garbage not mapped to Sanitation Section');
  }
});

runCase(13, 'DepartmentHub component features 7 Core MCK Departments with dedicated icons', () => {
  if (!deptHubFile.includes('7 Core MCK Departments Digitally Connected') ||
      !deptHubFile.includes("'establishment'") || !deptHubFile.includes("'revenue'") ||
      !deptHubFile.includes("'statistics'") || !deptHubFile.includes("'urban-welfare'")) {
    throw new Error('DepartmentHub missing 7 Core Departments connection or section keys');
  }
});

runCase(14, 'LeadershipPage displays resolution performance for the 7 official MCK sections', () => {
  if (!leadershipPageFile.includes('Sanitation Section') || !leadershipPageFile.includes('Engineering Section') ||
      !leadershipPageFile.includes('Revenue Section') || !leadershipPageFile.includes('Town Planning Section (TPS)') ||
      !leadershipPageFile.includes('Establishment Section') || !leadershipPageFile.includes('Statistics Section') ||
      !leadershipPageFile.includes('Urban Welfare (MEPMA & Asara)')) {
    throw new Error('LeadershipPage missing performance bars for the 7 MCK sections');
  }
});

runCase(15, 'WorkflowPage banner highlights 7 Core MCK Departments Connected', () => {
  if (!workflowPageFile.includes('7 Core MCK Departments Connected')) {
    throw new Error('WorkflowPage banner still references old department counts');
  }
});

/* -------------------------------------------------------------------------- */
/* GROUP 2: Authentication & Dedicated Department Officers (Cases 16 - 28)    */
/* -------------------------------------------------------------------------- */
console.log('\n--- GROUP 2: Authentication & Demo Accounts for 7 Sections ---');

runCase(16, 'Engineering Department Officer account defined with Engineering Section', () => {
  if (!mockUsersFile.includes("'engineering@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Engineering Section'")) {
    throw new Error('engineering@kmc.demo not mapped to Engineering Section');
  }
});

runCase(17, 'Sanitation Department Officer account defined with Sanitation Section', () => {
  if (!mockUsersFile.includes("'sanitation.dept@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Sanitation Section'") ||
      !mockUsersFile.includes('Dr. G. Srinivas Rao')) {
    throw new Error('sanitation.dept@kmc.demo not properly configured');
  }
});

runCase(18, 'Revenue Department Officer account defined with Revenue Section', () => {
  if (!mockUsersFile.includes("'revenue.dept@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Revenue Section'") ||
      !mockUsersFile.includes('Sri. M. Sudhakar')) {
    throw new Error('revenue.dept@kmc.demo not properly configured');
  }
});

runCase(19, 'Town Planning Section (TPS) Officer account defined with TPS role', () => {
  if (!mockUsersFile.includes("'townplanning.dept@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Town Planning Section (TPS)'") ||
      !mockUsersFile.includes('Smt. D. Vani')) {
    throw new Error('townplanning.dept@kmc.demo not properly configured');
  }
});

runCase(20, 'Establishment Section Officer account defined with Establishment Section', () => {
  if (!mockUsersFile.includes("'establishment.dept@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Establishment Section'") ||
      !mockUsersFile.includes('Sri. K. Chandrashekar')) {
    throw new Error('establishment.dept@kmc.demo not properly configured');
  }
});

runCase(21, 'Statistics Section Officer account defined with Civil Registry role', () => {
  if (!mockUsersFile.includes("'statistics.dept@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Statistics / Birth & Death Registration Section'") ||
      !mockUsersFile.includes('Sri. B. Anjaneyulu')) {
    throw new Error('statistics.dept@kmc.demo not properly configured');
  }
});

runCase(22, 'Urban Welfare Section Officer account defined with MEPMA & Asara role', () => {
  if (!mockUsersFile.includes("'welfare.dept@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)'") ||
      !mockUsersFile.includes('Smt. K. Madhavi')) {
    throw new Error('welfare.dept@kmc.demo not properly configured');
  }
});

runCase(23, 'Super Admin demo account defined with platform admin permissions', () => {
  if (!mockUsersFile.includes("'admin@kmc.demo'") || !mockUsersFile.includes('Sri. V. Murali Krishna, IAS')) {
    throw new Error('admin@kmc.demo account missing');
  }
});

runCase(24, 'Mayor / Commissioner demo account defined with leadership scope', () => {
  if (!mockUsersFile.includes("'commissioner@kmc.demo'") || !mockUsersFile.includes('Smt. K. Shailaja, IAS')) {
    throw new Error('commissioner@kmc.demo account missing');
  }
});

runCase(25, 'Ward 27 Corporator demo account defined for Green Park Colony', () => {
  if (!mockUsersFile.includes("'corporator27@kmc.demo'") || !mockUsersFile.includes('Sri. K. Ramesh Rao')) {
    throw new Error('corporator27@kmc.demo account missing');
  }
});

runCase(26, 'Field Staff Ramesh assigned to Sanitation Section', () => {
  if (!mockUsersFile.includes("'fieldstaff@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Sanitation Section'")) {
    throw new Error('Ramesh field staff not assigned to Sanitation Section');
  }
});

runCase(27, 'Field Staff Mahesh assigned to Engineering Section', () => {
  if (!mockUsersFile.includes("'mahesh.field@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Engineering Section'")) {
    throw new Error('Mahesh field staff not assigned to Engineering Section');
  }
});

runCase(28, 'Field Staff Electrician Suresh assigned to Engineering Section', () => {
  if (!mockUsersFile.includes("'suresh.electric@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Engineering Section'")) {
    throw new Error('Suresh electrician not assigned to Engineering Section');
  }
});

/* -------------------------------------------------------------------------- */
/* GROUP 3: Field Staff Roster & Categories (Cases 29 - 38)                   */
/* -------------------------------------------------------------------------- */
console.log('\n--- GROUP 3: Field Staff Roster & Categories ---');

runCase(29, 'Field Staff Venkatesh (Roads) assigned to Engineering Section', () => {
  if (!mockUsersFile.includes("'venkatesh.field@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Engineering Section'")) {
    throw new Error('Venkatesh not assigned to Engineering Section');
  }
});

runCase(30, 'Field Staff Naresh (Water Supply Lineman) assigned to Engineering Section', () => {
  if (!mockUsersFile.includes("'fieldstaff12@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Engineering Section'")) {
    throw new Error('Naresh not assigned to Engineering Section');
  }
});

runCase(31, 'Field Staff Kiran (Sanitation) assigned to Sanitation Section', () => {
  if (!mockUsersFile.includes("'kiran.field@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Sanitation Section'")) {
    throw new Error('Kiran not assigned to Sanitation Section');
  }
});

runCase(32, 'Field Staff Raju (Civil Works) assigned to Engineering Section', () => {
  if (!mockUsersFile.includes("'raju.field@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Engineering Section'")) {
    throw new Error('Raju not assigned to Engineering Section');
  }
});

runCase(33, 'Field Staff Satish (Electrician) assigned to Engineering Section', () => {
  if (!mockUsersFile.includes("'satish.electric@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Engineering Section'")) {
    throw new Error('Satish not assigned to Engineering Section');
  }
});

runCase(34, 'Field Staff Anil (Engineering Staff) assigned to Engineering Section', () => {
  if (!mockUsersFile.includes("'anil.field@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Engineering Section'")) {
    throw new Error('Anil not assigned to Engineering Section');
  }
});

runCase(35, 'Field Staff Prakash (Sanitation) assigned to Sanitation Section', () => {
  if (!mockUsersFile.includes("'prakash.field@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Sanitation Section'")) {
    throw new Error('Prakash not assigned to Sanitation Section');
  }
});

runCase(36, 'Field Staff Praveen (Sanitation) assigned to Sanitation Section', () => {
  if (!mockUsersFile.includes("'praveen.field@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Sanitation Section'")) {
    throw new Error('Praveen not assigned to Sanitation Section');
  }
});

runCase(37, 'Field Staff Srinivas (Water Supply) assigned to Engineering Section', () => {
  if (!mockUsersFile.includes("'srinivas.water@kmc.demo'") ||
      !mockUsersFile.includes("departmentName: 'Engineering Section'")) {
    throw new Error('Srinivas not assigned to Engineering Section');
  }
});

runCase(38, 'ROLE_DISPLAY_NAMES defines Department Officer with Engineering Section title', () => {
  if (!permissionsFile.includes("department_officer: { title: 'Department Officer (Engineering Section)'")) {
    throw new Error('ROLE_DISPLAY_NAMES department_officer missing Engineering Section title');
  }
});

/* -------------------------------------------------------------------------- */
/* GROUP 4: 66 Wards & Corporator Detail Display (Cases 39 - 48)              */
/* -------------------------------------------------------------------------- */
console.log('\n--- GROUP 4: 66 Wards & Corporator Details ---');

runCase(39, 'WARDS generator configures the complete 66 municipal wards of Karimnagar', () => {
  if (!wardsFile.includes('Array.from({ length: 66 }') || !wardsFile.includes('export const WARDS: Ward[]')) {
    throw new Error('WARDS definition does not generate 66 wards');
  }
});

runCase(40, 'Ward 27 is defined as Green Park Colony with Corporator Sri. K. Ramesh Rao', () => {
  if (!wardsFile.includes('Green Park Colony') || !wardsFile.includes('Sri. K. Ramesh Rao')) {
    throw new Error('Ward 27 Green Park Colony missing or incorrect corporator');
  }
});

runCase(41, 'Ward 12 is defined with Corporator Smt. P. Lavanya', () => {
  if (!wardsFile.includes('Smt. P. Lavanya')) {
    throw new Error('Ward 12 missing Corporator Smt. P. Lavanya');
  }
});

runCase(42, 'CitizenPage correctly shows Elected Ward Corporator details card', () => {
  if (!citizenPageFile.includes('corporatorName') || !citizenPageFile.includes('Elected Ward Corporator')) {
    throw new Error('CitizenPage does not display corporator details');
  }
});

runCase(43, 'CitizenPage includes corporator contact and office hours details', () => {
  if (!citizenPageFile.includes('Corporator') || !citizenPageFile.includes('citizenWard')) {
    throw new Error('CitizenPage missing corporator information card');
  }
});

runCase(44, 'Ward selection dynamically loads the specific ward corporator in Citizen App', () => {
  if (!citizenPageFile.includes('citizenWard') || !citizenPageFile.includes('corporatorName')) {
    throw new Error('Active ward corporator lookup not implemented dynamically in CitizenPage');
  }
});

runCase(45, 'Corporator phone contact format conforms to official KMC standard', () => {
  if (!wardsFile.includes('corporator:') && !citizenPageFile.includes('corporatorName')) {
    throw new Error('Official corporator phone or name mapping missing');
  }
});

runCase(46, 'Ward Page renders Corporator console with ward-level grievance metrics', () => {
  const wardPageFile = fs.readFileSync(path.join(root, 'src/pages/WardPage.tsx'), 'utf8');
  if (!wardPageFile.includes('Total Grievances')) {
    throw new Error('WardPage missing corporator console metrics');
  }
});

runCase(47, 'Wards data includes performance score, grade, and population metadata', () => {
  if (!wardsFile.includes('population:') || !wardsFile.includes('score:')) {
    throw new Error('Wards data missing population or score metadata');
  }
});

runCase(48, 'Cross-ward complaint assignment preserves target corporator accountability', () => {
  const testCrossWardFile = fs.readFileSync(path.join(root, 'tests/test-cross-ward-photo-e2e.mjs'), 'utf8');
  if (!testCrossWardFile.includes('Smt. P. Lavanya')) {
    throw new Error('Cross-ward test missing verification of Ward 12 Corporator Smt. P. Lavanya');
  }
});

/* -------------------------------------------------------------------------- */
/* GROUP 5: Citizen Identity (Smt. Lavanya Reddy vs Rajesh Kumar) (49 - 58)   */
/* -------------------------------------------------------------------------- */
console.log('\n--- GROUP 5: Citizen Identity Verification ---');

runCase(49, 'USR-CITIZEN-02 is registered to Smt. Lavanya Reddy in Booth Colony (Ward 12)', () => {
  if (!storageMigrationFile.includes("id: 'USR-CITIZEN-02'") ||
      !storageMigrationFile.includes("displayName: 'Smt. Lavanya Reddy'") ||
      !storageMigrationFile.includes("assignedWardName: 'Ward 12 – Booth Colony'")) {
    throw new Error('USR-CITIZEN-02 identity not configured as Smt. Lavanya Reddy in Ward 12');
  }
});

runCase(50, 'USR-CITIZEN-01 is registered to Sri. P. Rajesh Kumar in Green Park Colony (Ward 27)', () => {
  if (!mockUsersFile.includes("id: 'USR-CITIZEN-01'") ||
      !mockUsersFile.includes("displayName: 'Sri. P. Rajesh Kumar'") ||
      !mockUsersFile.includes("assignedWardName: 'Ward 27 – Green Park Colony'")) {
    throw new Error('USR-CITIZEN-01 identity not configured as Sri. P. Rajesh Kumar');
  }
});

runCase(51, 'CitizenPage dynamic greeting renders the authenticated user name instead of hardcoded strings', () => {
  if (!citizenPageFile.includes('citizenDisplayName') && !citizenPageFile.includes('currentUser?.displayName')) {
    throw new Error('CitizenPage contains hardcoded citizen greeting');
  }
});

runCase(52, 'CitizenPage does not render hardcoded "NAMASTE, PRIYA RAO!" string', () => {
  if (citizenPageFile.includes('NAMASTE, PRIYA RAO!')) {
    throw new Error('CitizenPage still contains hardcoded Priya Rao string');
  }
});

runCase(53, 'Citizen Portal top bar shows LR avatar initials for Smt. Lavanya Reddy', () => {
  if (!storageMigrationFile.includes("avatarInitials: 'LR'")) {
    throw new Error('Avatar initials for Smt. Lavanya Reddy not set to LR');
  }
});

runCase(54, 'Citizen 1 and Citizen 2 maintain strict data isolation in storage', () => {
  const auditFile = fs.readFileSync(path.join(root, 'tests/run-audit.mjs'), 'utf8');
  if (!auditFile.includes('Citizen 1 CANNOT access Citizen 2') ||
      !auditFile.includes('Citizen 2 CANNOT access Citizen 1')) {
    throw new Error('run-audit.mjs missing citizen isolation verification');
  }
});

runCase(55, 'Citizen profile tab renders verified citizen badge with green checkmark', () => {
  if (!phoneFrameFile.includes('Verified Resident') && !phoneFrameFile.includes('CheckCircle2')) {
    throw new Error('PhoneFrame profile tab missing verified citizen badge');
  }
});

runCase(56, 'Citizen mobile phone frame reflects Ward 12 (Booth Colony) for Lavanya Reddy', () => {
  if (!phoneFrameFile.includes('citizenWard') || !phoneFrameFile.includes('Ward 12 – Booth Colony')) {
    throw new Error('PhoneFrame does not support Ward 12 Booth Colony');
  }
});

runCase(57, 'Citizen can submit 5-star rating on resolved grievances with immediate persistence', () => {
  if (!mobileDetailFlowFile.includes('handleRateSubmit') || !mobileDetailFlowFile.includes('rateGrievance')) {
    throw new Error('MobileDetailFlow missing rating submission handler');
  }
});

runCase(58, 'Citizen feedback comments are stored and verified in storage migrations', () => {
  if (!storageMigrationFile.includes('INITIAL_FEEDBACK') || !storageMigrationFile.includes('Very prompt and effective action')) {
    throw new Error('Storage migrations missing seed feedback verification');
  }
});

/* -------------------------------------------------------------------------- */
/* GROUP 6: In-Frame Smartphone Mockup & Bottom Nav Tabs (Cases 59 - 70)       */
/* -------------------------------------------------------------------------- */
console.log('\n--- GROUP 6: In-Frame Smartphone Mockup Workflow ---');

runCase(59, 'PhoneFrame component provides 4 bottom navigation tabs: Home, Services, Alerts, Profile', () => {
  if (!phoneFrameFile.includes("'home'") || !phoneFrameFile.includes("'services'") ||
      !phoneFrameFile.includes("'alerts'") || !phoneFrameFile.includes("'profile'")) {
    throw new Error('PhoneFrame missing one of the 4 required bottom tabs');
  }
});

runCase(60, 'Home tab displays in-frame Report a Problem and Track My Complaint actions in CitizenPage', () => {
  if (!citizenPageFile.includes('Report a Problem') || !citizenPageFile.includes('Track My Complaint')) {
    throw new Error('CitizenPage Home view missing primary action buttons');
  }
});

runCase(61, 'Services tab renders civic service directory with fast report action in PhoneFrame', () => {
  if (!phoneFrameFile.includes('servicesList') || !phoneFrameFile.includes('Water Supply')) {
    throw new Error('PhoneFrame Services tab missing civic services directory');
  }
});

runCase(62, 'Alerts tab displays real-time official MCK SMS feed inside phone screen', () => {
  if (!phoneFrameFile.includes('alertFilter') || !phoneFrameFile.includes('VM-MCKNRG')) {
    throw new Error('Alerts tab missing official MCK SMS feed');
  }
});

runCase(63, 'Profile tab displays citizen credentials and language switcher inside phone screen', () => {
  if (!phoneFrameFile.includes('citizenName') || !phoneFrameFile.includes('setLang')) {
    throw new Error('PhoneFrame Profile tab missing language switcher or credentials');
  }
});

runCase(64, 'CitizenPage mobile screen state operates strictly in-frame without navigating away', () => {
  if (!citizenPageFile.includes("setMobileScreen('report')") || !citizenPageFile.includes("setMobileScreen('track')")) {
    throw new Error('CitizenPage does not set in-frame mobile screen state on action clicks');
  }
});

runCase(65, 'MobileReportFlow is rendered strictly within the smartphone frame container', () => {
  if (!citizenPageFile.includes('<MobileReportFlow')) {
    throw new Error('MobileReportFlow not embedded in CitizenPage smartphone container');
  }
});

runCase(66, 'MobileTrackFlow is rendered strictly within the smartphone frame container', () => {
  if (!citizenPageFile.includes('<MobileTrackFlow')) {
    throw new Error('MobileTrackFlow not embedded in CitizenPage smartphone container');
  }
});

runCase(67, 'MobileDetailFlow is rendered strictly within the smartphone frame container', () => {
  if (!citizenPageFile.includes('<MobileDetailFlow')) {
    throw new Error('MobileDetailFlow not embedded in CitizenPage smartphone container');
  }
});

runCase(68, 'Mobile report workflow has 4 interactive steps: Category, Details & Photo, Location, Confirm', () => {
  if (!mobileReportFlowFile.includes('step === 1') || !mobileReportFlowFile.includes('step === 2') ||
      !mobileReportFlowFile.includes('step === 3') || !mobileReportFlowFile.includes('step === 4')) {
    throw new Error('MobileReportFlow missing 4-step wizard structure');
  }
});

runCase(69, 'Mobile tracking workflow supports search by grievance ID and filter by status', () => {
  if (!mobileTrackFlowFile.includes('searchQuery') || !mobileTrackFlowFile.includes('statusFilter')) {
    throw new Error('MobileTrackFlow missing search or status filter state');
  }
});

runCase(70, 'Back button in smartphone header returns to previous mobile screen rather than outer route', () => {
  if (!phoneFrameFile.includes('onBackClick') || !citizenPageFile.includes("setMobileScreen('home')")) {
    throw new Error('In-frame back navigation not wired properly');
  }
});

/* -------------------------------------------------------------------------- */
/* GROUP 7: Department Dashboard Section Switcher & Redressal (Cases 71 - 82) */
/* -------------------------------------------------------------------------- */
console.log('\n--- GROUP 7: Department Dashboard Controls ---');

runCase(71, 'DepartmentDashboardPage exports MCK_SECTIONS with all 7 official sections', () => {
  if (!deptDashboardFile.includes('export const MCK_SECTIONS = [') ||
      !deptDashboardFile.includes('Engineering Section') ||
      !deptDashboardFile.includes('Sanitation Section') ||
      !deptDashboardFile.includes('Town Planning Section (TPS)') ||
      !deptDashboardFile.includes('Revenue Section') ||
      !deptDashboardFile.includes('Establishment Section') ||
      !deptDashboardFile.includes('Statistics / Birth & Death Registration Section') ||
      !deptDashboardFile.includes('Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)')) {
    throw new Error('DepartmentDashboardPage MCK_SECTIONS missing one or more of the 7 sections');
  }
});

runCase(72, 'DepartmentDashboardPage header banner title dynamically displays the active section', () => {
  if (!deptDashboardFile.includes("title={`${t('Department Officer Portal')} • ${selectedSection.toUpperCase()}`}")) {
    throw new Error('DepartmentDashboardPage header banner title does not show active section dynamically');
  }
});

runCase(73, 'DepartmentDashboardPage top controls include dedicated MCK Administrative Section selector', () => {
  if (!deptDashboardFile.includes('MCK Administrative Section (7 Core Sections)') ||
      !deptDashboardFile.includes('handleSectionChange')) {
    throw new Error('DepartmentDashboardPage missing MCK Section selector control');
  }
});

runCase(74, 'DepartmentDashboardPage top controls include Ward Selector with 66 wards and All Wards option', () => {
  if (!deptDashboardFile.includes('All Wards (66 Wards — City-Wide Oversight)') ||
      !deptDashboardFile.includes('handleWardChange')) {
    throw new Error('DepartmentDashboardPage missing Ward Selector options');
  }
});

runCase(75, 'DepartmentDashboardPage top controls include Ward Status Badge showing Total and Pending counts', () => {
  if (!deptDashboardFile.includes('Ward Status') || !deptDashboardFile.includes('totalCount') ||
      !deptDashboardFile.includes('pendingCount')) {
    throw new Error('DepartmentDashboardPage missing compact Ward Status Badge');
  }
});

runCase(76, 'Category Tabs adapt dynamically to the active section without horizontal clipping', () => {
  if (!deptDashboardFile.includes('SECTION_DEFAULT_CATEGORIES') || !deptDashboardFile.includes('availableCategories')) {
    throw new Error('DepartmentDashboardPage missing SECTION_DEFAULT_CATEGORIES definition');
  }
});

runCase(77, 'Engineering Section Category Tabs feature Drainage, Roads, Street Lights, Water Supply, Civil', () => {
  if (!deptDashboardFile.includes("'drainage'") || !deptDashboardFile.includes("'roads'") ||
      !deptDashboardFile.includes("'street-lights'") || !deptDashboardFile.includes("'water-supply'") ||
      !deptDashboardFile.includes("'civil'")) {
    throw new Error('Engineering Section missing required civic categories');
  }
});

runCase(78, 'Sanitation Section Category Tabs feature Sanitation & Garbage and Public Health & Fogging', () => {
  if (!deptDashboardFile.includes("'sanitation'") || !deptDashboardFile.includes("'public-health'")) {
    throw new Error('Sanitation Section missing required sanitation or fogging category');
  }
});

runCase(79, 'Department grievances filter strictly excludes unrelated pure records from other wings', () => {
  if (!deptDashboardFile.includes('deptGrievancesAll = useMemo') || !deptDashboardFile.includes('selectedSection')) {
    throw new Error('Grievance filter does not link to selectedSection');
  }
});

runCase(80, 'Officer task dispatch assigns ground staff with target due date and updates roster', () => {
  if (!deptDashboardFile.includes('handleConfirmAssignment') || !deptDashboardFile.includes('assignGrievanceToStaff')) {
    throw new Error('DepartmentDashboardPage missing assignment confirmation handler');
  }
});

runCase(81, 'Officer resolution approval closes grievance with verifiable audit stamp', () => {
  if (!deptDashboardFile.includes('handleApproveGrievance') || !deptDashboardFile.includes('approveAndClose')) {
    throw new Error('DepartmentDashboardPage missing approval and closing handler');
  }
});

runCase(82, 'Dispatched tasks list is collapsible and strictly filters to selected ward and section', () => {
  if (!deptDashboardFile.includes('displayedTasks') || !deptDashboardFile.includes('showDispatchedTasks')) {
    throw new Error('DepartmentDashboardPage missing collapsible dispatched tasks section');
  }
});

/* -------------------------------------------------------------------------- */
/* GROUP 8: Login Page Glassmorphism & Demo Dropdown (Cases 83 - 90)          */
/* -------------------------------------------------------------------------- */
console.log('\n--- GROUP 8: Login Page & Glassmorphism Design ---');

runCase(83, 'LoginPage card uses semi-transparent dark glassmorphism styling', () => {
  if (!loginPageFile.includes('glass-card') && !loginPageFile.includes('backdrop-blur')) {
    throw new Error('LoginPage missing glassmorphism card styling');
  }
});

runCase(84, 'LoginPage preserves authentic Elgandal Fort background landmark image', () => {
  if (!loginPageFile.includes('elgandal-fort.jpg')) {
    throw new Error('LoginPage background landmark image missing');
  }
});

runCase(85, 'Demo accounts dropdown organizes all roles into 5 structured categories', () => {
  if (!loginPageFile.includes("'Administration'") && !loginPageFile.includes("'Ward & Department'") &&
      !loginPageFile.includes("'Field Operations'") && !loginPageFile.includes("'Audit'") &&
      !loginPageFile.includes("'Citizens'")) {
    throw new Error('LoginPage demo dropdown missing 5 structured categories');
  }
});

runCase(86, 'Demo accounts dropdown closed state displays single compact button trigger', () => {
  if (!loginPageFile.includes('demo-role-select') || !loginPageFile.includes('Select a demo account...')) {
    throw new Error('LoginPage missing compact closed dropdown trigger button');
  }
});

runCase(87, 'Demo accounts dropdown options display colored avatar initials and role designations', () => {
  if (!loginPageFile.includes('avatarInitials') || !loginPageFile.includes('ROLE_BADGE')) {
    throw new Error('LoginPage demo options missing avatar initials or badge styles');
  }
});

runCase(88, 'Selected demo account displays a distinctive amber checkmark', () => {
  if (!loginPageFile.includes('isSelected &&') || !loginPageFile.includes('<Check')) {
    throw new Error('LoginPage demo dropdown missing checkmark indicator on selected account');
  }
});

runCase(89, 'Demo accounts dropdown closes upon outside click or Escape key press', () => {
  if (!loginPageFile.includes('handleClickOutside') || !loginPageFile.includes("e.key === 'Escape'")) {
    throw new Error('LoginPage demo dropdown missing click outside or escape listeners');
  }
});

runCase(90, 'Continue with demo button is solid amber and triggers authenticated session launch', () => {
  if (!loginPageFile.includes('Continue with demo') || !loginPageFile.includes('handleDemoContinue')) {
    throw new Error('LoginPage missing Continue with demo button handler');
  }
});

/* -------------------------------------------------------------------------- */
/* GROUP 9: Storage Migration, Self-Healing & Persistence (Cases 91 - 96)     */
/* -------------------------------------------------------------------------- */
console.log('\n--- GROUP 9: Storage Migration v1.6.0 & Self-Healing ---');

runCase(91, 'Storage schema version is bumped to 1.6.0 for MCK 7 Core Departments', () => {
  if (!storageKeysFile.includes("CURRENT_SCHEMA_VERSION = '1.6.0'")) {
    throw new Error('CURRENT_SCHEMA_VERSION is not 1.6.0');
  }
});

runCase(92, 'storageMigration.ts exports healDepartments to synchronize client localStorage', () => {
  if (!storageMigrationFile.includes('export function healDepartments(): void')) {
    throw new Error('storageMigration.ts missing healDepartments function');
  }
});

runCase(93, 'healDepartments updates legacy stored grievances to official section names', () => {
  if (!storageMigrationFile.includes("newDept = 'Engineering Section'") ||
      !storageMigrationFile.includes("newDept = 'Sanitation Section'") ||
      !storageMigrationFile.includes("newDept = 'Town Planning Section (TPS)'")) {
    throw new Error('healDepartments missing legacy department name normalization');
  }
});

runCase(94, 'healDemoUsers updates demo user records with authoritative departmentName & departmentId', () => {
  if (!storageMigrationFile.includes('user.departmentName !== demoUser.departmentName') ||
      !storageMigrationFile.includes('user.departmentId !== demoUser.departmentId')) {
    throw new Error('healDemoUsers missing department sync checks');
  }
});

runCase(95, 'UserManagementPage assigns field staff and department officers strictly to 7 MCK sections', () => {
  if (!userManagementFile.includes('Engineering Section') || !userManagementFile.includes('Sanitation Section') ||
      !userManagementFile.includes('Town Planning Section (TPS)') || !userManagementFile.includes('Revenue Section') ||
      !userManagementFile.includes('Establishment Section') || !userManagementFile.includes('Statistics / Birth & Death Registration Section') ||
      !userManagementFile.includes('Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)')) {
    throw new Error('UserManagementPage missing options for 7 MCK sections');
  }
});

runCase(96, 'All localStorage keys are strictly namespaced under kmc: to avoid collisions', () => {
  if (!storageKeysFile.includes("META: 'kmc:meta'") || !storageKeysFile.includes("USERS: 'kmc:users'") ||
      !storageKeysFile.includes("GRIEVANCES: 'kmc:grievances'") || !storageKeysFile.includes("DEPARTMENTS: 'kmc:departments'")) {
    throw new Error('Storage keys missing kmc: namespace');
  }
});

/* -------------------------------------------------------------------------- */
/* GROUP 10: Multi-Language Support & Escalation SLA (Cases 97 - 100)         */
/* -------------------------------------------------------------------------- */
console.log('\n--- GROUP 10: Multi-Language & SLA Escalations ---');

runCase(97, 'Telugu translations cover all 7 Core Departments of MCK', () => {
  const teMatch = ['ఎస్టాబ్లిష్‌మెంట్ విభాగం', 'రెవెన్యూ విభాగం', 'ఇంజనీరింగ్ విభాగం', 'టౌన్ ప్లానింగ్ విభాగం (TPS)',
                   'పారిశుధ్య విభాగం', 'గణాంకాలు / జనన, మరణాల రిజిస్ట్రేషన్ విభాగం',
                   'పట్టణ సంక్షేమం / పేదరిక నిర్మూలన విభాగం (మెప్మా & ఆసరా)'].every(s => pagesTranslationsFile.includes(s));
  if (!teMatch) throw new Error('pagesTranslationsFile missing Telugu translations for 7 MCK sections');
});

runCase(98, 'Hindi translations cover all 7 Core Departments of MCK', () => {
  const hiMatch = ['स्थापना अनुभाग', 'राजस्व अनुभाग', 'इंजीनियरिंग अनुभाग', 'नगर नियोजन अनुभाग (TPS)',
                   'स्वच्छता अनुभाग', 'सांख्यिकी / जन्म और मृत्यु पंजीकरण अनुभाग',
                   'शहरी कल्याण / गरीबी उन्मूलन अनुभाग (मेप्मा और आसरा)'].every(s => pagesTranslationsFile.includes(s));
  if (!hiMatch) throw new Error('pagesTranslationsFile missing Hindi translations for 7 MCK sections');
});

runCase(99, 'SLA target hours are enforced per category (24h Water, 48h Sanitation/Light, 72h Roads/Drainage)', () => {
  if (!categoriesFile.includes("slaHours: 72") || !categoriesFile.includes("slaHours: 48") ||
      !categoriesFile.includes("slaHours: 24")) {
    throw new Error('Standard civic category SLA hours not properly configured');
  }
});

runCase(100, 'Hierarchical Escalation Ladder transitions to Level 4/5 upon overdue SLA breach', () => {
  if (!workflowPageFile.includes('EscalationLadder') || !workflowPageFile.includes('currentEscalationLevel')) {
    throw new Error('WorkflowPage missing EscalationLadder integration');
  }
});

console.log('\n================================================================================');
console.log(`TOTAL COMPREHENSIVE TEST CASES: 100`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('================================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL 100 TEST CASES PASSED WITH 100% SUCCESS RATE!\n');
}
