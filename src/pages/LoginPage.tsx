import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROLE_DESTINATIONS, ROLE_DISPLAY_NAMES } from '../auth/permissions';
import {
  Lock, Mail, Eye, EyeOff, LogIn, CheckCircle2, AlertCircle, MapPin,
  Shield, Users, Smartphone, ArrowRight, Presentation,
} from 'lucide-react';
import kmcLogo from '../assets/kmc-logo.svg';
import { LanguageToggle } from '../components/common/DemoControls';
import { usePrefs } from '../i18n';

interface LandmarkInfo {
  id: string;
  name: string;
  ward: string;
  tagline: string;
  image: string;
}

const KARIMNAGAR_LANDMARKS: LandmarkInfo[] = [
  {
    id: 'tower',
    name: 'Clock Tower, Tower Circle',
    ward: 'Ward 8',
    tagline: 'The historic heart of the city',
    image: 'landmarks/tower-circle.png',
  },
  {
    id: 'dam',
    name: 'Lower Manair Dam',
    ward: 'Ward 45 · LMD Colony',
    tagline: 'The reservoir that supplies all 66 wards',
    image: 'landmarks/lmd-dam.png',
  },
  {
    id: 'fort',
    name: 'Elgandal Fort',
    ward: 'Heritage Enclave',
    tagline: 'Centuries of Telangana history on a granite ridge',
    image: 'landmarks/elgandal-fort.jpg',
  },
];

// The three tiers of the proposed system (deck Page 4)
const TIERS = [
  { icon: Shield, title: 'Administrative Leadership', text: 'Informed decisions, efficient monitoring, and improved coordination.' },
  { icon: Users, title: 'Elected Representatives', text: 'Better insights, stronger engagement, and responsible governance.' },
  { icon: Smartphone, title: 'Citizens', text: 'Easy access to services, transparency, and a stronger voice in governance.' },
];

const ROLE_BADGE_DARK: Record<string, { color: string; bg: string }> = {
  super_admin: { color: 'text-amber-300', bg: 'bg-amber-400/20 border-amber-400/40' },
  mayor_commissioner: { color: 'text-purple-300', bg: 'bg-purple-400/20 border-purple-400/40' },
  corporator: { color: 'text-blue-300', bg: 'bg-blue-400/20 border-blue-400/40' },
  department_officer: { color: 'text-orange-300', bg: 'bg-orange-400/20 border-orange-400/40' },
  field_staff: { color: 'text-teal-300', bg: 'bg-teal-400/20 border-teal-400/40' },
  citizen: { color: 'text-emerald-300', bg: 'bg-emerald-400/20 border-emerald-400/40' },
  governance_auditor: { color: 'text-indigo-300', bg: 'bg-indigo-400/20 border-indigo-400/40' },
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, allDemoUsers } = useAuth();
  const { t } = usePrefs();

  const [activeLandmarkIdx, setActiveLandmarkIdx] = useState(0);
  const activeLandmark = KARIMNAGAR_LANDMARKS[activeLandmarkIdx];

  const [username, setUsername] = useState('admin@kmc.demo');
  const [password, setPassword] = useState('KmcAdmin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Auto-cycle through landmarks
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveLandmarkIdx((prev) => (prev + 1) % KARIMNAGAR_LANDMARKS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Check if we came from an unauthorized redirect
  const from = (location.state as any)?.from?.pathname;

  const signIn = (user: string, pass: string) => {
    setErrorMessage(null);
    if (!user.trim() || !pass.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoadingUser(user);
    setTimeout(() => {
      const res = login(user, pass, rememberMe);
      setLoadingUser(null);

      if (res.success) {
        // Find user role to determine target destination
        const userRec = allDemoUsers[user.toLowerCase().trim()];
        const targetRoute = from || (userRec ? ROLE_DESTINATIONS[userRec.user.role] : '/');
        navigate(targetRoute, { replace: true });
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(username, password);
  };

  const handleDemoSignIn = (demoUsername: string, demoPassword: string) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    signIn(demoUsername, demoPassword);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotPasswordOpen(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 2800);
  };

  const isFormLoading = loadingUser !== null && loadingUser === username;

  return (
    <div className="relative min-h-screen bg-kmc-navy-dark text-white selection:bg-kmc-navy selection:text-white">

      {/* Full-page landmark background */}
      <div className="fixed inset-0" aria-hidden="true">
        {KARIMNAGAR_LANDMARKS.map((lm, idx) => (
          <img
            key={lm.id}
            src={lm.image}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover brightness-[1.08] contrast-[1.05] transition-opacity duration-1000 ${idx === activeLandmarkIdx ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        {/* Crystal-clear background overlays: reduced darkening so landmark photography is richly visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/45 via-slate-950/15 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-between">
        
        <div className="flex-1 w-full max-w-7xl mx-auto px-5 sm:px-10 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8 lg:gap-14 items-start">

          {/* Left section: Identity Box (medium) beside Sign In + Vision Card */}
          <section className="space-y-6">
            {/* Medium-sized Government of Telangana / KMC Identity Box alongside Language Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="flex items-center gap-3.5 sm:gap-4 bg-slate-950/70 backdrop-blur-xl px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl border border-white/20 shadow-xl">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 backdrop-blur-md p-1.5 border border-amber-300 flex items-center justify-center shrink-0 shadow-lg ring-1 ring-amber-400/30">
                  <img src={kmcLogo} alt="KMC emblem" className="w-full h-full object-contain filter drop-shadow-sm" />
                </div>
                <div>
                  <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-[0.2em] text-amber-300 block drop-shadow">
                    {t('Government of Telangana')}
                  </span>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold font-heading uppercase tracking-wide text-white drop-shadow-md leading-tight mt-0.5">
                    {t('Karimnagar Municipal Corporation')}
                  </h1>
                  <p className="text-[11px] text-slate-200 font-medium tracking-wide flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    <span>{t('Digital Governance Platform')}</span>
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/70 backdrop-blur-xl rounded-xl p-1 border border-white/20 shadow-xl self-start sm:self-center">
                <LanguageToggle />
              </div>
            </div>

            <div className="bg-slate-950/50 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl max-w-xl">
              <h2 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold font-heading uppercase leading-[1.1] tracking-wide drop-shadow-md text-white">
                {t('Towards Transparent, Accountable & Smart Governance')}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-100 font-medium leading-relaxed drop-shadow">
                {t('One digital platform connecting leadership, elected representatives and citizens across all 66 wards.')}
              </p>

              <ul className="mt-6 hidden sm:grid gap-3">
                {TIERS.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex items-start gap-3 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/15 p-3.5 hover:bg-slate-900/80 transition-colors">
                    <span className="w-9 h-9 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-white">{t(title)}</span>
                      <span className="block text-xs text-slate-200 mt-0.5">{t(text)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Sign in card */}
          <main className="w-full max-w-lg lg:ml-auto bg-slate-950/65 backdrop-blur-xl text-white rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">{t('Digital Governance Platform')}</span>
            <h2 className="text-3xl font-extrabold font-heading uppercase text-white mt-1">{t('Sign in')}</h2>
            <p className="text-sm text-slate-200 mt-1">{t('Use your official account, or pick a demo role below.')}</p>

            {errorMessage && (
              <div role="alert" className="mt-5 p-3 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 backdrop-blur-sm">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-200 mb-1.5">
                  {t('Email or username')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-email"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin@kmc.demo"
                    className="w-full pl-9 pr-3 py-3 text-sm border border-white/20 rounded-xl bg-white/10 backdrop-blur-md text-white placeholder-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-xs font-semibold text-slate-200">
                    {t('Password')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="min-h-[32px] -mr-1 px-1 rounded text-xs text-amber-300 hover:text-amber-200 hover:underline font-medium"
                  >
                    {t('Forgot password?')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('Enter password')}
                    className="w-full pl-9 pr-10 py-3 text-sm border border-white/20 rounded-xl bg-white/10 backdrop-blur-md text-white placeholder-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/30 bg-white/10 text-amber-400 focus:ring-amber-400 w-4 h-4"
                />
                {t('Keep me signed in on this device')}
              </label>

              <button
                type="submit"
                disabled={loadingUser !== null}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70"
              >
                {isFormLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    {t('Signing in…')}
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    {t('Sign in')}
                  </>
                )}
              </button>
            </form>

            {/* Demo roles: one click signs in */}
            <section className="mt-10" aria-labelledby="demo-heading">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-white/20"></span>
                <h3 id="demo-heading" className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-300">
                  {t('Or continue with a demo role')}
                </h3>
                <span className="h-px flex-1 bg-white/20"></span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(allDemoUsers).map(([key, record]) => {
                  const badge = ROLE_DISPLAY_NAMES[record.user.role];
                  const darkBadge = ROLE_BADGE_DARK[record.user.role] || { color: 'text-amber-300', bg: 'bg-white/10 border-white/20' };
                  const isLoading = loadingUser === record.user.username;
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={loadingUser !== null}
                      onClick={() => handleDemoSignIn(record.user.username, record.passwordHash)}
                      title={`${record.roleDescription}\n${record.user.username} · ${record.passwordHash}`}
                      className="group text-left p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 hover:border-amber-400/50 backdrop-blur-md transition-all disabled:opacity-60 flex items-center gap-3"
                    >
                      <span className={`w-9 h-9 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0 ${darkBadge.bg} ${darkBadge.color}`}>
                        {record.user.avatarInitials}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-[11px] font-bold uppercase tracking-wide leading-tight ${darkBadge.color}`}>{t(badge.title.replace(/\s*\(.*\)$/, ''))}</span>
                        <span className="block text-xs font-semibold text-white group-hover:text-amber-200 transition-colors leading-snug mt-0.5">{record.user.displayName}</span>
                      </span>
                      {isLoading ? (
                        <span className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin shrink-0"></span>
                      ) : (
                        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-300/80 mt-3">
                {t('Demonstration prototype. Accounts, roles and data are simulated in this browser.')}
              </p>
            </section>
          </main>
        </div>

        {/* Landmark caption, switcher and tagline */}
        <footer className="w-full max-w-7xl mx-auto px-5 sm:px-10 py-4 bg-slate-950/45 backdrop-blur-md rounded-t-2xl border-t border-x border-white/20 flex flex-wrap items-center justify-between gap-4 mt-auto">
          <div key={activeLandmark.id} className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">{t(activeLandmark.ward)}</span>
                <span className="text-white font-bold text-sm">• {t(activeLandmark.name)}</span>
              </div>
              <p className="text-xs text-slate-200">{t(activeLandmark.tagline)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2" role="tablist" aria-label={t('Karimnagar landmarks')}>
            <span className="text-[11px] uppercase font-bold text-slate-300 mr-1">{t('Landmarks')}:</span>
            {KARIMNAGAR_LANDMARKS.map((lm, idx) => (
              <button
                key={lm.id}
                type="button"
                role="tab"
                aria-selected={idx === activeLandmarkIdx}
                aria-label={t(lm.name)}
                onClick={() => setActiveLandmarkIdx(idx)}
                className="group h-8 px-2 flex items-center gap-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className={`block h-2.5 rounded-full transition-all ${idx === activeLandmarkIdx ? 'w-6 bg-amber-400' : 'w-2.5 bg-white/50 group-hover:bg-white'}`} />
                <span className={`text-[11px] font-medium hidden md:inline ${idx === activeLandmarkIdx ? 'text-amber-300 font-bold' : 'text-slate-300'}`}>
                  {lm.name.split(',')[0]}
                </span>
              </button>
            ))}
          </div>
          <div className="w-full sm:w-auto text-xs text-slate-300 flex flex-col sm:items-end gap-0.5">
            <span className="font-medium text-white">{t('Smart Governance. Stronger Karimnagar. Better Tomorrow.')}</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Presentation className="w-3.5 h-3.5 text-amber-400" />
              {t('26-slide proposal included after sign in')}
            </span>
          </div>
        </footer>
      </div>

      {/* Forgot password (demo) */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="forgot-heading">
          <div className="bg-kmc-navy-dark/95 backdrop-blur-xl rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/20 text-white">
            <h3 id="forgot-heading" className="text-base font-bold font-heading uppercase text-white mb-2">
              {t('Reset password')}
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              {t("Enter your email address and we'll send you a password reset link.")}
            </p>

            {forgotSuccess ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-center text-xs text-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1.5" />
                <strong className="block font-bold">{t('Reset link sent')}</strong>
                <span>{t('In this demo, sign in with one of the demo roles instead.')}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. admin@kmc.demo"
                  className="w-full px-3 py-2.5 text-sm border border-white/20 rounded-xl bg-white/10 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 outline-none"
                  required
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="px-3 py-2 text-xs text-slate-300 hover:bg-white/10 rounded-lg"
                  >
                    {t('Cancel')}
                  </button>
                  <button type="submit" className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition-colors">
                    {t('Send reset link')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
