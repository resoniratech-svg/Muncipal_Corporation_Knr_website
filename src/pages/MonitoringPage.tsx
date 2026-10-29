import React from 'react';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { KpiCard } from '../components/common/KpiCard';
import { StatusChip } from '../components/common/StatusChip';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, AlertTriangle, Users, FileText, ArrowRight, 
  CheckCircle2, Clock, Calendar, BarChart3, TrendingUp 
} from 'lucide-react';
import { usePrefs } from '../i18n';

export const MonitoringPage: React.FC = () => {
  const { dataMode, auditLog } = useApp();
  const { t } = usePrefs();

  const monthlyReportRows = [
    { rank: 1, ward: t("Ward 12 – Satellite Colony"), resRate: "96%", tat: `2.1 ${t("Days")}`, rating: "4.6 / 5", status: t("Excellent") },
    { rank: 2, ward: t("Ward 8 – Tower Circle"), resRate: "92%", tat: `2.8 ${t("Days")}`, rating: "4.3 / 5", status: t("Very Good") },
    { rank: 3, ward: t("Ward 5 – Kashmirgadda"), resRate: "90%", tat: `3.1 ${t("Days")}`, rating: "4.2 / 5", status: t("Good") },
  ];

  const escalationSteps = [
    { step: 1, title: t("Step 1: Issue Logged / Detected"), desc: t("Citizen or sensor logs grievance with SLA counter") },
    { step: 2, title: t("Step 2: SLA Breach Exceeded"), desc: t("Target hours elapsed without field status update") },
    { step: 3, title: t("Step 3: Automatic Escalation"), desc: t("System triggers high-priority alert without manual intervention") },
    { step: 4, title: t("Step 4: Alert Sent to Leadership"), desc: t("Delivered to Commissioner, Addl Commissioner & HoD dashboard") },
    { step: 5, title: t("Step 5: Review & Action Taken"), desc: t("Command directive issued; emergency resource dispatched") },
    { step: 6, title: t("Step 6: Issue Resolved & Closed"), desc: t("Photo proof uploaded, citizen notified & feedback recorded") },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('ring-4', 'ring-kmc-navy/30', 'transition-all', 'duration-500');
      setTimeout(() => el.classList.remove('ring-4', 'ring-kmc-navy/30'), 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      <BannerStrip
        title={t("9. Governance & Monitoring Mechanism")}
        tagline={t("Monitor. Analyze. Act. Better Karimnagar, Together.")}
        actionButton={
          <span className="text-xs bg-kmc-navy text-white font-bold px-3 py-1 rounded-md shadow uppercase tracking-wide border border-white/20">
            {t("Commissioner's Command Office")}
          </span>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 w-full">
        
        {/* Top 4 City Complaints Stats Bar */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            label={t("Total City Complaints")}
            value="12,842"
            sublabel={t("Central Repository (May)")}
            highlightColor="border-l-kmc-navy"
            onClick={() => scrollToSection('performance-report-section')}
            actionHint="View Performance Table →"
          />
          <KpiCard
            label={t("Resolved Complaints")}
            value="10,328"
            sublabel={t("Verified with Evidence")}
            highlightColor="border-l-emerald-600"
            onClick={() => scrollToSection('performance-report-section')}
            actionHint="Inspect Resolution Rate →"
          />
          <KpiCard
            label={t("In Progress")}
            value="2,014"
            sublabel={t("Active Operations")}
            highlightColor="border-l-blue-600"
            onClick={() => scrollToSection('audit-trail-section')}
            actionHint="View Real-Time Audit Log →"
          />
          <KpiCard
            label={t("Critical SLA Breaches")}
            value="500"
            sublabel={t("Requires Direct Action")}
            delta={t("Urgent")}
            deltaType="negative"
            highlightColor="border-l-red-600"
            onClick={() => scrollToSection('escalation-workflow-section')}
            actionHint="Inspect Escalation Flow →"
          />
        </section>

        {/* 4 Core Monitoring Mechanisms */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-card border border-slate-200 p-4 border-t-4 border-t-kmc-navy flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-kmc-navy" />
                <h4 className="text-xs font-bold font-heading uppercase text-slate-900">
                  {t("Central Monitoring")}
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {t("Central monitoring by Municipal Commissioner's office with city-wide real-time visibility.")}
              </p>
            </div>
            <div className="mt-3 text-[11px] font-bold text-kmc-navy bg-blue-50 p-1.5 rounded">
              {t("Centralized Oversight")}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card border border-slate-200 p-4 border-t-4 border-t-purple-600 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h4 className="text-xs font-bold font-heading uppercase text-slate-900">
                  {t("Periodic Reviews")}
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {t("Periodic review meetings using live dashboard metrics to address bottlenecks.")}
              </p>
            </div>
            <div className="mt-3 text-[11px] font-bold text-purple-800 bg-purple-50 p-1.5 rounded">
              {t("Performance Tracking")}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card border border-slate-200 p-4 border-t-4 border-t-emerald-600 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h4 className="text-xs font-bold font-heading uppercase text-slate-900">
                  {t("Monthly Reports")}
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {t("Automated monthly performance reports and ward rankings.")}
              </p>
            </div>
            <div className="mt-3 text-[11px] font-bold text-emerald-800 bg-emerald-50 p-1.5 rounded">
              {t("Objective Evaluation")}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card border border-slate-200 p-4 border-t-4 border-t-red-600 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-700" />
                <h4 className="text-xs font-bold font-heading uppercase text-slate-900">
                  {t("Automatic Escalation")}
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {t("6-Step Automated escalation of critical issues and SLA breaches to senior leadership.")}
              </p>
            </div>
            <div className="mt-3 text-[11px] font-bold text-red-800 bg-red-50 p-1.5 rounded">
              {t("When SLA is breached")}
            </div>
          </div>
        </section>

        {/* Monthly Performance Report Table */}
        <section id="performance-report-section" className="bg-white rounded-xl shadow-card border border-slate-200 p-5 scroll-mt-20">
          <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {t("Official Release")}
              </span>
              <h3 className="text-base font-bold font-heading uppercase text-slate-800 mt-1">
                {t("Monthly Performance Report – May 2024")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("Resolution Rate, Average Turnaround Time (TAT), and Citizen Satisfaction ratings across top divisions")}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {t("City Resolution Rate: 80.4%")}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">{t("Rank")}</th>
                  <th className="py-2.5 px-3">{t("Ward")}</th>
                  <th className="py-2.5 px-3">{t("Resolution Rate")}</th>
                  <th className="py-2.5 px-3">{t("Avg. TAT (Days)")}</th>
                  <th className="py-2.5 px-3">{t("Citizen Satisfaction")}</th>
                  <th className="py-2.5 px-3 text-right">{t("Performance Band")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyReportRows.map((r) => (
                  <tr key={r.rank} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      #{r.rank}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {r.ward}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700 text-sm">
                      {r.resRate}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {r.tat}
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-700">
                      ★ {r.rating}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <StatusChip status={r.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
            <div>
              {t("City Aggregate")}: {t("Total Complaints")} <strong>12,642</strong> | {t("Resolved")}: <strong>10,328</strong>
            </div>
            <div className="text-emerald-700 font-semibold">
              {t("Benchmark Target: ≥ 85% TAT compliance by Q3")}
            </div>
          </div>
        </section>

        {/* 6-Step Escalation Workflow */}
        <section id="escalation-workflow-section" className="bg-white rounded-xl shadow-card border border-slate-200 p-5 scroll-mt-20">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h4 className="text-xs font-bold font-heading uppercase text-slate-800">
              {t("6-Step Automated Escalation Flow")}
            </h4>
            <p className="text-[11px] text-slate-500">
              {t("Automated escalation triggers when departmental SLAs are breached")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {escalationSteps.map((step) => (
              <div key={step.step} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="w-5 h-5 rounded-full bg-kmc-navy text-white text-[11px] font-bold flex items-center justify-center mb-1.5">
                    {step.step}
                  </span>
                  <h5 className="text-[11px] font-bold font-heading uppercase text-slate-900">
                    {step.title}
                  </h5>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live System Governance Audit Trail */}
        <section id="audit-trail-section" className="bg-white rounded-xl shadow-card border border-slate-200 p-5 scroll-mt-20">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-kmc-navy bg-blue-50 px-2 py-0.5 rounded">
                {t("Tamper-Resistant Compliance Log")}
              </span>
              <h4 className="text-xs font-bold font-heading uppercase text-slate-800 mt-1">
                {t("Real-Time System Audit Trail & SLA Activity")}
              </h4>
              <p className="text-[11px] text-slate-500">
                {t("Live timestamped log of automated escalations, status shifts, and leadership directives")}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
              {auditLog.length} {t("Recorded Events")}
            </span>
          </div>

          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-2 px-3">{t("Timestamp")}</th>
                  <th className="py-2 px-3">{t("Actor / User")}</th>
                  <th className="py-2 px-3">{t("Action Type")}</th>
                  <th className="py-2 px-3">{t("Resource / Target")}</th>
                  <th className="py-2 px-3">{t("Audit Details")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLog.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900 font-sans">
                      {log.actorName} <span className="text-[11px] text-slate-500">({t(log.role)})</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px] font-bold">
                        {t(log.action)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-kmc-navy font-bold">
                      {t(log.resourceId || log.resource)}
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-sans">
                      {t(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Key Outcomes Strip */}
        <section className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl">
          <h4 className="text-xs font-bold font-heading uppercase text-amber-300 mb-3 text-center sm:text-left">
            {t("Governance & Monitoring Key Outcomes")}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-bold text-white block">{t("Real-Time Visibility")}</span>
              <span className="text-[11px] text-slate-400">{t("Across entire city")}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-bold text-white block">{t("Accountability")}</span>
              <span className="text-[11px] text-slate-400">{t("At every hierarchy")}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-bold text-white block">{t("Faster Resolution")}</span>
              <span className="text-[11px] text-slate-400">{t("Enforced SLAs")}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-bold text-white block">{t("Citizen Satisfaction")}</span>
              <span className="text-[11px] text-slate-400">{t("Transparent proof")}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 col-span-2 sm:col-span-1">
              <span className="font-bold text-white block">{t("Data-Driven Decisions")}</span>
              <span className="text-[11px] text-slate-400">{t("Fact-based policy")}</span>
            </div>
          </div>
        </section>

      </main>

      <FooterStrip
        tagline={t("Strong Governance. Timely Action. Better Karimnagar.")}
      />
    </div>
  );
};
