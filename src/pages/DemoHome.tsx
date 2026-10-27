import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { FullImageModal } from '../components/common/FullImagePreview';
import { useApp } from '../context/AppContext';
import { usePrefs } from '../i18n';
import { BUDGET_PAGE_1, BUDGET_HARMONIZED } from '../data/budget';
import { 
  Shield, Users, Smartphone, TrendingUp, GitMerge, Bell, 
  Eye, CheckCircle2, ArrowRight, BarChart3, Clock, AlertTriangle, 
  Layers, MapPin, Award
} from 'lucide-react';

export const DemoHome: React.FC = () => {
  const navigate = useNavigate();
  const { dataMode } = useApp();
  const { t } = usePrefs();
  const [landmarkModal, setLandmarkModal] = useState<{ src: string; alt: string; title: string } | null>(null);

  const budget = dataMode === 'deck-exact' ? BUDGET_PAGE_1 : BUDGET_HARMONIZED;

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      <BannerStrip
        title={t("Karimnagar Municipal Corporation")}
        tagline={t("Towards Transparent, Accountable & Smart Governance")}
        actionButton={
          <button
            onClick={() => navigate('/present')}
            className="px-3 py-2 min-h-[36px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-md shadow uppercase tracking-wide flex items-center gap-1.5 transition-all"
          >
            {t("Start 26-Slide Deck Walkthrough →")}
          </button>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10 w-full">
        
        {/* Hero Section (Deck Page 1) */}
        <section className="bg-gradient-to-br from-kmc-navy via-slate-900 to-kmc-navy-dark text-white rounded-2xl p-6 sm:p-10 shadow-xl border border-slate-700/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="max-w-3xl relative z-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full mb-3 border border-amber-300/30">
              {t("Executive Proposal & Interactive Prototype")}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-heading uppercase tracking-wide leading-tight">
              {t("Integrated Digital Governance Platform")}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              {t("Urban governance in Karimnagar requires a structured, technology-driven approach to address gaps in transparency, accountability, and service delivery. This platform unifies administrative leadership, elected representatives, and citizens into one seamless ecosystem.")}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/leadership')}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
              >
                <span>{t("Launch Leadership Dashboard")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/present')}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/20 transition-all flex items-center gap-2"
              >
                <span>{t("Deck Presentation (Slide 1–26)")}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Exactly three big role cards: one tap goes to the right place (Page 4 tiers) */}
        <section data-tour="roles" aria-labelledby="roles-heading">
          <h2 id="roles-heading" className="text-xl sm:text-2xl font-bold font-heading uppercase text-slate-800">{t("Who are you?")}</h2>
          <p className="text-base text-slate-600 mt-1">{t("Choose one to open the platform the way that person uses it.")}</p>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { to: '/citizen', icon: Smartphone, title: t('I am a Citizen'), text: t('Report a problem with a photo, track it, and rate the work.'), tier: t('Tier 3 · Citizens'), color: 'border-kmc-green', iconBg: 'bg-emerald-50 text-kmc-green' },
              { to: '/ward', icon: Users, title: t('I am a Ward Councillor / Field Staff'), text: t('Check new complaints, send them to staff, upload after photos and approve work.'), tier: t('Tier 2 · Elected Representatives'), color: 'border-kmc-purple', iconBg: 'bg-purple-50 text-kmc-purple' },
              { to: '/leadership', icon: Shield, title: t('I am Mayor / Commissioner'), text: t('See the whole city, every complaint with photos, and escalations.'), tier: t('Tier 1 · Administrative Leadership'), color: 'border-kmc-navy', iconBg: 'bg-blue-50 text-kmc-navy' },
            ].map(({ to, icon: Icon, title, text, tier, color, iconBg }) => (
              <button
                key={to}
                type="button"
                onClick={() => navigate(to)}
                className={`text-left bg-white rounded-2xl p-6 shadow-card border-t-8 ${color} border-x border-b border-slate-200 hover:shadow-card-hover transition-shadow flex flex-col gap-4 min-h-[220px]`}
              >
                <span className={`w-16 h-16 rounded-2xl flex items-center justify-center ${iconBg}`}>
                  <Icon className="w-9 h-9" aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="block text-xl font-bold text-slate-900">{title}</span>
                  <span className="block text-base text-slate-600 mt-1">{text}</span>
                </span>
                <span className="flex items-center justify-between text-sm font-semibold text-slate-500">
                  {tier}
                  <ArrowRight className="w-5 h-5 text-slate-700" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* The Platform Will Enable (4 Core Capabilities - Page 1) */}
        <section className="bg-white rounded-2xl p-6 shadow-card border border-slate-200">
          <h3 className="text-sm font-bold font-heading uppercase text-slate-800 mb-4 pb-2 border-b border-slate-100">
            {t("The Platform Will Enable")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                <MapPin className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold font-heading uppercase text-slate-900">
                {t("Real-Time Monitoring of Civic Issues")}
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                {t("Capture, track, and resolve citizen complaints in real time with geo-tagging and dashboards.")}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold font-heading uppercase text-slate-900">
                {t("Transparent Budget Allocation & Tracking")}
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                {t("End-to-end visibility of budget allocation, utilization, and expenditure at ward and department levels.")}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold font-heading uppercase text-slate-900">
                {t("Data-Driven Decision-Making")}
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                {t("Use analytics and insights to identify trends, prioritize interventions, and improve service outcomes.")}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold font-heading uppercase text-slate-900">
                {t("Performance Evaluation at Ward Level")}
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                {t("Measure and compare ward performance across key indicators to promote accountability and competition.")}
              </p>
            </div>
          </div>
        </section>

        {/* Karimnagar Smart City Landmarks & Civic Infrastructure Showcase */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <span className="text-[11px] uppercase font-bold text-kmc-navy bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {t("Civic Heritage & Urban Pride")}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-heading uppercase text-slate-800 mt-1">
                {t("Smart City Karimnagar Landmarks")}
              </h2>
            </div>
            <p className="text-xs text-slate-600 max-w-md">
              {t("From the bustling historic Tower Circle to the expansive Lower Manair Dam, our digital governance covers every street, canal, and colony.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Landmark 1: Tower Circle */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden group hover:shadow-xl transition-all">
              <div 
                className="h-48 relative overflow-hidden cursor-pointer"
                onClick={() => setLandmarkModal({ src: 'landmarks/tower-circle.png', alt: 'Tower Circle Clock Tower', title: t("Clock Tower (Tower Circle)") })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLandmarkModal({ src: 'landmarks/tower-circle.png', alt: 'Tower Circle Clock Tower', title: t("Clock Tower (Tower Circle)") }); } }}
                aria-label={t("View full size image of Clock Tower (Tower Circle)")}
              >
                <img
                  src="landmarks/tower-circle.png"
                  alt="Tower Circle Clock Tower"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow">
                  {t("Ward 8 • City Center")}
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                  <h4 className="text-sm font-bold font-heading">{t("Clock Tower (Tower Circle)")}</h4>
                  <span className="text-[11px] text-slate-300">{t("Heart of Karimnagar Nightscape")}</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t("The iconic architectural heart of Karimnagar, featuring illuminated smart lighting, high-density commercial markets, and automated civic sanitation.")}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold text-slate-500">{t("Corporator: Sri. G. Srinivas")}</span>
                  <button
                    onClick={() => navigate('/ward')}
                    className="min-h-[36px] -mr-2 px-2 rounded-lg text-xs font-bold text-kmc-navy hover:bg-slate-100 flex items-center gap-1"
                  >
                    <span>{t("Inspect Ward 8")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Landmark 2: Lower Manair Dam */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden group hover:shadow-xl transition-all">
              <div 
                className="h-48 relative overflow-hidden cursor-pointer"
                onClick={() => setLandmarkModal({ src: 'landmarks/lmd-dam.png', alt: 'Lower Manair Dam (LMD)', title: t("Lower Manair Dam (LMD)") })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLandmarkModal({ src: 'landmarks/lmd-dam.png', alt: 'Lower Manair Dam (LMD)', title: t("Lower Manair Dam (LMD)") }); } }}
                aria-label={t("View full size image of Lower Manair Dam (LMD)")}
              >
                <img
                  src="landmarks/lmd-dam.png"
                  alt="Lower Manair Dam (LMD)"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3 bg-cyan-400 text-slate-950 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow">
                  {t("Ward 45 • Water Lifeline")}
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                  <h4 className="text-sm font-bold font-heading">{t("Lower Manair Dam (LMD)")}</h4>
                  <span className="text-[11px] text-slate-300">{t("24 TMC Reservoir & Water Security")}</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t("The primary reservoir and scenic waterfront providing drinking water security and uninterrupted supply to all 66 municipal wards.")}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold text-slate-500">{t("Water Supply Wing")}</span>
                  <button
                    onClick={() => navigate('/department')}
                    className="min-h-[36px] -mr-2 px-2 rounded-lg text-xs font-bold text-cyan-700 hover:bg-slate-100 flex items-center gap-1"
                  >
                    <span>{t("Water Division")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Landmark 3: Elgandal Fort */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden group hover:shadow-xl transition-all">
              <div 
                className="h-48 relative overflow-hidden cursor-pointer"
                onClick={() => setLandmarkModal({ src: 'landmarks/elgandal-fort.jpg', alt: 'Historic Elgandal Fort', title: t("Historic Elgandal Fort") })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLandmarkModal({ src: 'landmarks/elgandal-fort.jpg', alt: 'Historic Elgandal Fort', title: t("Historic Elgandal Fort") }); } }}
                aria-label={t("View full size image of Historic Elgandal Fort")}
              >
                <img
                  src="landmarks/elgandal-fort.jpg"
                  alt="Historic Elgandal Fort"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3 bg-emerald-400 text-slate-950 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow">
                  {t("Heritage Citadel")}
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                  <h4 className="text-sm font-bold font-heading">{t("Historic Elgandal Fort")}</h4>
                  <span className="text-[11px] text-slate-300">{t("Granite Fortifications & Minarets")}</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t("An ancient hilltop fortress chronicling centuries of dynasties, overlooking verdant Telangana valleys and symbolising regional heritage.")}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold text-slate-500">{t("Town Planning & Heritage")}</span>
                  <button
                    onClick={() => navigate('/present')}
                    className="min-h-[36px] -mr-2 px-2 rounded-lg text-xs font-bold text-emerald-700 hover:bg-slate-100 flex items-center gap-1"
                  >
                    <span>{t("View Roadmap")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5 Objectives & 5 Key Challenges (Pages 2 & 3) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 5 Key Challenges (Page 3) */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-rose-700" />
                <h3 className="text-base font-bold font-heading uppercase text-slate-900">
                  {t("Key Challenges Identified")}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                {t("Absence of centralized systems severely hinders effective governance and citizen trust across 66 wards.")}
              </p>

              <div className="space-y-2.5 text-xs">
                {[
                  "Absence of a centralized monitoring system across 66 wards",
                  "Delays due to manual grievance handling processes",
                  "Limited visibility into fund allocation and utilization",
                  "Lack of measurable performance indicators for wards",
                  "Minimal structured interaction between citizens and administration"
                ].map((challenge, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-rose-50/50 border border-rose-100 text-slate-800">
                    <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                      0{idx + 1}
                    </span>
                    <span className="font-medium">{t(challenge)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-rose-800 font-semibold bg-rose-50 p-2.5 rounded-lg">
              {t("Resulting Impact: Poor Transparency • Delayed Services • Inefficient Fund Use • Low Accountability • Low Citizen Engagement")}
            </div>
          </div>

          {/* 5 Objectives (Page 2) */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold font-heading uppercase text-slate-900">
                  {t("Platform Core Objectives")}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                {t("Our Goal: Build a Transparent, Efficient, Citizen-Centric and Performance-Driven Municipal Corporation.")}
              </p>

              <div className="space-y-2.5 text-xs">
                {[
                  "To establish end-to-end transparency in municipal operations",
                  "To enable real-time grievance redressal tracking",
                  "To improve efficiency in budget utilization",
                  "To strengthen citizen engagement and trust",
                  "To introduce a performance-driven administrative ecosystem across all wards"
                ].map((obj, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 text-slate-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                      0{idx + 1}
                    </span>
                    <span className="font-medium">{t(obj)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-kmc-navy">
              <span>{t("View Full Ward Rankings & Action Plans")}</span>
              <button
                onClick={() => navigate('/performance')}
                className="min-h-[36px] inline-flex items-center px-2 -mr-2 rounded-lg text-kmc-navy underline hover:text-blue-700 hover:bg-slate-100"
              >
                {t("Go to Performance →")}
              </button>
            </div>
          </div>
        </section>

        {/* Karimnagar Municipal Dashboard snapshot (Page 1 laptop mock-up) */}
        <section className="bg-white rounded-2xl p-6 shadow-card border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-kmc-navy bg-blue-50 px-2 py-0.5 rounded">
                {t("Page")} 1
              </span>
              <h3 className="text-sm font-bold font-heading uppercase text-slate-800 mt-1">
                {t("Karimnagar Municipal Dashboard")}
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              {t("Budget Overview")} ({dataMode === 'deck-exact' ? 'FY 2024-25' : 'Harmonized FY 2024-25'})
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {(dataMode === 'deck-exact'
              ? [
                  { label: 'Total Complaints', value: '1,245', delta: '▲12%' },
                  { label: 'In Progress', value: '320', delta: '▲8%' },
                  { label: 'Resolved', value: '925', delta: '▲15%' },
                  { label: 'Open', value: '180', delta: '▼5%' },
                ]
              : [
                  { label: 'Total Complaints', value: '12,458', delta: '' },
                  { label: 'In Progress', value: '1,874', delta: '' },
                  { label: 'Resolved', value: '10,234', delta: '' },
                  { label: 'Overdue', value: '350', delta: '' },
                ]
            ).map((m) => (
              <div key={m.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] uppercase font-bold text-slate-500 block font-heading">{t(m.label)}</span>
                <span className="text-xl font-bold font-heading text-slate-900">{m.value}</span>
                {m.delta && <span className="ml-2 text-[11px] font-semibold text-slate-600">{m.delta}</span>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div>
              <h4 className="font-bold uppercase text-slate-700 mb-2">{t("Top Issue Categories")}</h4>
              {[['Drainage', 35], ['Roads', 26], ['Water Supply', 20], ['Street Lights', 12], ['Others', 5]].map(([name, pct]) => (
                <div key={name} className="mb-1.5">
                  <div className="flex justify-between text-slate-600"><span>{t(name as string)}</span><strong>{pct}%</strong></div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-kmc-navy" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h4 className="font-bold uppercase text-slate-700 mb-2">{t("Budget Overview")}</h4>
              <div className="space-y-1.5">
                <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-100"><span>{t("Allocated")}</span><strong className="font-mono">₹{budget.allocatedCr} Cr</strong></div>
                <div className="flex justify-between p-2 rounded bg-emerald-50 border border-emerald-100 text-emerald-900"><span>{t("Utilized")}</span><strong className="font-mono">₹{budget.utilizedCr} Cr</strong></div>
                <div className="flex justify-between p-2 rounded bg-blue-50 border border-blue-100 text-blue-900"><span>{t("Balance")}</span><strong className="font-mono">₹{budget.balanceCr} Cr</strong></div>
                <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-100"><span>{t("Utilized")}</span><strong>{budget.percentage}%</strong></div>
              </div>
            </div>
            <div>
              <h4 className="font-bold uppercase text-slate-700 mb-2">{t("Ward Performance Overview")}</h4>
              {[['Ward 1', 85], ['Ward 2', 72], ['Ward 3', 68], ['Ward 4', 90], ['Ward 5', 75]].map(([name, pct]) => (
                <div key={name} className="mb-1.5">
                  <div className="flex justify-between text-slate-600"><span>{t(name as string)}</span><strong>{pct}%</strong></div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-kmc-green" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Navigation to Key Interactive Modules */}
        <section className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold font-heading uppercase text-amber-300 mb-4">
            {t("Interactive System Modules & Live Simulations")}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <button
              onClick={() => navigate('/leadership')}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-slate-700 transition-all"
            >
              <Shield className="w-4 h-4 text-blue-400 mb-1" />
              <div className="font-bold uppercase font-heading text-slate-200">{t("Leadership")}</div>
              <div className="text-[11px] text-slate-400">{t("Executive Oversight")}</div>
            </button>

            <button
              onClick={() => navigate('/ward')}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-slate-700 transition-all"
            >
              <Users className="w-4 h-4 text-purple-400 mb-1" />
              <div className="font-bold uppercase font-heading text-slate-200">{t("Ward Operations")}</div>
              <div className="text-[11px] text-slate-400">{t("Ward Management")}</div>
            </button>

            <button
              onClick={() => navigate('/citizen')}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-slate-700 transition-all"
            >
              <Smartphone className="w-4 h-4 text-emerald-400 mb-1" />
              <div className="font-bold uppercase font-heading text-slate-200">{t("Citizen App")}</div>
              <div className="text-[11px] text-slate-400">{t("Citizen Services")}</div>
            </button>

            <button
              onClick={() => navigate('/performance')}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-slate-700 transition-all"
            >
              <Award className="w-4 h-4 text-amber-400 mb-1" />
              <div className="font-bold uppercase font-heading text-slate-200">{t("Rankings & KPIs")}</div>
              <div className="text-[11px] text-slate-400">{t("Performance Analytics")}</div>
            </button>

            <button
              onClick={() => navigate('/workflow')}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-slate-700 transition-all"
            >
              <GitMerge className="w-4 h-4 text-sky-400 mb-1" />
              <div className="font-bold uppercase font-heading text-slate-200">{t("Workflows & SLAs")}</div>
              <div className="text-[11px] text-slate-400">{t("Escalation Matrix")}</div>
            </button>

            <button
              onClick={() => navigate('/notifications')}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-slate-700 transition-all"
            >
              <Bell className="w-4 h-4 text-rose-400 mb-1" />
              <div className="font-bold uppercase font-heading text-slate-200">{t("Broadcast Alerts")}</div>
              <div className="text-[11px] text-slate-400">{t("Multi-Channel Alerts")}</div>
            </button>
          </div>
        </section>

      </main>

      <FooterStrip
        tagline={t("The initiative aims to position Karimnagar as a model municipal corporation for smart governance.")}
      />

      {landmarkModal && (
        <FullImageModal
          onClose={() => setLandmarkModal(null)}
          src={landmarkModal.src}
          alt={landmarkModal.alt}
          title={landmarkModal.title}
        />
      )}
    </div>
  );
};
