import fs from 'fs';
import path from 'path';

console.log('========================================================================');
console.log(' KMC DIGITAL GOVERNANCE PLATFORM — IMAGE DISPLAY & PREVIEW AUDIT TEST  ');
console.log('========================================================================\n');

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

const rootDir = process.cwd();

// Test 1: FullImagePreview & FullImageModal component implementation
console.log('1. Checking Shared Reusable Component (FullImagePreview.tsx)...');
const previewPath = path.join(rootDir, 'src/components/common/FullImagePreview.tsx');
assert(fs.existsSync(previewPath), 'FullImagePreview.tsx exists');
const previewContent = fs.readFileSync(previewPath, 'utf8');

assert(previewContent.includes('export const FullImagePreview'), 'Exports FullImagePreview component');
assert(previewContent.includes('export const FullImageModal'), 'Exports FullImageModal component');
assert(previewContent.includes('object-contain'), 'Uses object-contain to prevent image cropping');
assert(previewContent.includes('bg-slate-950'), 'Uses neutral dark background for letterboxing');
assert(previewContent.includes('max-w-[95vw]'), 'Modal enforces max-w-[95vw] responsive boundary');
assert(previewContent.includes('max-h-[90vh]') || previewContent.includes('max-h-[92vh]'), 'Modal enforces max-h responsive boundary');
assert(previewContent.includes('document.body.style.overflow = \'hidden\''), 'Enforces body scroll locking on modal open');
assert(previewContent.includes('Escape'), 'Supports Escape key modal dismissal');
assert(previewContent.includes('e.stopPropagation()'), 'Prevents backdrop click from firing on modal content click');
assert(previewContent.includes('closeBtnRef.current?.focus()'), 'Enforces focus management on open');
assert(previewContent.includes('previouslyFocusedRef.current?.focus()'), 'Enforces focus restore on close');

// Test 2: Before & After comparison viewer
console.log('\n2. Checking BeforeAfterViewer.tsx...');
const viewerPath = path.join(rootDir, 'src/components/photos/BeforeAfterViewer.tsx');
assert(fs.existsSync(viewerPath), 'BeforeAfterViewer.tsx exists');
const viewerContent = fs.readFileSync(viewerPath, 'utf8');

assert(viewerContent.includes('PhotoLightbox') || viewerContent.includes('FullImageModal'), 'Integrates lightbox for click-to-zoom');
assert(viewerContent.includes('object-contain'), 'Before & After images use object-contain');
assert(viewerContent.includes('bg-slate-950'), 'Before & After images use neutral dark letterbox');
assert(viewerContent.includes('h-64 sm:h-72 md:h-80'), 'Before and After side-by-side containers use equal matching heights');
assert(viewerContent.includes('h-72 sm:h-80 md:h-96'), 'Interactive slider container provides standardized height');

// Test 3: Ward Corporator Verification screens
console.log('\n3. Checking Ward Corporator Components...');
const beforeAfterCardPath = path.join(rootDir, 'src/components/ward/BeforeAfterCard.tsx');
const cardContent = fs.readFileSync(beforeAfterCardPath, 'utf8');
assert(cardContent.includes('FullImagePreview'), 'BeforeAfterCard uses FullImagePreview');
assert(!cardContent.includes('h-28 object-cover'), 'BeforeAfterCard removed cropped h-28 object-cover');

const wardWorkflowPath = path.join(rootDir, 'src/components/ward/WardWorkflow.tsx');
const workflowContent = fs.readFileSync(wardWorkflowPath, 'utf8');
assert(workflowContent.includes('FullImagePreview'), 'WardWorkflow uses FullImagePreview');

const wardPagePath = path.join(rootDir, 'src/pages/WardPage.tsx');
const wardPageContent = fs.readFileSync(wardPagePath, 'utf8');
assert(wardPageContent.includes('FullImagePreview'), 'WardPage uses FullImagePreview');

// Test 4: Common and Photo Lightbox Components
console.log('\n4. Checking EvidencePhotoModal and PhotoLightbox...');
const evidenceModalPath = path.join(rootDir, 'src/components/common/EvidencePhotoModal.tsx');
const evidenceContent = fs.readFileSync(evidenceModalPath, 'utf8');
assert(evidenceContent.includes('FullImageModal'), 'EvidencePhotoModal imports FullImageModal');
assert(evidenceContent.includes('object-contain'), 'PhotoThumbnail uses object-contain');
assert(evidenceContent.includes('bg-slate-950'), 'PhotoThumbnail uses bg-slate-950 neutral background');

const photoLightboxPath = path.join(rootDir, 'src/components/photos/PhotoLightbox.tsx');
const lightboxContent = fs.readFileSync(photoLightboxPath, 'utf8');
assert(lightboxContent.includes('FullImageModal'), 'PhotoLightbox delegates to FullImageModal');

// Test 5: Field Staff Task Details and Portal
console.log('\n5. Checking Field Staff Portal...');
const fieldStaffPath = path.join(rootDir, 'src/pages/FieldStaffTasksPage.tsx');
const fieldStaffContent = fs.readFileSync(fieldStaffPath, 'utf8');
assert(fieldStaffContent.includes('FullImagePreview'), 'FieldStaffTasksPage uses FullImagePreview');
assert(fieldStaffContent.includes('before[0].src'), 'FieldStaffTasksPage provides full preview of citizen before photo');
assert(!fieldStaffContent.includes('h-56 object-cover'), 'Removed cropped h-56 object-cover from FieldStaffTasksPage');

// Test 6: Citizen Portal (Detail, Track, Report Wizard, Info Pages, Form)
console.log('\n6. Checking Citizen Portal Screens...');
const complaintDetailPath = path.join(rootDir, 'src/pages/citizen/ComplaintDetail.tsx');
const complaintDetailContent = fs.readFileSync(complaintDetailPath, 'utf8');
assert(complaintDetailContent.includes('FullImagePreview'), 'ComplaintDetail uses FullImagePreview');

const trackComplaintsPath = path.join(rootDir, 'src/pages/citizen/TrackComplaints.tsx');
const trackComplaintsContent = fs.readFileSync(trackComplaintsPath, 'utf8');
assert(trackComplaintsContent.includes('object-contain'), 'TrackComplaints uses object-contain');
assert(trackComplaintsContent.includes('bg-slate-950'), 'TrackComplaints uses neutral background');

const reportWizardPath = path.join(rootDir, 'src/pages/citizen/ReportWizard.tsx');
const reportWizardContent = fs.readFileSync(reportWizardPath, 'utf8');
assert(reportWizardContent.includes('FullImagePreview'), 'ReportWizard uses FullImagePreview');

const citizenInfoPath = path.join(rootDir, 'src/pages/citizen/CitizenInfoPages.tsx');
const citizenInfoContent = fs.readFileSync(citizenInfoPath, 'utf8');
assert(citizenInfoContent.includes('object-contain'), 'CitizenInfoPages uses object-contain');
assert(citizenInfoContent.includes('bg-slate-950'), 'CitizenInfoPages uses neutral dark background');

const grievanceFormPath = path.join(rootDir, 'src/components/citizen/GrievanceForm.tsx');
const grievanceFormContent = fs.readFileSync(grievanceFormPath, 'utf8');
assert(grievanceFormContent.includes('FullImagePreview'), 'GrievanceForm uses FullImagePreview');

// Test 7: Leadership, Department Dashboard, Demo Home, Presentation
console.log('\n7. Checking Leadership, Department & Landing Screens...');
const complaintsPanelPath = path.join(rootDir, 'src/components/leadership/ComplaintsPanel.tsx');
const complaintsPanelContent = fs.readFileSync(complaintsPanelPath, 'utf8');
assert(complaintsPanelContent.includes('object-contain'), 'ComplaintsPanel uses object-contain');

const deptDashboardPath = path.join(rootDir, 'src/pages/DepartmentDashboardPage.tsx');
const deptDashboardContent = fs.readFileSync(deptDashboardPath, 'utf8');
assert(deptDashboardContent.includes('FullImagePreview'), 'DepartmentDashboardPage uses FullImagePreview for assets');

const demoHomePath = path.join(rootDir, 'src/pages/DemoHome.tsx');
const demoHomeContent = fs.readFileSync(demoHomePath, 'utf8');
assert(demoHomeContent.includes('FullImageModal'), 'DemoHome uses FullImageModal for landmark previews');

const presentationPath = path.join(rootDir, 'src/pages/PresentationPage.tsx');
const presentationContent = fs.readFileSync(presentationPath, 'utf8');
assert(presentationContent.includes('FullImageModal'), 'PresentationPage uses FullImageModal for infrastructure photos');
assert(presentationContent.includes('object-contain'), 'PresentationPage spotlight uses object-contain');

// Test 8: Photo Picker Upload Flow
console.log('\n8. Checking Photo Picker Component...');
const photoPickerPath = path.join(rootDir, 'src/components/photos/PhotoPicker.tsx');
const photoPickerContent = fs.readFileSync(photoPickerPath, 'utf8');
assert(photoPickerContent.includes('FullImagePreview'), 'PhotoPicker uses FullImagePreview');
assert(photoPickerContent.includes('bg-slate-950'), 'PhotoPicker uses neutral letterbox container');

console.log('\n========================================================================');
console.log(` RESULTS: ${passedTests} PASSED, ${failedTests} FAILED out of ${totalTests} assertions.`);
console.log('========================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('✅ ALL IMAGE DISPLAY & PREVIEW AUDIT TESTS PASSED SUCCESSFULLY!\n');
}
