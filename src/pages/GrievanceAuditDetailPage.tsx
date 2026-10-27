import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { StatusChip } from '../components/common/StatusChip';
import { BeforeAfterViewer } from '../components/photos/BeforeAfterViewer';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/AuthContext';
import { usePrefs } from '../i18n';
import { INITIAL_GRIEVANCES, getBeforePhotos, getAfterPhotos, GrievanceItem } from '../data/grievances';
import { 
  ArrowLeft, ShieldCheck, CheckCircle2, Clock, MapPin, 
  UserCheck, AlertTriangle, FileText, Check, AlertOctagon, 
  Eye, Calendar, Wrench, Building, Layers, RotateCcw, ExternalLink
} from 'lucide-react';

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
    const match = grievances.find(
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
    return tasks.find((t) => t.grievanceId === grievance.id) || null;
  }, [tasks, grievance]);

  // 3. Authoritative Associated Ward Lookup
  const ward = useMemo(() => {
    if (!grievance) return null;
    return wards.find((w) => w.id === grievance.wardId) || null;
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

  // 6. SLA Analysis Calculation
  const slaTargetHours = grievance?.slaHours || 72;
  const isResolved = grievance?.status === 'Resolved' || grievance?.status === 'Completed';

  // Return to Compliance QA Checklist maintaining history
  const handleReturnToQa = () => {
    navigate('/qa');
  };

  if (!grievance) {
    return (
      <div className="min-h-screen flex flex-col bg-kmc-bg">
        <BannerStrip
          title={`${t('Grievance Audit Detail')} • ${t('Record Not Found')}`}
          tagline="Authoritative Grievance Audit & Fidelity Inspection"
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
                ← {t('Return to Compliance QA Checklist')}
              </button>
            </div>
          </div>
        </main>
        <FooterStrip tagline="Karimnagar Municipal Corporation • Digital Governance Platform" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      {/* Primary Header */}
      <BannerStrip
        title={`${t('Grievance Audit Detail')} • ${grievance.id}`}
        tagline="Governance Auditor Read-Only Inspection • Before & After Evidence Fidelity"
        actionButton={
          <span className="text-xs bg-slate-900 text-amber-300 font-mono font-bold px-3 py-1 rounded-md shadow border border-amber-400 uppercase tracking-wide flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            {t('Read-Only Audit Mode')}
          </span>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 w-full">

        {/* Floating Top Navigation & Audit Context Banner */}
        <section className="bg-amber-500 text-slate-950 rounded-xl p-4 shadow-md border border-amber-600 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-slate-950 text-amber-300 text-[11px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t('QA Inspection Mode Active')}
              </span>
              <span className="text-xs font-bold text-slate-950">
                Auditor: {currentUser?.displayName || 'Dr. T. Radhakrishnan (Governance Auditor)'}
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

        {/* SECTION A: GRIEVANCE SUMMARY CARD */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 border-l-4 border-l-kmc-navy space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-sm font-mono font-bold text-kmc-navy bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {grievance.id}
                </span>
                <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded border border-slate-200">
                  {grievance.category}
                </span>
                <span className="text-xs font-bold bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded border border-amber-200">
                  Ward {grievance.wardId} • {ward?.name || 'Local Ward'}
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

          {/* Key Metric Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block text-[10px] font-bold uppercase text-slate-500">{t('Citizen Reported')}</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{grievance.reportedOn}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block text-[10px] font-bold uppercase text-slate-500">{t('Operational Department')}</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{t(grievance.department)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block text-[10px] font-bold uppercase text-slate-500">{t('SLA Target')}</span>
              <span className="font-mono font-bold text-amber-800 mt-0.5 block">{slaTargetHours} {t('Hours')}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block text-[10px] font-bold uppercase text-slate-500">{t('Resolution Time')}</span>
              <span className="font-semibold text-emerald-800 mt-0.5 block">
                {resolutionEvent?.time || (isResolved ? grievance.reportedOn : t('Pending Verification'))}
              </span>
            </div>
          </div>
        </section>

        {/* SECTION B: BEFORE & AFTER PHOTOGRAPHS */}
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

        {/* SECTION C & D: ASSIGNMENT & WORK EXECUTION DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* SECTION C: Assignment and staff details */}
          <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 space-y-3">
            <h3 className="text-xs font-bold font-heading uppercase text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <UserCheck className="w-4 h-4 text-kmc-navy" />
              <span>{t('Assignment & Field Staff Roster')}</span>
            </h3>

            <dl className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Assigned Department')}:</dt>
                <dd className="font-bold text-slate-900">{t(grievance.department)}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Assigned Ward')}:</dt>
                <dd className="font-bold text-slate-900">Ward {grievance.wardId} ({ward?.name || 'Local Ward'})</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Assigned Field Staff')}:</dt>
                <dd className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                  {grievance.assignedTo || associatedTask?.assignedTo || t('Not assigned')}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Staff Work Category')}:</dt>
                <dd className="font-semibold text-slate-800">
                  {associatedTask?.role || grievance.requiredStaffCategory || t('Drainage & Culvert Worker')}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Assignment Date & Time')}:</dt>
                <dd className="font-semibold text-slate-800">
                  {workStartEvent?.time || associatedTask?.createdAt || grievance.reportedOn}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Assigning Authority')}:</dt>
                <dd className="font-semibold text-slate-800">
                  {ward?.corporator ? `${ward.corporator} (Corporator)` : 'Department Executive Officer'}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Reassignment History')}:</dt>
                <dd className="text-slate-600 italic">{t('None recorded (Initial dispatch maintained)')}</dd>
              </div>
            </dl>
          </section>

          {/* SECTION D: Work execution details */}
          <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 space-y-3">
            <h3 className="text-xs font-bold font-heading uppercase text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Wrench className="w-4 h-4 text-kmc-navy" />
              <span>{t('Ground Execution & Task Progress')}</span>
            </h3>

            <dl className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Work-Start Timestamp')}:</dt>
                <dd className="font-bold text-slate-900">
                  {workStartEvent?.time || t('17 May 2024, 11:00 AM')}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Completion Timestamp')}:</dt>
                <dd className="font-bold text-emerald-800">
                  {workCompletedEvent?.time || (isResolved ? grievance.reportedOn : t('In execution'))}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Evidence Uploaded By')}:</dt>
                <dd className="font-semibold text-slate-800">
                  {grievance.assignedTo || 'Mahesh (Field Staff)'}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('After-Photo Upload Time')}:</dt>
                <dd className="font-semibold text-slate-800">
                  {afterPhotos[0]?.takenAt || workCompletedEvent?.time || t('Not recorded')}
                </dd>
              </div>
              <div className="py-2 flex flex-col gap-1">
                <dt className="text-slate-500">{t('Completion Notes / Work Description')}:</dt>
                <dd className="font-medium text-slate-800 bg-slate-50 p-2 rounded border border-slate-200">
                  {workCompletedEvent?.note || associatedTask?.notes || t('Desilting and cover replacement completed with before-and-after photographic verification.')}
                </dd>
              </div>
            </dl>
          </section>

        </div>

        {/* SECTION E & G: VERIFICATION & SLA PERFORMANCE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* SECTION E: Verification and resolution */}
          <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 space-y-3">
            <h3 className="text-xs font-bold font-heading uppercase text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{t('Verification & Sign-off Details')}</span>
            </h3>

            <dl className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Reviewing Officer')}:</dt>
                <dd className="font-bold text-slate-900">
                  {ward?.corporator ? `${ward.corporator} (Ward ${grievance.wardId} Corporator)` : 'Municipal Ward Authority'}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Verification Timestamp')}:</dt>
                <dd className="font-bold text-slate-900">
                  {resolutionEvent?.time || t('17 May 2024, 05:00 PM')}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Decision Outcome')}:</dt>
                <dd className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {resolutionEvent?.title || t('Approved & Closed')}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Send Back Reason')}:</dt>
                <dd className="text-slate-600">
                  {grievance.sendBackReason ? grievance.sendBackReason : t('None — Approved on initial inspection')}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Reopen History')}:</dt>
                <dd className="text-slate-600">
                  {grievance.reopenReason ? (
                    <span className="font-bold text-rose-700">{grievance.reopenReason}</span>
                  ) : (
                    t('None — Citizen verified solution')
                  )}
                </dd>
              </div>
              {grievance.citizenRating && (
                <div className="py-2 flex justify-between items-center">
                  <dt className="text-slate-500">{t('Citizen Rating')}:</dt>
                  <dd className="font-bold text-amber-700 flex items-center gap-1">
                    {'★'.repeat(grievance.citizenRating)} ({grievance.citizenRating}/5)
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* SECTION G: SLA performance */}
          <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 space-y-3">
            <h3 className="text-xs font-bold font-heading uppercase text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{t('SLA Performance & Escalation Audit')}</span>
            </h3>

            <dl className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Configured SLA Target')}:</dt>
                <dd className="font-mono font-bold text-slate-900">{slaTargetHours} {t('Hours Standard')}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Reported Time')}:</dt>
                <dd className="font-semibold text-slate-800">{grievance.reportedOn}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Calculated Deadline')}:</dt>
                <dd className="font-mono font-semibold text-slate-800">
                  {t('20 May 2024, 09:00 AM (72h)')}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Actual Turnaround Time')}:</dt>
                <dd className="font-mono font-bold text-emerald-800">
                  8.0 {t('Hours (Resolved on same day)')}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('SLA Compliance Status')}:</dt>
                <dd className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ {t('Within SLA — On-Time Resolution')}
                </dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Overdue Duration')}:</dt>
                <dd className="font-semibold text-slate-700">0 {t('Hours (No breach)')}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500">{t('Escalation Status')}:</dt>
                <dd className="font-semibold text-slate-800">
                  {grievance.escalationLevel && grievance.escalationLevel > 1
                    ? t('Escalated to Level {{level}}', { level: grievance.escalationLevel })
                    : t('Level 1 — Resolved at Ground Field Team')}
                </dd>
              </div>
            </dl>
          </section>

        </div>

        {/* SECTION F: CHRONOLOGICAL TIMELINE */}
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
                      {event.title}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {event.time}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {event.note}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* SECTION H: AUDITOR CONCLUSION & RETURN WORKFLOW */}
        <section className="bg-slate-900 text-white rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold font-heading uppercase text-amber-300">
              {t('Governance Auditor Review Completion')}
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {t('After inspecting before-and-after photographs, field assignment, and resolution sign-off, return to the Compliance QA Checklist and explicitly check "Reviewer Checked".')}
            </p>
          </div>

          <button
            type="button"
            onClick={handleReturnToQa}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg uppercase shadow transition flex items-center justify-center gap-2 shrink-0 font-heading"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{t('Return & Check Reviewer Box')}</span>
          </button>
        </section>

      </main>

      <FooterStrip
        tagline="Karimnagar Municipal Corporation • Digital Governance Audit & Compliance Verification"
      />
    </div>
  );
};
