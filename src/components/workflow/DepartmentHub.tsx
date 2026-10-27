import React, { useState } from 'react';
import kmcLogo from '../../assets/kmc-logo.svg';
import { DEPARTMENTS, DepartmentInfo } from '../../data/departments';
import { Droplet, Hammer, Trash2, Zap, Building, Banknote, HeartPulse, Laptop } from 'lucide-react';
import { usePrefs } from '../../i18n';

const ICONS: Record<string, React.ReactNode> = {
  'water-supply': <Droplet className="w-5 h-5" />,
  'engineering': <Hammer className="w-5 h-5" />,
  'sanitation': <Trash2 className="w-5 h-5" />,
  'electrical': <Zap className="w-5 h-5" />,
  'town-planning': <Building className="w-5 h-5" />,
  'revenue': <Banknote className="w-5 h-5" />,
  'health': <HeartPulse className="w-5 h-5" />,
  'it-data': <Laptop className="w-5 h-5" />,
};

export const DepartmentHub: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<DepartmentInfo>(DEPARTMENTS[0]);
  const { t } = usePrefs();

  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
      <div className="text-center mb-6">
        <span className="text-xs uppercase tracking-wider font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          {t("Integrated Departmental Workflow")}
        </span>
        <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-800 uppercase mt-2">
          {t("8 Municipal Departments Digitally Connected")}
        </h3>
        <p className="text-xs text-slate-500 max-w-xl mx-auto mt-1">
          {t("Operating within a single digital ecosystem to eliminate silos, standardize workflows, and enforce accountability.")}
        </p>
      </div>

      {/* Hub Visualization */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {DEPARTMENTS.map((dept) => {
          const isSelected = selectedDept.id === dept.id;
          return (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-kmc-navy bg-slate-900 text-white shadow-md scale-[1.02]'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : `${dept.color}15`,
                    color: isSelected ? '#F1D26E' : dept.color,
                  }}
                >
                  {ICONS[dept.id]}
                </div>
                <span
                  className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                    color: isSelected ? '#FFFFFF' : '#334155',
                  }}
                >
                  {dept.resolutionRate}% TAT
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold font-heading uppercase leading-tight mb-1">
                  {t(dept.name)}
                </h4>
                <p className="text-[11px] opacity-75 line-clamp-1">
                  {dept.scope.map(s => t(s)).join(', ')}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Central Platform Connecting Card */}
      <div className="p-4 bg-gradient-to-r from-kmc-navy to-kmc-navy-light text-white rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 p-2 flex items-center justify-center border border-amber-400 shrink-0">
            <img src={kmcLogo} alt="KMC" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-amber-300 tracking-wider">
              {t("Selected Wing")}: {t(selectedDept.name)}
            </span>
            <h4 className="text-base font-bold font-heading uppercase">
              {t("Operational Scope & Responsibilities")}
            </h4>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {selectedDept.scope.map((item, idx) => (
                <span key={idx} className="text-[11px] bg-white/15 px-2 py-0.5 rounded text-slate-100">
                  • {t(item)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-xs text-slate-300">{t("Departmental Head")}</p>
          <p className="text-sm font-bold text-amber-300">{t(selectedDept.head)}</p>
          <p className="text-xs text-emerald-300 font-semibold mt-0.5">
            {t("Avg SLA On-Time")}: {selectedDept.resolutionRate}%
          </p>
        </div>
      </div>
    </div>
  );
};
