import React from 'react';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { KpiCard } from '../components/common/KpiCard';
import { StatusChip } from '../components/common/StatusChip';
import { DonutChart } from '../components/charts/DonutChart';
import { BarChart } from '../components/charts/BarChart';
import { LineChart } from '../components/charts/LineChart';
import { 
  WARD_27_KPIS, KPI_TRENDS_6_MONTHS, RANKING_TABLE_PAGE_9, 
  PERFORMANCE_DISTRIBUTION_66, UNDERPERFORMING_WARDS, ACTION_PLAN_PAGE_8, TOP_5_PAGE_8 
} from '../data/kpis';
import { 
  Award, Trophy, TrendingUp, AlertTriangle, CheckCircle2, 
  ShieldCheck, ArrowUpRight, ArrowDownRight, Minus, BarChart3 
} from 'lucide-react';
import { usePrefs } from '../i18n';

export const PerformancePage: React.FC = () => {
  const { t } = usePrefs();

  // KPI comparison data: Ward 27 vs City Average
  const comparisonData = [
    { name: t("Res Time (d)"), value: 2.4, secondaryValue: 3.5 },
    { name: t("Resolved (%)"), value: 86, secondaryValue: 72 },
    { name: t("Quality (★)"), value: 4.3 * 20, secondaryValue: 3.8 * 20 },
    { name: t("Budget (%)"), value: 78, secondaryValue: 65 },
    { name: t("Cleanliness (%)"), value: 80, secondaryValue: 68 },
  ];

  // 6-month trend lines configuration
  const trendLines = [
    { key: "issuesResolvedPct", name: t("Issues Resolved (%)"), color: "#2E7D32" },
    { key: "cleanlinessScore", name: t("Cleanliness Score (%)"), color: "#0288D1" },
    { key: "budgetUtilPct", name: t("Budget Utilized (%)"), color: "#F57C00" },
  ];

  const distributionDonutData = PERFORMANCE_DISTRIBUTION_66.map(d => ({
    name: t(d.name),
    value: d.percentage,
    color: d.color,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      <BannerStrip
        title={t("5. Ward Performance Evaluation Framework & Ranking System")}
        tagline={t("Measure. Monitor. Improve. Better Performance. Better Karimnagar.")}
        actionButton={
          <span className="text-xs bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-md shadow uppercase tracking-wide">
            {t("May 2024 Evaluation")}
          </span>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 w-full">
        
        {/* Ward 27 Evaluation Summary Header (Slide 8 exact) */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                {t("Ward 27 – Green Park Colony")}
              </span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                {t("Overall Score: 85 / 100 (Grade: Very Good)")}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {t("↑9 points vs Apr 2024")}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading uppercase text-slate-900 mt-1">
              {t("Monthly Ward Performance Monitoring Dashboard – May 2024")}
            </h2>
            <p className="text-xs text-slate-500">
              {t("Predefined KPIs drive accountability, healthy competition, and continuous improvement across 66 wards.")}
            </p>
          </div>

          {/* Ward Performance Ranking – May 2024 as printed on Page 8 */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs min-w-[220px]">
            <span className="text-[11px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              {t("Ward Performance Ranking – May 2024")}
            </span>
            {TOP_5_PAGE_8.map((r) => (
              <div key={r.rank} className={`flex justify-between gap-3 py-0.5 ${r.ward.includes('27') ? 'font-bold text-kmc-navy' : 'text-slate-700'}`}>
                <span>{r.rank}. {t(r.ward)}</span>
                <span>{r.score} · {t(r.performance)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 5 Core KPI Metric Cards for Ward 27 (Slide 8 exact) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {WARD_27_KPIS.map((kpi, idx) => {
            const targetIds = [
              'kpi-trends-section',
              'kpi-comparison-section',
              'ward-ranking-section',
              'kpi-comparison-section',
              'underperforming-wards-section',
            ];
            const targetId = targetIds[idx] || 'kpi-trends-section';

            const handleCardClick = () => {
              const el = document.getElementById(targetId);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                el.classList.add('ring-4', 'ring-kmc-navy/30');
                setTimeout(() => el.classList.remove('ring-4', 'ring-kmc-navy/30'), 1500);
              }
            };

            return (
              <KpiCard
                key={idx}
                label={t(kpi.name)}
                value={kpi.value}
                delta={kpi.delta}
                deltaType={kpi.deltaType}
                sublabel={`${t("City Avg")}: ${kpi.cityAvgValue}${kpi.unit === '★/5' ? '/5' : kpi.unit === '%' ? '%' : ' d'}`}
                highlightColor={idx === 0 ? "border-l-blue-600" : idx === 1 ? "border-l-emerald-600" : idx === 2 ? "border-l-amber-500" : idx === 3 ? "border-l-purple-600" : "border-l-teal-600"}
                onClick={handleCardClick}
                actionHint={t("Inspect Trend →")}
              />
            );
          })}
        </section>

        {/* 6-Month Trend Chart & Comparison vs City Average */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Trend Lines (Slide 8) */}
          <div id="kpi-trends-section" className="scroll-mt-24 bg-white rounded-xl shadow-card border border-slate-200 p-5 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-2 mb-3">
                <h4 className="text-xs font-bold font-heading uppercase text-slate-800">
                  {t("Ward 27 KPI Progress Trend (Last 6 Months: Dec 2023 – May 2024)")}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t("Continuous performance growth across issues resolved, cleanliness, and budget efficiency")}
                </p>
              </div>
              <LineChart data={KPI_TRENDS_6_MONTHS} lines={trendLines} height={230} />
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 text-center">
              {t("Steady upward trajectory: Cleanliness up from 66% to 80%; Resolution up from 70% to 86%.")}
            </div>
          </div>

          {/* KPI Comparison (Ward 27 vs City Average) */}
          <div id="kpi-comparison-section" className="scroll-mt-24 bg-white rounded-xl shadow-card border border-slate-200 p-5 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold font-heading uppercase text-slate-800">
                    {t("KPI Comparison (Ward 27 vs City Average)")}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {t("Navy = Ward 27 | Green = City Average Benchmark")}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold">
                  <span className="flex items-center gap-1 text-kmc-navy">
                    <span className="w-2.5 h-2.5 rounded bg-kmc-navy"></span>
                    {t("Ward 27")}
                  </span>
                  <span className="flex items-center gap-1 text-kmc-green">
                    <span className="w-2.5 h-2.5 rounded bg-[#7CB342]"></span>
                    {t("City Avg")}
                  </span>
                </div>
              </div>
              <BarChart
                data={comparisonData}
                dataKey="value"
                secondaryDataKey="secondaryValue"
                height={230}
              />
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 text-center">
              {t("Ward 27 outperforms city average in TAT (2.4 vs 3.5 days) and resolved percentage (86% vs 72%).")}
            </div>
          </div>

        </section>

        {/* 5.2 Performance Ranking System (Slide 9 Exact) */}
        <section id="ward-ranking-section" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {t("Section 5.2")}
              </span>
              <h3 className="text-lg font-bold font-heading uppercase text-slate-900 mt-1">
                {t("Ward Performance Ranking System – May 2024")}
              </h3>
            </div>
            <div className="text-xs text-slate-600 font-medium">
              {t("City Overall Average Score:")} <strong className="text-slate-800 font-mono">68.4 / 100</strong> ({t("66 Wards")})
            </div>
          </div>

          {/* Top 3 Trophies */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 border-2 border-amber-300 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center font-heading shrink-0 shadow">
                1st
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-amber-800">{t("Top Performing Ward")}</span>
                <h4 className="text-sm font-bold font-heading uppercase text-slate-900">
                  {t("Ward 27 – Green Park Colony")}
                </h4>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                  {t("Score: 89 / 100 (Grade A+, Excellent) ↑5")}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-300 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-300 text-slate-800 font-black text-xl flex items-center justify-center font-heading shrink-0 shadow">
                2nd
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-600">{t("Runner Up")}</span>
                <h4 className="text-sm font-bold font-heading uppercase text-slate-900">
                  {t("Ward 12 – Satellite Colony")}
                </h4>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                  {t("Score: 86 / 100 (Grade A, Very Good) ↑3")}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100/60 border-2 border-orange-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-orange-300 text-orange-950 font-black text-xl flex items-center justify-center font-heading shrink-0 shadow">
                3rd
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-orange-800">{t("Third Position")}</span>
                <h4 className="text-sm font-bold font-heading uppercase text-slate-900">
                  {t("Ward 33 – Huzurabad Road")}
                </h4>
                <p className="text-xs font-semibold text-blue-700 mt-0.5">
                  {t("Score: 78 / 100 (Grade B+, Good) ↑2")}
                </p>
              </div>
            </div>
          </div>

          {/* 7-Row Ranking Table & 66-Ward Distribution Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 7-Row Detailed Ranking Table (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-xl shadow-card border border-slate-200 p-5 overflow-hidden">
              <div className="border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold font-heading uppercase text-slate-800">
                    {t("Ward Performance Ranking Table – May 2024")}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {t("Recognize excellence, encourage accountability, and drive healthy competition")}
                  </p>
                </div>
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                  {t("Official Monthly Report")}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">{t("Rank")}</th>
                      <th className="py-2.5 px-3">{t("Ward")}</th>
                      <th className="py-2.5 px-3">{t("Score")}</th>
                      <th className="py-2.5 px-3">{t("Grade")}</th>
                      <th className="py-2.5 px-3">{t("Level")}</th>
                      <th className="py-2.5 px-3 text-right">{t("Trend")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {RANKING_TABLE_PAGE_9.map((row) => (
                      <tr key={row.rank} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          #{row.rank}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {t(row.name)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                          {row.score}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-kmc-navy">
                          {row.grade}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusChip status={t(row.level)} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-xs">
                          {row.trendType === 'up' ? (
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{row.trend}</span>
                          ) : row.trendType === 'down' ? (
                            <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">{row.trend}</span>
                          ) : (
                            <span className="text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">{row.trend}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Distribution Donut (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-xl shadow-card border border-slate-200 p-5 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-2 mb-3">
                  <h4 className="text-xs font-bold font-heading uppercase text-slate-800">
                    {t("Performance Distribution (66 Wards)")}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {t("Distribution across 4 performance tiers")}
                  </p>
                </div>
                <DonutChart
                  data={distributionDonutData}
                  centerLabel="66"
                  centerSublabel={t("Total Wards")}
                  height={190}
                  innerRadius={50}
                  outerRadius={75}
                  showLegend={true}
                />
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 text-center">
                {t("50% of wards in Excellent / Very Good tier; 10% requiring corrective intervention.")}
              </div>
            </div>
          </div>
        </section>

        {/* Underperforming Wards Table */}
        <section id="underperforming-wards-section" className="scroll-mt-24 bg-white rounded-xl shadow-card border border-slate-200 p-5">
          <div className="border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              <div>
                <h4 className="text-xs font-bold font-heading uppercase text-rose-950">
                  {t("Underperforming Wards Flagged for Timely Intervention (Scores < 60)")}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t("Targeted corrective interventions directed by the Municipal Commissioner")}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              {t("3 Wards Flagged")}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-rose-50/50 text-rose-900 font-bold uppercase text-[11px] tracking-wider border-b border-rose-100">
                <tr>
                  <th className="py-2.5 px-3">{t("Ward")}</th>
                  <th className="py-2.5 px-3">{t("Score")}</th>
                  <th className="py-2.5 px-3">{t("Major Areas of Concern")}</th>
                  <th className="py-2.5 px-3 text-right">{t("Action Required")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {UNDERPERFORMING_WARDS.map((w, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/20 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {t(w.ward)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-700">
                      {w.score} / 100
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {t(w.concerns)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold text-[11px]">
                        {t(w.action)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Performance Improvement Action Plan Table (Slide 8 exact) */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
          <div className="border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold font-heading uppercase text-slate-800">
                {t("Performance Improvement Action Plan (Ward 27 Targets)")}
              </h4>
              <p className="text-[11px] text-slate-500">
                {t("Time-bound departmental roadmap to attain ≥ 90% across all indicators by 30 June 2024")}
              </p>
            </div>
            <span className="text-xs font-bold text-kmc-navy bg-slate-100 px-2.5 py-0.5 rounded">
              {t("Deadline: 30 Jun 2024")}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">{t("KPI")}</th>
                  <th className="py-2.5 px-3">{t("Current")}</th>
                  <th className="py-2.5 px-3">{t("Target")}</th>
                  <th className="py-2.5 px-3">{t("Action Plan")}</th>
                  <th className="py-2.5 px-3">{t("Responsible Dept.")}</th>
                  <th className="py-2.5 px-3 text-right">{t("Deadline")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ACTION_PLAN_PAGE_8.map((plan, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {t(plan.kpi)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                      {plan.current}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                      {plan.target}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {t(plan.actionPlan)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-kmc-navy">
                      {t(plan.department)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-500 whitespace-nowrap">
                      {t(plan.deadline)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      <FooterStrip
        tagline={t("Data-Driven. People-Centric. Performance-Focused. A Better Karimnagar.")}
      />
    </div>
  );
};
