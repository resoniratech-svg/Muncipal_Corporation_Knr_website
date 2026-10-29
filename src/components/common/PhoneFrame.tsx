import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import kmcLogo from '../../assets/kmc-logo.svg';
import {
  Home, LayoutGrid, Bell, User, Wifi, Battery, Signal,
  Search, Droplet, Zap, Trash2, Waves, Wrench, Building2,
  BarChart3, CreditCard, FileText, ChevronRight, CheckCircle2,
  Clock, AlertTriangle, ShieldCheck, Phone, LogOut, Check,
  ExternalLink, ArrowRight,
} from 'lucide-react';
import { usePrefs, LANGUAGES, Lang } from '../../i18n';
import { useAuth } from '../../auth/AuthContext';
import { useApp } from '../../context/AppContext';

interface PhoneFrameProps {
  title?: string;
  children: React.ReactNode;
  activeTab?: 'home' | 'services' | 'alerts' | 'profile';
  onTabChange?: (tab: 'home' | 'services' | 'alerts' | 'profile') => void;
  className?: string;
  showHeader?: boolean;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  title = "My Karimnagar",
  children,
  activeTab = 'home',
  onTabChange,
  className = '',
  showHeader = true,
}) => {
  const navigate = useNavigate();
  const { t, lang, setLang } = usePrefs();
  const { currentUser, logout } = useAuth();
  const { grievances } = useApp();

  const [currentTab, setCurrentTab] = useState<'home' | 'services' | 'alerts' | 'profile'>(activeTab);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(true);

  // Services tab state
  const [serviceSearch, setServiceSearch] = useState('');

  // Alerts tab filter state
  const [alertFilter, setAlertFilter] = useState<'all' | 'grievances' | 'notices'>('all');

  // Profile tab SMS toggle state
  const [smsEnabled, setSmsEnabled] = useState(true);

  useEffect(() => {
    if (activeTab && activeTab !== currentTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  const handleTabClick = (tab: 'home' | 'services' | 'alerts' | 'profile') => {
    setCurrentTab(tab);
    if (tab === 'alerts') {
      setHasUnreadAlerts(false);
    }
    if (onTabChange) onTabChange(tab);
  };

  // Citizen displayName fallback
  const citizenName = currentUser?.displayName || 'Smt. Priya Rao';
  const citizenWard = currentUser?.assignedWardName || 'Ward 27 – Green Park Colony';
  const citizenId = currentUser?.id || 'USR-CITIZEN-01';

  // Services catalog list
  const servicesList = [
    {
      id: 'water',
      title: t('Water Supply'),
      desc: t('Drinking water schedule & tanker requests'),
      category: 'Water Supply',
      icon: Droplet,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      id: 'streetlights',
      title: t('Streetlights'),
      desc: t('Fused bulbs, dark spots & repair'),
      category: 'Streetlights',
      icon: Zap,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      id: 'sanitation',
      title: t('Sanitation'),
      desc: t('Garbage collection & street sweeping'),
      category: 'Sanitation',
      icon: Trash2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      id: 'drainage',
      title: t('Drainage'),
      desc: t('Drain overflow, desilting & manholes'),
      category: 'Drainage',
      icon: Waves,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    },
    {
      id: 'roads',
      title: t('Roads'),
      desc: t('Pothole repair & road restoration'),
      category: 'Roads',
      icon: Wrench,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
    },
    {
      id: 'town_planning',
      title: t('Town Planning'),
      desc: t('Building permissions & layout checks'),
      category: 'Town Planning',
      icon: Building2,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      id: 'ward_projects',
      title: t('Ward Projects'),
      desc: t('Track ongoing development in Ward 27'),
      route: '/citizen/portal',
      icon: BarChart3,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      id: 'property_tax',
      title: t('Property Tax'),
      desc: t('Check dues, receipts & assessments'),
      icon: CreditCard,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
    },
    {
      id: 'certificates',
      title: t('Certificates'),
      desc: t('Birth, death & trade licenses'),
      icon: FileText,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
  ];

  const filteredServices = servicesList.filter((s) => {
    if (!serviceSearch.trim()) return true;
    const q = serviceSearch.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q);
  });

  // Alerts catalog list
  const alertsList = [
    {
      id: 'alt-1',
      type: 'grievance',
      badge: t('Resolved'),
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      title: t('Grievance #GRV2024-00234 Resolved'),
      desc: t('Your drain overflow issue at Green Park Colony has been resolved with verified after-photo evidence.'),
      time: 'Today, 04:20 PM',
      icon: CheckCircle2,
      actionText: t('View Details & Rate'),
      actionRoute: '/citizen/track',
    },
    {
      id: 'alt-2',
      type: 'grievance',
      badge: t('In Progress'),
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      title: t('Work Dispatched (#GRV2024-00234)'),
      desc: t('Field Staff (Mahesh) has arrived at the location and commenced desilting operations.'),
      time: 'Today, 11:45 AM',
      icon: Clock,
      actionRoute: '/citizen/track',
    },
    {
      id: 'alt-3',
      type: 'grievance',
      badge: t('Registered'),
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      title: t('Complaint Registered (#GRV2024-00234)'),
      desc: t('Grievance logged with citizen photo and GPS coordinates. Assigned to Ward 27.'),
      time: 'Today, 10:15 AM',
      icon: ShieldCheck,
      actionRoute: '/citizen/track',
    },
    {
      id: 'alt-4',
      type: 'notice',
      badge: t('Ward Notice'),
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      title: t('Ward 27 Drinking Water Supply'),
      desc: t('Morning water supply schedule: 06:00 AM to 08:30 AM tomorrow in Green Park Colony.'),
      time: 'Yesterday, 07:00 PM',
      icon: Droplet,
    },
    {
      id: 'alt-5',
      type: 'notice',
      badge: t('Ward Notice'),
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
      title: t('Special Waste Clearance Drive'),
      desc: t('Door-to-door bulk waste clearance vehicle will be deployed on Saturday across Ward 27.'),
      time: '2 days ago',
      icon: Trash2,
    },
  ];

  const filteredAlerts = alertsList.filter((a) => {
    if (alertFilter === 'all') return true;
    if (alertFilter === 'grievances') return a.type === 'grievance';
    if (alertFilter === 'notices') return a.type === 'notice';
    return true;
  });

  // Dynamic header title according to active tab
  const getHeaderTitle = () => {
    switch (currentTab) {
      case 'services':
        return t('Municipal Civic Services');
      case 'alerts':
        return t('All Alerts');
      case 'profile':
        return t('Citizen Profile');
      case 'home':
      default:
        return t(title);
    }
  };

  const getHeaderSubtitle = () => {
    switch (currentTab) {
      case 'services':
        return t('Ward 27 – Green Park Colony');
      case 'alerts':
        return t('Official SMS Updates');
      case 'profile':
        return t('Verified Resident');
      case 'home':
      default:
        return t('Citizen Governance Portal');
    }
  };

  return (
    <div className={`mx-auto w-full max-w-[380px] bg-slate-900 p-3 rounded-[40px] shadow-phone border-4 border-slate-700/60 transition-all ${className}`}>
      {/* Device Inner Shell */}
      <div className="bg-slate-50 rounded-[32px] overflow-hidden flex flex-col h-[650px] relative border border-slate-200">
        
        {/* Device Status Bar */}
        <div className="bg-kmc-navy text-white text-[11px] px-5 py-2 flex items-center justify-between font-medium shrink-0 select-none">
          <span>10:30</span>
          {/* Dynamic Island / Notch */}
          <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          </div>
          <div className="flex items-center gap-1.5 opacity-90">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* App Bar Header */}
        {showHeader && (
          <div className="bg-kmc-navy text-white px-4 py-2.5 flex items-center justify-between border-b border-kmc-navy-light shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <img src={kmcLogo} alt="KMC" className="w-6 h-6 object-contain shrink-0" />
              <div className="min-w-0">
                <h4 className="text-xs font-bold font-heading uppercase tracking-wide leading-none truncate">
                  {getHeaderTitle()}
                </h4>
                <p className="text-[11px] text-amber-300 truncate mt-0.5">
                  {getHeaderSubtitle()}
                </p>
              </div>
            </div>
            <div className="text-[11px] bg-kmc-green px-2 py-0.5 rounded-full text-white font-semibold shrink-0">
              {t('Live')}
            </div>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3 text-slate-800">

          {/* TAB 1: HOME */}
          {currentTab === 'home' && (
            <div className="space-y-3">
              {children}
            </div>
          )}

          {/* TAB 2: SERVICES */}
          {currentTab === 'services' && (
            <div className="space-y-3">
              {/* Search Services */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder={t('Search services...')}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 text-slate-800 outline-none focus:ring-1 focus:ring-kmc-navy"
                />
              </div>

              {/* Quick Report Hero CTA */}
              <div className="bg-gradient-to-r from-kmc-navy to-slate-900 rounded-2xl p-3.5 text-white shadow-sm flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                    {t('Fast Grievance Redressal')}
                  </span>
                  <h5 className="text-xs font-bold font-heading uppercase text-white mt-0.5">
                    {t('Have a problem in your street?')}
                  </h5>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    {t('Take a photo & report in 60 seconds')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/citizen/report')}
                  className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shrink-0 shadow flex items-center gap-1"
                >
                  <span>{t('Report')}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Services Grid */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                  {t('Civic Categories')} ({filteredServices.length})
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {filteredServices.map((srv) => {
                    const Icon = srv.icon;
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => {
                          if (srv.route) {
                            navigate(srv.route);
                          } else {
                            navigate('/citizen/report');
                          }
                        }}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-left hover:border-kmc-navy transition-all flex flex-col justify-between min-h-[92px] group"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${srv.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-kmc-navy group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <div className="mt-1.5">
                          <span className="block text-xs font-bold text-slate-800 leading-tight">
                            {srv.title}
                          </span>
                          <span className="block text-[10px] text-slate-500 leading-tight truncate mt-0.5">
                            {srv.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Municipal Helpline Box */}
              <div className="bg-slate-100 rounded-xl p-2.5 border border-slate-200 text-center">
                <p className="text-[11px] font-bold text-slate-700">
                  {t('Karimnagar Municipal Helpline')}
                </p>
                <p className="text-xs font-mono font-bold text-kmc-navy mt-0.5">
                  1800-425-4140 · 0878-2243444
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ALERTS */}
          {currentTab === 'alerts' && (
            <div className="space-y-3">
              {/* Filter Tabs */}
              <div className="flex items-center justify-between gap-1 bg-slate-200/80 p-1 rounded-xl text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setAlertFilter('all')}
                  className={`flex-1 py-1 rounded-lg text-center transition-all ${
                    alertFilter === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('All')}
                </button>
                <button
                  type="button"
                  onClick={() => setAlertFilter('grievances')}
                  className={`flex-1 py-1 rounded-lg text-center transition-all ${
                    alertFilter === 'grievances' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('Grievances')}
                </button>
                <button
                  type="button"
                  onClick={() => setAlertFilter('notices')}
                  className={`flex-1 py-1 rounded-lg text-center transition-all ${
                    alertFilter === 'notices' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('Ward Notices')}
                </button>
              </div>

              {/* Alerts List */}
              <div className="space-y-2">
                {filteredAlerts.map((alt) => {
                  const Icon = alt.icon;
                  return (
                    <div
                      key={alt.id}
                      className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-kmc-navy shrink-0" />
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${alt.badgeColor}`}>
                            {alt.badge}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {alt.time}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-slate-900 leading-snug">
                        {alt.title}
                      </h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {alt.desc}
                      </p>

                      {alt.actionText && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => alt.actionRoute && navigate(alt.actionRoute)}
                            className="text-xs font-bold text-kmc-navy hover:underline flex items-center gap-1"
                          >
                            <span>{alt.actionText}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Official SMS Disclaimer */}
              <div className="text-center py-1">
                <span className="text-[10px] text-slate-400">
                  {t('Sender ID: VM-MCKNRG · Official Municipal Broadcast')}
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {currentTab === 'profile' && (
            <div className="space-y-3">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm text-center">
                <div className="w-14 h-14 rounded-full bg-kmc-navy text-amber-300 font-heading text-lg font-bold mx-auto flex items-center justify-center border-2 border-amber-400/50 shadow-md">
                  {currentUser?.avatarInitials || 'PR'}
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2 font-heading uppercase">
                  {citizenName}
                </h4>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    {t('Verified Citizen')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  ID: {citizenId}
                </p>
                <div className="mt-2 inline-block px-2.5 py-0.5 bg-blue-50 text-kmc-navy rounded-full text-[11px] font-semibold border border-blue-200">
                  {citizenWard}
                </div>
              </div>

              {/* Grievance Summary Counters */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    {t('Total Filed')}
                  </span>
                  <span className="text-base font-bold text-slate-900 font-heading">
                    {grievances.length > 0 ? grievances.length : '4'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-bold text-blue-500 uppercase block">
                    {t('In Progress')}
                  </span>
                  <span className="text-base font-bold text-blue-700 font-heading">
                    1
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase block">
                    {t('Resolved')}
                  </span>
                  <span className="text-base font-bold text-emerald-700 font-heading">
                    3
                  </span>
                </div>
              </div>

              {/* Language Preferences */}
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  {t('Language')}
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {LANGUAGES.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setLang(item.code)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        lang === item.code
                          ? 'bg-kmc-navy text-white border-kmc-navy shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications Toggle */}
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {t('SMS Notifications')}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {t('Receive instant ticket updates')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsEnabled(!smsEnabled)}
                  className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                    smsEnabled ? 'bg-kmc-green' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      smsEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Registered Details */}
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    {t('Registered Address')}
                  </span>
                  <span className="text-slate-800 font-medium">
                    Plot 42, Green Park Colony, Karimnagar - 505001
                  </span>
                </div>
                <div className="pt-1.5 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    {t('Ward Office')}
                  </span>
                  <span className="text-slate-800 font-medium">
                    Ward 27 Sachivalayam · Corporator: Sri. K. Ramesh Rao
                  </span>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full py-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('Sign out')}</span>
              </button>
            </div>
          )}

        </div>

        {/* Bottom Tab Bar (Home, Services, Alerts, Profile) */}
        <div className="bg-white border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shrink-0 select-none shadow-lg">
          <button
            type="button"
            onClick={() => handleTabClick('home')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
              currentTab === 'home' ? 'text-kmc-navy font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[11px]">{t('Home')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('services')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
              currentTab === 'services' ? 'text-kmc-navy font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-[11px]">{t('Services')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('alerts')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
              currentTab === 'alerts' ? 'text-kmc-navy font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Bell className="w-4 h-4" />
              {hasUnreadAlerts && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
            <span className="text-[11px]">{t('Alerts')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('profile')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
              currentTab === 'profile' ? 'text-kmc-navy font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[11px]">{t('Profile')}</span>
          </button>
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="bg-white py-1 flex justify-center shrink-0">
          <div className="w-24 h-1 bg-slate-300 rounded-full"></div>
        </div>

      </div>
    </div>
  );
};
