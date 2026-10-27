import React, { useState } from 'react';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { INITIAL_GRIEVANCES } from '../data/grievances';
import { KpiCard } from '../components/common/KpiCard';
import { StatusChip } from '../components/common/StatusChip';
import { DonutChart } from '../components/charts/DonutChart';
import { NewComplaintsQueue, VerificationQueue, EvidenceCards } from '../components/ward/WardWorkflow';
import { CitizenStatus } from '../components/photos/CitizenStatus';
import { getBeforePhotos } from '../data/grievances';
import { resolvePhoto } from '../photos/photoStore';
import { TaskTable } from '../components/ward/TaskTable';
import { PhotoThumbnail } from '../components/common/EvidencePhotoModal';
import { FullImagePreview } from '../components/common/FullImagePreview';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/AuthContext';
import { userRepository } from '../storage/repositories/userRepository';
import { 
  Users, CheckCircle2, Clock, AlertTriangle, 
  MapPin, Wrench, HardHat, ShieldCheck, ChevronRight, UserCheck, Phone, Briefcase
} from 'lucide-react';
import { SearchableSelect } from '../components/common/SearchableSelect';
import { usePrefs } from '../i18n';

export const WardPage: React.FC = () => {
  const { activeWard, activeWardId, setActiveWardId, wards, grievances, tasks } = useApp();
  const { currentUser } = useAuth();
  const { t } = usePrefs();

  // If corporator, ensure active ward is their assigned ward (Ward 27)
  const isCorporator = currentUser?.role === 'corporator';
  const corporatorWardId = currentUser?.assignedWardIds?.[0] || 27;
  const effectiveWardId = isCorporator ? corporatorWardId : activeWardId;
  const effectiveWard = wards.find((w) => w.id === effectiveWardId) || activeWard;

  React.useEffect(() => {
    if (isCorporator && currentUser?.assignedWardIds?.[0]) {
      setActiveWardId(currentUser.assignedWardIds[0]);
    }
  }, [isCorporator, currentUser, setActiveWardId]);

  // Dynamic grievances filtered strictly for this ward
  const wardGrievances = grievances.filter((g) => g.wardId === effectiveWardId);
  const wardStaff = userRepository.getFieldStaff({ wardId: effectiveWardId });

  // Ward totals come from the ward register (Ward 27 = Page 6: 128 / 32 / 56 / 40 / 8); grievances
  // filed in this session are added on top. Seeded examples are already part of those totals.
  const seededIds = new Set(INITIAL_GRIEVANCES.map((g) => g.id));
  const newGrievances = wardGrievances.filter((g) => !seededIds.has(g.id));
  const countNew = (match: (status: string) => boolean) => newGrievances.filter((g) => match(g.status)).length;
  const pendingCount = effectiveWard.pendingComplaints + countNew((st) => st === 'Pending');
  const inProgressCount = effectiveWard.inProgressComplaints + countNew((st) => st === 'In Progress');
  const completedCount = effectiveWard.completedComplaints + countNew((st) => st === 'Completed' || st === 'Resolved');
  const overdueCount = effectiveWard.overdueComplaints + countNew((st) => st === 'Overdue');
  const totalWardCount = effectiveWard.totalComplaints + newGrievances.length;

  // Monthly rank among all 66 wards by performance score
  const wardRank = 1 + wards.filter((w) => w.score > effectiveWard.score).length;

  // Civic Works status breakdown (Slide 6 exact)
  const civicWorks = [
    { category: "Road Works", total: 24, pending: 6, inProgress: 12, completed: 6, color: "#F57C00" },
    { category: "Drainage Works", total: 18, pending: 4, inProgress: 8, completed: 6, color: "#0288D1" },
    { category: "Street Lights", total: 42, pending: 4, inProgress: 18, completed: 20, color: "#FBC02D" },
    { category: "Sanitation", total: 44, pending: 12, inProgress: 16, completed: 14, color: "#2E7D32" },
  ];

  // Dynamic Donut data for active ward
  const wardDonutData = [
    { name: "Pending", value: pendingCount, color: "#F57C00" },
    { name: "In Progress", value: inProgressCount, color: "#0288D1" },
    { name: "Completed", value: completedCount, color: "#2E7D32" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      <BannerStrip
        title="4.2 Tier 2: Ward / Division Management System"
        tagline="Operational interface for execution and monitoring at ground level"
        actionButton={
          isCorporator ? (
            <div className="flex items-center gap-1.5 bg-purple-900/80 px-3 py-1.5 rounded-lg text-purple-100 border border-purple-400/40 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{t('Assigned Scope: Ward 27 (Green Park Colony)')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="ward-page-select" className="text-xs text-slate-200 font-medium whitespace-nowrap">{t('Select Ward')}</label>
              <SearchableSelect
                id="ward-page-select"
                value={activeWardId}
                onChange={(val) => setActiveWardId(Number(val))}
                variant="dark"
                size="sm"
                searchPlaceholder="Search 66 wards..."
                options={wards.map((w) => ({
                  value: w.id,
                  label: `Ward ${w.id}: ${w.name}`,
                  sublabel: w.corporator ? `Corporator: ${w.corporator}` : undefined,
                }))}
                className="w-full sm:w-72"
              />
            </div>
          )
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 w-full">
        
        {/* Ward Header Banner */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                {t('Ward Division')} {effectiveWard.id}
              </span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                {t('Score')}: {effectiveWard.score}/100 ({t(effectiveWard.level)})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading uppercase text-slate-900 mt-1">
              {t('Ward Management Dashboard')} – {effectiveWard.name}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {t('Ward Corporator')}: <strong className="text-slate-900">{effectiveWard.corporator}</strong> | {t('Population')}: {effectiveWard.population.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[11px] uppercase font-bold text-slate-500">{t('Monthly Rank')}</span>
              <p className="text-lg font-bold font-heading text-amber-700">
                {t('Rank')} {wardRank} / {wards.length}
              </p>
            </div>
          </div>
        </section>

        {/* Top 5 Ward KPIs */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <KpiCard
            label="Total Grievances"
            value={totalWardCount}
            sublabel={`Ward ${effectiveWard.id} Active Base`}
            icon={<HardHat className="w-5 h-5 text-kmc-navy" />}
            highlightColor="border-l-kmc-navy"
          />
          <KpiCard
            label="Pending"
            value={pendingCount}
            sublabel="Awaiting Action"
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            highlightColor="border-l-amber-500"
          />
          <KpiCard
            label="In Progress"
            value={inProgressCount}
            sublabel="Under Field Work"
            icon={<Wrench className="w-5 h-5 text-blue-600" />}
            highlightColor="border-l-blue-600"
          />
          <KpiCard
            label="Completed"
            value={completedCount}
            sublabel="Verified with Proof"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-700" />}
            highlightColor="border-l-emerald-600"
          />
          <KpiCard
            label="Overdue"
            value={overdueCount}
            sublabel="Breached SLA"
            delta="Alert"
            deltaType="negative"
            icon={<AlertTriangle className="w-5 h-5 text-red-700" />}
            highlightColor="border-l-red-600"
          />
        </section>

        {/* Corporator workflow: new complaints, then work waiting for verification */}
        <NewComplaintsQueue wardId={effectiveWardId} />
        <VerificationQueue wardId={effectiveWardId} />

        {/* Grievance Status Donut & Recent Grievances Table */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Status Donut (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl shadow-card border border-slate-200 p-5 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-2 mb-3">
                <h4 className="text-xs font-bold font-heading uppercase text-slate-800">
                  Grievance Resolution Status
                </h4>
                <p className="text-[11px] text-slate-500">
                  Ward {activeWardId} Operational Load: {totalWardCount} Cases
                </p>
              </div>
              <DonutChart
                data={wardDonutData}
                centerLabel={String(totalWardCount)}
                centerSublabel="Total Issues"
                valueSuffix=""
                height={200}
                innerRadius={50}
                outerRadius={75}
                showLegend={true}
              />
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 text-center">
              Target: Maintain ≥ 85% on-time turnaround by month end
            </div>
          </div>

          {/* Recent Grievances Table (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-card border border-slate-200 p-5 overflow-hidden">
            <div className="border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold font-heading uppercase text-slate-800">
                  Recent Ward Grievances (Live Redressal Stream)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Real-time persistent tickets reported across Ward {activeWard.id}
                </p>
              </div>
              <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded font-semibold">
                Updated Real-Time
              </span>
            </div>

            {/* Under 768px the table becomes stacked cards */}
            <ul className="md:hidden space-y-3">
              {wardGrievances.slice(0, 6).map((g) => {
                const photo = getBeforePhotos(g)[0];
                return (
                  <li key={g.id} className="rounded-xl border-2 border-slate-200 p-3 flex gap-3">
                    {photo && (
                      <FullImagePreview
                        src={resolvePhoto(photo.src)}
                        alt={`Before photo of ${g.category.toLowerCase()}`}
                        title={g.description}
                        variant="thumbnail"
                        className="w-16 h-16 rounded-lg shrink-0"
                      />
                    )}
                    <div className="min-w-0 space-y-1">
                      <p className="text-base font-semibold">{g.description}</p>
                      <p className="text-sm text-slate-600">{g.location} · {g.reportedOn}</p>
                      <CitizenStatus status={g.status} english />
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Grievance / Issue</th>
                    <th className="py-2.5 px-3">Evidence Photo</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Reported On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wardGrievances.slice(0, 6).map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{g.description}</div>
                        <div className="text-[11px] font-mono text-kmc-navy">{g.id} • {g.category}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        {g.beforePhoto ? (
                          <PhotoThumbnail
                            src={g.beforePhoto}
                            alt={`Evidence for ${g.id}`}
                            location={g.location}
                            size="sm"
                          />
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">No image</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{g.location}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusChip status={g.status} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500 font-mono text-[11px]">
                        {g.reportedOn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </section>

        {/* Civic Works Status (Page 6 – printed for Ward 27) */}
        {effectiveWardId === 27 && (
          <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
            <div className="border-b border-slate-100 pb-2.5 mb-3">
              <h4 className="text-xs font-bold font-heading uppercase text-slate-800">{t('Civic Works Status')}</h4>
              <p className="text-[11px] text-slate-500">{t('Ward')} {effectiveWard.id} {t('works by category')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {civicWorks.map((cw) => (
                <div key={cw.category} className="p-3 rounded-lg bg-slate-50 border border-slate-100" style={{ borderTop: `3px solid ${cw.color}` }}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-900">{t(cw.category)}</span>
                    <span className="text-lg font-bold font-heading text-slate-900">{cw.total}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[11px]">
                    <div className="rounded bg-amber-50 text-amber-800 py-1"><strong className="block text-xs">{String(cw.pending).padStart(2, '0')}</strong>{t('Pending')}</div>
                    <div className="rounded bg-blue-50 text-blue-800 py-1"><strong className="block text-xs">{String(cw.inProgress).padStart(2, '0')}</strong>{t('In Progress')}</div>
                    <div className="rounded bg-emerald-50 text-emerald-800 py-1"><strong className="block text-xs">{String(cw.completed).padStart(2, '0')}</strong>{t('Completed')}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ward Field Staff Operations Roster */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-kmc-navy" />
                <h4 className="text-xs font-bold font-heading uppercase text-slate-800">
                  {t('Ward')} {effectiveWardId} {t('Field Staff Operations Roster')}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t('Authorized municipal ground personnel deployed in Ward')} {effectiveWardId} ({effectiveWard.name})
              </p>
            </div>
            <span className={`text-[11px] px-2.5 py-1 rounded font-semibold ${
              wardStaff.length > 0 ? 'bg-purple-100 text-purple-900' : 'bg-amber-100 text-amber-800'
            }`}>
              {wardStaff.length} {t('Deployed Staff')}
            </span>
          </div>

          {wardStaff.length === 0 ? (
            <div className="p-8 text-center bg-amber-50/40">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800">
                {t('No active field staff are assigned to this ward.')}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {t('Contact Super Admin to manage ward assignments.')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
              {wardStaff.map((staff) => {
                const staffTasks = tasks.filter(
                  (t) =>
                    t.wardId === effectiveWardId &&
                    (t.assignedFieldStaffId === staff.id ||
                     t.assignedTo?.toLowerCase() === (staff.displayName || staff.name || '').toLowerCase()) &&
                    t.status !== 'Completed'
                );
                return (
                  <div
                    key={staff.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{staff.displayName || staff.name}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            {staff.id} • {t(staff.departmentId || 'Operations')}
                          </div>
                          {staff.staffCategory && (
                            <div className="mt-1">
                              <span className="text-[10px] font-semibold bg-blue-50 text-blue-900 border border-blue-200 px-1.5 py-0.5 rounded">
                                {staff.staffCategory}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                          {t('Active')}
                        </span>
                      </div>

                      {staff.phone && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-2">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{staff.phone}</span>
                        </div>
                      )}

                      {staff.skills && staff.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {staff.skills.slice(0, 2).map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">{t('Active Tasks')}</span>
                      <span className="font-bold text-slate-900 bg-slate-200/60 px-2 py-0.5 rounded">
                        {staffTasks.length} {t('assigned')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Task Assignments Table (Ground Staff Operations) */}
        <section>
          <TaskTable />
        </section>

        {/* Before / After Evidence with real uploaded photos */}
        <EvidenceCards wardId={effectiveWardId} />
      </main>

      <FooterStrip
        tagline="Stronger Wards. Efficient Services. Happier Citizens."
      />
    </div>
  );
};
