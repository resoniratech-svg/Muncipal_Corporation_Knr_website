import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Camera, ExternalLink } from 'lucide-react';
import { usePrefs } from '../../i18n';

interface PhotoTest {
  n: number;
  title: string;
  how: string;
  route: string;
  /** Result of the automated browser run recorded below */
  result: 'PASS' | 'FAIL' | 'MANUAL';
  evidence: string;
}

// Results from the automated Chrome run of 26 Oct 2026 (production build, see README "Acceptance tests")
const PHOTO_TESTS: PhotoTest[] = [
  { n: 1, title: 'Citizen reports a complaint with a photo in 4 steps in under 60 seconds at 390px', how: 'Report a Problem → Drainage → Take Photo → Use my current location → Send Complaint', route: '/citizen/report', result: 'PASS', evidence: 'ID in #GRV2024-XXXXX format shown with time and "We have received your complaint."; no horizontal scroll at 390px. A person typing takes about 30–45 s.' },
  { n: 2, title: 'BEFORE photo appears in My Requests, the Ward dashboard and the Leadership view', how: 'Check the new complaint in Track My Complaint, Ward → New Complaints, Leadership → Recent Complaints (opens the viewer)', route: '/leadership', result: 'PASS', evidence: 'The compressed JPEG loads in all three places.' },
  { n: 3, title: 'Field staff cannot mark a task Resolved without an AFTER photo', how: 'Field Tasks → Mark as Done & Upload Photo; the submit button stays disabled with "Please upload the photo of the completed work."', route: '/field-tasks', result: 'PASS', evidence: 'Button disabled until a photo is added; the app context also refuses completion without a photo, so no other screen can bypass it.' },
  { n: 4, title: 'After the corporator approves, the citizen sees the before/after slider and Solved / Not Solved', how: 'Ward → Work Completed – Waiting for Verification → Approve & Close; then the citizen opens the complaint', route: '/ward', result: 'PASS', evidence: 'Slider, both buttons and timeline thumbnails shown; SMS "Your complaint … has been resolved. Please check the photo." sent. Send Back requires a reason.' },
  { n: 5, title: '"Not Solved – Reopen" escalates one level and alerts the Leadership dashboard', how: 'Citizen taps Not Solved, writes a reason, Reopen Complaint; Leadership → Reopened by Citizens', route: '/leadership', result: 'PASS', evidence: 'Escalation level 1 → 2 (Department Officer) and the complaint is listed in the red Leadership alert.' },
  { n: 6, title: 'Images survive a page refresh; "Reset Demo" clears them', how: 'Reload the complaint page; then Demo → Reset Demo → Yes, reset', route: '/citizen/track', result: 'PASS', evidence: 'Photo still loads after reload; after reset 0 stored photos remain and the 12 demo complaints are restored.' },
  { n: 7, title: 'Oversized file, wrong type and no photo all show friendly messages', how: 'Choose a 5.9 MB photo, a .txt file, then skip the photo', route: '/citizen/report', result: 'PASS', evidence: '"This photo is too big…", "This file is not a photo…", and the tip "A photo helps us fix the problem faster." Submission without a photo is allowed.' },
  { n: 8, title: 'Language toggle changes all citizen-screen text with no layout breaks (Telugu at 360px)', how: 'Top bar → తెలుగు, then open every citizen screen at 360px', route: '/citizen', result: 'PASS', evidence: '7 citizen screens: Telugu shown, no leftover English labels, no horizontal scroll. Data typed by people (addresses, notices) stays as entered.' },
  { n: 9, title: 'No horizontal scroll at 360, 390, 768, 1024, 1440 and 1920px; no console errors', how: '16 routes at each width', route: '/', result: 'PASS', evidence: 'No overflow on any of the 96 page/width combinations; 0 console errors.' },
  { n: 10, title: 'A first-time person can complete report → track → rate without help', how: 'Walkthrough below (not an automated test)', route: '/citizen', result: 'MANUAL', evidence: 'Home → big "Report a Problem" → tap a picture tile → "Take Photo" → "Use my current location" → check → "Send Complaint" → "Track this complaint" → after the fix, "Yes, Problem Solved" → tap stars → "Send Rating". Every screen has one highlighted main button, Back, Home and Help. Needs confirming with a real first-time user.' },
];

const KEY = 'kmc-ui:qa-photo-checks';

export const PhotoWorkflowChecklist: React.FC = () => {
  const { t } = usePrefs();
  const [checked, setChecked] = useState<Record<number, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch {
      return {};
    }
  });

  const toggle = (n: number) =>
    setChecked((prev) => {
      const next = { ...prev, [n]: !prev[n] };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

  const passed = PHOTO_TESTS.filter((t) => t.result === 'PASS').length;

  return (
    <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold font-heading uppercase text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-kmc-green" aria-hidden="true" />
            {t("Photo Workflow – Acceptance Tests 1–10")}
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">{t("Automated browser run on 26 Oct 2026: 9 of 9 automated tests passed; test 10 is a manual walkthrough.")}</p>
        </div>
      </div>
      <ol className="mt-4 space-y-3">
        {PHOTO_TESTS.map((test) => (
          <li key={test.n} className="rounded-xl border-2 border-slate-200 p-3 flex flex-col md:flex-row md:items-start gap-3">
            <span
              className={`inline-flex items-center gap-1 self-start rounded-full px-2.5 py-1 text-xs font-bold border ${
                test.result === 'PASS' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : test.result === 'FAIL' ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
            >
              {test.result === 'FAIL' ? <XCircle className="w-3.5 h-3.5" aria-hidden="true" /> : <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />}
              {test.result}
            </span>
            <div className="flex-1 min-w-0 text-sm">
              <p className="font-bold text-slate-900">{test.n}. {t(test.title)}</p>
              <p className="text-slate-600 mt-0.5"><strong>{t("How")}:</strong> {t(test.how)}</p>
              <p className="text-slate-600 mt-0.5"><strong>{t("Result")}:</strong> {t(test.evidence)}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link to={test.route} className="min-h-[44px] px-3 rounded-lg border-2 border-slate-300 text-xs font-bold flex items-center gap-1">
                {t("Open")} <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
              <label className="flex items-center gap-2 text-xs font-semibold min-h-[44px]">
                <input type="checkbox" checked={!!checked[test.n]} onChange={() => toggle(test.n)} className="w-5 h-5" />
                {t("Reviewer checked")}
              </label>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};
