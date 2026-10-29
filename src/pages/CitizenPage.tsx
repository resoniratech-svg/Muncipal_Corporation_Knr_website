import React, { useState } from 'react';
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
import { Laptop, Smartphone } from 'lucide-react';
import { usePrefs } from '../i18n';
import { MobileReportFlow } from '../components/citizen/mobile/MobileReportFlow';
import { MobileTrackFlow } from '../components/citizen/mobile/MobileTrackFlow';
import { MobileDetailFlow } from '../components/citizen/mobile/MobileDetailFlow';

export const CitizenPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeWardId, grievances, projects, dataMode } = useApp();
  const { currentUser } = useAuth();
  const { t } = usePrefs();
  const [activeView, setActiveView] = useState<'portal' | 'mobile'>('portal');

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
        
        {/* Resident Greeting Banner */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-kmc-green">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                {t("Citizen ID:")} {currentUser?.id || 'USR-CITIZEN-01'}
              </span>
              <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                {t(currentUser?.assignedWardName || 'Ward 27 – Green Park Colony')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading uppercase text-slate-900 mt-1">
              {t("Namaste, Priya Rao!")}
            </h2>
            <p className="text-xs text-slate-500">
              {t("Welcome to the Karimnagar Municipal Corporation Public Services & Grievance Portal.")}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-500 uppercase font-bold">{t("My Active Tickets")}</span>
            <p className="text-lg font-bold font-heading text-emerald-700">{citizenGrievances.length} {t("Registered")}</p>
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
              <div className="flex flex-wrap gap-3 mt-4">
                <a href="#/citizen/report" onClick={(e) => { e.preventDefault(); navigate('/citizen/report'); }} className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase rounded-lg shadow">
                  {t("Report an Issue")}
                </a>
                <a href="#/citizen/track" onClick={(e) => { e.preventDefault(); navigate('/citizen/track'); }} className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase rounded-lg">
                  {t("Track My Request")}
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                {(dataMode === 'deck-exact'
                  ? [[t('Total Grievances'), '8,924'], [t('In Progress'), '2,341'], [t('Completed'), '6,123'], [t('Overdue'), '460']]
                  : [[t('Total Grievances'), '12,458'], [t('In Progress'), '1,874'], [t('Completed'), '10,234'], [t('Overdue'), '350']]
                ).map(([label, value]) => (
                  <div key={label} className="p-3 rounded-xl bg-white/10 border border-white/15">
                    <span className="text-[11px] uppercase font-bold text-slate-300 block">{label}</span>
                    <span className="text-xl font-bold font-heading">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Row: Ward Development Projects Transparency */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white rounded-xl shadow-card border border-slate-200 p-5">
              <div className="border-b border-slate-100 pb-2 mb-3">
                <h4 className="text-xs font-bold font-heading uppercase text-slate-800">{t("Ward Development Overview")}</h4>
                <p className="text-[11px] text-slate-500">{t("Ward 27")}</p>
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
