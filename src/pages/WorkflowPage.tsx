import React from 'react';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { DepartmentHub } from '../components/workflow/DepartmentHub';
import { EscalationLadder } from '../components/workflow/EscalationLadder';
import { GrievanceSimulator } from '../components/workflow/GrievanceSimulator';
import { SLA_MASTER } from '../data/grievances';
import { useApp } from '../context/AppContext';
import { 
  GitMerge, Clock, ShieldCheck, ArrowRight, CheckCircle2, 
  Send, Users, Building, Laptop, Smartphone, AlertOctagon 
} from 'lucide-react';
import { usePrefs } from '../i18n';

export const WorkflowPage: React.FC = () => {
  const { isDelayEscalated } = useApp();
  const { t } = usePrefs();

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      <BannerStrip
        title={t("6. Integrated Departmental Workflow & Hierarchical Grievance Redressal")}
        tagline={t("One Platform. One Process. One Responsibility. Effective Grievance Redressal. Better KMC.")}
        actionButton={
          <span className="text-xs bg-emerald-700 text-white font-bold px-3 py-1 rounded-md shadow uppercase tracking-wide">
            {t("7 Core MCK Departments Connected")}
          </span>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 w-full">
        
        {/* Interactive Grievance Step-Through Simulator */}
        <section>
          <GrievanceSimulator />
        </section>

        {/* 8 Connected Municipal Departments Hub */}
        <section>
          <DepartmentHub />
        </section>

        {/* 5-Level Hierarchical Escalation Ladder */}
        <section>
          <EscalationLadder currentEscalationLevel={isDelayEscalated ? 4 : 1} />
        </section>

        {/* Service Level Agreements (SLAs Table) */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
          <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {t("Section 6.2 Predefined SLAs")}
              </span>
              <h3 className="text-base font-bold font-heading uppercase text-slate-800 mt-1">
                {t("Time-Bound Service Delivery Matrix")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("Every civic category is bound by fixed resolution SLA hours and strict escalation pathways")}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {t("SLA Compliance: 85% On-Time")}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">{t("Category")}</th>
                  <th className="py-2.5 px-3">{t("Example Civic Issue")}</th>
                  <th className="py-2.5 px-3">{t("SLA Timeline")}</th>
                  <th className="py-2.5 px-3">{t("Escalation Trigger Pathway")}</th>
                  <th className="py-2.5 px-3 text-right">{t("Standard")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SLA_MASTER.map((sla, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {t(sla.category)}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {t(sla.example)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-bold font-mono text-xs bg-amber-50 text-amber-800 border border-amber-200">
                        {sla.sla}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {t(sla.escalation)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                        {t("Strict SLA")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      <FooterStrip
        tagline={t("Outcome: Effective Coordination. Accountable Governance. Happier Citizens.")}
      />
    </div>
  );
};
