import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { DonutChart } from '../components/charts/DonutChart';
import { PhoneFrame } from '../components/common/PhoneFrame';
import { SmsMessageFeed } from '../components/citizen/SmsMessageFeed';
import { PhotoThumbnail } from '../components/common/EvidencePhotoModal';
import { StatusChip } from '../components/common/StatusChip';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/AuthContext';
import { GrievanceItem } from '../data/grievances';
import {
  Laptop, Smartphone, MapPin, Phone, Building2, Clock, ShieldCheck, User,
  UserCheck, Banknote, Construction, Trash2, FileText, HeartPulse, ChevronRight, ArrowRight,
  CheckCircle2, Download, Landmark, FileCheck, Receipt, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { usePrefs } from '../i18n';
import { getPaymentsForCitizen, CitizenPaymentRecord } from '../data/payments';
import { MobileReportFlow } from '../components/citizen/mobile/MobileReportFlow';
import { MobileTrackFlow } from '../components/citizen/mobile/MobileTrackFlow';
import { MobileDetailFlow } from '../components/citizen/mobile/MobileDetailFlow';

const MCK_CITIZEN_DEPARTMENTS = [
  {
    id: 'establishment',
    name: 'Establishment Section',
    badge: 'Administration & HR',
    icon: UserCheck,
    iconBg: 'bg-blue-600',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    description: 'Manages general administration, human resources, municipal staff postings, and inner corporate affairs.',
    scope: ['Staff Roster & Deputations', 'Citizen Charters', 'Ward Staff Supervision'],
    actionLabel: 'Administrative Enquiry',
    category: 'Establishment',
  },
  {
    id: 'revenue',
    name: 'Revenue Section',
    badge: 'Taxation & Assessment',
    icon: Banknote,
    iconBg: 'bg-emerald-600',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    description: 'Responsible for collecting local taxes, including Property Tax (House Tax), Vacant Land Tax (VLT), and municipal revenue evaluations.',
    scope: ['Property Tax (House Tax)', 'Vacant Land Tax (VLT)', 'Trade Licenses & Mutations'],
    actionLabel: 'Property Tax / VLT Query',
    category: 'Property Tax',
  },
  {
    id: 'engineering',
    name: 'Engineering Section',
    badge: 'Public Works & Infra',
    icon: Construction,
    iconBg: 'bg-amber-600',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    description: 'Oversees public works, city infrastructure development, road layout and repairs, water supply planning, and street lighting networks.',
    scope: ['Road Restoration & Potholes', 'Underground Drainage', 'Drinking Water Supply', 'Street Lights'],
    actionLabel: 'Report Works / Drainage',
    category: 'Drainage',
  },
  {
    id: 'town-planning',
    name: 'Town Planning Section (TPS)',
    badge: 'Layouts & Permits',
    icon: Building2,
    iconBg: 'bg-purple-600',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    description: 'Regulates city layouts, manages Building Permissions, acts against unauthorized structures, and processes mutations.',
    scope: ['TG-bPASS Building Permissions', 'Unauthorized Encroachments', 'Master Plan Layouts', 'Colony Parks'],
    actionLabel: 'Building Permission / Layout',
    category: 'Town Planning',
  },
  {
    id: 'sanitation',
    name: 'Sanitation Section',
    badge: 'Cleanliness & Waste',
    icon: Trash2,
    iconBg: 'bg-green-600',
    badgeColor: 'bg-green-50 text-green-800 border-green-200',
    description: 'Directs city cleanliness programs, solid waste management, sewage upkeep, and public health cleaning protocols.',
    scope: ['Door-to-Door Waste Collection', 'Open Garbage Clearances', 'Anti-Larval Fogging & Bleaching'],
    actionLabel: 'Report Garbage / Sanitation',
    category: 'Sanitation',
  },
  {
    id: 'statistics',
    name: 'Statistics / Birth & Death Registration Section',
    badge: 'Civil Registry',
    icon: FileText,
    iconBg: 'bg-slate-700',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    description: 'Manages civil registry work including issuing unified certificates for births and deaths within municipal limits.',
    scope: ['Digital Birth Certificates', 'Death Registration Certificates', 'Name Corrections & QR Verification'],
    actionLabel: 'Certificate Services',
    category: 'Certificates',
  },
  {
    id: 'urban-welfare',
    name: 'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)',
    badge: 'Welfare & MEPMA',
    icon: HeartPulse,
    iconBg: 'bg-pink-600',
    badgeColor: 'bg-pink-50 text-pink-800 border-pink-200',
    description: 'Works alongside state initiatives like the Mission for Elimination of Poverty in Municipal Areas (MEPMA) and distributes welfare programs like the Asara pension.',
    scope: ['Asara Social Security Pensions', 'MEPMA Mahila SHG Subsidies', 'PM SVANidhi Street Vendor Cards'],
    actionLabel: 'Asara / MEPMA Services',
    category: 'Urban Welfare',
  },
];

export const CitizenPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeWardId, grievances, projects, dataMode, wards } = useApp();
  const { currentUser } = useAuth();
  const { t } = usePrefs();
  const [activeView, setActiveView] = useState<'portal' | 'mobile'>('portal');

  // Dynamic Citizen Profile and Elected Corporator Resolution
  const citizenDisplayName = currentUser?.displayName || 'Smt. Lavanya Reddy';
  const citizenWardId = currentUser?.assignedWardIds?.[0] || activeWardId || 27;
  const citizenWard = wards.find((w) => w.id === citizenWardId) || wards.find((w) => w.id === 27) || wards[0];
  const corporatorName = citizenWard.corporator;

  // In-frame mobile state for strictly self-contained smartphone experience
  const [mobileScreen, setMobileScreen] = useState<'home' | 'report' | 'track' | 'detail'>('home');
  const [mobileGrievanceId, setMobileGrievanceId] = useState<string | null>(null);
  const [reportInitialCategory, setReportInitialCategory] = useState<string | null>(null);
  const [phoneTab, setPhoneTab] = useState<'home' | 'services' | 'alerts' | 'profile'>('home');

  // Strict citizen isolation: Citizen sees ONLY records matching their citizenId
  const citizenGrievances = grievances.filter(g => {
    if (!currentUser || currentUser.role !== 'citizen') return true;
    return g.citizenId === currentUser.id;
  });

  // Citizen's paid municipal taxes & utility bills (Property Tax, Water Charges, etc.)
  const citizenPayments = useMemo(() => {
    return getPaymentsForCitizen(currentUser?.id, citizenDisplayName);
  }, [currentUser, citizenDisplayName]);

  // Citizen's submitted applications & certificates (e.g. Birth Certificate, Building Permission, Asara Pension)
  const citizenApplications = useMemo(() => {
    return grievances.filter(g => {
      const isLavanya = (
        (g.citizenName && g.citizenName.toLowerCase().includes('lavanya')) ||
        (g.description && g.description.toLowerCase().includes('lavanya')) ||
        (currentUser?.displayName && currentUser.displayName.toLowerCase().includes('lavanya') && g.wardId === 27) ||
        g.citizenId === currentUser?.id
      );
      const isServiceApp = (
        g.id.startsWith('APP-') ||
        g.category.toLowerCase().includes('birth') ||
        g.category.toLowerCase().includes('death') ||
        g.category.toLowerCase().includes('permission') ||
        g.category.toLowerCase().includes('pension') ||
        g.category.toLowerCase().includes('shg') ||
        g.category.toLowerCase().includes('vendor') ||
        g.category.toLowerCase().includes('certificate') ||
        g.description.toLowerCase().includes('application')
      );
      if (currentUser?.role === 'citizen') {
        return (g.citizenId === currentUser.id || isLavanya) && isServiceApp;
      }
      return isServiceApp;
    });
  }, [grievances, currentUser]);

  const developmentBreakdown = [
    { name: t("Completed"), value: 65, color: "#2E7D32" },
    { name: t("In Progress"), value: 25, color: "#0288D1" },
    { name: t("Planned"), value: 10, color: "#94A3B8" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      <BannerStrip
        title={t("4.3 Tier 3: Citizen Engagement Portal – Public-facing interface for transparency and participation")}
        tagline={t("Empowering Citizens. Building a Better Karimnagar Together.")}
        actionButton={
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-white/20">
            <button
              onClick={() => setActiveView('portal')}
              className={`px-2.5 py-2 min-h-[36px] rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                activeView === 'portal' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>{t("Web Portal")}</span>
            </button>
            <button
              onClick={() => setActiveView('mobile')}
              className={`px-2.5 py-2 min-h-[36px] rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                activeView === 'mobile' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t("Mobile Phone View")}</span>
            </button>
          </div>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 w-full">
        
        {/* Resident Greeting Banner with Elected Corporator Details */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 overflow-hidden border-l-4 border-l-kmc-green">
          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column: Citizen Welcome */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold font-mono bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded">
                  {t("Citizen ID:")} {currentUser?.id || 'USR-CITIZEN-02'}
                </span>
                <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t(currentUser?.assignedWardName || `Ward ${citizenWard.id} – ${citizenWard.name}`)}</span>
                </span>
                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded border border-blue-200">
                  {t("Verified Resident")}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-heading uppercase text-slate-900 tracking-tight">
                {t("Namaste, {{name}}!", { name: citizenDisplayName })}
              </h2>
              <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                {t("Welcome to the Karimnagar Municipal Corporation Public Services & Grievance Portal. Access civic facilities, track live ward works, and resolve grievances directly with your local administration.")}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-5 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-bold block">{t("My Registered Tickets")}</span>
                  <p className="text-lg font-bold font-heading text-emerald-700">{citizenGrievances.length} {t("Active")}</p>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-bold block">{t("Ward Population")}</span>
                  <p className="text-lg font-bold font-heading text-slate-800">{citizenWard.population ? citizenWard.population.toLocaleString() : '8,500'}</p>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-bold block">{t("Civic Rating")}</span>
                  <p className="text-lg font-bold font-heading text-blue-700">{citizenWard.grade} ({citizenWard.score}/100)</p>
                </div>
              </div>
            </div>

            {/* Right Column: Elected Corporator Details Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-blue-50/70 rounded-xl p-4 border border-blue-150 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-kmc-navy text-amber-300 font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                    {corporatorName.replace(/^(Sri|Smt)\.?\s+/i, '').split(' ').slice(0, 2).map(p => p[0]).join('') || 'CP'}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-kmc-navy block">
                      {t("Elected Ward Corporator")}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {t(corporatorName)}
                    </h4>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                  {t("Active Term")}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{t("Jurisdiction")}:</span>
                  </span>
                  <span className="font-semibold text-slate-900">Ward {citizenWard.id} ({citizenWard.name})</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{t("Ward Helpline")}:</span>
                  </span>
                  <a
                    href={`tel:+9190000${String(citizenWard.id).padStart(2, '0')}001`}
                    className="font-mono font-bold text-kmc-navy hover:underline"
                  >
                    +91 90000 {String(citizenWard.id).padStart(2, '0')}001
                  </a>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{t("Office")}:</span>
                  </span>
                  <span className="text-slate-700 text-right truncate max-w-[200px]">
                    Ward {citizenWard.id} Citizen Service Center
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{t("Office Hours")}:</span>
                  </span>
                  <span className="text-slate-700">Mon–Sat, 09:30 AM – 05:30 PM</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Toggleable Layout: Either Desktop Portal Or Mobile Smartphone Frame */}
        {activeView === 'mobile' ? (
          /* Mobile Frame View */
          <div className="py-4">
            <div className="text-center max-w-md mx-auto mb-4">
              <span className="text-[11px] uppercase font-bold text-kmc-navy bg-blue-100 px-3 py-1 rounded-full">
                {t("Interactive Smartphone Experience")}
              </span>
              <h3 className="text-lg font-bold font-heading uppercase text-slate-900 mt-1">
                {t("\"My Karimnagar\" Citizen App Mockup")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("Test grievance filing, track live status, receive SMS alerts, and rate service quality.")}
              </p>
            </div>

            <PhoneFrame
              activeTab={phoneTab}
              onTabChange={(tab) => {
                setPhoneTab(tab);
                if (tab === 'home') {
                  setMobileScreen('home');
                }
              }}
              title={
                mobileScreen === 'report'
                  ? 'Report a Problem'
                  : mobileScreen === 'track'
                  ? 'Track My Complaint'
                  : mobileScreen === 'detail'
                  ? 'Complaint Details'
                  : undefined
              }
              subtitle={
                mobileScreen === 'report'
                  ? 'Civic Issue Registration'
                  : mobileScreen === 'track'
                  ? 'My Registered Grievances'
                  : mobileScreen === 'detail'
                  ? (mobileGrievanceId || undefined)
                  : undefined
              }
              onBackClick={
                mobileScreen !== 'home'
                  ? () => {
                      if (mobileScreen === 'detail') {
                        setMobileScreen('track');
                      } else {
                        setMobileScreen('home');
                      }
                    }
                  : undefined
              }
              headerBackText={mobileScreen === 'detail' ? t('Complaints') : t('Home')}
              onReportClick={(cat) => {
                setPhoneTab('home');
                setReportInitialCategory(cat || null);
                setMobileScreen('report');
              }}
              onTrackClick={(id) => {
                setPhoneTab('home');
                if (id) setMobileGrievanceId(id);
                setMobileScreen(id ? 'detail' : 'track');
              }}
            >
              {mobileScreen === 'report' ? (
                <MobileReportFlow
                  initialCategory={reportInitialCategory}
                  onDone={() => setMobileScreen('home')}
                  onTrackCreated={(id) => {
                    setMobileGrievanceId(id);
                    setMobileScreen('detail');
                  }}
                  onCancel={() => setMobileScreen('home')}
                />
              ) : mobileScreen === 'track' ? (
                <MobileTrackFlow
                  onSelectGrievance={(id) => {
                    setMobileGrievanceId(id);
                    setMobileScreen('detail');
                  }}
                  onReportNew={() => {
                    setReportInitialCategory(null);
                    setMobileScreen('report');
                  }}
                  onBack={() => setMobileScreen('home')}
                />
              ) : mobileScreen === 'detail' ? (
                <MobileDetailFlow
                  grievanceId={mobileGrievanceId || 'GRV2024-00234'}
                  onBack={() => setMobileScreen('track')}
                  onHome={() => setMobileScreen('home')}
                />
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setReportInitialCategory(null);
                      setMobileScreen('report');
                    }}
                    className="w-full min-h-[52px] rounded-xl bg-kmc-navy text-white text-base font-bold shadow-md hover:bg-kmc-navy-light transition-all flex items-center justify-center gap-2"
                  >
                    <span>{t("Report a Problem")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileScreen('track')}
                    className="w-full min-h-[52px] rounded-xl border-2 border-kmc-navy text-kmc-navy text-base font-bold hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 bg-white"
                  >
                    <span>{t("Track My Complaint")}</span>
                  </button>

                  <SmsMessageFeed
                    onSelectGrievance={(id) => {
                      setMobileGrievanceId(id);
                      setMobileScreen('detail');
                    }}
                  />
                </div>
              )}
            </PhoneFrame>
          </div>
        ) : (
          /* Desktop Web Portal View */
          <>
            {/* Citizen Portal hero & public grievance totals */}
            <section className="bg-gradient-to-br from-kmc-navy via-slate-900 to-kmc-navy-dark text-white rounded-2xl p-6 sm:p-8 shadow-xl">
              <span className="text-[11px] uppercase font-bold tracking-wider text-amber-300">
                {t("Karimnagar Municipal Corporation – Citizen Portal")}
              </span>
              <h3 className="text-xl sm:text-3xl font-extrabold font-heading uppercase mt-1 leading-tight">
                {t("Together, Let's Build a Cleaner, Smarter Karimnagar.")}
              </h3>
              <p className="text-sm text-slate-300 mt-1">{t("Report issues. Track progress. See the change.")}</p>
              <div className="flex flex-wrap gap-2.5 mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/citizen/report?mode=payment')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase rounded-lg shadow flex items-center gap-1.5 transition-all"
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>{t("Pay Taxes & Bills")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/citizen/report?mode=certificate')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs uppercase rounded-lg shadow flex items-center gap-1.5 transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t("Certificates & Schemes")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/citizen/report?mode=grievance')}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase rounded-lg shadow flex items-center gap-1.5 transition-all"
                >
                  <Construction className="w-3.5 h-3.5" />
                  <span>{t("Report a Problem")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/citizen/track')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase rounded-lg transition-all"
                >
                  {t("Track My Request")}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                {(dataMode === 'deck-exact'
                  ? [[t('Total Grievances'), '8,924', 'total'], [t('In Progress'), '2,341', 'in_progress'], [t('Completed'), '6,123', 'completed'], [t('Overdue'), '460', 'overdue']]
                  : [[t('Total Grievances'), '12,458', 'total'], [t('In Progress'), '1,874', 'in_progress'], [t('Completed'), '10,234', 'completed'], [t('Overdue'), '350', 'overdue']]
                ).map(([label, value, key]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      const targetId = key === 'completed' ? 'citizen-payments-section' : 'citizen-applications-section';
                      const el = document.getElementById(targetId);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        el.classList.add('ring-4', 'ring-amber-400/40');
                        setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400/40'), 1500);
                      }
                    }}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-left transition-all cursor-pointer group"
                    title={t("View {{label}} breakdown", { label })}
                  >
                    <span className="text-[11px] uppercase font-bold text-slate-300 block group-hover:text-amber-300 transition-colors">{label}</span>
                    <span className="text-xl font-bold font-heading text-white">{value}</span>
                    <span className="text-[10px] text-amber-200/80 block mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {key === 'completed' ? t("View Receipts →") : t("Inspect Status →")}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* ================================================================= */}
            {/* 1. My Municipal Tax & Utility Bill Payments (Official Receipts)   */}
            {/* ================================================================= */}
            <section id="citizen-payments-section" className="scroll-mt-24 bg-white rounded-xl shadow-card border border-slate-200 p-5 sm:p-6 space-y-4 border-l-4 border-l-emerald-600">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold font-heading uppercase text-slate-900">
                        {t("My Municipal Tax & Utility Bill Payments")}
                      </h3>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>{t("Settled & Reconciled")}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {t("Official paid receipts reconciled in the Municipal Corporation of Karimnagar Treasury for Ward {{ward}} (PTIN-KNR-27-0428)", { ward: citizenWard.id })}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/citizen/report?mode=payment')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all self-start sm:self-auto shrink-0"
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>{t("Pay Another Bill / Tax")}</span>
                </button>
              </div>

              {citizenPayments.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
                  {t("No payment history found. Settle your property tax or water bills online.")}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">{t("Receipt No")}</th>
                        <th className="py-2.5 px-3">{t("Tax / Utility Head")}</th>
                        <th className="py-2.5 px-3">{t("Assessment / Ref")}</th>
                        <th className="py-2.5 px-3">{t("Door / Location")}</th>
                        <th className="py-2.5 px-3">{t("Amount Paid")}</th>
                        <th className="py-2.5 px-3">{t("Credited Treasury Account")}</th>
                        <th className="py-2.5 px-3">{t("Paid Date")}</th>
                        <th className="py-2.5 px-3 text-right">{t("Receipt")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {citizenPayments.map((p) => (
                        <tr key={p.receiptNo} className="hover:bg-emerald-50/40 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-emerald-800 whitespace-nowrap">
                            {p.receiptNo}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {t(p.taxType)}
                            <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                            {p.refValue}
                          </td>
                          <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                            {p.doorNo}, Ward {p.wardId}
                          </td>
                          <td className="py-3 px-3 font-mono font-extrabold text-slate-900 whitespace-nowrap">
                            ₹{p.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-mono text-[11px] text-slate-800 font-bold block">{p.receivingAccount}</span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">{p.officerInCharge} ({p.department})</span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                            {p.paidTimeStr}
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Receipt ${p.receiptNo} for ₹${p.amount} (${p.taxType}) is downloaded.\nCredited to: ${p.receivingAccountName}\nSupervising Officer: ${p.officerInCharge}`);
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:border-emerald-600 bg-white text-slate-700 hover:text-emerald-800 font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition"
                            >
                              <Download className="w-3 h-3 text-emerald-700" />
                              <span>{t("Receipt PDF")}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ================================================================= */}
            {/* 2. My Applied Certificates, Permissions & Welfare Services        */}
            {/* ================================================================= */}
            <section id="citizen-applications-section" className="scroll-mt-24 bg-white rounded-xl shadow-card border border-slate-200 p-5 sm:p-6 space-y-4 border-l-4 border-l-blue-600">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold font-heading uppercase text-slate-900">
                        {t("My Applied Certificates & Welfare Services")}
                      </h3>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded-full">
                        {citizenApplications.length} {t("Active Applications")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {t("Live status of your birth/death certificates, TG-bPASS permissions, and Asara welfare applications.")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/citizen/report?mode=certificate')}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all self-start sm:self-auto shrink-0"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t("Apply for New Certificate")}</span>
                </button>
              </div>

              {citizenApplications.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
                  {t("No applications lodged yet. Request digital certificates or welfare schemes directly.")}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">{t("Application ID")}</th>
                        <th className="py-2.5 px-3">{t("Service Scheme")}</th>
                        <th className="py-2.5 px-3">{t("Designated Section")}</th>
                        <th className="py-2.5 px-3">{t("Receiving Officer")}</th>
                        <th className="py-2.5 px-3">{t("Application Date")}</th>
                        <th className="py-2.5 px-3">{t("SLA Target")}</th>
                        <th className="py-2.5 px-3">{t("Status")}</th>
                        <th className="py-2.5 px-3 text-right">{t("Action")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {citizenApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-kmc-navy whitespace-nowrap">
                            {app.id}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 max-w-xs">
                            {t(app.category)}
                            <span className="block text-[10px] text-slate-500 font-normal mt-0.5 truncate">
                              {app.description}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="text-slate-800 font-semibold block">{app.department}</span>
                            <span className="text-[10px] text-slate-500 block">Ward {app.wardId}</span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-800">
                            {app.assignedTo || t("Section In-Charge")}
                          </td>
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                            {app.reportedOn}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700">
                              {app.slaHours}h SLA
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <StatusChip status={app.status} />
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => navigate(`/citizen/track/${encodeURIComponent(app.id)}`)}
                              className="px-2.5 py-1.5 rounded-lg bg-kmc-navy text-white hover:bg-kmc-navy-light font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition"
                            >
                              <span>{t("Track Live")}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* The 7 Core Departments of MCK — Public Services & Civic Facilities */}
            <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] uppercase font-bold text-kmc-navy bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                    {t("Municipal Corporation of Karimnagar (MCK) Governance")}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold font-heading uppercase text-slate-900 mt-1">
                    {t("The 7 Core Departments of MCK — Public Services & Grievance Lodging")}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t("The 7 administrative sections administering local governance, tax collection, public works, and civic welfare in Karimnagar.")}
                  </p>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg shrink-0 self-start sm:self-auto">
                  {t("7 Official Sections Active")}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {MCK_CITIZEN_DEPARTMENTS.map((dept) => {
                  const Icon = dept.icon;
                  return (
                    <div
                      key={dept.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 hover:border-kmc-navy hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs ${dept.iconBg}`}>
                            <Icon className="w-5 h-5" />
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${dept.badgeColor}`}>
                            {t(dept.badge)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 font-heading leading-tight mb-1">
                          {t(dept.name)}
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                          {t(dept.description)}
                        </p>
                        <div className="bg-white rounded-lg p-2.5 border border-slate-200/80 mb-3 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            {t("Citizen Facilities & Scope")}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {dept.scope.map((s, idx) => (
                              <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                {t(s)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (dept.id === 'revenue') {
                            navigate('/citizen/report?mode=payment');
                          } else if (dept.id === 'statistics' || dept.id === 'urban-welfare' || dept.id === 'town-planning') {
                            navigate('/citizen/report?mode=certificate');
                          } else {
                            navigate('/citizen/report?mode=grievance');
                          }
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-kmc-navy hover:bg-kmc-navy-light text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>{t(dept.actionLabel)}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ================================================================= */}
            {/* 1. My Municipal Tax & Utility Bill Payments (Official Receipts)   */}
            {/* ================================================================= */}
            <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 sm:p-6 space-y-4 border-l-4 border-l-emerald-600">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold font-heading uppercase text-slate-900">
                        {t("My Municipal Tax & Utility Bill Payments")}
                      </h3>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>{t("Settled & Reconciled")}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {t("Official paid receipts reconciled in the Municipal Corporation of Karimnagar Treasury for Ward {{ward}} (PTIN-KNR-27-0428)", { ward: citizenWard.id })}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/citizen/report?mode=payment')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all self-start sm:self-auto shrink-0"
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>{t("Pay Another Bill / Tax")}</span>
                </button>
              </div>

              {citizenPayments.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
                  {t("No payment history found. Settle your property tax or water bills online.")}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">{t("Receipt No")}</th>
                        <th className="py-2.5 px-3">{t("Tax / Utility Head")}</th>
                        <th className="py-2.5 px-3">{t("Assessment / Ref")}</th>
                        <th className="py-2.5 px-3">{t("Door / Location")}</th>
                        <th className="py-2.5 px-3">{t("Amount Paid")}</th>
                        <th className="py-2.5 px-3">{t("Credited Treasury Account")}</th>
                        <th className="py-2.5 px-3">{t("Paid Date")}</th>
                        <th className="py-2.5 px-3 text-right">{t("Receipt")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {citizenPayments.map((p) => (
                        <tr key={p.receiptNo} className="hover:bg-emerald-50/40 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-emerald-800 whitespace-nowrap">
                            {p.receiptNo}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {t(p.taxType)}
                            <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                            {p.refValue}
                          </td>
                          <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                            {p.doorNo}, Ward {p.wardId}
                          </td>
                          <td className="py-3 px-3 font-mono font-extrabold text-slate-900 whitespace-nowrap">
                            ₹{p.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-mono text-[11px] text-slate-800 font-bold block">{p.receivingAccount}</span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">{p.officerInCharge} ({p.department})</span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                            {p.paidTimeStr}
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Receipt ${p.receiptNo} for ₹${p.amount} (${p.taxType}) is downloaded.\nCredited to: ${p.receivingAccountName}\nSupervising Officer: ${p.officerInCharge}`);
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:border-emerald-600 bg-white text-slate-700 hover:text-emerald-800 font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition"
                            >
                              <Download className="w-3 h-3 text-emerald-700" />
                              <span>{t("Receipt PDF")}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ================================================================= */}
            {/* 2. My Applied Certificates, Permissions & Welfare Services        */}
            {/* ================================================================= */}
            <section id="citizen-applications-section" className="scroll-mt-24 bg-white rounded-xl shadow-card border border-slate-200 p-5 sm:p-6 space-y-4 border-l-4 border-l-blue-600">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold font-heading uppercase text-slate-900">
                        {t("My Applied Certificates & Welfare Services")}
                      </h3>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded-full">
                        {citizenApplications.length} {t("Active Applications")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {t("Live status of your birth/death certificates, TG-bPASS permissions, and Asara welfare applications.")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/citizen/report?mode=certificate')}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all self-start sm:self-auto shrink-0"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t("Apply for New Certificate")}</span>
                </button>
              </div>

              {citizenApplications.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
                  {t("No applications lodged yet. Request digital certificates or welfare schemes directly.")}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">{t("Application ID")}</th>
                        <th className="py-2.5 px-3">{t("Service Scheme")}</th>
                        <th className="py-2.5 px-3">{t("Designated Section")}</th>
                        <th className="py-2.5 px-3">{t("Receiving Officer")}</th>
                        <th className="py-2.5 px-3">{t("Application Date")}</th>
                        <th className="py-2.5 px-3">{t("SLA Target")}</th>
                        <th className="py-2.5 px-3">{t("Status")}</th>
                        <th className="py-2.5 px-3 text-right">{t("Action")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {citizenApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-kmc-navy whitespace-nowrap">
                            {app.id}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 max-w-xs">
                            {t(app.category)}
                            <span className="block text-[10px] text-slate-500 font-normal mt-0.5 truncate">
                              {app.description}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="text-slate-800 font-semibold block">{app.department}</span>
                            <span className="text-[10px] text-slate-500 block">Ward {app.wardId}</span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-800">
                            {app.assignedTo || t("Section In-Charge")}
                          </td>
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                            {app.reportedOn}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700">
                              {app.slaHours}h SLA
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <StatusChip status={app.status} />
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => navigate(`/citizen/track/${encodeURIComponent(app.id)}`)}
                              className="px-2.5 py-1.5 rounded-lg bg-kmc-navy text-white hover:bg-kmc-navy-light font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition"
                            >
                              <span>{t("Track Live")}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Top Row: Ward Development Projects Transparency */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white rounded-xl shadow-card border border-slate-200 p-5">
              <div className="border-b border-slate-100 pb-2 mb-3">
                <h4 className="text-xs font-bold font-heading uppercase text-slate-800">{t("Ward Development Overview")}</h4>
                <p className="text-[11px] text-slate-500">{t(currentUser?.assignedWardName || `Ward ${citizenWard.id} – ${citizenWard.name}`)}</p>
              </div>
              <DonutChart data={developmentBreakdown} height={210} innerRadius={50} outerRadius={75} showLegend={true} />
            </div>
            <div className="lg:col-span-8 bg-white rounded-xl shadow-card border border-slate-200 p-5">
              <div>
                <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {t("Transparency in Development")}
                    </span>
                    <h3 className="text-base font-bold font-heading uppercase text-slate-800 mt-1">
                      {t("Ward Development Projects Tracker")} ({t(currentUser?.assignedWardName || 'Ward 27')})
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t("Track ongoing and completed civil works funded by municipal allocations")}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-kmc-navy bg-slate-100 px-2.5 py-0.5 rounded">
                    {projects.length} {t("Active Projects")}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">{t("Project")}</th>
                        <th className="py-2.5 px-3">{t("Site Photo")}</th>
                        <th className="py-2.5 px-3">{t("Status")}</th>
                        <th className="py-2.5 px-3">{t("Progress")}</th>
                        <th className="py-2.5 px-3">{t("Budget")}</th>
                        <th className="py-2.5 px-3 text-right">{t("Completion")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {projects.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <div>{t(p.name)}</div>
                            {p.location && (
                              <div className="text-[11px] text-slate-500 font-normal">{t(p.location)}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {p.image ? (
                              <PhotoThumbnail
                                src={p.image}
                                alt={`Site Photo: ${p.name}`}
                                location={p.location || 'Ward 27, Karimnagar'}
                                size="sm"
                              />
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">{t("No image")}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <StatusChip status={t(p.status)} size="sm" />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${p.progress}%` }}
                                  className={`h-full ${p.progress === 100 ? 'bg-emerald-600' : 'bg-blue-600'}`}
                                ></div>
                              </div>
                              <span className="text-[11px] font-bold text-slate-700">{p.progress}%</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                            ₹{p.budgetLakhs.toFixed(2)} L
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                            {t(p.completionDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            </section>

            {/* Reporting and tracking */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-card border border-slate-200 p-5 space-y-3">
                <h3 className="text-base font-bold font-heading uppercase text-slate-800">{t("Report or track a complaint")}</h3>
                <p className="text-sm text-slate-600">{t("Online grievance submission with photo uploads, and live status with before/after photos.")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button type="button" onClick={() => navigate('/citizen/report')} className="min-h-[48px] rounded-xl bg-kmc-navy text-white text-base font-bold">{t("Report a Problem")}</button>
                  <button type="button" onClick={() => navigate('/citizen/track')} className="min-h-[48px] rounded-xl border-2 border-kmc-navy text-kmc-navy text-base font-bold">{t("Track My Complaint")}</button>
                </div>
              </div>
              <SmsMessageFeed />
            </section>
          </>
        )}

      </main>

      <FooterStrip
        tagline={t("Your City. Your Voice. Our Commitment.")}
      />
    </div>
  );
};
