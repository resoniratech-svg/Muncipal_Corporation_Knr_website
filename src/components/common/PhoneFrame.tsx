import React, { useState } from 'react';
import kmcLogo from '../../assets/kmc-logo.svg';
import { Home, Grid, Bell, User, Wifi, Battery, Signal } from 'lucide-react';
import { usePrefs } from '../../i18n';

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
  const { t } = usePrefs();
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handleTabClick = (tab: 'home' | 'services' | 'alerts' | 'profile') => {
    setCurrentTab(tab);
    if (onTabChange) onTabChange(tab);
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
            <div className="flex items-center gap-2">
              <img src={kmcLogo} alt="KMC" className="w-6 h-6 object-contain" />
              <div>
                <h4 className="text-xs font-bold font-heading uppercase tracking-wide leading-none">{t(title)}</h4>
                <p className="text-[11px] text-amber-300">{t('Citizen Governance Portal')}</p>
              </div>
            </div>
            <div className="text-[11px] bg-kmc-green px-2 py-0.5 rounded-full text-white font-semibold">
              {t('Live')}
            </div>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3 text-slate-800">
          {children}
        </div>

        {/* Bottom Tab Bar (as per mockups: Home, Services, Alerts, Profile) */}
        <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around shrink-0 select-none shadow-lg">
          <button
            onClick={() => handleTabClick('home')}
            className={`flex flex-col items-center gap-0.5 ${currentTab === 'home' ? 'text-kmc-navy font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[11px]">{t('Home')}</span>
          </button>
          <button
            onClick={() => handleTabClick('services')}
            className={`flex flex-col items-center gap-0.5 ${currentTab === 'services' ? 'text-kmc-navy font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Grid className="w-4 h-4" />
            <span className="text-[11px]">{t('Services')}</span>
          </button>
          <button
            onClick={() => handleTabClick('alerts')}
            className={`flex flex-col items-center gap-0.5 ${currentTab === 'alerts' ? 'text-kmc-navy font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></span>
            </div>
            <span className="text-[11px]">{t('Alerts')}</span>
          </button>
          <button
            onClick={() => handleTabClick('profile')}
            className={`flex flex-col items-center gap-0.5 ${currentTab === 'profile' ? 'text-kmc-navy font-bold' : 'text-slate-400 hover:text-slate-600'}`}
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
