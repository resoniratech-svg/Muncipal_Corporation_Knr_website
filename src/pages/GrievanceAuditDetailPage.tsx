import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { StatusChip } from '../components/common/StatusChip';
import { BeforeAfterViewer } from '../components/photos/BeforeAfterViewer';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/AuthContext';
import { usePrefs } from '../i18n';
import { INITIAL_GRIEVANCES, getBeforePhotos, getAfterPhotos, GrievanceItem } from '../data/grievances';
import { WARDS } from '../data/wards';
import { 
  ArrowLeft, ShieldCheck, CheckCircle2, Clock, MapPin, 
  UserCheck, AlertTriangle, FileText, Check, 
  Eye, Wrench, Building2, User
} from 'lucide-react';

const QA_GRIEVANCE_REVIEWS_KEY = 'kmc:qa_reviewed_grievances';
const LEGACY_PHOTO_CHECKS_KEY = 'kmc-ui:qa-photo-checks';

export const GrievanceAuditDetailPage: React.FC = () => {
  const { grievanceId } = useParams<{ grievanceId: string }>();
  const navigate = useNavigate();
  const { grievances, tasks, wards } = useApp();
  const { currentUser } = useAuth();
  const { t } = usePrefs();

  // 1. Authoritative Grievance Lookup
  const targetId = grievanceId ? decodeURIComponent(grievanceId) : 'GRV-2024-27-0045';

  const grievance: GrievanceItem | null = useMemo(() => {
    // Check authoritative repository first
    const match = (grievances || []).find(
      (g) =>
        g.id.toLowerCase() === targetId.toLowerCase() ||
        g.id.replace('#', '').toLowerCase() === targetId.replace('#', '').toLowerCase()
    );
    if (match) return match;

    // Check initial seed fixtures fallback
    const seedMatch = INITIAL_GRIEVANCES.find(
      (g) =>
        g.id.toLowerCase() === targetId.toLowerCase() ||
        g.id.replace('#', '').toLowerCase() === targetId.replace('#', '').toLowerCase()
    );
    return seedMatch || null;
  }, [grievances, targetId]);

  // 2. Authoritative Associated Task Lookup
  const associatedTask = useMemo(() => {
    if (!grievance) return null;
    return (tasks || []).find((tk) => tk.grievanceId === grievance.id) || null;
  }, [tasks, grievance]);

  // 3. Authoritative Associated Ward & Corporator Lookup
  const ward = useMemo(() => {
    if (!grievance) return null;
    return (wards || []).find((w) => w.id === grievance.wardId) || WARDS.find((w) => w.id === grievance.wardId) || null;
  }, [wards, grievance]);

  // 4. Photographic Evidence
  const beforePhotos = useMemo(() => (grievance ? getBeforePhotos(grievance) : []), [grievance]);
  const afterPhotos = useMemo(() => (grievance ? getAfterPhotos(grievance) : []), [grievance]);

  // 5. Timeline Resolution Extractor
  const timelineEvents = useMemo(() => {
    if (!grievance?.timeline) return [];
    return [...grievance.timeline];
  }, [grievance]);

  const resolutionEvent = useMemo(() => {
    return timelineEvents.find(
      (e) =>
        e.title.toLowerCase().includes('approved') ||
        e.title.toLowerCase().includes('resolved') ||
        e.title.toLowerCase().includes('closed')
    );
  }, [timelineEvents]);

  const workStartEvent = useMemo(() => {
    return timelineEvents.find(
      (e) =>
        e.title.toLowerCase().includes('progress') ||
        e.title.toLowerCase().includes('started') ||
        e.title.toLowerCase().includes('assigned')
    );
  }, [timelineEvents]);

  const workCompletedEvent = useMemo(() => {
    return timelineEvents.find(
      (e) =>
        e.title.toLowerCase().includes('completed') ||
        e.title.toLowerCase().includes('done')
    );
  }, [timelineEvents]);

  // 6. Review Complete State
  const [reviewState, setReviewState] = useState<{ checked: boolean; reviewer: string; timestamp: string } | null>(() => {
    try {
      const stored = localStorage.getItem(QA_GRIEVANCE_REVIEWS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[targetId]?.checked) return parsed[targetId];
      }
      const legacyStored = localStorage.getItem(LEGACY_PHOTO_CHECKS_KEY);
      if (legacyStored) {
        const legacy = JSON.parse(legacyStored);
        if ((targetId === 'GRV-2024-27-0045' && (legacy[2]?.checked || legacy[4]?.checked || legacy[10]?.checked)) || legacy[targetId]?.checked) {
          return {
            checked: true,
            reviewer: legacy[4]?.reviewer || legacy[targetId]?.reviewer || 'Governance Auditor',
            timestamp: legacy[4]?.timestamp || legacy[targetId]?.timestamp || new Date().toISOString(),
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const isReviewed = !!reviewState?.checked;

  const handleToggleReviewComplete = () => {
    if (isReviewed) {
      setReviewState(null);
      try {
        const stored = JSON.parse(localStorage.getItem(QA_GRIEVANCE_REVIEWS_KEY) || '{}');
        delete stored[targetId];
        localStorage.setItem(QA_GRIEVANCE_REVIEWS_KEY, JSON.stringify(stored));
      } catch (e) {
        console.error(e);
      }
    } else {
      const newReview = {
        checked: true,
        reviewer: currentUser?.displayName || 'Dr. T. Radhakrishnan (Governance Auditor)',
        timestamp: new Date().toISOString(),
      };
      setReviewState(newReview);
      try {
        const stored = JSON.parse(localStorage.getItem(QA_GRIEVANCE_REVIEWS_KEY) || '{}');
        stored[targetId] = { ...newReview, status: 'VERIFIED' };
        localStorage.setItem(QA_GRIEVANCE_REVIEWS_KEY, JSON.stringify(stored));

        // Sync with legacy checklist key for backward compatibility
        const legacy = JSON.parse(localStorage.getItem(LEGACY_PHOTO_CHECKS_KEY) || '{}');
        legacy[2] = { checked: true, reviewer: newReview.reviewer, timestamp: newReview.timestamp, status: 'VERIFIED' };
        legacy[4] = { checked: true, reviewer: newReview.reviewer, timestamp: newReview.timestamp, status: 'VERIFIED' };
        legacy[10] = { checked: true, reviewer: newReview.reviewer, timestamp: newReview.timestamp, status: 'VERIFIED' };
        legacy[targetId] = { checked: true, reviewer: newReview.reviewer, timestamp: newReview.timestamp, status: 'VERIFIED' };
        localStorage.setItem(LEGACY_PHOTO_CHECKS_KEY, JSON.stringify(legacy));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const slaTargetHours = grievance?.slaHours || 72;
  const isResolved = grievance?.status === 'Resolved' || grievance?.status === 'Completed';

  const handleReturnToQa = () => {
    navigate('/qa');
  };

  if (!grievance) {
    return (
      <div className="min-h-screen flex flex-col bg-kmc-bg">
        <BannerStrip
          title={`${t('Grievance Audit Detail')} • ${t('Record Not Found')}`}
          tagline={t("Authoritative Grievance Audit & Fidelity Inspection")}
        />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full text-center">
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-8 space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold font-heading uppercase text-slate-900">
              {t('Grievance Record Not Found')}
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              {t('No grievance record matching ID "{{id}}" exists in the municipal repository or demo dataset.', { id: targetId })}
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleReturnToQa}
                className="px-4 py-2 bg-kmc-navy text-white text-xs font-bold rounded-lg uppercase shadow hover:bg-kmc-navy-light transition"
              >
                ← {t('Return to Compliance QA')}
              </button>
            </div>
          </div>
        </main>
        <FooterStrip tagline={t("Karimnagar Municipal Corporation • Digital Governance Platform")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      {/* Primary Header */}
      <BannerStrip
        title={`${t('Grievance Audit Detail')} • ${grievance.id}`}
        tagline={t("Governance Auditor Read-Only Inspection • Before & After Evidence Fidelity")}
        actionButton={
          <span className="text-xs bg-slate-900 text-amber-300 font-mono font-bold px-3 py-1 rounded-md shadow border border-amber-400 uppercase tracking-wide flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            {t('Read-Only Audit Mode')}
          </span>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 w-full">

        {/* Top Context Navigation Bar */}
        <section className="bg-amber-500 text-slate-950 rounded-xl p-4 shadow-md border border-amber-600 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-slate-950 text-amber-300 text-[11px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t('QA Inspection Mode Active')}
              </span>
              <span className="text-xs font-bold text-slate-950">
                {t('Auditor')}: {t(currentUser?.displayName || 'Dr. T. Radhakrishnan (Governance Auditor)')}
              </span>
            </div>
            <p className="text-xs text-slate-900 font-medium">
              {t('Inspecting authoritative operational record for Grievance {{id}}. Live mutations and operational record edits are strictly disabled.', { id: grievance.id })}
            </p>
          </div>

          <button
            type="button"
            onClick={handleReturnToQa}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-lg uppercase shadow transition flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('Back to Compliance QA')}</span>
          </button>
        </section>

        {/* 1. BEFORE & AFTER IMAGES SECTION */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold font-heading uppercase text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-kmc-navy" />
                <span>{t('Photographic Evidence — Before & After Verification')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {t('Authentic full images uploaded by citizen and ground technician. Never cropped or replaced with generic placeholders.')}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
              {beforePhotos.length} {t('Before Photo')} • {afterPhotos.length} {t('After Photo')}
            </span>
          </div>

          {beforePhotos.length === 0 && afterPhotos.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">{t('Evidence not available.')}</p>
              <p className="text-slate-400 mt-0.5">{t('No photographic evidence was uploaded for this grievance record.')}</p>
            </div>
          ) : (
            <div className="pt-2">
              <BeforeAfterViewer
                before={beforePhotos}
                after={afterPhotos}
                problem={grievance.description}
                english={false}
              />
            </div>
          )}
        </section>

        {/* 2. INFORMATION OF THE ISSUE RAISED */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 border-l-4 border-l-kmc-navy space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-sm font-mono font-bold text-kmc-navy bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {grievance.id}
                </span>
                <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded border border-slate-200">
                  {t(grievance.category)}
                </span>
                <span className="text-xs font-bold bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded border border-amber-200">
                  {t(`Ward ${grievance.wardId}`)} • {t(ward?.name || 'Local Ward')}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 mt-2">
                {t(grievance.description)}
              </h2>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t(grievance.location)}</span>
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t('Lifecycle Status')}
              </span>
              <StatusChip status={grievance.status} size="md" />
              {isResolved && (
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1">
                  ✓ {t('Verified & Closed')}
                </span>
              )}
            </div>
          </div>

          {/* Issue Raised Key Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block text-[10px] font-bold uppercase text-slate-500">{t('Citizen Reported Date')}</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{t(grievance.reportedOn)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block text-[10px] font-bold uppercase text-slate-500">{t('Reporting Resident')}</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{t(grievance.citizenId ? 'Sri. P. Rajesh Kumar' : 'Resident Citizen')}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block text-[10px] font-bold uppercase text-slate-500">{t('Department')}</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{t(grievance.department)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block text-[10px] font-bold uppercase text-slate-500">{t('SLA Target')}</span>
              <span className="font-mono font-bold text-amber-800 mt-0.5 block">{slaTargetHours} {t('Hours')}</span>
            </div>
          </div>
        </section>

        {/* 3. WARD DETAILS & 4. SOLVED BY & ASSIGNED */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 3. WARD DETAILS */}
          <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 space-y-3">
            <h3 className="text-xs font-bold font-heading uppercase text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 className="w-4 h-4 text-kmc-navy" />
              <span>{t('Ward Information')}</span>
            </h3>

            <dl className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Ward Number')}:</dt>
                <dd className="font-bold text-slate-900">{t(`Ward ${grievance.wardId}`)}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Ward Name')}:</dt>
                <dd className="font-bold text-slate-900">{t(ward?.name || 'Local Ward')}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Locality / Landmark')}:</dt>
                <dd className="font-semibold text-slate-800">{t(grievance.location)}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Municipal Scope')}:</dt>
                <dd className="text-slate-700">{t('Karimnagar Municipal Corporation (66 Wards)')}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Assigned Corporator')}:</dt>
                <dd className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">
                  {t(ward?.corporator || 'Ward Corporator')}
                </dd>
              </div>
            </dl>
          </section>

          {/* 4. SOLVED BY AND ASSIGNED */}
          <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 space-y-3">
            <h3 className="text-xs font-bold font-heading uppercase text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <UserCheck className="w-4 h-4 text-kmc-navy" />
              <span>{t('Solved By & Assigned Staff')}</span>
            </h3>

            <dl className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Assigned Field Staff (Solved By)')}:</dt>
                <dd className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                  {t(grievance.assignedTo || associatedTask?.assignedTo || 'Mahesh (Field Staff)')}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Staff Work Category')}:</dt>
                <dd className="font-semibold text-slate-800">
                  {t(associatedTask?.role || grievance.requiredStaffCategory || 'Drainage & Culvert Worker')}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Assignment Date & Time')}:</dt>
                <dd className="font-semibold text-slate-800">
                  {t(workStartEvent?.time || associatedTask?.createdAt || grievance.reportedOn)}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Ground Completion Time')}:</dt>
                <dd className="font-bold text-emerald-800">
                  {t(workCompletedEvent?.time || (isResolved ? grievance.reportedOn : 'Completed on ground'))}
                </dd>
              </div>
              <div className="py-2 flex flex-col gap-1">
                <dt className="text-slate-500">{t('Work Execution Notes')}:</dt>
                <dd className="font-medium text-slate-800 bg-slate-50 p-2 rounded border border-slate-200">
                  {t(workCompletedEvent?.note || associatedTask?.notes || 'Desilting and cover replacement completed with before-and-after photographic verification.')}
                </dd>
              </div>
            </dl>
          </section>

        </div>

        {/* 5. CORPORATOR DETAILS */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 space-y-3">
          <h3 className="text-xs font-bold font-heading uppercase text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{t('Corporator Details & Digital Verification Sign-off')}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <dl className="divide-y divide-slate-100">
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Corporator Name')}:</dt>
                <dd className="font-bold text-slate-900">
                  {t(ward?.corporator || 'Sri. K. Ramesh Rao')}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Designation')}:</dt>
                <dd className="font-semibold text-slate-800">
                  {t('Elected Corporator — Ward {{wardId}}', { wardId: grievance.wardId })}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Verification Outcome')}:</dt>
                <dd className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {t(resolutionEvent?.title || 'Approved & Closed')}
                </dd>
              </div>
            </dl>

            <dl className="divide-y divide-slate-100">
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Sign-off Timestamp')}:</dt>
                <dd className="font-bold text-slate-900">
                  {t(resolutionEvent?.time || '17 May 2024, 05:00 PM')}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Citizen Rating')}:</dt>
                <dd className="font-bold text-amber-700">
                  {grievance.citizenRating ? `${'★'.repeat(grievance.citizenRating)} (${grievance.citizenRating}/5)` : '★★★★★ (5/5)'}
                </dd>
              </div>
              <div className="py-2 flex flex-col gap-1">
                <dt className="text-slate-500">{t('Corporator Approval Note')}:</dt>
                <dd className="font-medium text-slate-800 bg-slate-50 p-2 rounded border border-slate-200">
                  {t(resolutionEvent?.note || 'Corporator compared before/after photos and closed the complaint')}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* 6. REVIEW COMPLETE BUTTON (UNDER THAT) */}
        <section className={`rounded-xl p-6 shadow-card border-2 transition-all ${
          isReviewed ? 'bg-emerald-50/40 border-emerald-400' : 'bg-slate-900 text-white border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-5 h-5 ${isReviewed ? 'text-emerald-700' : 'text-amber-400'}`} />
                <h4 className={`text-base font-bold font-heading uppercase ${isReviewed ? 'text-emerald-950' : 'text-amber-300'}`}>
                  {t('Governance Auditor Review Sign-Off')}
                </h4>
              </div>
              <p className={`text-xs mt-1 max-w-xl ${isReviewed ? 'text-emerald-900' : 'text-slate-300'}`}>
                {isReviewed 
                  ? t('This resolved grievance has been verified and signed off by the Governance Auditor. All photo evidence and municipal sign-offs comply with platform standards.')
                  : t('Confirm that the before & after photographs, field technician assignment, corporator sign-off, and turnaround SLA have been verified.')
                }
              </p>

              {isReviewed && reviewState?.timestamp && (
                <p className="text-[11px] font-mono text-emerald-800 font-bold mt-2">
                  ✓ {t('Audited by {{reviewer}} on {{time}}', {
                    reviewer: t(reviewState.reviewer),
                    time: new Date(reviewState.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  })}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleToggleReviewComplete}
                className={`min-h-[46px] px-6 py-2.5 rounded-xl font-bold text-xs uppercase shadow transition flex items-center gap-2 active:scale-95 ${
                  isReviewed
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-heading border border-amber-500'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isReviewed ? t('✓ Review Complete (Audited)') : t('Review Complete')}</span>
              </button>

              <button
                type="button"
                onClick={handleReturnToQa}
                className="min-h-[46px] px-4 py-2.5 rounded-xl font-bold text-xs uppercase bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('Back to List')}</span>
              </button>
            </div>
          </div>
        </section>

        {/* 7. CHRONOLOGICAL EVENT TIMELINE */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold font-heading uppercase text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-kmc-navy" />
                <span>{t('Chronological Audit Event Timeline')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {t('Immutable log of status transitions, ground task dispatch, photo submission, and officer sign-off.')}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
              {timelineEvents.length} {t('Recorded Events')}
            </span>
          </div>

          <ol className="relative border-l-2 border-slate-200 ml-3 space-y-4 my-2">
            {timelineEvents.map((event, idx) => (
              <li key={idx} className="ml-5 relative">
                <span className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full bg-kmc-navy border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                </span>
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      {t(event.title)}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {t(event.time)}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {t(event.note)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

      </main>

      <FooterStrip
        tagline={t("Karimnagar Municipal Corporation • Digital Governance Audit & Compliance Verification")}
      />
    </div>
  );
};
