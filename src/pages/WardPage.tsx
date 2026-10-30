import React, { useState, useMemo } from 'react';
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
  MapPin, Wrench, HardHat, ShieldCheck, ChevronRight, UserCheck, Phone, Briefcase,
  Receipt, Landmark, FileCheck, Search, Filter
} from 'lucide-react';
import { SearchableSelect } from '../components/common/SearchableSelect';
import { usePrefs } from '../i18n';
import { getPaymentsForWard } from '../data/payments';

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
  const wardPayments = useMemo(() => getPaymentsForWard(effectiveWardId), [effectiveWardId]);
  const wardApplications = useMemo(() => {
    return wardGrievances.filter(g =>
      g.category.toLowerCase().includes('birth') ||
      g.category.toLowerCase().includes('death') ||
      g.category.toLowerCase().includes('permission') ||
      g.category.toLowerCase().includes('pension') ||
      g.category.toLowerCase().includes('shg') ||
      g.category.toLowerCase().includes('certificate') ||
      g.id.startsWith('APP-')
    );
  }, [wardGrievances]);

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

  // Active status filter state controlled by top KPI cards or stream pills
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'Pending' | 'In Progress' | 'Completed' | 'Overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleKpiClick = (status: 'all' | 'Pending' | 'In Progress' | 'Completed' | 'Overdue') => {
    setActiveStatusFilter(status);
    let targetId = 'ward-grievances-section';
    if (status === 'Pending') {
      targetId = 'new-complaints-section';
    } else if (status === 'In Progress') {
      targetId = 'task-assignments-section';
    } else if (status === 'Completed') {
      targetId = 'verification-queue-section';
    } else if (status === 'Overdue') {
      targetId = 'ward-grievances-section';
    }

    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      targetEl.classList.add('ring-4', 'ring-kmc-navy/30', 'transition-all', 'duration-500');
      setTimeout(() => {
        targetEl.classList.remove('ring-4', 'ring-kmc-navy/30');
      }, 1500);
    }
  };

  const filteredWardGrievances = useMemo(() => {
    return wardGrievances.filter((g) => {
      if (activeStatusFilter === 'Pending') {
        if (g.status !== 'Pending') return false;
      } else if (activeStatusFilter === 'In Progress') {
        if (g.status !== 'In Progress') return false;
      } else if (activeStatusFilter === 'Completed') {
        if (g.status !== 'Completed' && g.status !== 'Resolved') return false;
      } else if (activeStatusFilter === 'Overdue') {
        if (g.status !== 'Overdue') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = g.id.toLowerCase().includes(q);
        const descMatch = g.description.toLowerCase().includes(q);
        const locMatch = g.location.toLowerCase().includes(q);
        const catMatch = g.category.toLowerCase().includes(q);
        const staffMatch = (g.assignedTo || '').toLowerCase().includes(q);
        return idMatch || descMatch || locMatch || catMatch || staffMatch;
      }
      return true;
    });
  }, [wardGrievances, activeStatusFilter, searchQuery]);

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
        title={t("4.2 Tier 2: Ward / Division Management System")}
        tagline={t("Operational interface for execution and monitoring at ground level")}
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
                searchPlaceholder={t("Search 66 wards...")}
                options={wards.map((w) => ({
                  value: w.id,
                  label: t('Ward {{id}}: {{name}}', { id: w.id, name: t(w.name) }),
                  sublabel: w.corporator ? t('Corporator: {{name}}', { name: t(w.corporator) }) : undefined,
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
              {t('Ward Management Dashboard – {{name}}', { name: t(effectiveWard.name) })}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {t('Ward Corporator')}: <strong className="text-slate-900">{t(effectiveWard.corporator)}</strong> | {t('Population')}: {effectiveWard.population.toLocaleString('en-IN')}
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
            sublabel={t('Ward {{ward}} Active Base', { ward: effectiveWard.id })}
            icon={<HardHat className="w-5 h-5 text-kmc-navy" />}
            highlightColor="border-l-kmc-navy"
            onClick={() => handleKpiClick('all')}
            isActive={activeStatusFilter === 'all'}
            actionHint="Inspect All Ward Tickets →"
          />
          <KpiCard
            label="Pending"
            value={pendingCount}
            sublabel="Awaiting Action"
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            highlightColor="border-l-amber-500"
            onClick={() => handleKpiClick('Pending')}
            isActive={activeStatusFilter === 'Pending'}
            actionHint="Review & Validate Queue →"
          />
          <KpiCard
            label="In Progress"
            value={inProgressCount}
            sublabel="Under Field Work"
            icon={<Wrench className="w-5 h-5 text-blue-600" />}
            highlightColor="border-l-blue-600"
            onClick={() => handleKpiClick('In Progress')}
            isActive={activeStatusFilter === 'In Progress'}
            actionHint="Inspect Field Staff Tasks →"
          />
          <KpiCard
            label="Completed"
            value={completedCount}
            sublabel="Verified with Proof"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-700" />}
            highlightColor="border-l-emerald-600"
            onClick={() => handleKpiClick('Completed')}
            isActive={activeStatusFilter === 'Completed'}
            actionHint="Verify Proof & Close →"
          />
          <KpiCard
            label="Overdue"
            value={overdueCount}
            sublabel="Breached SLA"
            delta="Alert"
            deltaType="negative"
            icon={<AlertTriangle className="w-5 h-5 text-red-700" />}
            highlightColor="border-l-red-600"
            onClick={() => handleKpiClick('Overdue')}
            isActive={activeStatusFilter === 'Overdue'}
            actionHint="Inspect SLA Breaches →"
          />
        </section>

        {/* Corporator workflow: new complaints, then work waiting for verification */}
        <NewComplaintsQueue wardId={effectiveWardId} />
        <VerificationQueue wardId={effectiveWardId} />

        {/* Ward Revenue Collections & Citizen Applications Overview */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ward Tax Collections */}
          <div className="bg-white rounded-xl shadow-card border border-slate-200 p-4 border-l-4 border-l-emerald-600 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold font-heading uppercase text-slate-900">
                  {t('Ward {{ward}} Tax & Utility Collections', { ward: effectiveWardId })}
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ₹{wardPayments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()} {t('Collected')}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {wardPayments.slice(0, 3).map((p) => (
                <div key={p.receiptNo} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">{t(p.taxType)}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{p.receiptNo} · {t("Door {{door}} ({{name}})", { door: p.doorNo, name: p.citizenName })}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-700 block">₹{p.amount.toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">{t("Reconciled")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ward Citizen Applications */}
          <div className="bg-white rounded-xl shadow-card border border-slate-200 p-4 border-l-4 border-l-blue-600 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-700" />
                <h4 className="text-xs font-bold font-heading uppercase text-slate-900">
                  {t('Ward {{ward}} Citizen Applications', { ward: effectiveWardId })}
                </h4>
              </div>
              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {wardApplications.length} {t('Active Files')}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {wardApplications.slice(0, 3).map((app) => (
                <div key={app.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="max-w-[240px]">
                    <span className="font-bold text-slate-800 block truncate">{t(app.category)}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{app.description}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusChip status={app.status} size="sm" />
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{app.slaHours}h SLA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Grievance Status Donut & Recent Grievances Table */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Status Donut (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl shadow-card border border-slate-200 p-5 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-2 mb-3">
                <h4 className="text-xs font-bold font-heading uppercase text-slate-800">
                  {t('Grievance Resolution Status')}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t('Ward')} {activeWardId} {t('Operational Load')}: {totalWardCount} {t('Cases')}
                </p>
              </div>
              <DonutChart
                data={wardDonutData}
                centerLabel={String(totalWardCount)}
                centerSublabel={t('Total Issues')}
                valueSuffix=""
                height={200}
                innerRadius={50}
                outerRadius={75}
                showLegend={true}
              />
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 text-center">
              {t('Target: Maintain ≥ 85% on-time turnaround by month end')}
            </div>
          </div>

          {/* Recent Grievances Table (8 cols) */}
          <div id="ward-grievances-section" className="lg:col-span-8 bg-white rounded-xl shadow-card border border-slate-200 p-5 overflow-hidden scroll-mt-20">
            <div className="border-b border-slate-100 pb-3 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold font-heading uppercase text-slate-800 flex items-center gap-2">
                  <span>{t('Ward Grievances Live Redressal Stream')}</span>
                  {activeStatusFilter !== 'all' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-kmc-navy text-white">
                      {t(activeStatusFilter)} ({filteredWardGrievances.length})
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t('Real-time persistent tickets reported across Ward {{ward}}', { ward: activeWard.id })}
                </p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1 flex-wrap">
                {(['all', 'Pending', 'In Progress', 'Completed', 'Overdue'] as const).map((st) => {
                  const isActive = activeStatusFilter === st;
                  const count = st === 'all' ? totalWardCount : st === 'Pending' ? pendingCount : st === 'In Progress' ? inProgressCount : st === 'Completed' ? completedCount : overdueCount;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setActiveStatusFilter(st)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
                        isActive
                          ? 'bg-kmc-navy text-white shadow-sm'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>{st === 'all' ? t('All') : t(st)}</span>
                      <span className={`text-[10px] font-mono px-1 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-3 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search Ward {{ward}} grievances by ID, issue, landmark, category...', { ward: effectiveWardId })}
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-kmc-navy/30 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Under 768px the table becomes stacked cards */}
            <ul className="md:hidden space-y-3">
              {filteredWardGrievances.slice(0, 10).map((g) => {
                const photo = getBeforePhotos(g)[0];
                return (
                  <li key={g.id} className="rounded-xl border-2 border-slate-200 p-3 flex gap-3">
                    {photo && (
                      <FullImagePreview
                        src={resolvePhoto(photo.src)}
                        alt={`${t('BEFORE')}: ${t(g.category.toLowerCase())}`}
                        title={g.description}
                        variant="thumbnail"
                        className="w-16 h-16 rounded-lg shrink-0"
                      />
                    )}
                    <div className="min-w-0 space-y-1 flex-1">
                      <p className="text-base font-semibold text-slate-900">{g.description}</p>
                      <p className="text-xs text-slate-600">{t(g.location)} · {g.reportedOn}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <StatusChip status={g.status} size="sm" />
                        <span className="text-[10px] font-mono text-slate-500 font-bold">{g.id}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {filteredWardGrievances.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs space-y-2">
                <p>{t('No grievances found matching "{{filter}}" in Ward {{ward}}.', { filter: activeStatusFilter, ward: effectiveWardId })}</p>
                <button
                  type="button"
                  onClick={() => { setActiveStatusFilter('all'); setSearchQuery(''); }}
                  className="px-3 py-1 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {t('Reset Filters')}
                </button>
              </div>
            ) : (
              <div className="hidden md:block overflow-x-auto max-h-[460px] overflow-y-auto scrollbar-thin">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200 sticky top-0 z-10 shadow-xs">
                    <tr>
                      <th className="py-2.5 px-3">{t('Grievance / Issue')}</th>
                      <th className="py-2.5 px-3">{t('Evidence Photo')}</th>
                      <th className="py-2.5 px-3">{t('Location')}</th>
                      <th className="py-2.5 px-3">{t('Status')}</th>
                      <th className="py-2.5 px-3">{t('Assigned Staff')}</th>
                      <th className="py-2.5 px-3 text-right">{t('Reported On')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWardGrievances.slice(0, 20).map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 max-w-xs">
                          <div className="font-semibold text-slate-900 leading-snug">{g.description}</div>
                          <div className="text-[11px] font-mono text-kmc-navy mt-0.5">
                            {g.id} • <span className="font-sans font-semibold text-slate-600">{t(g.category)}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {g.beforePhoto ? (
                            <PhotoThumbnail
                              src={g.beforePhoto}
                              alt={`${t('Evidence for')} ${g.id}`}
                              location={t(g.location)}
                              size="sm"
                            />
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">{t('No image')}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{t(g.location)}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block">Ward {g.wardId}</span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <StatusChip status={g.status} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {g.assignedTo ? (
                            <div className="flex items-center gap-1 text-slate-800">
                              <UserCheck className="w-3 h-3 text-blue-600" />
                              <span className="font-medium text-[11px]">{g.assignedTo}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              Awaiting Route
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {g.reportedOn}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                            <span>{t(staff.displayName || staff.name)}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            {staff.id} • {t(staff.departmentId || 'Operations')}
                          </div>
                          {staff.staffCategory && (
                            <div className="mt-1">
                              <span className="text-[10px] font-semibold bg-blue-50 text-blue-900 border border-blue-200 px-1.5 py-0.5 rounded">
                                {t(staff.staffCategory)}
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
                              {t(skill)}
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
        tagline={t('Stronger Wards. Efficient Services. Happier Citizens.')}
      />
    </div>
  );
};
