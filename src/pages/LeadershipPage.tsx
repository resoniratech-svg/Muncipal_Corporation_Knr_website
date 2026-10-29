import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { ReopenedAlerts, RecentComplaints, ComplaintViewerModal } from '../components/leadership/ComplaintsPanel';
import { GrievanceItem } from '../data/grievances';
import { KpiCard } from '../components/common/KpiCard';
import { DonutChart } from '../components/charts/DonutChart';
import { BarChart } from '../components/charts/BarChart';
import { WardMapSvg } from '../components/charts/WardMapSvg';
import { WardOverviewPanel } from '../components/leadership/WardOverviewPanel';
import { useApp } from '../context/AppContext';
import { usePrefs } from '../i18n';
import { BUDGET_PAGE_5_LEADERSHIP, BUDGET_HARMONIZED } from '../data/budget';
import { 
  Users, Building2, CheckCircle2, Clock, AlertOctagon, 
  Bot, AlertTriangle, ArrowUpRight, TrendingUp, ShieldCheck, ArrowRight 
} from 'lucide-react';

export const LeadershipPage: React.FC = () => {
  const navigate = useNavigate();
  const { dataMode, activeWard, activeWardId, setActiveWardId, isDelayEscalated, grievances } = useApp();
  const { t } = usePrefs();

  const budget = dataMode === 'deck-exact' ? BUDGET_PAGE_5_LEADERSHIP : BUDGET_HARMONIZED;
  const [viewing, setViewing] = React.useState<GrievanceItem | null>(null);
  // Ward whose overview is open beside the heat-map (null = full-width map)
  const [overviewWardId, setOverviewWardId] = React.useState<number | null>(null);
  const overviewRef = React.useRef<HTMLDivElement>(null);
  const openWardOverview = (id: number) => {
    setActiveWardId(id);
    setOverviewWardId(id);
    // On narrow screens the overview sits below the map
    if (window.innerWidth < 1024) requestAnimationFrame(() => overviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  // Real calculation from persisted grievances
  const totalGrievances = grievances.length;
  const inProgressGrievances = grievances.filter(g => g.status === 'In Progress').length;
  const resolvedGrievances = grievances.filter(g => g.status === 'Resolved' || g.status === 'Completed').length;
  // Deck-exact mode shows the Page 5 printed rate; harmonized mode adds the live records to the Page 5 base.
  const resRate = dataMode === 'deck-exact'
    ? 78
    : Math.round(((1356 + resolvedGrievances) / (2458 + totalGrievances)) * 100);

  const complaintCategories = [
    { name: t("Sanitation"), value: 35, color: "#2E7D32" },
    { name: t("Roads"), value: 25, color: "#F57C00" },
    { name: t("Water Supply"), value: 15, color: "#0288D1" },
    { name: t("Street Lights"), value: 10, color: "#FBC02D" },
    { name: t("Others"), value: 15, color: "#7B1FA2" },
  ];

  const topPendingWards = [
    { name: `${t("Ward")} 27`, value: 184, color: "#D32F2F" },
    { name: `${t("Ward")} 12`, value: 142, color: "#F57C00" },
    { name: `${t("Ward")} 33`, value: 118, color: "#F57C00" },
    { name: `${t("Ward")} 18`, value: 95, color: "#0288D1" },
    { name: `${t("Ward")} 45`, value: 76, color: "#0288D1" },
  ];

  const departmentPerformance = [
    { name: t("Sanitation Section"), value: 82, color: "#2E7D32" },
    { name: t("Engineering Section"), value: 76, color: "#D97706" },
    { name: t("Revenue Section"), value: 85, color: "#0288D1" },
    { name: t("Town Planning Section (TPS)"), value: 74, color: "#7C3AED" },
    { name: t("Establishment Section"), value: 88, color: "#2563EB" },
    { name: t("Statistics Section"), value: 91, color: "#475569" },
    { name: t("Urban Welfare (MEPMA & Asara)"), value: 84, color: "#DB2777" },
  ];

  const budgetDonutData = [
    { name: t("Utilized"), value: budget.percentage, color: "#2E7D32" },
    { name: t("Balance"), value: 100 - budget.percentage, color: "#E2E8F0" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      <BannerStrip
        title="4.1 Tier 1: Leadership Dashboard"
        tagline="A high-level command interface for policy oversight and administrative control"
        actionButton={
          <div className="flex items-center gap-2 bg-slate-900/60 px-2.5 py-1 rounded text-white text-xs border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono">{t("Live Update: 10:30 AM")}</span>
          </div>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 w-full">
        
        {/* Top 6 KPI Metric Badges */}
        <section data-tour="kpis" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <KpiCard
            label="Total Population"
            value="6,10,000"
            sublabel="Karimnagar City"
            icon={<Users className="w-5 h-5 text-kmc-navy" />}
            highlightColor="border-l-kmc-navy"
          />
          <KpiCard
            label="Total Wards"
            value="66"
            sublabel="Administrative Divisions"
            icon={<Building2 className="w-5 h-5 text-purple-700" />}
            highlightColor="border-l-purple-600"
          />
          <KpiCard
            label="Total Complaints"
            value={dataMode === 'deck-exact' ? '2,458' : (2458 + totalGrievances).toLocaleString('en-IN')}
            sublabel="Today"
            icon={<Clock className="w-5 h-5 text-blue-600" />}
            highlightColor="border-l-blue-600"
          />
          <KpiCard
            label="In Progress"
            value={dataMode === 'deck-exact' ? '1,102' : (1102 + inProgressGrievances).toLocaleString('en-IN')}
            sublabel="Field Assignments"
            icon={<Clock className="w-5 h-5 text-amber-700" />}
            highlightColor="border-l-amber-500"
          />
          <KpiCard
            label="Resolved"
            value={dataMode === 'deck-exact' ? '1,356' : (1356 + resolvedGrievances).toLocaleString('en-IN')}
            sublabel="Completed with Proof"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-700" />}
            highlightColor="border-l-emerald-600"
          />
          <KpiCard
            label="Resolution Rate"
            value={`${resRate}%`}
            sublabel="Target: ≥ 85%"
            icon={<TrendingUp className="w-5 h-5 text-teal-600" />}
            highlightColor="border-l-teal-600"
          />
        </section>

        {/* Complaints citizens reopened, then recent complaints with before/after */}
        <ReopenedAlerts onOpen={setViewing} />
        <RecentComplaints onOpen={setViewing} />

        {/* Delay Escalation Live Alert */}
        {isDelayEscalated && (
          <div 
            onClick={() => navigate('/workflow')}
            className="p-4 bg-red-600 text-white rounded-xl shadow-lg flex items-center justify-between gap-3 animate-pulse cursor-pointer hover:bg-red-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold text-sm font-heading uppercase">
                  {t("URGENT COMMISSIONER ESCALATION: Grievance GRV-2024-27-0045")}
                </h4>
                <p className="text-xs text-red-100">
                  {t("Drain Overflow at Ramakrishna Nagar exceeded the 72-hour Engineering SLA without resolution. Click to view hierarchical escalation ladder.")}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold uppercase bg-white text-red-800 px-3 py-1 rounded-full shadow">
              {t("Investigate →")}
            </span>
          </div>
        )}

        {/* 66-Ward Interactive Heat Map & Active Drilldown */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-kmc-navy bg-blue-50 px-2 py-0.5 rounded">
                {t("Spatial City Intelligence")}
              </span>
              <h3 className="text-base font-bold font-heading text-slate-800 uppercase mt-1">
                {t("66-Ward Civic Performance Heat Map")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("Click any ward to see its overview: corporator, field staff and other staff with mobile numbers, citizens using the app, and issues solved and pending.")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-[11px] text-slate-500 uppercase font-bold block">{t("Selected Ward")}</span>
                <span className="text-sm font-bold text-kmc-navy font-heading">
                  {t("Ward")} {activeWard.id}: {t(activeWard.name)}
                </span>
              </div>
              <button
                onClick={() => navigate('/ward')}
                className="px-3 py-2 min-h-[36px] bg-kmc-navy hover:bg-kmc-navy-light text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow"
              >
                <span>{t("Open Ward Console")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {overviewWardId === null ? (
            <WardMapSvg selectedWardId={activeWardId} onWardSelect={openWardOverview} />
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 items-start">
              <div className="w-full lg:w-[30%] lg:shrink-0 lg:sticky lg:top-[200px] lg:max-h-[calc(100vh-210px)] lg:overflow-y-auto">
                <WardMapSvg compact selectedWardId={overviewWardId} onWardSelect={openWardOverview} />
              </div>
              <div ref={overviewRef} className="w-full lg:w-[70%] min-w-0 scroll-mt-4">
                <WardOverviewPanel wardId={overviewWardId} onClose={() => setOverviewWardId(null)} onOpenComplaint={setViewing} />
              </div>
            </div>
          )}
        </section>

        {/* Middle Section: Budget Overview & Grievance AI Overview */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Budget Overview (FY 2024-25) */}
          <div className="bg-white rounded-xl shadow-card border border-slate-200 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-kmc-green bg-green-50 px-2 py-0.5 rounded">
                    {t("Financial Oversight")}
                  </span>
                  <h3 className="text-base font-bold font-heading text-slate-800 uppercase mt-1">
                    {t("Budget Overview")} ({dataMode === 'deck-exact' ? t("FY 2024-25") : t("Harmonized FY 2024-25")})
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">{t("Utilization Rate")}</span>
                  <p className="text-base font-extrabold text-emerald-700 font-heading">
                    {budget.percentage}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <DonutChart
                  data={budgetDonutData}
                  centerLabel={`₹${budget.utilizedCr} Cr`}
                  centerSublabel={`${t("Utilized")} (${budget.percentage}%)`}
                  height={190}
                  innerRadius={50}
                  outerRadius={75}
                  showLegend={false}
                />

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">{t("Total Budget:")}</span>
                    <strong className="text-slate-900 font-mono">₹{budget.totalBudgetCr} Cr</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">{t("Allocated to Wards:")}</span>
                    <strong className="text-slate-900 font-mono">₹{budget.allocatedCr} Cr</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-emerald-50 border border-emerald-100 text-emerald-900">
                    <span className="font-medium">{t("Utilized:")}</span>
                    <strong className="font-mono">₹{budget.utilizedCr} Cr</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-blue-50 border border-blue-100 text-blue-900">
                    <span className="font-medium">{t("Available Balance:")}</span>
                    <strong className="font-mono">₹{budget.balanceCr} Cr</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              {dataMode === 'deck-exact' 
                ? t("* Baseline budget totals: ₹215 Cr Budget, ₹138 Cr Utilized (64% Rate).")
                : t("* Harmonized totals: ₹315 Cr Budget, ₹215 Cr Utilized (68% Rate).")}
            </div>
          </div>

          {/* Grievance Overview & AI Routing */}
          <div className="bg-white rounded-xl shadow-card border border-slate-200 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {t("AI Grievance Intelligence")}
                  </span>
                  <h3 className="text-base font-bold font-heading text-slate-800 uppercase mt-1">
                    {t("Grievance Overview & Categorization")}
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full font-semibold border border-blue-200">
                  <Bot className="w-3.5 h-3.5" />
                  <span>{t("AI-Routed: 1,945")}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">{t("Total Grievances")}</span>
                  <p className="text-lg font-bold font-heading text-slate-900">2,458</p>
                </div>
                <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                  <span className="text-[11px] text-rose-700 uppercase font-semibold">{t("High Priority")}</span>
                  <p className="text-lg font-bold font-heading text-rose-800">298</p>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-[11px] text-emerald-700 uppercase font-semibold">{t("Avg. Resolution Time")}</span>
                  <p className="text-lg font-bold font-heading text-emerald-800">2.6 Days</p>
                </div>
              </div>

              <div className="mt-2">
                <DonutChart
                  data={complaintCategories}
                  height={170}
                  innerRadius={45}
                  outerRadius={68}
                  showLegend={true}
                />
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>{t("Automated classification active")}</span>
              <span className="text-emerald-700 font-semibold">{t("1,945 of 2,458 AI-Routed")}</span>
            </div>
          </div>
        </section>

        {/* Lower Grid: Recent Alerts, Top Pending Wards & Department Performance */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Alerts (Interactive Navigation) */}
          <div className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h4 className="text-xs font-bold font-heading uppercase text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>{t("Recent System Alerts (Live)")}</span>
              </h4>
              <span className="text-[11px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                {t("3 Pending")}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div 
                onClick={() => navigate('/ward')}
                className="p-3 rounded-lg bg-rose-50 border border-rose-200 cursor-pointer hover:bg-rose-100/70 transition-all"
                title="Click to view Ward 27"
              >
                <div className="flex items-center justify-between text-[11px] text-rose-700 font-bold mb-1">
                  <span>10:15 AM</span>
                  <span className="bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded uppercase">{t("Critical")}</span>
                </div>
                <p className="text-slate-900 font-semibold">
                  {t("High pendency in Ward 27 – Sanitation")}
                </p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  {t("Escalated to Sanitation Section for immediate clearance. Click to open ward console.")}
                </p>
              </div>

              <div 
                onClick={() => navigate('/performance')}
                className="p-3 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100/70 transition-all"
                title="Click to view performance rankings"
              >
                <div className="flex items-center justify-between text-[11px] text-amber-700 font-bold mb-1">
                  <span>09:45 AM</span>
                  <span className="bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded uppercase">{t("Financial")}</span>
                </div>
                <p className="text-slate-900 font-semibold">
                  {t("Budget utilization below 40% in 12 Wards")}
                </p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  {t("Administrative review required with concerned executive engineers.")}
                </p>
              </div>

              <div 
                onClick={() => navigate('/department')}
                className="p-3 rounded-lg bg-blue-50 border border-blue-200 cursor-pointer hover:bg-blue-100/70 transition-all"
                title="Click to view departments"
              >
                <div className="flex items-center justify-between text-[11px] text-blue-700 font-bold mb-1">
                  <span>09:20 AM</span>
                  <span className="bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded uppercase">{t("Service Surge")}</span>
                </div>
                <p className="text-slate-900 font-semibold">
                  {t("Water supply complaints rising in Wards 12, 18, 33")}
                </p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  {t("Immediate attention needed from Water Works division.")}
                </p>
              </div>
            </div>
          </div>

          {/* Top Pending Wards (Bar Chart) */}
          <div className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h4 className="text-xs font-bold font-heading uppercase text-slate-800">
                {t("Top Pending Wards (Backlog)")}
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">{t("Pending Complaints")}</span>
            </div>
            <BarChart
              data={topPendingWards}
              height={230}
              horizontal={true}
              unit=" issues"
            />
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              {t("Ward 27 has highest pendency (184), followed by Ward 12 (142).")}
            </p>
          </div>

          {/* Department Performance (Resolution Rate) */}
          <div className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h4 className="text-xs font-bold font-heading uppercase text-slate-800">
                {t("Department Performance (Resolution Rate)")}
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">{t("% Completed")}</span>
            </div>
            <BarChart
              data={departmentPerformance}
              height={230}
              horizontal={true}
              color="#2E7D32"
              unit="%"
            />
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              {t("Sanitation leads at 82% resolution; Engineering requires acceleration at 68%.")}
            </p>
          </div>

        </section>

      </main>

      {viewing && <ComplaintViewerModal complaint={viewing} onClose={() => setViewing(null)} />}

      <FooterStrip
        tagline="Smart Governance. Stronger Karimnagar. Better Tomorrow."
      />
    </div>
  );
};
