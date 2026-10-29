import React, { useState } from 'react';
import {
  Search, Filter, ChevronRight, MapPin, Clock, CheckCircle2,
  AlertCircle, Plus, Image as ImageIcon, Waves, Construction,
  Trash2, Lightbulb, Droplet, CircleEllipsis
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../auth/AuthContext';
import { usePrefs } from '../../../i18n';
import { GrievanceItem, getBeforePhotos } from '../../../data/grievances';
import { resolvePhoto } from '../../../photos/photoStore';
import { categoryFor } from '../../../data/categories';

interface MobileTrackFlowProps {
  onSelectGrievance: (id: string) => void;
  onReportNew: () => void;
  onBack: () => void;
}

export const MobileTrackFlow: React.FC<MobileTrackFlowProps> = ({
  onSelectGrievance,
  onReportNew,
  onBack,
}) => {
  const { grievances } = useApp();
  const { currentUser } = useAuth();
  const { t } = usePrefs();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');

  const citizenId = currentUser?.role === 'citizen' ? currentUser.id : 'USR-CITIZEN-01';

  // Filter for citizen's grievances (or Super Admin sees demo citizen tickets + ward tickets)
  const myGrievances = grievances.filter((g) => {
    if (currentUser?.role === 'super_admin') return true;
    return g.citizenId === citizenId;
  });

  const filtered = myGrievances.filter((g) => {
    // Status filter
    if (statusFilter === 'pending' && g.status !== 'Pending') return false;
    if (statusFilter === 'in_progress' && g.status !== 'In Progress') return false;
    if (statusFilter === 'resolved' && g.status !== 'Resolved' && g.status !== 'Completed') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = g.id.toLowerCase().includes(q);
      const matchCat = g.category.toLowerCase().includes(q);
      const matchLoc = g.location.toLowerCase().includes(q);
      const matchDesc = g.description.toLowerCase().includes(q);
      return matchId || matchCat || matchLoc || matchDesc;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Completed':
        return {
          label: t('Resolved'),
          className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'In Progress':
        return {
          label: t('In Progress'),
          className: 'bg-blue-100 text-blue-800 border-blue-300',
        };
      case 'Overdue':
        return {
          label: t('Overdue'),
          className: 'bg-rose-100 text-rose-800 border-rose-300',
        };
      case 'Pending':
      default:
        return {
          label: t('Pending'),
          className: 'bg-amber-100 text-amber-800 border-amber-300',
        };
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('Search by #GRV ID, category...')}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 text-slate-800 outline-none focus:ring-1 focus:ring-kmc-navy"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            ×
          </button>
        )}
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all ${
            statusFilter === 'all'
              ? 'bg-kmc-navy text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('All')} ({myGrievances.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('in_progress')}
          className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all ${
            statusFilter === 'in_progress'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('In Progress')}
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('resolved')}
          className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all ${
            statusFilter === 'resolved'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('Resolved')}
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('Pending')}
        </button>
      </div>

      {/* Grievances List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              {t('No grievances found')}
            </p>
            <p className="text-[11px] text-slate-500">
              {t('You have no registered complaints matching this filter.')}
            </p>
            <button
              type="button"
              onClick={onReportNew}
              className="px-3.5 py-1.5 bg-kmc-navy text-white text-xs font-bold rounded-xl shadow hover:bg-kmc-navy-light inline-flex items-center gap-1.5 mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('Report a Problem')}</span>
            </button>
          </div>
        ) : (
          filtered.map((g) => {
            const badge = getStatusBadge(g.status);
            const beforeList = getBeforePhotos(g);
            const photoSrc = beforeList.length > 0 ? resolvePhoto(beforeList[0].src) : null;
            const cat = categoryFor(g.category);
            const Icon = cat.icon;

            return (
              <button
                key={g.id}
                type="button"
                onClick={() => onSelectGrievance(g.id)}
                className="w-full bg-white rounded-xl p-3 border border-slate-200 shadow-xs text-left hover:border-kmc-navy transition-all group block space-y-2"
              >
                {/* Top Row: ID, Time, Badge */}
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-kmc-navy">
                    {g.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">
                      {g.reportedOn}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Middle Row: Category & Description */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-kmc-navy flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-slate-800 leading-snug truncate">
                      {g.category}
                    </h5>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {g.description}
                    </p>
                  </div>
                </div>

                {/* Location row */}
                <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-0.5 border-t border-slate-100">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{g.location}</span>
                </div>

                {/* Bottom Row: Photo indicator and action */}
                <div className="flex items-center justify-between pt-0.5 text-[10px]">
                  {photoSrc ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{t('Evidence Photo Attached')}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">{t('No photo attached')}</span>
                  )}

                  <span className="text-kmc-navy font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>{t('View Progress')}</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Quick Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onReportNew}
          className="w-full py-2.5 px-3 rounded-xl border border-dashed border-kmc-navy text-kmc-navy text-xs font-bold hover:bg-blue-50/60 flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('Report Another Problem')}</span>
        </button>
      </div>
    </div>
  );
};
