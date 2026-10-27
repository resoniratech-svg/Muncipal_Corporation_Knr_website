import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Play, RotateCcw, AlertOctagon, User, Building, FileText, CheckCheck, Send } from 'lucide-react';
import { usePrefs } from '../../i18n';

export const GrievanceSimulator: React.FC = () => {
  const { simulationStep, runSimulationStep, resetSimulation, isDelayEscalated, toggleDelayEscalation } = useApp();
  const { t } = usePrefs();

  const STEPS = [
    {
      step: 1,
      title: t("Citizen Submission"),
      actor: t("Citizen via App / Portal"),
      action: t("Grievance registered with photo, GPS coordinates and category."),
      statusBadge: t("Complaint Registered"),
      icon: <Send className="w-4 h-4 text-blue-600" />
    },
    {
      step: 2,
      title: t("Ward-Level Routing"),
      actor: t("Ward Corporator & System"),
      action: t("Grievance routed to ward corporator; issue reviewed, validated, and categorized."),
      statusBadge: t("Validated & Routed"),
      icon: <User className="w-4 h-4 text-purple-600" />
    },
    {
      step: 3,
      title: t("Department Allocation"),
      actor: t("Engineering / Sanitation Wing"),
      action: t("Assigned to concerned departmental officer with SLA timeline (Engineering: 72 Hours)."),
      statusBadge: t("Task Assigned"),
      icon: <Building className="w-4 h-4 text-amber-700" />
    },
    {
      step: 4,
      title: t("Field Execution"),
      actor: t("Field Staff & Technicians"),
      action: t("Work executed on ground; geo-tagged before/after photo evidence uploaded."),
      statusBadge: t("Work Completed"),
      icon: <FileText className="w-4 h-4 text-teal-600" />
    },
    {
      step: 5,
      title: t("Resolution & Monitoring"),
      actor: t("Commissioner & Citizen"),
      action: t("Verified, closed, citizen rates service 5-stars; logged to municipal leadership dashboard."),
      statusBadge: t("Resolved & Closed"),
      icon: <CheckCheck className="w-4 h-4 text-emerald-700" />
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-3">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-kmc-navy bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
            {t("Live Interactive Simulator")}
          </span>
          <h3 className="text-lg font-bold font-heading text-slate-800 uppercase mt-1">
            {t("End-to-End Grievance Redressal Simulation")}
          </h3>
          <p className="text-xs text-slate-500">
            {t("Click through each stage to witness real-time routing, evidence capture, and leadership escalation.")}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={runSimulationStep}
            className="px-3.5 py-2 min-h-[36px] bg-kmc-navy hover:bg-kmc-navy-light text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            {simulationStep === 0 ? t("Start Simulation") : simulationStep < 5 ? `${t("Next Step")} (${simulationStep + 1}/5)` : t("Simulation Completed")}
          </button>

          <button
            onClick={toggleDelayEscalation}
            className={`px-3 py-2 min-h-[36px] text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all ${
              isDelayEscalated
                ? 'bg-red-600 text-white border-red-700 shadow-md animate-pulse'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            {isDelayEscalated ? t("Escalation Active!") : t("Simulate SLA Delay")}
          </button>

          {simulationStep > 0 && (
            <button
              onClick={resetSimulation}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
              title={t("Reset Simulation")}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* SLA Delay Alert Banner (if simulated) */}
      {isDelayEscalated && (
        <div className="mb-5 p-3.5 bg-red-600 text-white rounded-xl shadow-md flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <strong>{t("SLA Breach Triggered!")}</strong> {t("Grievance GRV-2024-27-0045 exceeded the 72-hour Engineering SLA without field closure.")}
              <span className="block text-red-100 mt-0.5 font-medium">
                {t("Auto-escalated to Level 4 (Municipal Commissioner). High-priority review alert dispatched.")}
              </span>
            </div>
          </div>
          <span className="text-[11px] uppercase font-black bg-white text-red-700 px-2.5 py-1 rounded-full shrink-0">
            {t("Escalated to Commissioner")}
          </span>
        </div>
      )}

      {/* 5 Stepper Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {STEPS.map((s) => {
          const isDone = simulationStep >= s.step;
          const isCurrent = simulationStep === s.step;

          return (
            <div
              key={s.step}
              className={`rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'border-kmc-navy bg-slate-50 ring-2 ring-kmc-navy shadow-md'
                  : isDone
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-slate-200 bg-white opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {s.icon}
                    <span className="text-[11px] font-bold uppercase text-slate-700">
                      {t("Step")} {s.step}
                    </span>
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[11px] text-slate-500">
                      {s.step}
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold font-heading text-slate-900 uppercase">
                  {s.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  {t("Actor")}: {s.actor}
                </p>
                <p className="text-[11px] text-slate-600 mt-2 line-clamp-3">
                  {s.action}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block ${
                  isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isDone ? s.statusBadge : t("Pending")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
