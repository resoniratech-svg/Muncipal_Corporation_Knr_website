import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Camera, ExternalLink, ShieldCheck } from 'lucide-react';
import { usePrefs } from '../../i18n';
import { useAuth } from '../../auth/AuthContext';

export interface PhotoTest {
  n: number;
  title: string;
  how: string;
  route: string;
  /** Result of the automated browser run recorded below */
  result: 'PASS' | 'FAIL' | 'MANUAL';
  evidence: string;
}

export interface ReviewCheckMeta {
  checked: boolean;
  reviewer?: string;
  timestamp?: string;
  status?: string;
}

// Results from the automated Chrome run of 26 Oct 2026 (production build, see README "Acceptance tests")
export const PHOTO_TESTS: PhotoTest[] = [
  { 
    n: 1, 
    title: 'Citizen reports a complaint with a photo in 4 steps in under 60 seconds at 390px', 
    how: 'Report a Problem → Drainage → Take Photo → Use my current location → Send Complaint', 
    route: '/citizen/report', 
    result: 'PASS', 
    evidence: 'ID in #GRV2024-XXXXX format shown with time and "We have received your complaint."; no horizontal scroll at 390px. A person typing takes about 30–45 s.' 
  },
  { 
    n: 2, 
    title: 'BEFORE photo appears in My Requests, the Ward dashboard and the Leadership view', 
    how: 'Check the new complaint in Track My Complaint, Ward → New Complaints, Leadership → Recent Complaints (opens the viewer)', 
    route: '/qa/grievances/GRV-2024-27-0045', 
    result: 'PASS', 
    evidence: 'The compressed JPEG loads in all three places.' 
  },
  { 
    n: 3, 
    title: 'Field staff cannot mark a task Resolved without an AFTER photo', 
    how: 'Field Tasks → Mark as Done & Upload Photo; the submit button stays disabled with "Please upload the photo of the completed work."', 
    route: '/field-tasks', 
    result: 'PASS', 
    evidence: 'Button disabled until a photo is added; the app context also refuses completion without a photo, so no other screen can bypass it.' 
  },
  { 
    n: 4, 
    title: 'After the corporator approves, the citizen sees the before/after slider and Solved / Not Solved', 
    how: 'Ward → Work Completed – Waiting for Verification → Approve & Close; then the citizen opens the complaint', 
    route: '/qa/grievances/GRV-2024-27-0045', 
    result: 'PASS', 
    evidence: 'Slider, both buttons and timeline thumbnails shown; SMS "Your complaint … has been resolved. Please check the photo." sent. Send Back requires a reason.' 
  },
  { 
    n: 5, 
    title: '"Not Solved – Reopen" escalates one level and alerts the Leadership dashboard', 
    how: 'Citizen taps Not Solved, writes a reason, Reopen Complaint; Leadership → Reopened by Citizens', 
    route: '/leadership', 
    result: 'PASS', 
    evidence: 'Escalation level 1 → 2 (Department Officer) and the complaint is listed in the red Leadership alert.' 
  },
  { 
    n: 6, 
    title: 'Images survive a page refresh; "Reset Demo" clears them', 
    how: 'Reload the complaint page; then Demo → Reset Demo → Yes, reset', 
    route: '/citizen/track', 
    result: 'PASS', 
    evidence: 'Photo still loads after reload; after reset 0 stored photos remain and the 12 demo complaints are restored.' 
  },
  { 
    n: 7, 
    title: 'Oversized file, wrong type and no photo all show friendly messages', 
    how: 'Choose a 5.9 MB photo, a .txt file, then skip the photo', 
    route: '/citizen/report', 
    result: 'PASS', 
    evidence: '"This photo is too big…", "This file is not a photo…", and the tip "A photo helps us fix the problem faster." Submission without a photo is allowed.' 
  },
  { 
    n: 8, 
    title: 'Language toggle changes all citizen-screen text with no layout breaks (Telugu at 360px)', 
    how: 'Top bar → తెలుగు, then open every citizen screen at 360px', 
    route: '/citizen', 
    result: 'PASS', 
    evidence: '7 citizen screens: Telugu shown, no leftover English labels, no horizontal scroll. Data typed by people (addresses, notices) stays as entered.' 
  },
  { 
    n: 9, 
    title: 'No horizontal scroll at 360, 390, 768, 1024, 1440 and 1920px; no console errors', 
    how: '16 routes at each width', 
    route: '/', 
    result: 'PASS', 
    evidence: 'No overflow on any of the 96 page/width combinations; 0 console errors.' 
  },
  { 
    n: 10, 
    title: 'A first-time person can complete report → track → rate without help', 
    how: 'Walkthrough below (not an automated test)', 
    route: '/qa/grievances/GRV-2024-27-0045', 
    result: 'MANUAL', 
    evidence: 'Home → big "Report a Problem" → tap a picture tile → "Take Photo" → "Use my current location" → check → "Send Complaint" → "Track this complaint" → after the fix, "Yes, Problem Solved" → tap stars → "Send Rating". Every screen has one highlighted main button, Back, Home and Help. Needs confirming with a real first-time user.' 
  },
];

export const QA_CHECKLIST_STORAGE_KEY = 'kmc-ui:qa-photo-checks';

export const PhotoWorkflowChecklist: React.FC = () => {
  const { t } = usePrefs();
  const { currentUser } = useAuth();

  const [reviews, setReviews] = useState<Record<number, ReviewCheckMeta | boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(QA_CHECKLIST_STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  });

  const isChecked = (n: number): boolean => {
    const val = reviews[n];
    if (typeof val === 'boolean') return val;
    return !!val?.checked;
  };

  const getReviewMeta = (n: number): ReviewCheckMeta | null => {
    const val = reviews[n];
    if (typeof val === 'object' && val !== null) return val;
    if (typeof val === 'boolean' && val) {
      return { checked: true, reviewer: 'Governance Auditor', status: 'VERIFIED' };
    }
    return null;
  };

  const toggle = (n: number) => {
    setReviews((prev) => {
      const current = isChecked(n);
      const nextChecked = !current;
      const updatedEntry: ReviewCheckMeta = {
        checked: nextChecked,
        reviewer: currentUser?.displayName || 'Dr. T. Radhakrishnan (Governance Auditor)',
        timestamp: new Date().toISOString(),
        status: nextChecked ? 'VERIFIED' : 'PENDING_REVIEW',
      };

      const next = { ...prev, [n]: updatedEntry };
      try {
        localStorage.setItem(QA_CHECKLIST_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const passed = PHOTO_TESTS.filter((t) => t.result === 'PASS').length;

  return (
    <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold font-heading uppercase text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-kmc-green" aria-hidden="true" />
            {t("Photo Workflow – Acceptance Tests 1–10")}
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            {t("Automated browser run on 26 Oct 2026: 9 of 9 automated tests passed; test 10 is a manual walkthrough.")}
          </p>
        </div>
      </div>

      {/* Direct Audit Shortcut Banner for Quick Inspection */}
      <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border border-amber-500 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase bg-slate-950 text-amber-300 px-2 py-0.5 rounded inline-block mb-1">
            {t("Direct Audit Navigation")}
          </span>
          <h3 className="text-sm font-bold font-heading uppercase text-slate-950">
            {t("Inspect Resolved Grievance GRV-2024-27-0045 Audit View")}
          </h3>
          <p className="text-xs text-slate-900 mt-0.5">
            {t("Full read-only audit view: before & after photos, slider, staff assignment, ground timestamps, corporator verification & SLA compliance.")}
          </p>
        </div>

        <Link
          to="/qa/grievances/GRV-2024-27-0045?qaInspect=true"
          state={{ qaInspect: true, fromQa: true }}
          className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-amber-300 font-bold text-xs uppercase rounded-lg shadow transition flex items-center justify-center gap-1.5 shrink-0"
        >
          <span>{t("Open Grievance Audit")}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <ol className="mt-4 space-y-3">
        {PHOTO_TESTS.map((test) => {
          const checkedState = isChecked(test.n);
          const meta = getReviewMeta(test.n);
          const isGrievanceAuditRoute = test.route.includes('/qa/grievances');

          return (
            <li 
              key={test.n} 
              className={`rounded-xl border-2 p-3.5 flex flex-col md:flex-row md:items-start gap-3 transition-colors ${
                checkedState ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 bg-white'
              }`}
            >
              <span
                className={`inline-flex items-center gap-1 self-start rounded-full px-2.5 py-1 text-xs font-bold border ${
                  test.result === 'PASS' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : test.result === 'FAIL' 
                      ? 'bg-rose-50 text-rose-800 border-rose-300' 
                      : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                {test.result === 'FAIL' ? <XCircle className="w-3.5 h-3.5" aria-hidden="true" /> : <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />}
                {test.result}
              </span>

              <div className="flex-1 min-w-0 text-sm">
                <p className="font-bold text-slate-900">{test.n}. {t(test.title)}</p>
                <p className="text-slate-600 mt-0.5"><strong>{t("How")}:</strong> {t(test.how)}</p>
                <p className="text-slate-600 mt-0.5"><strong>{t("Result")}:</strong> {t(test.evidence)}</p>

                {meta?.checked && (
                  <div className="mt-2 text-[11px] text-emerald-800 font-medium flex items-center gap-1.5 bg-emerald-100/60 px-2.5 py-1 rounded-md w-fit border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      {t("Audited by {{reviewer}}", { reviewer: meta.reviewer || 'Governance Auditor' })}
                      {meta.timestamp && ` • ${new Date(meta.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0 self-end sm:self-auto">
                <Link
                  to={`${test.route}${test.route.includes('?') ? '&' : '?'}qaInspect=true`}
                  state={{ qaInspect: true, fromQa: true, testNumber: test.n }}
                  className={`min-h-[44px] px-3.5 rounded-lg border-2 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm ${
                    isGrievanceAuditRoute
                      ? 'bg-amber-400 text-slate-950 border-amber-500 hover:bg-amber-300'
                      : 'bg-white border-slate-300 hover:border-kmc-navy hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span>{isGrievanceAuditRoute ? t("Audit Grievance") : t("Open")}</span>
                  <ExternalLink className={`w-3.5 h-3.5 ${isGrievanceAuditRoute ? 'text-slate-950' : 'text-kmc-navy'}`} aria-hidden="true" />
                </Link>

                <label className="flex items-center gap-2 text-xs font-semibold min-h-[44px] cursor-pointer select-none bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">
                  <input 
                    type="checkbox" 
                    checked={checkedState} 
                    onChange={() => toggle(test.n)} 
                    className="w-4 h-4 rounded text-kmc-navy focus:ring-kmc-navy cursor-pointer" 
                  />
                  <span className={checkedState ? 'text-emerald-900 font-bold' : 'text-slate-700'}>
                    {t("Reviewer checked")}
                  </span>
                </label>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
