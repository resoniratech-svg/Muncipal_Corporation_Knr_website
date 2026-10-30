import React, { useEffect, useRef, useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthContext';
import { ROLE_DISPLAY_NAMES } from '../../auth/permissions';
import { Presentation, LogOut, Menu, X, ChevronDown, EyeOff, AlertTriangle, UserRoundCog } from 'lucide-react';
import kmcLogo from '../../assets/kmc-logo.svg';
import { LanguageToggle, FontSizeToggle, DemoMenu } from './DemoControls';
import { SearchableSelect } from './SearchableSelect';
import { usePrefs } from '../../i18n';

interface NavItem {
  to: string;
  label: string;
}

/** Closes a popover on outside click or Escape */
const useDismiss = (open: boolean, close: () => void) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return ref;
};

// Role-based navigation items matching Prompt Section 10
const navLinksFor = (role: string | null, signedIn: boolean): NavItem[] => {
  if (!signedIn) return [{ to: '/login', label: 'Sign In' }];
  switch (role) {
    case 'super_admin':
      return [
        { to: '/', label: 'Overview' },
        { to: '/leadership', label: 'Leadership' },
        { to: '/ward', label: 'Wards' },
        { to: '/department', label: 'Departments' },
        { to: '/field-tasks', label: 'Field Tasks' },
        { to: '/citizen', label: 'Citizen App' },
        { to: '/performance', label: 'Performance' },
        { to: '/workflow', label: 'Workflow' },
        { to: '/notifications', label: 'Notifications' },
        { to: '/monitoring', label: 'Monitoring' },
        { to: '/implementation', label: 'Roadmap' },
        { to: '/admin/users', label: 'User Management' },
        { to: '/qa', label: 'QA Checklist' },
      ];
    case 'mayor_commissioner':
      return [
        { to: '/leadership', label: 'Leadership Dashboard' },
        { to: '/performance', label: 'Ward Performance' },
        { to: '/workflow', label: 'Department Overview' },
        { to: '/monitoring', label: 'Monitoring Reports' },
        { to: '/implementation', label: 'Roadmap' },
      ];
    case 'corporator':
      return [
        { to: '/ward', label: 'My Ward (Ward 27)' },
        { to: '/notifications', label: 'Ward Notifications' },
      ];
    case 'department_officer':
      return [
        { to: '/department', label: 'Department Overview' },
        { to: '/workflow', label: 'Assigned Workflows & SLAs' },
      ];
    case 'field_staff':
      return [{ to: '/field-tasks', label: 'My Assigned Tasks' }];
    case 'citizen':
      return [{ to: '/citizen', label: 'Citizen Portal' }];
    case 'governance_auditor':
      return [
        { to: '/monitoring', label: 'Monitoring Dashboard' },
        { to: '/performance', label: 'Ward Rankings' },
        { to: '/qa', label: 'Compliance QA' },
      ];
    default:
      return [{ to: '/', label: 'Home' }];
  }
};

// Super Admin has more pages than fit in one row; the rest go under "More"
const PRIMARY_COUNT = 7;

const linkClass = (isActive: boolean) =>
  `h-9 px-3 rounded-lg whitespace-nowrap flex items-center transition-colors ${
    isActive ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-200 hover:text-white hover:bg-slate-800'
  }`;

export const TopNav: React.FC = () => {
  const { activeWardId, setActiveWardId, wards } = useApp();
  const { currentUser, activeRole, logout, previewRole, setPreviewRole } = useAuth();
  const { t } = usePrefs();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useDismiss(profileOpen, () => setProfileOpen(false));
  const moreRef = useDismiss(moreOpen, () => setMoreOpen(false));

  // Menus close when the page changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const navLinks = navLinksFor(activeRole, !!currentUser);
  const primary = navLinks.length > PRIMARY_COUNT + 1 ? navLinks.slice(0, PRIMARY_COUNT) : navLinks;
  const more = navLinks.length > PRIMARY_COUNT + 1 ? navLinks.slice(PRIMARY_COUNT) : [];
  const moreActive = more.some((l) => l.to === location.pathname);

  const isCitizen = activeRole === 'citizen';
  const isStaff = !!currentUser && !isCitizen;
  const canPickWard = currentUser?.role === 'super_admin' || currentUser?.role === 'mayor_commissioner';
  const roleBadge = useMemo(() => {
    if (!activeRole) return null;
    const base = ROLE_DISPLAY_NAMES[activeRole] || { title: activeRole, color: 'text-slate-800', bg: 'bg-slate-100 border-slate-300' };
    if (currentUser?.role === 'department_officer') {
      const specificTitle = currentUser.roleTitle || (currentUser.departmentName ? `Department Officer (${currentUser.departmentName.split('/')[0].trim()})` : base.title);
      return {
        ...base,
        title: t(specificTitle),
      };
    }
    return {
      ...base,
      title: t(base.title),
    };
  }, [activeRole, currentUser, t]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const wardPicker = (id: string, full = false) => (
    <div className={`flex items-center gap-1.5 ${full ? 'w-full' : 'shrink-0'}`}>
      <label htmlFor={id} className="sr-only">Select Ward</label>
      <SearchableSelect
        id={id}
        value={activeWardId}
        onChange={(val) => setActiveWardId(Number(val))}
        variant="dark"
        size="sm"
        searchPlaceholder="Search 66 wards..."
        options={wards.map((w) => ({
          value: w.id,
          label: `W${w.id}: ${w.name}`,
          sublabel: w.corporator ? `Corporator: ${w.corporator}` : undefined,
        }))}
        className={full ? 'w-full' : 'w-48'}
      />
    </div>
  );

  const slidesButton = (full = false) => (
    <button
      type="button"
      onClick={() => navigate('/present')}
      className={`h-9 px-3 flex items-center justify-center gap-1.5 bg-kmc-purple hover:bg-purple-700 text-white font-bold rounded-lg text-[11px] uppercase whitespace-nowrap shadow transition-colors ${full ? 'w-full' : 'shrink-0'}`}
    >
      <Presentation className="w-4 h-4" aria-hidden="true" />
      {t('26 Slides')}
    </button>
  );

  return (
    <header className="relative lg:sticky lg:top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      {/* Administrative Preview Active Banner (Prompt Section 3 Requirement) */}
      {previewRole && currentUser?.role === 'super_admin' && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold border-b border-amber-600">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                Administrative preview: you are viewing the platform as <strong>{ROLE_DISPLAY_NAMES[previewRole].title}</strong>.
              </span>
            </span>
            <button
              type="button"
              onClick={() => setPreviewRole(null)}
              className="h-8 px-3 bg-slate-950 text-white rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5"
            >
              <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
              Exit Preview
            </button>
          </div>
        </div>
      )}

      {/* Top Utility Bar */}
      <div className="bg-kmc-navy-dark border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between gap-3">
          <p className={`hidden md:flex items-center gap-2 text-[11px] min-w-0 ${isStaff ? 'xl:hidden' : ''}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live shrink-0" aria-hidden="true" />
            <span className="text-amber-300 font-semibold uppercase tracking-wider whitespace-nowrap">{t('Official Government Platform • Telangana State')}</span>
            <span className="hidden lg:inline text-slate-500" aria-hidden="true">|</span>
            <span className="hidden lg:inline text-slate-300 whitespace-nowrap">{t('Karimnagar Municipal Corporation')}</span>
          </p>

          {/* Controls: language and text size always; staff tools from xl up (in the menu below that) */}
          <div className="flex items-center gap-2 ml-auto">
            <LanguageToggle />
            <FontSizeToggle />
            {currentUser && (
              <div className="hidden xl:flex items-center gap-2">
                <DemoMenu />
                {canPickWard && wardPicker('topnav-ward')}
                {isStaff && slidesButton()}
              </div>
            )}

            {/* User Profile Pill & Dropdown */}
            {currentUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  aria-label={`Account: ${currentUser.displayName}`}
                  className="h-9 flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 pl-1.5 pr-2 rounded-lg text-xs transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center justify-center font-heading shrink-0">
                    {currentUser.avatarInitials}
                  </span>
                  <span className="font-semibold text-slate-100 max-w-[130px] truncate hidden 2xl:inline">{currentUser.displayName}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>

                {profileOpen && (
                  <div role="menu" className="absolute right-0 mt-2 w-72 bg-white text-slate-900 border border-slate-200 rounded-xl shadow-2xl p-3 z-50">
                    <div className="pb-3 mb-2 border-b border-slate-100">
                      <p className="font-bold text-sm leading-tight">{currentUser.displayName}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5 break-all">{currentUser.username}</p>
                      {roleBadge && (
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-md text-[11px] font-bold border ${roleBadge.bg} ${roleBadge.color}`}>
                          {roleBadge.title}
                        </span>
                      )}
                      {currentUser.assignedWardName && (
                        <p className="text-xs text-slate-600 mt-2">
                          {t('Assigned ward:')} <strong className="text-slate-900">{t(currentUser.assignedWardName)}</strong>
                        </p>
                      )}
                      {currentUser.departmentName && (
                        <p className="text-xs text-slate-600 mt-1">
                          {t('Department:')} <strong className="text-slate-900">{t(currentUser.departmentName)}</strong>
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => navigate('/login')}
                      className="w-full h-10 px-2.5 rounded-lg text-left text-sm font-semibold flex items-center gap-2 hover:bg-slate-100"
                    >
                      <UserRoundCog className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      {t('Switch user')}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full h-10 px-2.5 rounded-lg text-left text-sm font-semibold flex items-center gap-2 text-rose-700 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      {t('Sign out')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => navigate('/login')} className="h-9 px-3 bg-amber-400 text-slate-950 font-bold rounded-lg text-xs uppercase">
                {t('Sign In')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 py-2">
        <NavLink to="/" className="flex items-center gap-3 group min-w-0">
          <span className="w-10 h-10 rounded-full bg-white/10 p-1 flex items-center justify-center border border-amber-400/80 group-hover:scale-105 transition-transform shrink-0">
            <img src={kmcLogo} alt="Karimnagar Emblem" className="w-full h-full object-contain" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm sm:text-base font-extrabold font-heading uppercase tracking-wide leading-tight text-white truncate">
              {t('Karimnagar Municipal Corporation')}
            </span>
            <span className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-amber-400 font-medium tracking-wider uppercase whitespace-nowrap">{t('Digital Governance Platform')}</span>
              {roleBadge && (
                <span className={`hidden sm:inline text-[11px] leading-4 font-bold px-1.5 rounded border whitespace-nowrap ${roleBadge.bg} ${roleBadge.color}`}>
                  {t(roleBadge.title)}
                </span>
              )}
            </span>
          </span>
        </NavLink>

        {/* Desktop Navigation Links (Role Filtered) */}
        <nav data-tour="nav" aria-label="Main" className="hidden xl:flex items-center gap-0.5 text-[13px] font-semibold shrink-0">
          {primary.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => linkClass(isActive)}>
              {t(link.label)}
            </NavLink>
          ))}
          {more.length > 0 && (
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                className={`${linkClass(moreActive)} gap-1`}
              >
                {t('More')}
                <ChevronDown className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {moreOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-56 bg-white text-slate-900 border border-slate-200 rounded-xl shadow-2xl p-1.5 z-50">
                  {more.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      role="menuitem"
                      className={({ isActive }) => `flex items-center h-10 px-3 rounded-lg text-sm ${isActive ? 'bg-amber-100 text-slate-950 font-bold' : 'font-semibold hover:bg-slate-100'}`}
                    >
                      {t(link.label)}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile / Tablet Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          className="xl:hidden w-11 h-11 shrink-0 rounded-lg bg-slate-800 text-slate-200 hover:text-white flex items-center justify-center"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-950 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <nav aria-label="Main" className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center min-h-[44px] px-3 rounded-lg text-sm font-semibold ${isActive ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'}`
                  }
                >
                  {t(link.label)}
                </NavLink>
              ))}
            </nav>

            {/* Staff tools that do not fit in the top bar below xl */}
            {currentUser && (
              <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
                <DemoMenu />
                {isStaff && slidesButton()}
                {canPickWard && <div className="w-full">{wardPicker('drawer-ward', true)}</div>}
              </div>
            )}

            {currentUser && (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 w-full min-h-[44px] px-3 text-left text-rose-300 font-bold text-sm flex items-center gap-2 hover:bg-slate-900 rounded-lg border-t border-slate-800"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span className="truncate">{t('Sign out')} ({currentUser.displayName})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
