import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROLE_DESTINATIONS, ROLE_DISPLAY_NAMES } from '../auth/permissions';
import {
  Lock, Mail, Eye, EyeOff, LogIn, CheckCircle2, AlertCircle,
  HelpCircle, ArrowRight, Shield, X, ChevronDown, Check,
} from 'lucide-react';
import kmcLogo from '../assets/kmc-logo.svg';
import { LanguageToggle } from '../components/common/DemoControls';
import { usePrefs } from '../i18n';
import { DemoUserRecord } from '../auth/mockUsers';

interface DemoAccountGroup {
  id: string;
  label: string;
  items: {
    key: string;
    record: DemoUserRecord;
    badgeTitle: string;
  }[];
}

const GROUPS_CONFIG = [
  { id: 'admin', label: 'Administration', roles: ['super_admin', 'mayor_commissioner'] },
  { id: 'ward_dept', label: 'Ward & Department', roles: ['corporator', 'department_officer'] },
  { id: 'field', label: 'Field Operations', roles: ['field_staff'] },
  { id: 'audit', label: 'Audit', roles: ['governance_auditor'] },
  { id: 'citizens', label: 'Citizens', roles: ['citizen'] },
];

const ROLE_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  super_admin: { bg: 'bg-amber-400/20', text: 'text-amber-300', border: 'border-amber-400/40' },
  mayor_commissioner: { bg: 'bg-purple-400/20', text: 'text-purple-300', border: 'border-purple-400/40' },
  corporator: { bg: 'bg-blue-400/20', text: 'text-blue-300', border: 'border-blue-400/40' },
  department_officer: { bg: 'bg-orange-400/20', text: 'text-orange-300', border: 'border-orange-400/40' },
  field_staff: { bg: 'bg-teal-400/20', text: 'text-teal-300', border: 'border-teal-400/40' },
  governance_auditor: { bg: 'bg-indigo-400/20', text: 'text-indigo-300', border: 'border-indigo-400/40' },
  citizen: { bg: 'bg-emerald-400/20', text: 'text-emerald-300', border: 'border-emerald-400/40' },
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, allDemoUsers } = useAuth();
  const { t } = usePrefs();

  const [username, setUsername] = useState('admin@kmc.demo');
  const [password, setPassword] = useState('KmcAdmin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState<string | null>(null);

  // Custom demo account dropdown state
  const [selectedDemoKey, setSelectedDemoKey] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Modals
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Check if we came from an unauthorized redirect
  const from = (location.state as any)?.from?.pathname;

  // Grouped demo accounts configuration
  const groupedAccounts = useMemo<DemoAccountGroup[]>(() => {
    const groups: DemoAccountGroup[] = [];

    GROUPS_CONFIG.forEach((cfg) => {
      const items = Object.entries(allDemoUsers)
        .filter(([_, rec]) => cfg.roles.includes(rec.user.role))
        .map(([k, rec]) => {
          let badgeTitle = rec.user.roleTitle || rec.user.role;
          if (rec.user.role === 'department_officer') {
            badgeTitle = rec.user.roleTitle || 'Department Officer';
          } else if (rec.user.role === 'field_staff') {
            badgeTitle = rec.user.roleTitle || 'Field Staff';
          } else {
            const badge = ROLE_DISPLAY_NAMES[rec.user.role];
            badgeTitle = badge ? badge.title.replace(/\s*\(.*\)$/, '') : rec.user.role;
          }
          return { key: k, record: rec, badgeTitle };
        });

      if (items.length > 0) {
        groups.push({
          id: cfg.id,
          label: cfg.label,
          items,
        });
      }
    });

    // Capture any dynamically created or extra roles
    const handledKeys = new Set(groups.flatMap((g) => g.items.map((i) => i.key)));
    const otherItems = Object.entries(allDemoUsers)
      .filter(([k]) => !handledKeys.has(k))
      .map(([k, rec]) => {
        const badge = ROLE_DISPLAY_NAMES[rec.user.role];
        const roleClean = badge ? badge.title.replace(/\s*\(.*\)$/, '') : rec.user.role;
        return { key: k, record: rec, badgeTitle: roleClean };
      });

    if (otherItems.length > 0) {
      groups.push({
        id: 'other',
        label: 'Other Accounts',
        items: otherItems,
      });
    }

    return groups;
  }, [allDemoUsers]);

  // Flattened items list for keyboard navigation
  const flatItems = useMemo(() => groupedAccounts.flatMap((g) => g.items), [groupedAccounts]);

  // Click outside and escape key handling for the dropdown
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const signIn = (user: string, pass: string) => {
    setErrorMessage(null);
    if (!user.trim() || !pass.trim()) {
      setErrorMessage(t('Please enter both your email address and password.'));
      return;
    }

    setLoadingUser(user);
    setTimeout(() => {
      const res = login(user, pass, rememberMe);
      setLoadingUser(null);

      if (res.success) {
        const userRec = allDemoUsers[user.toLowerCase().trim()];
        const targetRoute = from || (userRec ? ROLE_DESTINATIONS[userRec.user.role] : '/');
        navigate(targetRoute, { replace: true });
      } else {
        setErrorMessage(res.error || t('Authentication failed. Please verify credentials.'));
      }
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(username, password);
  };

  const handleDemoSelect = (key: string) => {
    setSelectedDemoKey(key);
    if (key && allDemoUsers[key]) {
      const record = allDemoUsers[key];
      setUsername(record.user.username);
      setPassword(record.passwordHash);
      setErrorMessage(null);
    }
  };

  const handleDemoContinue = () => {
    if (!selectedDemoKey || !allDemoUsers[selectedDemoKey]) return;
    const record = allDemoUsers[selectedDemoKey];
    signIn(record.user.username, record.passwordHash);
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!dropdownOpen) {
        setDropdownOpen(true);
        const currIdx = flatItems.findIndex((it) => it.key === selectedDemoKey);
        setHighlightedIdx(currIdx >= 0 ? currIdx : 0);
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (flatItems[highlightedIdx]) {
          handleDemoSelect(flatItems[highlightedIdx].key);
          setDropdownOpen(false);
        }
      } else if (e.key === 'ArrowDown') {
        setHighlightedIdx((prev) => (prev + 1) % flatItems.length);
      } else if (e.key === 'ArrowUp') {
        setHighlightedIdx((prev) => (prev - 1 + flatItems.length) % flatItems.length);
      }
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
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
  const isDemoLoading = loadingUser !== null && selectedDemoKey && allDemoUsers[selectedDemoKey]?.user.username === loadingUser;

  // Selected account details for the closed dropdown button
  const selectedRecord = selectedDemoKey ? allDemoUsers[selectedDemoKey] : null;
  const selectedBadge = selectedRecord ? ROLE_DISPLAY_NAMES[selectedRecord.user.role] : null;
  const selectedRoleClean = selectedRecord
    ? (selectedRecord.user.role === 'department_officer' || selectedRecord.user.role === 'field_staff'
        ? selectedRecord.user.roleTitle || selectedBadge?.title.replace(/\s*\(.*\)$/, '')
        : selectedBadge?.title.replace(/\s*\(.*\)$/, '') || selectedRecord.user.role)
    : '';
  const selectedBadgeStyle = selectedRecord ? ROLE_BADGE[selectedRecord.user.role] : null;

  return (
    <div className="relative min-h-screen bg-kmc-navy-dark text-white selection:bg-kmc-navy selection:text-white flex flex-col justify-between">

      {/* Background landmark photograph with clean subtle dark overlay */}
      <div className="fixed inset-0" aria-hidden="true">
        <img
          src="landmarks/elgandal-fort.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover brightness-[1.05] contrast-[1.05]"
        />
        {/* Subtle dark overlay: keeps landmark photography sharp, vivid, and visible through the glass card */}
        <div className="absolute inset-0 bg-slate-950/25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-transparent to-slate-950/35 pointer-events-none" />
      </div>

      {/* Top Header Branding & Controls */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 backdrop-blur-md p-1.5 border border-white/20 flex items-center justify-center shrink-0 shadow">
            <img src={kmcLogo} alt="KMC emblem" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-amber-300 block">
              {t('Government of Telangana')}
            </span>
            <h1 className="text-sm sm:text-base font-bold uppercase tracking-wide text-white leading-tight">
              {t('Karimnagar Municipal Corporation')}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle glass />
          <button
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="min-h-[36px] px-3 py-1.5 rounded-xl glass-control-btn text-xs font-semibold text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('Help')}</span>
          </button>
        </div>
      </header>

      {/* Main Centered Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-[440px] glass-card-main rounded-2xl p-6 sm:p-8 text-white relative">
          <h2 className="text-2xl font-bold font-heading text-white tracking-tight">{t('Sign in')}</h2>
          <p className="text-xs text-slate-300 mt-1">{t('Access your municipal governance account.')}</p>

          {errorMessage && (
            <div role="alert" className="mt-4 p-3 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl glass-form-input text-white placeholder-slate-400 outline-none"
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
                  className="text-xs text-amber-300 hover:text-amber-200 hover:underline font-medium"
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
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl glass-form-input text-white placeholder-slate-400 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
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
                className="rounded border-white/30 bg-slate-950/60 text-amber-400 focus:ring-amber-400 w-4 h-4"
              />
              <span>{t('Keep me signed in on this device')}</span>
            </label>

            <button
              type="submit"
              disabled={loadingUser !== null}
              className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {isFormLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>{t('Signing in…')}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{t('Sign in')}</span>
                </>
              )}
            </button>

            <div className="text-center pt-0.5">
              <p className="text-xs text-slate-300">
                {t("Don't have an account?")}{' '}
                <button
                  type="button"
                  onClick={() => setSignUpModalOpen(true)}
                  className="text-amber-300 hover:text-amber-200 font-semibold underline underline-offset-2"
                >
                  {t('Sign up')}
                </button>
              </p>
            </div>
          </form>

          {/* Professional Custom Demo Account Selector */}
          <div className="mt-5 pt-4 border-t border-white/10 space-y-2 relative" ref={dropdownRef}>
            <label htmlFor="demo-role-select" className="block text-xs font-semibold text-slate-200">
              {t('Try a demo account')}
            </label>

            <div className="relative">
              {/* Closed Dropdown Button Trigger */}
              <button
                id="demo-role-select"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
                aria-controls="demo-role-menu"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onKeyDown={handleButtonKeyDown}
                className={`w-full min-h-[42px] px-3 py-2 rounded-xl glass-control-btn ${
                  dropdownOpen
                    ? 'border-amber-400 ring-1 ring-amber-400/50'
                    : ''
                } flex items-center justify-between gap-2.5 transition-all text-left outline-none cursor-pointer`}
              >
                {selectedRecord ? (
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        selectedBadgeStyle?.bg || 'bg-white/10'
                      } ${selectedBadgeStyle?.text || 'text-white'} ${
                        selectedBadgeStyle?.border || 'border-white/20'
                      }`}
                    >
                      {selectedRecord.user.avatarInitials}
                    </span>
                    <div className="min-w-0 flex-1 truncate">
                      <span className="text-xs font-semibold text-white mr-1.5">
                        {t(selectedRoleClean || '')}
                      </span>
                      <span className="text-[11px] text-slate-300 truncate">
                        · {selectedRecord.user.displayName}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full min-w-0">
                    <span className="text-xs text-slate-400 font-medium truncate">
                      {t('Select a demo account...')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {t('Choose a role')}
                    </span>
                  </div>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180 text-amber-400' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu Options Panel */}
              {dropdownOpen && (
                <div
                  id="demo-role-menu"
                  role="listbox"
                  aria-label={t('Try a demo account')}
                  className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-slate-900/95 backdrop-blur-md border border-white/15 rounded-xl shadow-2xl overflow-hidden"
                >
                  <div
                    ref={listRef}
                    className="max-h-[300px] overflow-y-auto divide-y divide-white/5"
                  >
                    {groupedAccounts.map((group) => (
                      <div key={group.id} role="group" aria-label={t(group.label)}>
                        {/* Logical Group Header */}
                        <div className="px-3 py-1.5 bg-slate-950/80 border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400 sticky top-0 z-10 backdrop-blur-sm flex items-center justify-between">
                          <span>{t(group.label)}</span>
                          <span className="text-[9px] text-slate-500 font-normal">({group.items.length})</span>
                        </div>

                        {/* Options in Group */}
                        <div className="py-0.5">
                          {group.items.map((item) => {
                            const isSelected = selectedDemoKey === item.key;
                            const isFocused = flatItems[highlightedIdx]?.key === item.key;
                            const badgeStyle = ROLE_BADGE[item.record.user.role] || {
                              bg: 'bg-white/10',
                              text: 'text-white',
                              border: 'border-white/20',
                            };

                            return (
                              <div
                                key={item.key}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  handleDemoSelect(item.key);
                                  setDropdownOpen(false);
                                }}
                                onMouseEnter={() => {
                                  const idx = flatItems.findIndex((fi) => fi.key === item.key);
                                  if (idx !== -1) setHighlightedIdx(idx);
                                }}
                                className={`min-h-[42px] px-3 py-2 flex items-center justify-between gap-2.5 cursor-pointer text-left transition-colors ${
                                  isSelected
                                    ? 'bg-amber-400/10 text-white font-medium'
                                    : isFocused
                                    ? 'bg-slate-800 text-white'
                                    : 'hover:bg-slate-800/80 text-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <span
                                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                                  >
                                    {item.record.user.avatarInitials}
                                  </span>
                                  <div className="min-w-0 flex-1 truncate">
                                    <span
                                      className={`text-xs block font-semibold leading-tight truncate ${
                                        isSelected ? 'text-amber-300' : 'text-slate-100'
                                      }`}
                                    >
                                      {t(item.badgeTitle)}
                                    </span>
                                    <span className="text-[11px] text-slate-400 block leading-tight truncate mt-0.5">
                                      {item.record.user.displayName}
                                    </span>
                                  </div>
                                </div>

                                {isSelected && (
                                  <Check className="w-4 h-4 text-amber-400 shrink-0 ml-1.5" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clear Continue Action */}
            <button
              type="button"
              disabled={!selectedDemoKey || loadingUser !== null}
              onClick={handleDemoContinue}
              className="w-full py-2 px-3 glass-control-btn text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isDemoLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{t('Signing in…')}</span>
                </>
              ) : (
                <>
                  <span>{t('Continue with demo')}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Simple Unobtrusive Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {t('Karimnagar Municipal Corporation')} · {t('Government of Telangana')}
      </footer>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="forgot-heading">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/20 text-white">
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
                  className="w-full px-3 py-2.5 text-sm border border-white/20 rounded-xl bg-slate-950/60 text-white placeholder-slate-400 outline-none"
                  required
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="px-3 py-2 text-xs text-slate-300 hover:bg-white/10 rounded-lg"
                  >
                    {t('common.cancel')}
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

      {/* Sign Up / Registration Info Modal */}
      {signUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="signup-modal-title">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/20 text-white">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </span>
                <h3 id="signup-modal-title" className="text-base font-bold font-heading text-white">
                  {t('Municipal Account Registration')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSignUpModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
                aria-label={t('Close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed mb-3">
              {t('Citizen registration is handled through the My Karimnagar citizen services portal or at your local ward municipal office. For administrative or staff access, please contact the municipal platform administrator.')}
            </p>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1 text-xs text-slate-300 mb-4">
              <p className="font-semibold text-amber-300">
                {t('Karimnagar Municipal Corporation')}
              </p>
              <p>{t('Toll-Free Helpline: 1800-425-4140')}</p>
              <p>{t('Municipal Control Room: 0878-2243444')}</p>
              <p>{t('Official Email: commissioner_kmc@telangana.gov.in')}</p>
            </div>

            <p className="text-[11px] text-slate-400 mb-4">
              {t('Or select any demo role below to explore the digital platform.')}
            </p>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSignUpModalOpen(false)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition-colors"
              >
                {t('Got it')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="help-modal-title">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/20 text-white">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-teal-400/20 border border-teal-400/40 text-teal-300 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </span>
                <h3 id="help-modal-title" className="text-base font-bold font-heading text-white">
                  {t('Platform Assistance')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
                aria-label={t('Close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed mb-3">
              {t('Need assistance logging in? Contact Karimnagar Municipal Corporation support:')}
            </p>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5 text-xs text-slate-300 mb-4">
              <p className="font-semibold text-amber-300">
                {t('Karimnagar Municipal Corporation')}
              </p>
              <p>{t('Toll-Free Helpline: 1800-425-4140')}</p>
              <p>{t('Municipal Control Room: 0878-2243444')}</p>
              <p>{t('Official Email: commissioner_kmc@telangana.gov.in')}</p>
            </div>

            <p className="text-[11px] text-slate-400 mb-4">
              {t('Or select any demo role below to explore the digital platform.')}
            </p>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition-colors"
              >
                {t('Close')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
