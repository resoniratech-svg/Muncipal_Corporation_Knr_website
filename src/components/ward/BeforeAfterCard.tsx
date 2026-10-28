import React from 'react';
import { resolveAssetSrc } from '../common/ImageWithFallback';
import { MapPin, CheckCircle, Clock } from 'lucide-react';
import { StatusChip } from '../common/StatusChip';
import { FullImagePreview } from '../common/FullImagePreview';
import { isPhotoSource } from '../../data/grievances';
import { usePrefs } from '../../i18n';

interface EvidenceProps {
  caseId?: string;
  issue?: string;
  location?: string;
  status?: 'Completed' | 'In Progress';
  lat?: number;
  lng?: number;
  beforeDesc?: string;
  afterDesc?: string;
  beforeImage?: string;
  afterImage?: string;
}

export const BeforeAfterCard: React.FC<EvidenceProps> = ({
  caseId = 'GRV-2024-27-0045',
  issue = 'Drain Overflow near main intersection',
  location = 'Ramakrishna Nagar, Ward 27',
  status = 'Completed',
  lat = 17.9860,
  lng = 79.1188,
  beforeDesc = "Identified blockage & debris overflow",
  afterDesc = "Desilted, sanitized & closed with slab",
  beforeImage = 'images/field-evidence/sanitation-work.jpg',
  afterImage = 'images/field-evidence/street-lights-fixed.jpg',
}) => {
  const { t } = usePrefs();

  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-200 p-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 mb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-kmc-navy bg-slate-100 px-2 py-0.5 rounded">
              {t('Case ID')}: {caseId}
            </span>
            <StatusChip status={status} size="sm" />
            <span className="text-[11px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded border border-slate-200">
              {t('Demonstration Evidence Photo')}
            </span>
          </div>
          <h4 className="text-sm font-bold font-heading text-slate-800 uppercase mt-1">
            {t(issue)}
          </h4>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-red-500" />
            <span>{t(location)}</span>
          </p>
        </div>

        <div className="text-[11px] font-mono bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-lg">
          {t('Geo-tag')}: {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>
      </div>

      {/* Visual Comparison Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Before */}
        <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between">
          {beforeImage && isPhotoSource(beforeImage) ? (
            <div className="h-44 sm:h-52 relative">
              <FullImagePreview
                src={beforeImage}
                alt={`${t('BEFORE')}: ${t(issue)}`}
                title={`${t('BEFORE')}: ${t(issue)}`}
                caption={t(beforeDesc)}
                location={t(location)}
                badge="BEFORE"
                badgeVariant="before"
                className="h-full rounded-none border-0"
              />
            </div>
          ) : (
            <div className="h-44 sm:h-52 bg-gradient-to-br from-amber-100 to-amber-200 flex flex-col items-center justify-center p-3 text-center border-b border-amber-300">
              <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-xs mb-1 shadow">
                !
              </div>
              <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wide">
                {t('BEFORE EVIDENCE')}
              </span>
              <span className="text-[11px] text-amber-900 line-clamp-1">{t(beforeDesc)}</span>
            </div>
          )}
          <div className="p-2 bg-white text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
            <span>{t('Reported Condition')}</span>
            <span className="text-amber-700 font-semibold">{t('Pre-Work')}</span>
          </div>
        </div>

        {/* After */}
        <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between">
          {afterImage && isPhotoSource(afterImage) ? (
            <div className="h-44 sm:h-52 relative">
              <FullImagePreview
                src={afterImage}
                alt={`${t('AFTER')}: ${t(issue)}`}
                title={`${t('AFTER')}: ${t(issue)}`}
                caption={t(afterDesc)}
                location={t(location)}
                badge="AFTER"
                badgeVariant="after"
                className="h-full rounded-none border-0"
              />
            </div>
          ) : (
            <div className={`h-44 sm:h-52 flex flex-col items-center justify-center p-3 text-center border-b ${
              status === 'Completed'
                ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 border-emerald-300'
                : 'bg-gradient-to-br from-sky-100 to-sky-200 border-sky-300'
            }`}>
              <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs mb-1 shadow ${
                status === 'Completed' ? 'bg-emerald-600' : 'bg-blue-600'
              }`}>
                {status === 'Completed' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wide ${
                status === 'Completed' ? 'text-emerald-950' : 'text-blue-950'
              }`}>
                {status === 'Completed' ? t('AFTER EVIDENCE') : t('WORK IN PROGRESS')}
              </span>
              <span className={`text-[11px] line-clamp-1 ${
                status === 'Completed' ? 'text-emerald-900' : 'text-blue-900'
              }`}>
                {status === 'Completed' ? t(afterDesc) : t('Technicians dispatched')}
              </span>
            </div>
          )}
          <div className="p-2 bg-white text-[11px] text-slate-500 flex items-center justify-between">
            <span>{t('Verified Resolution')}</span>
            <span className={`font-semibold ${status === 'Completed' ? 'text-emerald-700' : 'text-blue-700'}`}>
              {status === 'Completed' ? t('100% Quality Pass') : t('Under Review')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
