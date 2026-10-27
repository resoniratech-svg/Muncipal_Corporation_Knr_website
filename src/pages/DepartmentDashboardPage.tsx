import React, { useState, useMemo } from 'react';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { KpiCard } from '../components/common/KpiCard';
import { StatusChip } from '../components/common/StatusChip';
import { DonutChart } from '../components/charts/DonutChart';
import { PhotoThumbnail } from '../components/common/EvidencePhotoModal';
import { FullImageModal } from '../components/common/FullImagePreview';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/AuthContext';
import { 
  Building, Wrench, CheckCircle2, Clock, AlertTriangle, 
  MapPin, Check, Filter, UserCheck, ChevronRight, UserPlus, X, ShieldAlert,
  ChevronDown, ChevronUp, Waves, Construction, Trash2, Lightbulb, Droplet,
  Search, ArrowUpDown, Calendar, Eye, CheckCheck, RefreshCw, Layers
} from 'lucide-react';
import { SearchableSelect } from '../components/common/SearchableSelect';
import { userRepository, staffCategoryRepository } from '../storage';
import { usePrefs } from '../i18n';
import { GrievanceItem } from '../data/grievances';

interface CategoryMeta {
  key: string;
  name: string;
  department: string;
  icon: React.ElementType;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
  defaultSla: number;
}

const CATEGORY_DEFINITIONS: Record<string, CategoryMeta> = {
  drainage: {
    key: 'drainage',
    name: 'Drainage & Stormwater Culverts',
    department: 'Engineering',
    icon: Waves,
    color: 'text-cyan-700',
    borderAccent: 'border-l-cyan-600',
    badgeBg: 'bg-cyan-50 border-cyan-200',
    badgeText: 'text-cyan-900',
    defaultSla: 72,
  },
  roads: {
    key: 'roads',
    name: 'Roads & Surface Maintenance',
    department: 'Engineering',
    icon: Construction,
    color: 'text-amber-700',
    borderAccent: 'border-l-amber-600',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-900',
    defaultSla: 72,
  },
  civil: {
    key: 'civil',
    name: 'Civil Works & Public Infrastructure',
    department: 'Engineering',
    icon: Building,
    color: 'text-indigo-700',
    borderAccent: 'border-l-indigo-600',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-900',
    defaultSla: 72,
  },
  'street-lights': {
    key: 'street-lights',
    name: 'Street Lighting & Electrical Systems',
    department: 'Electrical',
    icon: Lightbulb,
    color: 'text-yellow-700',
    borderAccent: 'border-l-yellow-600',
    badgeBg: 'bg-yellow-50 border-yellow-200',
    badgeText: 'text-yellow-900',
    defaultSla: 48,
  },
  'water-supply': {
    key: 'water-supply',
    name: 'Drinking Water & Pipeline Distribution',
    department: 'Water Supply',
    icon: Droplet,
    color: 'text-sky-700',
    borderAccent: 'border-l-sky-600',
    badgeBg: 'bg-sky-50 border-sky-200',
    badgeText: 'text-sky-900',
    defaultSla: 24,
  },
  sanitation: {
    key: 'sanitation',
    name: 'Sanitation & Solid Waste Management',
    department: 'Sanitation',
    icon: Trash2,
    color: 'text-emerald-700',
    borderAccent: 'border-l-emerald-600',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-900',
    defaultSla: 48,
  },
};

function resolveCategoryKey(g: GrievanceItem): string {
  const c = (g.category || '').toLowerCase();
  const d = (g.description || '').toLowerCase();
  if (c.includes('drain') || d.includes('drain')) return 'drainage';
  if (c.includes('road') || c.includes('pothole') || d.includes('road') || d.includes('pothole')) return 'roads';
  if (c.includes('light') || c.includes('electric') || d.includes('light')) return 'street-lights';
  if (c.includes('water') || c.includes('pipe') || d.includes('water') || d.includes('pipe') || c.includes('leak')) return 'water-supply';
  if (c.includes('sanitation') || c.includes('garbage') || c.includes('waste')) return 'sanitation';
  return 'civil';
}

export const DepartmentDashboardPage: React.FC = () => {
  const { grievances, tasks, wards, assignGrievanceToStaff, approveAndClose } = useApp();
  const { currentUser } = useAuth();
  const { t } = usePrefs();

  const userDept = currentUser?.departmentName || 'Engineering Department';
  const officerName = currentUser?.displayName || 'Er. P. Venkateshwarlu';

  // 1. Ward Selection State: default to Ward 27 or session
  const [selectedWard, setSelectedWard] = useState<string>(() => {
    try {
      return sessionStorage.getItem('kmc_dept_selected_ward') || '27';
    } catch {
      return '27';
    }
  });

  const handleWardChange = (newWard: string) => {
    setSelectedWard(newWard);
    try {
      sessionStorage.setItem('kmc_dept_selected_ward', newWard);
    } catch {}
  };

  // 2. Search, Status, and Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'In Progress' | 'Completed' | 'Resolved'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'sla'>('newest');

  // 3. Collapsible categories state (all open by default for rapid overview)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const toggleCategory = (key: string) => {
    setCollapsedCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 4. Modal and preview state
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);
  const [assigneeName, setAssigneeName] = useState('');
  const [targetDueDate, setTargetDueDate] = useState('Next 48 Hours');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ src: string; title: string; location: string } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Department-wide grievances belonging strictly to this department's operational scope
  const deptGrievancesAll = useMemo(() => {
    return grievances.filter(g => {
      const deptLower = (g.department || '').toLowerCase();
      const catLower = (g.category || '').toLowerCase();
      return (
        deptLower.includes('engineering') || 
        catLower.includes('drainage') || 
        catLower.includes('road') ||
        catLower.includes('civil') ||
        g.department === 'Engineering'
      );
    });
  }, [grievances]);

  // Ward Selector options
  const wardOptions = useMemo(() => {
    const allOption = {
      value: 'all',
      label: t('All Wards (66 Wards — City-Wide Oversight)'),
      sublabel: t('View and dispatch department grievances across the entire municipality'),
    };

    const perWard = wards.map((w) => {
      const count = deptGrievancesAll.filter((g) => g.wardId === w.id).length;
      const pendingInWard = deptGrievancesAll.filter((g) => g.wardId === w.id && g.status === 'Pending').length;
      return {
        value: String(w.id),
        label: `Ward ${w.id} — ${w.name}`,
        sublabel: `Corporator: ${w.corporator} • ${count} grievance(s) (${pendingInWard} pending)`,
      };
    });

    return [allOption, ...perWard];
  }, [wards, deptGrievancesAll, t]);

  // Grievances filtered strictly by the selected Ward!
  const wardFilteredGrievances = useMemo(() => {
    if (selectedWard === 'all') {
      return deptGrievancesAll;
    }
    const targetWardNum = parseInt(selectedWard, 10);
    return deptGrievancesAll.filter((g) => g.wardId === targetWardNum);
  }, [deptGrievancesAll, selectedWard]);

  // Active ward info object
  const activeWardObj = useMemo(() => {
    if (selectedWard === 'all') return null;
    return wards.find(w => w.id === parseInt(selectedWard, 10)) || null;
  }, [wards, selectedWard]);

  // Filter and sort grievances within the selected ward
  const processedGrievances = useMemo(() => {
    return wardFilteredGrievances
      .filter(g => {
        // Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'Completed' && g.status !== 'Completed') return false;
          if (statusFilter === 'Resolved' && g.status !== 'Resolved') return false;
          if (statusFilter === 'Pending' && g.status !== 'Pending') return false;
          if (statusFilter === 'In Progress' && g.status !== 'In Progress') return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchId = g.id.toLowerCase().includes(q);
          const matchDesc = g.description.toLowerCase().includes(q);
          const matchLoc = g.location.toLowerCase().includes(q);
          const matchAssignee = (g.assignedTo || '').toLowerCase().includes(q);
          if (!matchId && !matchDesc && !matchLoc && !matchAssignee) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'sla') {
          return (a.slaHours || 72) - (b.slaHours || 72);
        }
        if (sortBy === 'oldest') {
          return a.id.localeCompare(b.id);
        }
        // newest
        return b.id.localeCompare(a.id);
      });
  }, [wardFilteredGrievances, statusFilter, searchQuery, sortBy]);

  // Metric counts for the selected ward
  const totalCount = wardFilteredGrievances.length;
  const pendingCount = wardFilteredGrievances.filter(g => g.status === 'Pending').length;
  const inProgressCount = wardFilteredGrievances.filter(g => g.status === 'In Progress').length;
  const completedCount = wardFilteredGrievances.filter(g => g.status === 'Completed' || g.status === 'Resolved').length;
  const overdueCount = wardFilteredGrievances.filter(g => g.status === 'Overdue').length;

  const donutData = useMemo(() => [
    { name: t('Pending'), value: pendingCount, color: '#F57C00' },
    { name: t('In Progress'), value: inProgressCount, color: '#0288D1' },
    { name: t('Resolved/Closed'), value: completedCount, color: '#2E7D32' },
  ], [pendingCount, inProgressCount, completedCount, t]);

  // Group grievances by Category!
  const categoryGroups = useMemo(() => {
    // Primary department categories
    const baseKeys = ['drainage', 'roads', 'civil'];
    
    // Also discover any additional categories present in the current grievance set
    const presentKeys = new Set<string>(baseKeys);
    wardFilteredGrievances.forEach(g => {
      presentKeys.add(resolveCategoryKey(g));
    });

    const groups = Array.from(presentKeys).map(key => {
      const meta = CATEGORY_DEFINITIONS[key] || {
        key,
        name: key.toUpperCase(),
        department: 'Engineering',
        icon: Wrench,
        color: 'text-slate-700',
        borderAccent: 'border-l-slate-600',
        badgeBg: 'bg-slate-50 border-slate-200',
        badgeText: 'text-slate-900',
        defaultSla: 72,
      };

      // All grievances for this category in the selected ward
      const allCategoryGrievances = wardFilteredGrievances.filter(g => resolveCategoryKey(g) === key);
      
      // Grievances matching current search & status filters
      const filteredCategoryGrievances = processedGrievances.filter(g => resolveCategoryKey(g) === key);

      const catPending = allCategoryGrievances.filter(g => g.status === 'Pending').length;
      const catInProgress = allCategoryGrievances.filter(g => g.status === 'In Progress').length;
      const catResolved = allCategoryGrievances.filter(g => g.status === 'Completed' || g.status === 'Resolved').length;
      const catOverdue = allCategoryGrievances.filter(g => g.status === 'Overdue').length;

      return {
        meta,
        allGrievances: allCategoryGrievances,
        grievances: filteredCategoryGrievances,
        total: allCategoryGrievances.length,
        pending: catPending,
        inProgress: catInProgress,
        resolved: catResolved,
        overdue: catOverdue,
      };
    });

    // Sort groups so categories with grievances appear first
    return groups.sort((a, b) => b.total - a.total);
  }, [wardFilteredGrievances, processedGrievances]);

  // Modal Handlers
  const handleOpenAssignModal = (gid: string) => {
    setSelectedGrievanceId(gid);
    const { eligibleStaff } = staffCategoryRepository.getEligibleFieldStaff(gid, currentUser?.id);
    setAssigneeName(eligibleStaff.length > 0 ? eligibleStaff[0].displayName : '');
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrievanceId) return;

    try {
      const { eligibleStaff, targetWardId, requiredCategory } = staffCategoryRepository.getEligibleFieldStaff(selectedGrievanceId, currentUser?.id);
      const targetAssignee = assigneeName || (eligibleStaff.length > 0 ? eligibleStaff[0].displayName : '');
      if (!targetAssignee) {
        throw new Error(`No eligible ${requiredCategory?.name || 'field staff'} selected for Ward ${targetWardId}.`);
      }
      assignGrievanceToStaff(selectedGrievanceId, targetAssignee, targetDueDate, officerName);
      showToast(t(`Grievance ${selectedGrievanceId} assigned to ${targetAssignee} (Ward ${targetWardId}). Task dispatched to Field Staff portal!`));
      setSelectedGrievanceId(null);
      setAssigneeName('');
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch task.');
    }
  };

  const handleApproveGrievance = (gid: string) => {
    approveAndClose(gid, officerName);
    showToast(t(`Resolution verified and approved for Grievance ${gid}!`));
  };

  // Dispatched tasks strictly filtered to selected ward
  const displayedTasks = useMemo(() => {
    const deptTasks = tasks.filter(t => 
      t.departmentId?.toLowerCase().includes('engineering') || 
      t.task.toLowerCase().includes('drain') || 
      t.task.toLowerCase().includes('road') ||
      t.task.toLowerCase().includes('pothole')
    );
    if (selectedWard === 'all') return deptTasks;
    const targetWardNum = parseInt(selectedWard, 10);
    return deptTasks.filter(t => t.wardId === targetWardNum);
  }, [tasks, selectedWard]);

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      <BannerStrip
        title={`${t('Department Officer Portal')} • ${t(userDept)}`}
        tagline="Ward-Specific Grievance Redressal, Category Grouping & Ground Staff Dispatch"
        actionButton={
          <span className="text-xs bg-orange-700 text-white font-bold px-3 py-1 rounded-md shadow uppercase tracking-wide">
            {t('72h SLA Active')}
          </span>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 w-full">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-white hover:text-emerald-200">✕</button>
          </div>
        )}

        {/* PROMINENT WARD SELECTOR COMMAND BAR */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-4 sm:p-5 border-l-4 border-l-kmc-navy">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-bold font-mono uppercase bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded flex items-center gap-1.5 border border-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-kmc-navy" />
                  {t('Operational Ward Selection')}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {selectedWard === 'all'
                    ? t('Displaying grievances across all 66 municipal wards')
                    : t('Filtering grievances strictly for {{ward}}', {
                        ward: activeWardObj ? `Ward ${activeWardObj.id} (${activeWardObj.name})` : `Ward ${selectedWard}`
                      })}
                </span>
              </div>

              <div className="max-w-xl">
                <label htmlFor="dept-ward-select" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  {t('Select Ward')}:
                </label>
                <SearchableSelect
                  value={selectedWard}
                  onChange={handleWardChange}
                  searchPlaceholder={t('Search ward number or colony name...')}
                  options={wardOptions}
                  fullWidth
                  size="md"
                />
              </div>
            </div>

            {/* Quick status counters for selected scope */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shrink-0 flex items-center gap-4 text-xs">
              <div className="text-center px-2">
                <span className="block text-[10px] uppercase font-bold text-slate-500">{t('Total')}</span>
                <span className="text-lg font-bold font-mono text-slate-900">{totalCount}</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center px-2">
                <span className="block text-[10px] uppercase font-bold text-amber-700">{t('Pending')}</span>
                <span className="text-lg font-bold font-mono text-amber-800">{pendingCount}</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center px-2">
                <span className="block text-[10px] uppercase font-bold text-blue-700">{t('Active')}</span>
                <span className="text-lg font-bold font-mono text-blue-800">{inProgressCount}</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center px-2">
                <span className="block text-[10px] uppercase font-bold text-emerald-700">{t('Resolved')}</span>
                <span className="text-lg font-bold font-mono text-emerald-800">{completedCount}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Officer Welcome & Department Scope Console */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-orange-500">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono bg-orange-100 text-orange-900 px-2 py-0.5 rounded">
                {t('Operational Wing')}: {t('Engineering')}
              </span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                {t('SLA Compliance: 85% On-Time')}
              </span>
              {activeWardObj && (
                <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                  {t('Elected Corporator')}: {activeWardObj.corporator}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading uppercase text-slate-900 mt-1">
              {officerName} – {t('Department Command Console')}
            </h2>
            <p className="text-xs text-slate-500">
              {selectedWard === 'all'
                ? t('Managing city-wide Engineering grievances across all 66 Wards.')
                : t('Managing Engineering grievances for Ward {{ward}} ({{name}}).', {
                    ward: selectedWard,
                    name: activeWardObj?.name || 'Local Ward'
                  })}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] text-slate-500 uppercase font-bold">{t('Standard SLA')}</span>
            <p className="text-lg font-bold font-heading text-orange-700">{t('72 Hours Max')}</p>
          </div>
        </section>

        {/* 4 Ward-Specific KPI Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            label={selectedWard === 'all' ? t('Total City Grievances') : t('Ward {{id}} Grievances', { id: selectedWard })}
            value={totalCount}
            sublabel={t('Engineering Scope')}
            icon={<Building className="w-5 h-5 text-orange-700" />}
            highlightColor="border-l-orange-500"
          />
          <KpiCard
            label={t('Pending Assignment')}
            value={pendingCount}
            sublabel={t('Awaiting Field Staff')}
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            highlightColor="border-l-amber-500"
          />
          <KpiCard
            label={t('Under Execution')}
            value={inProgressCount}
            sublabel={t('Ground Teams Deployed')}
            icon={<Wrench className="w-5 h-5 text-blue-600" />}
            highlightColor="border-l-blue-600"
          />
          <KpiCard
            label={t('Resolved & Closed')}
            value={completedCount}
            sublabel={t('Photo Proof Verified')}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-700" />}
            highlightColor="border-l-emerald-600"
          />
        </section>

        {/* SEARCH, STATUS FILTER AND SORT BAR */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search by ID, keyword, street...')}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-kmc-navy/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {(['all', 'Pending', 'In Progress', 'Completed', 'Resolved'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-kmc-navy text-white shadow'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? t('All Statuses') : t(st)}
              </button>
            ))}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-semibold">{t('Sort')}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="newest">{t('Newest First')}</option>
              <option value="oldest">{t('Oldest First')}</option>
              <option value="sla">{t('SLA Target (Urgent)')}</option>
            </select>
          </div>
        </section>

        {/* CATEGORY-WISE GRIEVANCE GROUPING SECTIONS */}
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold font-heading uppercase text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-kmc-navy" />
              <span>{t('Category-Wise Grievance Redressal')}</span>
              {selectedWard !== 'all' && (
                <span className="text-xs font-normal text-slate-600">
                  ({t('Ward {{ward}}', { ward: selectedWard })})
                </span>
              )}
            </h3>

            <div className="text-xs text-slate-500">
              <span>{processedGrievances.length} {t('records shown across {{count}} categories', { count: categoryGroups.length })}</span>
            </div>
          </div>

          {/* Render Each Category Group */}
          {categoryGroups.map((group) => {
            const isCollapsed = !!collapsedCategories[group.meta.key];
            const IconComponent = group.meta.icon;

            return (
              <section
                key={group.meta.key}
                className={`bg-white rounded-xl shadow-card border border-slate-200 overflow-hidden transition-all border-l-4 ${group.meta.borderAccent}`}
              >
                {/* Category Group Header Card */}
                <div
                  onClick={() => toggleCategory(group.meta.key)}
                  className="p-4 sm:p-4.5 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm ${group.meta.badgeBg}`}>
                      <IconComponent className={`w-5 h-5 ${group.meta.color}`} />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold font-heading uppercase text-slate-900 flex items-center gap-2">
                        {t(group.meta.name)}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {t('Operational Wing')}: {t(group.meta.department)} • {t('SLA: {{hours}}h Target', { hours: group.meta.defaultSla })}
                      </p>
                    </div>
                  </div>

                  {/* Summary Metric Badges & Accordion Toggle */}
                  <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-auto">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-200 text-slate-800">
                      {group.total} {t('Total')}
                    </span>

                    {group.pending > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {group.pending} {t('Pending')}
                      </span>
                    )}

                    {group.inProgress > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-900 border border-blue-200">
                        {group.inProgress} {t('Active')}
                      </span>
                    )}

                    {group.resolved > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                        {group.resolved} {t('Resolved')}
                      </span>
                    )}

                    <div className="text-slate-400 p-1">
                      {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Category Grievance Table / List */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-5">
                    {group.grievances.length === 0 ? (
                      <div className="py-6 px-4 text-center rounded-xl bg-slate-50/60 border border-dashed border-slate-200">
                        <IconComponent className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                        <p className="text-xs font-semibold text-slate-600">
                          {selectedWard === 'all'
                            ? t('No active {{cat}} grievances matching filters.', { cat: t(group.meta.name) })
                            : t('No active {{cat}} grievances reported in Ward {{ward}}.', { cat: t(group.meta.name), ward: selectedWard })}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {t('Any newly reported grievances in this category will be grouped here for staff dispatch.')}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">{t('Grievance ID')}</th>
                              <th className="py-2.5 px-3">{t('Issue Description')}</th>
                              <th className="py-2.5 px-3">{t('Location & Ward')}</th>
                              <th className="py-2.5 px-3">{t('Site Photo')}</th>
                              <th className="py-2.5 px-3">{t('Reported On')}</th>
                              <th className="py-2.5 px-3">{t('SLA Target')}</th>
                              <th className="py-2.5 px-3">{t('Status')}</th>
                              <th className="py-2.5 px-3">{t('Assigned Staff')}</th>
                              <th className="py-2.5 px-3 text-right">{t('Action')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {group.grievances.map((g) => (
                              <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 px-3 font-mono font-bold text-kmc-navy whitespace-nowrap">
                                  {g.id}
                                </td>
                                <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs">
                                  {t(g.description)}
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 text-slate-700">
                                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <span>{t(g.location)}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-500 font-bold block mt-0.5">
                                    Ward {g.wardId}
                                  </span>
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  {g.beforePhoto ? (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewPhoto({
                                        src: g.beforePhoto!,
                                        title: `${g.id}: ${g.category}`,
                                        location: `${g.location} (Ward ${g.wardId})`,
                                      })}
                                      className="relative group block"
                                      title={t('Click to inspect full photograph evidence')}
                                    >
                                      <PhotoThumbnail
                                        src={g.beforePhoto}
                                        alt={`Site Photo for ${g.id}`}
                                        location={t(g.location)}
                                        size="sm"
                                      />
                                      <span className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 rounded-lg flex items-center justify-center transition opacity-0 group-hover:opacity-100">
                                        <Eye className="w-3.5 h-3.5 text-white" />
                                      </span>
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 italic">{t('No photo')}</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                                  {g.reportedOn}
                                </td>
                                <td className="py-3 px-3 font-mono text-xs font-bold text-amber-800 whitespace-nowrap">
                                  {g.slaHours || group.meta.defaultSla} {t('Hours')}
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <StatusChip status={g.status} size="sm" />
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  {g.assignedTo ? (
                                    <div className="flex items-center gap-1.5 text-slate-800">
                                      <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                      <span className="font-semibold text-xs">{g.assignedTo}</span>
                                    </div>
                                  ) : (
                                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                      {t('Awaiting Assignment')}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-right whitespace-nowrap">
                                  {g.status === 'Pending' ? (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAssignModal(g.id)}
                                      className="px-3 py-1.5 min-h-[34px] bg-kmc-navy hover:bg-kmc-navy-light text-white font-bold text-xs rounded-lg flex items-center gap-1.5 ml-auto shadow-sm transition active:scale-95"
                                    >
                                      <UserPlus className="w-3.5 h-3.5" />
                                      <span>{t('Assign Staff')}</span>
                                    </button>
                                  ) : g.status === 'Completed' ? (
                                    <button
                                      type="button"
                                      onClick={() => handleApproveGrievance(g.id)}
                                      className="px-3 py-1.5 min-h-[34px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 ml-auto shadow-sm transition active:scale-95"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>{t('Approve & Close')}</span>
                                    </button>
                                  ) : g.status === 'Resolved' ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                                      {t('Signed Off')}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-slate-500 font-mono">
                                      {t('In Execution')}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Civic Asset Spotlight */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 flex flex-col md:flex-row items-center gap-5">
          <div className="w-full md:w-56 h-36 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-sm relative group bg-slate-950">
            <img
              src="images/civic-works/cable-bridge.jpg"
              alt="Engineering Civic Works - Manair River Cable Bridge"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-2 left-2 bg-slate-950/80 text-white font-bold text-[11px] uppercase px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
              {t('Engineering Asset')}
            </span>
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold text-kmc-navy bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {t('Major Civic Infrastructure')}
              </span>
              <span className="text-xs font-bold text-slate-700">{t('Manair River Cable-Stayed Bridge & Arterial Approaches')}</span>
            </div>
            <h4 className="text-sm font-bold font-heading uppercase text-slate-900">
              {t('Corridor Maintenance & Structural Redressal Program')}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('Supervising ongoing road surfacing, stormwater drains, culverts, and structural maintenance connecting Karimnagar across all municipal divisions.')}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono">
              <span>✓ {t('Inspection Status: Verified')}</span>
              <span>•</span>
              <span>{t('Field Teams: Deployed')}</span>
              <span>•</span>
              <span>{t('Executive Wing: Roads, Bridges & Culverts')}</span>
            </div>
          </div>
        </section>

        {/* Ward-Specific Dispatched Field Tasks */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold font-heading uppercase text-slate-800">
                {selectedWard === 'all'
                  ? t('Field Staff Task Progress (City-Wide Execution)')
                  : t('Field Staff Task Progress (Ward {{ward}} Execution)', { ward: selectedWard })}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t('Monitor work dispatched to field technicians, desilting operators, and road crews')}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
              {displayedTasks.length} {t('Dispatched Tasks')}
            </span>
          </div>

          {displayedTasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              {t('No active dispatched tasks in this scope.')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedTasks.map((task) => (
                <div key={task.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono font-bold text-slate-500">{task.id}</span>
                      <StatusChip status={task.status} size="sm" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 font-heading uppercase">
                      {task.task}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {t('Assigned')}: <strong>{task.assignedTo}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {t('Due Date')}: {task.dueDate}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-bold">Ward {task.wardId}</span>
                    {task.status !== 'Completed' ? (
                      <span className="text-amber-800 font-bold">{t('Waiting for after photo')}</span>
                    ) : (
                      <span className="text-emerald-700 font-bold">✓ {t('Completed')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* WARD-SPECIFIC STAFF ASSIGNMENT MODAL DIALOG */}
      {selectedGrievanceId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold font-heading uppercase text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-kmc-navy" />
                <span>{t('Dispatch Task to Field Staff')}</span>
              </h4>
              <button
                onClick={() => setSelectedGrievanceId(null)}
                className="text-slate-500 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const {
                eligibleStaff: eligibleWardStaff,
                grievance: targetG,
                requiredCategory,
                targetWardId,
              } = staffCategoryRepository.getEligibleFieldStaff(selectedGrievanceId || '', currentUser?.id);
              
              const hasStaff = eligibleWardStaff.length > 0;
              const effectiveAssignee = assigneeName || (hasStaff ? eligibleWardStaff[0].displayName : '');

              return (
                <>
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-kmc-navy">{selectedGrievanceId}</span>
                      <span className="text-xs font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                        Ward {targetWardId}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {targetG ? t(targetG.description) : t('Grievance')}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{targetG?.location}</span>
                    </p>

                    {requiredCategory && (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200 mt-2">
                        <span className="text-[11px] font-bold text-slate-600 uppercase">{t('Required Staff Category')}:</span>
                        <span className="text-[11px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                          {requiredCategory.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {!hasStaff ? (
                    <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>{t('No active {{cat}} is assigned to Ward {{ward}}.', { cat: requiredCategory?.name || 'Field Staff', ward: targetWardId })}</span>
                      </p>
                      <p className="text-amber-800 leading-relaxed text-[11px]">
                        {t('This grievance will remain in the Awaiting Assignment queue. Cross-ward staff assignments are strictly prohibited by KMC governance rules to ensure ward-level accountability.')}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {t('{{count}} eligible {{cat}} worker(s) assigned to Ward {{ward}} ready for deployment.', {
                          count: eligibleWardStaff.length,
                          cat: requiredCategory?.name || 'Field Staff',
                          ward: targetWardId,
                        })}
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleConfirmAssignment} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        {t('Select Eligible Field Worker (Ward {{ward}})', { ward: targetWardId })}
                      </label>
                      {hasStaff ? (
                        <SearchableSelect
                          value={effectiveAssignee}
                          onChange={(val) => setAssigneeName(val)}
                          searchPlaceholder={t('Search {{cat}} in Ward {{ward}}...', { cat: requiredCategory?.name || 'Field Staff', ward: targetWardId })}
                          options={eligibleWardStaff.map((s) => {
                            const workload = tasks.filter((t) => (t.assignedFieldStaffId === s.id || t.assignedTo === s.displayName) && t.status !== 'Completed').length;
                            return {
                              value: s.displayName,
                              label: s.displayName,
                              sublabel: `ID: ${s.id} • Ward ${s.wardId} • ${s.staffCategory || s.roleTitle} • ${workload} active task(s)`,
                            };
                          })}
                          fullWidth
                          size="sm"
                        />
                      ) : (
                        <input
                          type="text"
                          disabled
                          value={t('No active {{cat}} assigned to Ward {{ward}}', { cat: requiredCategory?.name || 'staff', ward: targetWardId })}
                          className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 text-xs cursor-not-allowed opacity-75"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        {t('Target Completion SLA Deadline')}
                      </label>
                      <input
                        type="text"
                        value={targetDueDate}
                        onChange={(e) => setTargetDueDate(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-kmc-navy/30 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSelectedGrievanceId(null)}
                        className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 text-xs"
                      >
                        {t('Cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={!hasStaff || (!assigneeName && !effectiveAssignee)}
                        className="px-4 py-2 bg-kmc-navy hover:bg-kmc-navy-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg uppercase shadow text-xs transition"
                      >
                        {t('Confirm & Dispatch Task')}
                      </button>
                    </div>
                  </form>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* FULL PHOTO EVIDENCE PREVIEW MODAL */}
      {previewPhoto && (
        <FullImageModal
          src={previewPhoto.src}
          alt={previewPhoto.title}
          title={previewPhoto.title}
          location={previewPhoto.location}
          badge={t('Site Evidence')}
          badgeVariant="before"
          onClose={() => setPreviewPhoto(null)}
        />
      )}

      <FooterStrip
        tagline="Departmental Workflow & Grievance SLA Redressal System • Karimnagar Municipal Corporation"
      />
    </div>
  );
};
