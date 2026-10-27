import React from 'react';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { 
  CheckCircle2, ArrowRight, ShieldCheck, Award, 
  Layers, Users, FileSignature, CheckSquare, Sparkles 
} from 'lucide-react';
import { usePrefs } from '../i18n';

export const ImplementationPage: React.FC = () => {
  const { t } = usePrefs();

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      <BannerStrip
        title={t("7, 10 & 11. Implementation Strategy & Request for Approval")}
        tagline={t("Strategic Planning. Smart Execution. Better Karimnagar, Together.")}
        actionButton={
          <span className="text-xs bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-md shadow uppercase tracking-wide">
            {t("Decisive Action Plan")}
          </span>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 w-full">
        
        {/* Phase 1, Phase 2, Phase 3 Roadmap */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-6">
          <div className="border-b border-slate-100 pb-3 mb-6">
            <span className="text-[11px] font-bold uppercase text-kmc-navy bg-blue-50 px-2 py-0.5 rounded">
              {t("Implementation Roadmap")}
            </span>
            <h3 className="text-lg font-bold font-heading uppercase text-slate-800 mt-1">
              {t("Phased Implementation Strategy")}
            </h3>
            <p className="text-xs text-slate-500">
              {t("A phased and structured approach for seamless deployment, adoption and sustained success")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Phase 1 */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between relative">
              <div className="absolute -top-3 left-4 bg-kmc-navy text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {t("Phase 1")}
              </div>
              <div className="pt-2">
                <h4 className="text-sm font-bold font-heading uppercase text-slate-900 mb-2">
                  {t("Approval & System Design")}
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-kmc-navy mt-1.5 shrink-0"></span>
                    <span><strong>{t("Requirement finalization")}:</strong> {t("Understand municipal needs and define functional & technical requirements.")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-kmc-navy mt-1.5 shrink-0"></span>
                    <span><strong>{t("Customization as per municipal workflows")}:</strong> {t("Configure system modules, workflows, roles, and approval hierarchies.")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-kmc-navy mt-1.5 shrink-0"></span>
                    <span><strong>{t("Leadership approval & go-ahead")}:</strong> {t("Final approval from leadership for pilot deployment.")}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="p-5 rounded-xl border-2 border-amber-400 bg-amber-50/40 flex flex-col justify-between relative shadow-sm">
              <div className="absolute -top-3 left-4 bg-amber-500 text-slate-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {t("Phase 2")}
              </div>
              <div className="pt-2">
                <h4 className="text-sm font-bold font-heading uppercase text-slate-900 mb-2">
                  {t("Pilot Implementation")}
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
                    <span><strong>{t("Deployment in 5 selected wards/divisions")}:</strong> {t("Pilot the system in limited geographies to test workflows and integrations.")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
                    <span><strong>{t("Training of officials and staff")}:</strong> {t("Conduct role-based training and handholding for smooth adoption.")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
                    <span><strong>{t("Performance evaluation and feedback")}:</strong> {t("Measure performance, gather feedback, and identify improvement areas.")}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between relative">
              <div className="absolute -top-3 left-4 bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {t("Phase 3")}
              </div>
              <div className="pt-2">
                <h4 className="text-sm font-bold font-heading uppercase text-slate-900 mb-2">
                  {t("Full-Scale Rollout")}
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                    <span><strong>{t("Expansion to all wards")}:</strong> {t("Scale the solution across all wards/divisions for city-wide coverage.")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                    <span><strong>{t("Continuous monitoring")}:</strong> {t("Real-time dashboards and analytics to track performance and service delivery.")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                    <span><strong>{t("System optimization")}:</strong> {t("Ongoing improvements based on data insights, feedback, and evolving needs.")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Ongoing Success Factors */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span className="font-bold text-slate-800">{t("Ongoing Success Factors:")}</span>
            <span>• {t("Stakeholder Collaboration")}</span>
            <span>• {t("Change Management & Communication")}</span>
            <span>• {t("Data Security & Compliance")}</span>
            <span>• {t("Performance Tracking & Improvement")}</span>
            <span>• {t("Citizen-Centric Focus")}</span>
          </div>
        </section>

        {/* 10. Conclusion & Strategic Outcomes */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-6">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <span className="text-[11px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {t("Strategic Outcomes")}
            </span>
            <h3 className="text-lg font-bold font-heading uppercase text-slate-800 mt-1">
              {t("Transformational Step Towards Smart Urban Governance")}
            </h3>
            <p className="text-xs text-slate-500">
              {t("By integrating modern technology with municipal administration, Karimnagar will establish a benchmark in Telangana and India.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
              <h5 className="font-bold font-heading uppercase text-blue-900 text-xs mb-1">
                {t("Greater Efficiency")}
              </h5>
              <p className="text-xs text-slate-700">
                {t("Streamlined departmental workflows, automated routing, faster TAT, and optimal municipal resource utilization.")}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <h5 className="font-bold font-heading uppercase text-emerald-900 text-xs mb-1">
                {t("Enhanced Transparency")}
              </h5>
              <p className="text-xs text-slate-700">
                {t("Real-time grievance tracking, public budget visibility, photo completion proofs, and open data dashboards.")}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200">
              <h5 className="font-bold font-heading uppercase text-purple-900 text-xs mb-1">
                {t("Measurable Outcomes")}
              </h5>
              <p className="text-xs text-slate-700">
                {t("Data-driven decisions, monthly KPI scorecards, ward rankings, and targeted interventions for underperforming areas.")}
              </p>
            </div>
          </div>

          {/* 5-Step Way Forward */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="text-xs font-bold font-heading uppercase text-slate-800 mb-3">
              {t("The 5-Step Way Forward")}
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs text-slate-700">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <strong className="text-kmc-navy block uppercase text-[11px]">{t("1. Adopt")}</strong>
                <span className="text-[11px]">{t("Drive city-wide adoption across all departments.")}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <strong className="text-kmc-navy block uppercase text-[11px]">{t("2. Capacity Building")}</strong>
                <span className="text-[11px]">{t("Continuous training and handholding for staff.")}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <strong className="text-kmc-navy block uppercase text-[11px]">{t("3. Optimization")}</strong>
                <span className="text-[11px]">{t("Continuous improvement via feedback analytics.")}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <strong className="text-kmc-navy block uppercase text-[11px]">{t("4. Collaborate")}</strong>
                <span className="text-[11px]">{t("Engage citizens and stakeholders for impact.")}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <strong className="text-kmc-navy block uppercase text-[11px]">{t("5. Scale & Innovate")}</strong>
                <span className="text-[11px]">{t("Expand smart IoT sensors & emerging tech.")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 11. Request for Approval */}
        <section className="bg-gradient-to-br from-kmc-navy via-slate-900 to-kmc-navy-dark text-white rounded-2xl p-6 sm:p-10 shadow-2xl border-2 border-amber-400/80">
          <div className="max-w-3xl">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full mb-3 inline-block">
              {t("Administrative Proposal")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading uppercase tracking-wide leading-tight text-white">
              {t("To Take a Decisive Step Towards Smart, Transparent & Citizen-Centric Governance")}
            </h2>

            <p className="mt-3 text-sm text-slate-300">
              {t("Approval is respectfully sought from the Hon'ble Mayor and Municipal Commissioner to initiate:")}
            </p>

            {/* 3 Asks (Slide 26 exact) */}
            <div className="mt-5 space-y-3">
              <div className="p-3.5 rounded-xl bg-white/10 border border-white/20 flex items-start gap-3">
                <CheckSquare className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold font-heading uppercase text-amber-300">
                    {t("1. Development & Deployment of the Digital Governance Platform")}
                  </h4>
                  <p className="text-xs text-slate-200 mt-0.5">
                    {t("Design, build, and deploy an integrated platform to streamline municipal operations, enhance transparency, and improve service delivery.")}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/10 border border-white/20 flex items-start gap-3">
                <CheckSquare className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold font-heading uppercase text-amber-300">
                    {t("2. Pilot Implementation in Selected Wards")}
                  </h4>
                  <p className="text-xs text-slate-200 mt-0.5">
                    {t("Roll out the platform in 5 selected wards to test workflows, gather feedback, and refine the system for full-scale city-wide implementation.")}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/10 border border-white/20 flex items-start gap-3">
                <CheckSquare className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold font-heading uppercase text-amber-300">
                    {t("3. Formation of a Monitoring Committee for Execution Oversight")}
                  </h4>
                  <p className="text-xs text-slate-200 mt-0.5">
                    {t("Constitute a cross-functional monitoring committee to ensure effective execution, periodic review, and achievement of measurable outcomes.")}
                  </p>
                </div>
              </div>
            </div>

            {/* Callout Box */}
            <div className="mt-6 p-4 rounded-xl bg-amber-400 text-slate-950 font-semibold text-xs leading-relaxed shadow-lg">
              {t("\"Your approval today, a better Karimnagar tomorrow. This initiative will transform how we govern, how we serve and how we grow, together. Let's build a smarter, more transparent and accountable Karimnagar.\"")}
            </div>

            {/* Expected Outcomes */}
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="bg-white/15 px-3 py-1 rounded-full text-slate-200">{t("✓ Improved Efficiency & Productivity")}</span>
              <span className="bg-white/15 px-3 py-1 rounded-full text-slate-200">{t("✓ Enhanced Transparency & Accountability")}</span>
              <span className="bg-white/15 px-3 py-1 rounded-full text-slate-200">{t("✓ Better Citizen Experience")}</span>
              <span className="bg-white/15 px-3 py-1 rounded-full text-slate-200">{t("✓ Data-Driven Decisions")}</span>
              <span className="bg-white/15 px-3 py-1 rounded-full text-slate-200">{t("✓ Stronger Compliance")}</span>
            </div>

            {/* Closing Signature Block (Slide 26 exact) */}
            <div className="mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-300 italic">
                  {t("\"We seek your approval to move forward with this impactful initiative for the betterment of Karimnagar and its citizens.\"")}
                </p>
              </div>

              <div className="border border-amber-300/60 rounded-xl p-3 bg-white/5 text-center min-w-[200px]">
                <FileSignature className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                <span className="text-[11px] text-slate-500 block uppercase">{t("Competent Authority")}</span>
                <span className="text-xs font-bold text-white uppercase font-heading">
                  {t("Approved & Recommended")}
                </span>
              </div>
            </div>
          </div>
        </section>

      </main>

      <FooterStrip
        tagline={t("Together, let’s build a smarter, transparent, and more liveable Karimnagar.")}
      />
    </div>
  );
};
