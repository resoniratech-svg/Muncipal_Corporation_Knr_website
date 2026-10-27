# Karimnagar Municipal Corporation (KMC) – Digital Governance Platform

An interactive, production-grade, offline-capable front-end demonstration web application for the **Karimnagar Municipal Corporation (KMC) Digital Governance Platform Proposal**, tailored for presentations to the Hon'ble Mayor and Municipal Commissioner.

Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **Recharts**, and **Lucide React**, using **HashRouter** for static hosting compatibility.

---

## 🌟 Key Capabilities & Structure

1. **Tier 1: Leadership Dashboard (`/leadership`)**
   - High-level command interface for Mayor and Municipal Commissioner.
   - 66-Ward interactive SVG heat-map with drill-down (Excellent, Good, Average, Poor).
   - Real-time budget tracking (FY 2024-25), AI grievance categorization, and alert escalation feeds.
   - Top pending wards and department turnaround performance.

2. **Tier 2: Ward / Division Management System (`/ward`)**
   - Default: **Ward 27 (Green Park Colony)** with a 66-ward division switcher.
   - Civic works breakdown: Roads, Drainage, Street Lights, Sanitation.
   - Field staff task assignments with interactive status toggles (`Pending` → `In Progress` → `Completed`).
   - Geo-tagged before/after photographic evidence cards (`GRV-2024-27-0045` and `GRV-2024-27-0082`).

3. **Tier 3: Citizen Engagement Portal & Mobile App (`/citizen`)**
   - Dual interface: Desktop Citizen Web Portal + authentic Smartphone View (`PhoneFrame`).
   - Interactive grievance filing form with photo upload and automatic SMS confirmation.
   - Ward development projects transparency table and 5-star citizen rating module.
   - Official SMS notification feed simulating sender `VM-MCKNRG`.

4. **Ward Performance Evaluation & Rankings (`/performance`)**
   - 5 predefined KPIs: Resolution Time, % Resolved, Quality Rating, Budget Efficiency, Cleanliness Score.
   - 6-month historical trend line chart (Dec 2023 to May 2024).
   - Benchmark comparison against City Average.
   - 7-row May 2024 ranking table with grades, levels, trend arrows, and top-3 trophies.
   - Underperforming wards intervention matrix (Wards 45, 39, 22) and Action Plan (due 30 Jun 2024).

5. **Integrated Departmental Workflow & SLAs (`/workflow`)**
   - 8 municipal departments digitally unified around a central platform hub.
   - 5-stage grievance workflow process.
   - 5-level hierarchical escalation ladder (Field Staff 2d → Officer 5d → HoD 7d → Commissioner 10d → Mayor/Council).
   - **Interactive Redressal Simulator**: Step-through grievance resolution and trigger simulated SLA breaches.

6. **Government Communication & Public Broadcast (`/notifications`)**
   - 4 notification classes: Emergency Alerts, Decisions & Schemes, Budget Transparency, Ward Updates.
   - Live preview across 3 channels: Mobile App push, SMS (`VM-MCKNRG`), and Web Portal announcements.
   - **Admin Broadcast Console**: Type and dispatch real-time announcements to all channels.
   - Reactive to Proactive transformation comparison.

7. **Governance & Central Monitoring (`/monitoring`)**
   - Central monitoring overview from the Municipal Commissioner's office.
   - Monthly Performance Report (May 2024) across top wards.
   - 6-step automated escalation workflow.

8. **Implementation Strategy & Request for Approval (`/implementation`)**
   - 3-Phase roadmap: Phase 1 (Design), Phase 2 (5-Ward Pilot), Phase 3 (City-wide Rollout).
   - 5-step Way Forward.
   - Formal Request for Approval with 3 core asks and signature block.

9. **26-Slide Presentation Mode (`/present`)**
   - Walkthrough of all 26 slides in order with Left/Right arrow keys and slide selector.
   - "Open Live Demo" shortcut buttons on every slide.

10. **Quality Assurance Audit Route (`/qa`)**
    - Inch-by-inch verification tool comparing deck transcriptions against rendered UI with pass/fail checkboxes.

---

## 🛠 Installation & Local Development

### Prerequisites
- Node.js (v18+ or v20+)
- npm or pnpm

### Commands

```bash
# Install dependencies
npm install

# Start local development server (runs at http://localhost:5173/)
npm run dev

# Build production-ready static assets
npm run build

# Preview static build locally
npm run preview
```

---

## ⚙️ Configuration & Data Modes

Open `src/data/config.ts` to adjust:

```typescript
export const APP_CONFIG = {
  dataMode: 'deck-exact', // Options: 'deck-exact' | 'harmonized'
  fiscalYear: 'FY 2024-25',
  reportMonth: 'May 2024',
  lastUpdated: '10:30 AM',
  population: '6,10,000',
  totalWards: 66,
};
```

### Switching `DATA_MODE`:
- **`deck-exact`**: Every screen shows the verbatim numbers printed on that specific PDF page (e.g. Page 1 shows ₹350 Cr budget, Page 5 shows ₹215 Cr budget).
- **`harmonized`**: Harmonizes all screens to a single consistent model:
  - Total Budget: **₹315 Cr** (Allocated ₹315 Cr, Utilized ₹215 Cr, Balance ₹100 Cr, 68% rate)
  - Total City Complaints: **12,458** (Resolved 10,234, In Progress 1,874, Overdue 350, 85% SLA on-time)
  - City Average Ward Score: **68.4 / 100**
  *(Can also be toggled live at runtime using the pill switch in the top header).*

---

## 🚀 Static Deployment (Zero Backend)

The project builds to a pure static folder (`dist/`) requiring no backend or Node server:

### Vercel
```bash
npx vercel deploy --prod
```

### Netlify
```bash
npx netlify deploy --dir=dist --prod
```

### GitHub Pages
1. Set `"base": "./"` in `vite.config.ts` (already configured).
2. Deploy the `dist/` directory to your `gh-pages` branch.

---

## 📂 Project Structure

```
src/
├── assets/
│   └── kmc-logo.svg           # Karimnagar Municipal Corporation emblem
├── components/
│   ├── charts/
│   │   ├── BarChart.tsx       # Recharts bar chart
│   │   ├── DonutChart.tsx     # Recharts donut chart
│   │   ├── LineChart.tsx      # Recharts trend lines
│   │   └── WardMapSvg.tsx     # 66-ward interactive SVG heat map
│   ├── citizen/
│   │   ├── GrievanceForm.tsx  # Grievance filing form
│   │   ├── SmsMessageFeed.tsx # SMS conversation simulation
│   │   └── StarRating.tsx     # 5-star rating widget
│   ├── common/
│   │   ├── BannerStrip.tsx    # Navy header strip with emblem
│   │   ├── FooterStrip.tsx    # Deck-exact footer strip
│   │   ├── KpiCard.tsx        # KPI badge card
│   │   ├── PhoneFrame.tsx     # Smartphone container mock
│   │   ├── StatusChip.tsx     # Color-coded status badge
│   │   └── TopNav.tsx         # Global top navigation & mode switchers
│   ├── ward/
│   │   ├── BeforeAfterCard.tsx# Geo-tagged evidence card
│   │   └── TaskTable.tsx      # Task assignment management table
│   └── workflow/
│       ├── DepartmentHub.tsx  # 8-department circular connection hub
│       ├── EscalationLadder.tsx # 5-level escalation ladder
│       └── GrievanceSimulator.tsx # Step-by-step interactive simulator
├── context/
│   └── AppContext.tsx         # Reactive in-memory state & interactions
├── data/
│   ├── budget.ts              # Budget tables & allocations
│   ├── config.ts              # Global config & DATA_MODE toggle
│   ├── deckText.ts            # Verbatim text for 26 slides & QA review
│   ├── departments.ts         # 8 departments, roles, and escalation targets
│   ├── grievances.ts          # Grievance items, tasks, and SLA rules
│   ├── kpis.ts                # Monthly ward KPIs and rankings
│   ├── notifications.ts       # Broadcast notifications data
│   └── wards.ts               # All 66 wards data
├── pages/
│   ├── CitizenPage.tsx        # Page 7 & 16: Citizen Portal & Mobile App
│   ├── DemoHome.tsx           # Page 1, 2, 3, 4: Overview & Role Switcher
│   ├── ImplementationPage.tsx # Page 18, 25, 26: Implementation & Approval
│   ├── LeadershipPage.tsx     # Page 5: Mayor & Commissioner Dashboard
│   ├── MonitoringPage.tsx     # Page 24: Commissioner's Monitoring
│   ├── NotificationsPage.tsx  # Page 19–23: Public Notification System
│   ├── PerformancePage.tsx    # Page 8–11: Performance Evaluation & Rankings
│   ├── PresentationPage.tsx   # All 26 Slides Fullscreen Navigator
│   ├── QaAuditPage.tsx        # Side-by-Side QA Verification Checklist
│   └── WardPage.tsx           # Page 6: Ward 27 Management & Ground Staff
├── App.tsx                    # Root routing shell
├── index.css                  # Tailwind directives and custom styles
└── main.tsx                   # Entry point with HashRouter & AppProvider
```

---

## 📷 Before / After Photo Evidence Workflow

The complaint lifecycle follows the deck's Page 13 flow, with a photo at both ends:

| Step | Who | Screen | Status shown to the citizen |
|---|---|---|---|
| 1. Report with 1–3 BEFORE photos (camera or gallery) | Citizen | `/citizen/report` (4-step wizard) | 🟠 Waiting |
| 2. Validate & send to field staff | Ward Corporator | `/ward` → *New Complaints* | 🔵 Work in progress |
| 3. *Mark as Done & Upload Photo* (AFTER photo required) | Field Staff | `/field-tasks` | 🔵 Work done – being checked |
| 4. Compare photos → *Approve & Close* or *Send Back* (reason required) | Ward Corporator | `/ward` → *Work Completed – Waiting for Verification* | 🟢 Fixed |
| 5. Before/after slider → *Yes, Problem Solved* (rate) or *Not Solved – Reopen* | Citizen | `/citizen/track/:id` | 🟢 Fixed / 🔴 Reopened |

* A task **cannot** be completed without an AFTER photo. The rule lives in `AppContext.updateTaskStatus` / `completeTaskWithPhotos`, so no screen can bypass it.
* *Not Solved – Reopen* moves the complaint one level up the deck's 5-level escalation ladder (Field Staff → Department Officer → HoD → Commissioner → Mayor/Council). It appears in the red **Reopened by Citizens** panel on `/leadership`.
* Photos carry a timestamp and a mock geo-tag. Ward 27 uses the deck's sample coordinates 17.9860, 79.1188; see `src/photos/geo.ts`.
* Photos also appear on the Ward dashboard *Before / After Evidence* cards, the Leadership *Recent Complaints* viewer (read-only), and the public **Fixed Problems Gallery** (`/citizen/gallery`, filter by ward).

### How photos are stored (no backend)

* Photos are compressed in the browser (longest side ≤ 1280 px, JPEG, quality lowered until ≈ 350 KB). Each one is saved under its own key `kmc:photo:<id>` in `localStorage`.
* A complaint only stores the short reference `kmc-photo:<id>` (`src/photos/photoStore.ts`), so updating a complaint never rewrites the image data.
* The 12 pre-loaded demo complaints use bundled placeholder images in `src/assets/demo-photos/`: 6 fixed with before/after, 3 in progress with a before photo only, and 3 waiting. They are stored as `demo-photo:<name>` tokens and take no storage space.
* If the browser's storage is full, the citizen sees *"There is no space left for photos in this demo…"* and nothing is half-saved.
* Accepted files: JPG / PNG / WEBP, up to 5 MB each, 1–3 per complaint. Wrong type, oversized and no-photo cases each show a plain-language message.

### Reset Demo and Quick Demo

Use the yellow **Demo** menu in the top bar (any signed-in user):

* **Reset Demo:** after a confirmation, removes every complaint, task and photo added in this browser and restores the 12 demo complaints. The user stays signed in.
* **Quick Demo (60 seconds):** Super Admin only. Plays one full story for the officials' presentation: citizen reports with a photo → corporator routes → field staff upload the after photo → corporator approves → citizen sees the before/after and rates 5★. A narration bar shows each step and has a **Stop** button.
* **Take the guided tour:** reopens the role's 4–5-step coach marks. The tour also opens once on first visit, with *Skip* and *Don't show again*.

## 🧭 Simple for everyone

* **Citizen screens** (`/citizen/*`): four big buttons on the home screen, a 4-step report wizard with picture tiles, plain words (Waiting / Work in progress / Fixed / Delayed), always a Back button and a Home icon, and a **Help** button on every screen.
* **Language toggle** (top bar): English | తెలుగు | हिन्दी for all citizen screens. Strings live in `src/i18n/en.json`, `te.json` and `hi.json`. Staff dashboards keep the deck's English labels, with a one-line help text or `?` tooltip.
* **Accessibility:** A- / A / A+ text size, visible focus rings, 48 px buttons on citizen screens, screen-reader announcements for toasts, alt text on every photo, `prefers-reduced-motion` respected, and lazy-loaded images.

### ⚠️ Translations that need review by a native speaker

Every string in `src/i18n/te.json` (Telugu) and `src/i18n/hi.json` (Hindi) was written without a native-speaker review and **must be checked before public use**. Please look especially at:

* `status.*` (the status words citizens rely on), `report.cat.*` (problem names) and `success.nextText` (the promise about what happens next).
* The word chosen for the ward representative: Telugu "కౌన్సిలర్", Hindi "पार्षद".
* `photoError.*` and `detail.reopen*` (error and reopen messages).

Text typed by people or stored in the data (addresses, notice titles, project names, staff notes) is shown as entered and is not translated.

## ✅ Acceptance tests (photo workflow)

The `/qa` route has a **Photo Workflow** checklist (tests 1–10) with results and a reviewer tick-box. To re-run the automated browser checks:

```bash
npm i --no-save playwright-core@1.49.1     # test-only, not a project dependency
python3 tests/acceptance/make-fixtures.py  # creates a normal photo, a >5 MB photo and a .txt file
npm run build && npx vite preview --port 4173 &
node tests/acceptance/photo-workflow.mjs   # uses local Google Chrome (or set CHROME_PATH)
```

Last run (26 Oct 2026): tests 1–9 **PASS**. Test 10 (a first-time user completes report → track → rate unaided) is a manual walkthrough, described on `/qa`.

## Compromises because there is no backend

* **One browser only.** Data and photos live in this browser's `localStorage`. A complaint filed on one phone is not visible on another device; all roles must use the same browser, which suits a single presentation laptop. Clearing site data erases everything.
* **Storage limit.** Browsers allow roughly 5 MB per site, which is about 10–15 compressed photos on top of the demo data. After that the friendly "no space left" message appears until **Reset Demo** is used.
* **Mock SMS and location.** SMS messages are written to the in-app notification feed rather than sent. "Use my current location" and photo geo-tags use sample ward coordinates; the real GPS is not read.
* **No real security.** Sign-in, roles and the photo-required rule are enforced in the browser only. A real deployment needs server-side authentication, file storage (with virus/EXIF handling) and an audit database.
* **No real escalation timers.** SLA breaches escalate when simulated (Workflow page) or when a citizen reopens; nothing runs in the background while the app is closed.
* **Quick Demo is scripted.** It calls the same actions as the screens, but it moves between role views without signing in as each role, so it requires the Super Admin account.
# Muncipal_Corporation_Knr_website
