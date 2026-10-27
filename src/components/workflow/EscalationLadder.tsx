import React from 'react';
import { ESCALATION_LADDER, ESCALATION_TRIGGERS } from '../../data/departments';
import { AlertTriangle, Clock, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { usePrefs } from '../../i18n';

interface EscalationLadderProps {
  currentEscalationLevel?: number; // 1 to 5
}

export const EscalationLadder: React.FC<EscalationLadderProps> = ({ currentEscalationLevel = 1 }) => {
  const { t } = usePrefs();

  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 mb-5 border-b border-slate-100 gap-2">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-kmc-navy bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {t("Hierarchical Redressal")}
          </span>
          <h3 className="text-lg font-bold font-heading text-slate-800 uppercase mt-1">
            {t("5-Level Time-Bound Escalation Ladder")}
          </h3>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>{t("Strict automated escalation upon SLA breach")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-6">
        {ESCALATION_LADDER.map((step) => {
          const isCurrentActive = currentEscalationLevel === step.level;
          const isPassed = currentEscalationLevel > step.level;

          return (
            <div
              key={step.level}
              className={`relative rounded-xl border p-4 transition-all flex flex-col justify-between ${
                isCurrentActive
                  ? 'border-red-500 bg-red-50/70 shadow-md ring-2 ring-red-400'
                  : isPassed
                  ? 'border-slate-300 bg-slate-50 opacity-75'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full text-white ${step.color}`}>
                    {t("Level")} {step.level}
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {t(step.target)}
                  </span>
                </div>

                <h4 className="text-sm font-bold font-heading text-slate-900 uppercase">
                  {t(step.title)}
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                  {t(step.roleDescription)}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                <p className="text-[11px] text-slate-500 uppercase font-semibold">{t("Designated Authority")}</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-tight">
                  {t(step.officerDesignation)}
                </p>
              </div>

              {isCurrentActive && (
                <div className="absolute -top-2.5 right-3 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase shadow">
                  {t("Active Escalation")}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Escalation Triggers and Accountability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <h5 className="text-xs font-bold font-heading uppercase text-amber-900">
              {t("Automatic Escalation Triggers")}
            </h5>
          </div>
          <ul className="space-y-1 text-xs text-amber-950">
            {ESCALATION_TRIGGERS.map((trigger, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>{t(trigger)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <h5 className="text-xs font-bold font-heading uppercase text-emerald-950">
              {t("Accountability & Transparency Enforcement")}
            </h5>
          </div>
          <ul className="space-y-1 text-xs text-emerald-950">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>{t("Real-time tracking and logging at every hierarchical level")}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>{t("Digital audit logs of all actions, timestamps and officer decisions")}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>{t("Automatic alerts sent to Municipal Commissioner for overdue files")}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>{t("Public performance reporting and ward ranking dashboards")}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
