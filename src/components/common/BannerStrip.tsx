import React from 'react';
import kmcLogo from '../../assets/kmc-logo.svg';
import { usePrefs } from '../../i18n';

interface BannerStripProps {
  title?: string;
  tagline: string;
  actionButton?: React.ReactNode;
}

export const BannerStrip: React.FC<BannerStripProps> = ({ title, tagline, actionButton }) => {
  const { t } = usePrefs();

  return (
    <div className="bg-kmc-navy text-white px-4 sm:px-6 py-2.5 sm:py-3 shadow-md border-b-2 border-kmc-green-accent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/10 p-1 flex items-center justify-center border border-amber-400 shrink-0">
          <img src={kmcLogo} alt="KMC Emblem" className="w-full h-full object-contain" />
        </div>
        <div>
          {title && (
            <div className="text-[11px] sm:text-xs uppercase tracking-wider text-amber-300 font-semibold font-heading">
              {t(title)}
            </div>
          )}
          <div className="text-xs sm:text-sm md:text-base font-semibold tracking-wide text-slate-100 uppercase">
            {t(tagline)}
          </div>
        </div>
      </div>
      {actionButton && (
        <div className="self-stretch sm:self-auto shrink-0 flex justify-end">
          {actionButton}
        </div>
      )}
    </div>
  );
};
