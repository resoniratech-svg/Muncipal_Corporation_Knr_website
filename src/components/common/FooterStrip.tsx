import React from 'react';
import kmcLogo from '../../assets/kmc-logo.svg';
import { usePrefs } from '../../i18n';

interface FooterStripProps {
  tagline?: string;
  subtext?: string;
}

export const FooterStrip: React.FC<FooterStripProps> = ({ 
  tagline = "The initiative aims to position Karimnagar as a model municipal corporation for smart governance.",
  subtext = "Karimnagar Municipal Corporation | Smart Governance. Better Service. Stronger Karimnagar."
}) => {
  const { t } = usePrefs();

  return (
    <footer className="mt-12 bg-slate-900 text-slate-300 border-t border-slate-800 text-xs py-5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        <div className="flex items-center gap-2">
          <img src={kmcLogo} alt="KMC" className="w-5 h-5 opacity-80" />
          <span className="font-semibold text-white tracking-wide">{t(subtext)}</span>
        </div>
        <div className="text-slate-400 font-medium">
          {t(tagline)}
        </div>
      </div>
    </footer>
  );
};
