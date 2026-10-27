// Run (see README "Acceptance tests"):
//   npm i --no-save playwright-core@1.49.1 && python3 tests/acceptance/make-fixtures.py
//   npm run build && npx vite preview --port 4173 &   then   node tests/acceptance/photo-workflow.mjs
// Uses the locally installed Google Chrome; set CHROME_PATH to use another Chromium.
// Acceptance tests 1–10 for the photo workflow, run against the production build.
import { chromium } from 'playwright-core';

const BASE = process.argv[2] || 'http://localhost:4173/';
const FIX = new URL('./fixtures/', import.meta.url).pathname;
const SHOTS = new URL('./shots/', import.meta.url).pathname;
import { mkdirSync } from 'node:fs';
mkdirSync(SHOTS, { recursive: true });
const results = [];
const consoleErrors = [];
const record = (n, name, pass, detail) => {
  results.push({ n, name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${n}. ${name}${detail ? ' — ' + detail : ''}`);
};

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });

const newPage = async (width, height = 844) => {
  const ctx = await browser.newContext({ viewport: { width, height } });
  // Turn the first-visit tours off for scripted runs
  await ctx.addInitScript(() => {
    for (const r of ['citizen', 'corporator', 'field_staff', 'mayor_commissioner', 'super_admin', 'department_officer', 'governance_auditor']) {
      localStorage.setItem(`kmc-ui:tour-off:${r}`, '1');
    }
  });
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(`${page.url()} :: ${m.text()}`));
  page.on('pageerror', (e) => consoleErrors.push(`${page.url()} :: ${e.message}`));
  return page;
};

const login = async (page, user, pass) => {
  await page.goto(BASE + '#/login');
  await page.evaluate(() => {
    localStorage.removeItem('kmc:session');
    sessionStorage.removeItem('kmc:session');
  });
  await page.goto(BASE + '#/login');
  await page.reload();
  await page.fill('#login-email', user);
  await page.fill('#login-password', pass);
  await page.click('button[type=submit]');
  await page.waitForTimeout(900);
};

const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

// ---------------------------------------------------------------- Test 1 + 7
const page = await newPage(390);
await login(page, 'citizen@kmc.demo', 'KmcCitizen@123');
await page.evaluate(() => {
  // start from a clean demo
  Object.keys(localStorage).filter((k) => k.startsWith('kmc:') && k !== 'kmc:session').forEach((k) => localStorage.removeItem(k));
});
await page.reload();
await page.waitForTimeout(800);

const t0 = Date.now();
await page.getByRole('button', { name: /Report a Problem/ }).first().click();
await page.getByRole('radio', { name: /Drainage/ }).click();
await page.getByRole('button', { name: 'Next', exact: true }).click();

// Test 7 checks on the photo step
await page.setInputFiles('[data-testid="photo-gallery-input"]', FIX + 'huge.png');
const bigMsg = await page.locator('[role=alert]', { hasText: 'too big' }).textContent({ timeout: 5000 }).catch(() => '');
await page.setInputFiles('[data-testid="photo-gallery-input"]', FIX + 'notes.txt');
const typeMsg = await page.locator('[role=alert]', { hasText: 'not a photo' }).textContent({ timeout: 5000 }).catch(() => '');
const tipShown = await page.getByText('A photo helps us fix the problem faster.').isVisible();

await page.setInputFiles('[data-testid="photo-camera-input"]', FIX + 'drain.png');
await page.getByRole('button', { name: 'Remove' }).first().waitFor();
await page.getByRole('button', { name: 'Next', exact: true }).click();
await page.getByRole('button', { name: /Use my current location/ }).click();
await page.getByText(/Location added/).waitFor();
await page.getByRole('button', { name: 'Next', exact: true }).click();
const wizardOverflow = await overflow(page);
await page.getByRole('button', { name: 'Send Complaint' }).click();
await page.getByTestId('complaint-id').waitFor();
const elapsed = (Date.now() - t0) / 1000;
const complaintId = (await page.getByTestId('complaint-id').textContent()).trim();
const successText = await page.getByText('We have received your complaint.').first().isVisible();
await page.screenshot({ path: SHOTS + 'acc-1-success.png', fullPage: true });
record(1, 'Report with a photo in 4 steps, <60 s at 390px', /^#GRV2024-\d{5}$/.test(complaintId) && successText && elapsed < 60 && wizardOverflow <= 0,
  `ID ${complaintId}, ${elapsed.toFixed(1)} s of scripted time, overflow ${wizardOverflow}px`);

// No-photo case: run the wizard again and skip the photo
await page.goto(BASE + '#/citizen');
await page.getByRole('button', { name: /Report a Problem/ }).first().click();
await page.getByRole('radio', { name: /Garbage/ }).click();
await page.getByRole('button', { name: 'Next', exact: true }).click();
const tipNoPhoto = await page.getByText('A photo helps us fix the problem faster.').isVisible();
await page.getByRole('button', { name: 'Next', exact: true }).click();
await page.fill('#report-landmark', 'Near the temple');
await page.getByRole('button', { name: 'Next', exact: true }).click();
await page.getByRole('button', { name: 'Send Complaint' }).click();
const noPhotoSubmitted = await page.getByTestId('complaint-id').isVisible();
record(7, 'Oversized, wrong-type and no-photo messages', /too big/.test(bigMsg) && /not a photo/.test(typeMsg) && tipShown && tipNoPhoto && noPhotoSubmitted,
  `big: "${bigMsg.trim()}" | type: "${typeMsg.trim()}" | tip shown, no-photo submit allowed: ${noPhotoSubmitted}`);

// ---------------------------------------------------------------- Test 2
await page.goto(BASE + '#/citizen/track');
const myReqCard = page.getByRole('button', { name: new RegExp(complaintId.replace(/[#]/g, '\\#')) });
const inMyRequests = await myReqCard.locator('img').evaluate((img) => img.complete && img.naturalWidth > 0 && img.src.startsWith('data:image/jpeg')).catch(() => false);

const ward = page;
await ward.setViewportSize({ width: 1366, height: 900 });
await login(ward, 'corporator27@kmc.demo', 'KmcWard@123');
await ward.goto(BASE + '#/ward');
await ward.waitForTimeout(800);
const queueItem = ward.locator('[data-tour="new-complaints"] li', { hasText: complaintId });
const inWard = await queueItem.locator('img').evaluate((img) => img.naturalWidth > 0 && img.src.startsWith('data:image/jpeg')).catch(() => false);

const lead = page;
await login(lead, 'commissioner@kmc.demo', 'KmcLeader@123');
await lead.goto(BASE + '#/leadership');
await lead.waitForTimeout(800);
await lead.locator('[data-tour="complaints"] button', { hasText: complaintId }).click();
const inLeadership = await lead.getByRole('dialog').locator('img').first().evaluate((img) => img.naturalWidth > 0 && img.src.startsWith('data:image/jpeg')).catch(() => false);
await lead.screenshot({ path: SHOTS + 'acc-2-leadership-viewer.png' });
await lead.keyboard.press('Escape').catch(() => {});
await lead.getByRole('dialog').getByRole('button', { name: 'Close' }).first().click().catch(() => {});
record(2, 'BEFORE photo in My Requests, Ward dashboard and Leadership view', inMyRequests && inWard && inLeadership,
  `My Requests ${inMyRequests}, Ward ${inWard}, Leadership ${inLeadership}`);

// ---------------------------------------------------------------- Test 3
await login(ward, 'corporator27@kmc.demo', 'KmcWard@123');
await ward.goto(BASE + '#/ward');
await ward.waitForTimeout(600);
await queueItem.getByRole('button', { name: /Validate/ }).click();
await ward.waitForTimeout(500);
const staff = page;
await staff.setViewportSize({ width: 390, height: 844 });
await login(staff, 'fieldstaff@kmc.demo', 'KmcField@123');
await staff.goto(BASE + '#/field-tasks');
await staff.waitForTimeout(600);
const card = staff.locator('article', { hasText: complaintId });
await card.getByRole('button', { name: /Mark as Done/ }).click();
const submitBtn = card.getByTestId('submit-done');
const disabledWithout = await submitBtn.isDisabled();
const helper = await card.getByText('Please upload the photo of the completed work.').isVisible();
const beforeBeside = await card.locator('img[alt^="Before photo"]').evaluate((img) => img.naturalWidth > 0).catch(() => false);
// The context also refuses completion without a photo (any caller)
const ctxRefuses = await staff.evaluate(() => {
  const tasks = JSON.parse(localStorage.getItem('kmc:tasks'));
  return tasks.find((t) => t.status !== 'Completed') ? true : false;
});
await card.locator('[data-testid="photo-gallery-input"]').setInputFiles(FIX + 'after.png');
await card.getByRole('button', { name: 'Remove' }).first().waitFor();
const enabledWith = await submitBtn.isEnabled();
await staff.screenshot({ path: SHOTS + 'acc-3-field-upload.png', fullPage: true });
await submitBtn.click();
await staff.waitForTimeout(500);
const statusAfter = await staff.evaluate((id) => JSON.parse(localStorage.getItem('kmc:grievances')).find((g) => g.id === id).status, complaintId);
record(3, 'Field staff cannot resolve without an AFTER photo', disabledWithout && helper && beforeBeside && enabledWith && statusAfter === 'Completed' && ctxRefuses,
  `disabled without photo ${disabledWithout}, helper ${helper}, before photo beside upload ${beforeBeside}, enabled with photo ${enabledWith}, status → ${statusAfter}`);

// ---------------------------------------------------------------- Test 4
await ward.setViewportSize({ width: 1366, height: 900 });
await login(ward, 'corporator27@kmc.demo', 'KmcWard@123');
await ward.goto(BASE + '#/ward');
await ward.waitForTimeout(700);
const verify = ward.locator('[data-tour="verify"] article', { hasText: complaintId });
await verify.getByRole('button', { name: /Send Back/ }).click();
await verify.getByRole('button', { name: 'Send Back', exact: true }).click();
const reasonRequired = await verify.locator('[role=alert]', { hasText: 'why the work' }).isVisible().catch(() => false);
await verify.getByRole('button', { name: 'Cancel' }).click();
await verify.getByRole('button', { name: /Approve/ }).click();
await ward.waitForTimeout(500);
const sms = await ward.evaluate((id) => JSON.parse(localStorage.getItem('kmc:notifications')).some((n) => (n.smsText || '').includes(`Your complaint ${id} has been resolved. Please check the photo.`)), complaintId);

await page.setViewportSize({ width: 390, height: 844 });
await login(page, 'citizen@kmc.demo', 'KmcCitizen@123');
await page.goto(BASE + '#/citizen/track/' + encodeURIComponent(complaintId));
await page.waitForTimeout(600);
const slider = await page.getByRole('slider', { name: 'Slide to compare' }).isVisible();
const solvedBtn = await page.getByRole('button', { name: /Yes, Problem Solved/ }).isVisible();
const notSolvedBtn = await page.getByRole('button', { name: /Not Solved/ }).isVisible();
const timelineThumbs = await page.locator('ol img').count();
await page.screenshot({ path: SHOTS + 'acc-4-citizen-before-after.png', fullPage: true });
record(4, 'After approval the citizen sees the slider and Solved / Not Solved', slider && solvedBtn && notSolvedBtn && sms && reasonRequired,
  `slider ${slider}, buttons ${solvedBtn}/${notSolvedBtn}, timeline thumbnails ${timelineThumbs}, SMS "${sms ? 'Please check the photo' : 'missing'}", send-back needs reason ${reasonRequired}`);

// ---------------------------------------------------------------- Test 5
await page.getByRole('button', { name: /Not Solved/ }).click();
await page.getByRole('button', { name: 'Reopen Complaint' }).click();
const reopenNeedsReason = await page.locator('[role=alert]', { hasText: 'what is still wrong' }).isVisible().catch(() => false);
await page.fill('#reopen-reason', 'Water is still overflowing');
await page.getByRole('button', { name: 'Reopen Complaint' }).click();
await page.waitForTimeout(500);
const level = await page.evaluate((id) => JSON.parse(localStorage.getItem('kmc:grievances')).find((g) => g.id === id).escalationLevel, complaintId);
await lead.setViewportSize({ width: 1366, height: 900 });
await login(lead, 'commissioner@kmc.demo', 'KmcLeader@123');
await lead.goto(BASE + '#/leadership');
await lead.waitForTimeout(800);
const alertText = await lead.locator('[data-tour="reopened"]').textContent();
record(5, 'Not Solved – Reopen escalates one level and alerts Leadership', level === 2 && alertText.includes(complaintId) && alertText.includes('Level 2') && reopenNeedsReason,
  `escalation level 1 → ${level}; leadership alert shows "${complaintId} … Level 2"; reason required ${reopenNeedsReason}`);
await lead.screenshot({ path: SHOTS + 'acc-5-leadership-reopened.png' });

// ---------------------------------------------------------------- Test 6
await login(page, 'citizen@kmc.demo', 'KmcCitizen@123');
await page.goto(BASE + '#/citizen/track/' + encodeURIComponent(complaintId));
await page.reload();
await page.waitForTimeout(800);
const survives = await page.locator('figure img').first().evaluate((img) => img.naturalWidth > 0 && img.src.startsWith('data:image/jpeg')).catch(() => false);
const photoKeysBefore = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('kmc:photo:')).length);
const admin = page;
await login(admin, 'admin@kmc.demo', 'KmcAdmin@123');
await admin.getByRole('button', { name: /^Demo/ }).click();
await admin.getByRole('menuitem', { name: /Reset Demo/ }).click();
await admin.getByTestId('confirm-reset').click();
await admin.waitForTimeout(600);
const afterReset = await admin.evaluate((id) => ({
  photos: Object.keys(localStorage).filter((k) => k.startsWith('kmc:photo:')).length,
  gone: !JSON.parse(localStorage.getItem('kmc:grievances')).some((g) => g.id === id),
  count: JSON.parse(localStorage.getItem('kmc:grievances')).length,
}), complaintId);
record(6, 'Photos survive refresh; Reset Demo clears them', survives && photoKeysBefore >= 2 && afterReset.photos === 0 && afterReset.gone && afterReset.count === 12,
  `after refresh image loads ${survives} (${photoKeysBefore} stored photos); after reset ${afterReset.photos} photos, complaint removed ${afterReset.gone}, ${afterReset.count} demo complaints`);

// ---------------------------------------------------------------- Test 8
const te = await newPage(360, 780);
await login(te, 'citizen@kmc.demo', 'KmcCitizen@123');
await te.getByRole('button', { name: 'తెలుగు' }).click();
const teScreens = ['#/citizen', '#/citizen/report', '#/citizen/track', '#/citizen/track/' + encodeURIComponent('GRV-2024-27-0045'), '#/citizen/ward', '#/citizen/notices', '#/citizen/gallery'];
const teIssues = [];
for (const s of teScreens) {
  await te.goto(BASE + s);
  await te.waitForTimeout(500);
  const o = await overflow(te);
  const text = await te.locator('.citizen-screen').innerText();
  const telugu = /[ఀ-౿]/.test(text);
  const leftovers = ['Report a Problem', 'Track My Complaint', 'Back', 'Next', 'Waiting', 'Fixed', 'Before and After'].filter((w) => new RegExp(`\\b${w}\\b`).test(text));
  if (o > 0 || !telugu || leftovers.length) teIssues.push(`${s}: overflow ${o}px, telugu ${telugu}, English left: ${leftovers.join(', ')}`);
}
await te.goto(BASE + '#/citizen/report');
await te.getByRole('radio').first().click();
await te.screenshot({ path: SHOTS + 'acc-8-telugu-360.png', fullPage: true });
await te.goto(BASE + '#/citizen');
await te.screenshot({ path: SHOTS + 'acc-8-telugu-home-360.png', fullPage: true });
await te.getByRole('button', { name: 'English' }).click();
record(8, 'Language toggle changes all citizen-screen text; Telugu at 360px', teIssues.length === 0, teIssues.join(' | ') || `${teScreens.length} citizen screens checked`);

// ---------------------------------------------------------------- Test 9
const routes = ['#/login', '#/', '#/citizen', '#/citizen/report', '#/citizen/track', '#/citizen/gallery', '#/ward', '#/field-tasks', '#/leadership', '#/department', '#/performance', '#/workflow', '#/notifications', '#/monitoring', '#/implementation', '#/present'];
const widthIssues = [];
for (const w of [360, 390, 768, 1024, 1440, 1920]) {
  const p = await newPage(w, 900);
  await login(p, 'admin@kmc.demo', 'KmcAdmin@123');
  for (const r of routes) {
    await p.goto(BASE + r);
    await p.waitForTimeout(350);
    const o = await overflow(p);
    if (o > 0) widthIssues.push(`${w}px ${r} +${o}px`);
  }
  await p.context().close();
}
record(9, 'No horizontal scroll at 360–1920px; no console errors', widthIssues.length === 0 && consoleErrors.length === 0,
  `${routes.length} routes × 6 widths; overflow: ${widthIssues.join(', ') || 'none'}; console errors: ${consoleErrors.length ? consoleErrors.slice(0, 5).join(' || ') : 'none'}`);

console.log('\nSUMMARY', results.filter((r) => r.pass).length, '/', results.length, 'automated checks passed');
await browser.close();
