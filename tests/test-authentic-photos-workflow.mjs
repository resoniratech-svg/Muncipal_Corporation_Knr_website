import { createServer } from 'vite';

// Mock browser localStorage for Node testing environment
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
  console.log(' KMC DIGITAL GOVERNANCE PLATFORM — AUTHENTIC PHOTOS WORKFLOW TEST');
  console.log('========================================================================\n');

  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  const { initializeStorage } = await server.ssrLoadModule('./src/storage/storageMigration.ts');
  const { grievanceRepository } = await server.ssrLoadModule('./src/storage/repositories/grievanceRepository.ts');
  const { taskRepository } = await server.ssrLoadModule('./src/storage/repositories/taskRepository.ts');
  const { wardRepository } = await server.ssrLoadModule('./src/storage/repositories/wardRepository.ts');
  const { auditRepository } = await server.ssrLoadModule('./src/storage/repositories/auditRepository.ts');
  const { resolvePhoto, DEMO_PHOTOS } = await server.ssrLoadModule('./src/photos/photoStore.ts');
  const { getBeforePhotos, getAfterPhotos, isPhotoSource } = await server.ssrLoadModule('./src/data/grievances.ts');

  // Test 1: Zero Cartoon Illustrations
  console.log('1. Verifying Zero Cartoon SVGs in Photo Store & Seed Grievances...');
  for (const [key, path] of Object.entries(DEMO_PHOTOS)) {
    assert(!path.endsWith('.svg'), `DEMO_PHOTOS[${key}] is a genuine photo (${path}), not an SVG illustration`);
  }

  initializeStorage(true);
  const grievances = grievanceRepository.getAll();
  const cartoonSvgCount = grievances.filter(g =>
    (g.beforePhoto && g.beforePhoto.includes('.svg')) ||
    (g.afterPhoto && g.afterPhoto.includes('.svg'))
  ).length;
  assert(cartoonSvgCount === 0, 'Zero stored grievances contain .svg illustration evidence');

  // Verify all pre-seeded resolved grievances resolve to authentic JPG/PNG photos
  const resolvedPreSeeded = grievances.filter(g => g.status === 'Resolved');
  assert(resolvedPreSeeded.length >= 6, `At least 6 resolved grievances pre-seeded (found ${resolvedPreSeeded.length})`);
  for (const g of resolvedPreSeeded) {
    const beforeSrc = resolvePhoto(getBeforePhotos(g)[0]?.src);
    const afterSrc = resolvePhoto(getAfterPhotos(g)[0]?.src);
    assert(beforeSrc.includes('.jpg') || beforeSrc.includes('.png'), `${g.id} before photo resolves to authentic photo: ${beforeSrc}`);
    assert(afterSrc.includes('.jpg') || afterSrc.includes('.png'), `${g.id} after photo resolves to authentic photo: ${afterSrc}`);
    assert(beforeSrc !== afterSrc, `${g.id} before and after photos are distinct independent sources`);
  }

  // Test A: Citizen Grievance Submission with Authentic Photo
  console.log('\n2. Test A: Citizen Upload of Authentic Photo...');
  const citizenPhotoData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
  const createdG1 = grievanceRepository.create({
    citizenId: 'USR-CITIZEN-01',
    category: 'Drainage Issue',
    department: 'Engineering',
    location: 'Main Road, Ward 27',
    description: 'Blocked drain chamber near corner shop',
    wardId: 27,
    slaHours: 48,
    beforePhoto: citizenPhotoData,
    latitude: 17.9860,
    longitude: 79.1188,
  }, 'Sri. P. Rajesh Kumar');

  assert(!!createdG1.id, `Grievance 1 registered with ID: ${createdG1.id}`);
  assert(createdG1.beforePhoto === citizenPhotoData, 'Citizen uploaded photograph saved in grievance record');
  assert(getBeforePhotos(createdG1)[0].src === citizenPhotoData, 'getBeforePhotos returns citizen uploaded photograph');
  assert(getAfterPhotos(createdG1).length === 0, 'After photo is initially empty for new complaint');

  // Test B: Field Staff Task Completion with Different Authentic Photo
  console.log('\n3. Test B: Field Staff Upload of Work Completion Photo...');
  const task1 = taskRepository.create({
    task: `${createdG1.category}: ${createdG1.description}`,
    assignedTo: 'Mahesh (Field Staff)',
    role: 'Field Staff',
    dueDate: 'Tomorrow, 05:00 PM',
    status: 'In Progress',
    wardId: 27,
    grievanceId: createdG1.id,
  });

  const completionPhotoData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=COMPLETION_PHOTO';
  const afterEvidence = [{
    src: completionPhotoData,
    takenAt: '27 May 2024, 02:30 PM',
    lat: 17.9860,
    lng: 79.1188,
    location: 'Main Road, Ward 27',
  }];

  taskRepository.updateStatus(task1.id, 'Completed', 'Chamber desilted and concrete slab secured.', completionPhotoData);
  grievanceRepository.updateStatus(createdG1.id, 'Completed', 'After photo uploaded by Mahesh (Field Staff)', 'Mahesh (Field Staff)', {
    afterPhotos: afterEvidence,
    afterPhoto: completionPhotoData,
    timelineTitle: 'Work Completed – Waiting for Verification',
    timelinePhoto: completionPhotoData,
  });

  const updatedG1 = grievanceRepository.getById(createdG1.id);
  assert(updatedG1.status === 'Completed', 'Grievance transitioned to Completed');
  assert(updatedG1.afterPhoto === completionPhotoData, 'Completion photograph stored separately in grievance');
  assert(updatedG1.beforePhoto !== updatedG1.afterPhoto, 'Before and after photos remain distinct independent sources');

  // Test C: Corporator Approval and Inclusion in Fixed Gallery
  console.log('\n4. Test C: Corporator Approval & Inclusion in Fixed Problems Gallery...');
  grievanceRepository.updateStatus(createdG1.id, 'Resolved', 'Verified and approved by Ward 27 Corporator', 'Sri. K. Ramesh Rao');
  const resolvedG1 = grievanceRepository.getById(createdG1.id);
  assert(resolvedG1.status === 'Resolved', 'Grievance verified and approved as Resolved');

  // Filter criteria used by ResolvedGallery in CitizenInfoPages.tsx
  const fixedGalleryItems = grievanceRepository.getAll().filter(g =>
    g.status === 'Resolved' && getBeforePhotos(g).length && getAfterPhotos(g).length
  );
  assert(fixedGalleryItems.some(g => g.id === createdG1.id), 'Newly resolved grievance appears in Fixed Problems Gallery');

  // Test D: Correct Association (Two Grievances with Different Photos)
  console.log('\n5. Test D: Correct Grievance Photo Association...');
  const photoG2Before = 'data:image/jpeg;base64,/9j/ROAD_DAMAGE_BEFORE_PHOTO_G2';
  const photoG2After = 'data:image/jpeg;base64,/9j/ROAD_RESURFACED_AFTER_PHOTO_G2';
  const createdG2 = grievanceRepository.create({
    citizenId: 'USR-CITIZEN-01',
    category: 'Roads',
    department: 'Engineering',
    location: 'Ambedkar Circle, Ward 27',
    description: 'Deep road potholes',
    wardId: 27,
    slaHours: 72,
    beforePhoto: photoG2Before,
  }, 'Sri. P. Rajesh Kumar');

  grievanceRepository.updateStatus(createdG2.id, 'Resolved', 'Road resurfaced and approved', 'Sri. K. Ramesh Rao', {
    afterPhoto: photoG2After,
    afterPhotos: [{ src: photoG2After, takenAt: '27 May 2024, 05:00 PM', lat: 17.989, lng: 79.120, location: 'Ambedkar Circle' }],
  });

  const g1Item = grievanceRepository.getById(createdG1.id);
  const g2Item = grievanceRepository.getById(createdG2.id);
  assert(getBeforePhotos(g1Item)[0].src === citizenPhotoData, 'Grievance 1 retains its own before photo');
  assert(getAfterPhotos(g1Item)[0].src === completionPhotoData, 'Grievance 1 retains its own after photo');
  assert(getBeforePhotos(g2Item)[0].src === photoG2Before, 'Grievance 2 retains its own before photo');
  assert(getAfterPhotos(g2Item)[0].src === photoG2After, 'Grievance 2 retains its own after photo');
  assert(getBeforePhotos(g1Item)[0].src !== getBeforePhotos(g2Item)[0].src, 'Grievance 1 and 2 before photos are mutually isolated');

  // Test E: Persistence Across Simulated Browser Refresh
  console.log('\n6. Test E: Persistence Across Refresh...');
  const storedJson = globalThis.localStorage.getItem('kmc:grievances');
  assert(!!storedJson, 'Grievances exist in localStorage');
  const parsedGrievances = JSON.parse(storedJson);
  const restoredG1 = parsedGrievances.find(g => g.id === createdG1.id);
  assert(restoredG1.beforePhoto === citizenPhotoData, 'Before photo persisted across simulated refresh');
  assert(restoredG1.afterPhoto === completionPhotoData, 'After photo persisted across simulated refresh');

  // Test F: Missing Image State Handling
  console.log('\n7. Test F: Missing Image Handling (No Illustrations Substituted)...');
  const createdNoPhoto = grievanceRepository.create({
    citizenId: 'USR-CITIZEN-01',
    category: 'Garbage',
    department: 'Sanitation',
    location: 'Subhash Nagar, Ward 27',
    description: 'Garbage pile reported without photo',
    wardId: 27,
    slaHours: 24,
  }, 'Sri. P. Rajesh Kumar');

  assert(!createdNoPhoto.beforePhoto, 'Grievance created without photo has undefined beforePhoto');
  assert(getBeforePhotos(createdNoPhoto).length === 0, 'getBeforePhotos returns empty array');
  assert(resolvePhoto(createdNoPhoto.beforePhoto || '') === '', 'resolvePhoto returns empty string for missing photo');
  assert(!isPhotoSource(''), 'Empty string is not recognized as a photo source');

  // Test H: Cross-Portal Consistency
  console.log('\n8. Test H: Cross-Portal Consistency Across Roles...');
  // 1. Citizen Portal:
  const citizenGrievance = grievanceRepository.getById(createdG1.id);
  assert(citizenGrievance.beforePhoto === citizenPhotoData, 'Citizen portal sees original uploaded before photo');
  // 2. Department Officer:
  const deptGrievances = grievanceRepository.getByDepartment('Engineering');
  const deptG1 = deptGrievances.find(g => g.id === createdG1.id);
  assert(deptG1.beforePhoto === citizenPhotoData, 'Department Officer sees original uploaded before photo');
  // 3. Ward Corporator:
  const wardGrievances = grievanceRepository.getByWardId(27);
  const wardG1 = wardGrievances.find(g => g.id === createdG1.id);
  assert(wardG1.beforePhoto === citizenPhotoData, 'Ward Corporator sees original uploaded before photo');
  assert(wardG1.afterPhoto === completionPhotoData, 'Ward Corporator sees completion after photo for verification');
  // 4. Field Staff:
  const staffTasks = taskRepository.getByStaffName('Mahesh (Field Staff)');
  const staffTask1 = staffTasks.find(t => t.grievanceId === createdG1.id);
  assert(staffTask1.photo === completionPhotoData, 'Field Staff task records the completion photo');

  console.log('\n========================================================================');
  console.log(` RESULTS: ${passCount} PASSED, ${failCount} FAILED out of ${passCount + failCount} assertions.`);
  console.log('========================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL AUTHENTIC PHOTOS WORKFLOW TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  }
}

runTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
