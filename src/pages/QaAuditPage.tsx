import React, { useState, useMemo } from 'react';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { 
  Check, CheckCircle2, ExternalLink, ShieldCheck, 
  MapPin, UserCheck, Calendar, Eye, CheckSquare, RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/AuthContext';
import { usePrefs } from '../i18n';
import { INITIAL_GRIEVANCES, GrievanceItem } from '../data/grievances';
import { WARDS } from '../data/wards';

export interface GrievanceReviewMeta {
  checked: boolean;
  reviewer: string;
  timestamp: string;
  status: 'VERIFIED' | 'PENDING';
}

export const QA_GRIEVANCE_REVIEWS_KEY = 'kmc:qa_reviewed_grievances';
export const LEGACY_PHOTO_CHECKS_KEY = 'kmc-ui:qa-photo-checks';

export const QaAuditPage: React.FC = () => {
  const { grievances, wards } = useApp();
  const { currentUser } = useAuth();
  const { t } = usePrefs();

  // 1. Authoritative List of Resolved Grievances
  const resolvedGrievances = useMemo<GrievanceItem[]>(() => {
    const list = (grievances || []).filter((g) => g.status === 'Resolved');
    if (list.length > 0) return list;
    return INITIAL_GRIEVANCES.filter((g) => g.status === 'Resolved');
  }, [grievances]);

  // 2. Load Review State from LocalStorage
  const [reviews, setReviews] = useState<Record<string, GrievanceReviewMeta>>(() => {
    try {
      const stored = localStorage.getItem(QA_GRIEVANCE_REVIEWS_KEY);
      if (stored) return JSON.parse(stored);

      // Check legacy photo checks key if any
      const legacyStored = localStorage.getItem(LEGACY_PHOTO_CHECKS_KEY);
      if (legacyStored) {
        const legacy = JSON.parse(legacyStored);
        const mapped: Record<string, GrievanceReviewMeta> = {};
        if (legacy[2] || legacy[4]) {
          mapped['GRV-2024-27-0045'] = {
            checked: true,
            reviewer: 'Governance Auditor',
            timestamp: new Date().toISOString(),
            status: 'VERIFIED',
          };
        }
        return mapped;
      }
      return {};
    } catch {
      return {};
    }
  });

  // Toggle review state for a grievance
  const toggleReview = (grievanceId: string) => {
    setReviews((prev) => {
      const isCurrentlyChecked = !!prev[grievanceId]?.checked;
      const updated = { ...prev };

      if (isCurrentlyChecked) {
        delete updated[grievanceId];
      } else {
        updated[grievanceId] = {
          checked: true,
          reviewer: currentUser?.displayName || 'Governance Auditor',
          timestamp: new Date().toISOString(),
          status: 'VERIFIED',
        };
      }

      // Persist to primary key
      try {
        localStorage.setItem(QA_GRIEVANCE_REVIEWS_KEY, JSON.stringify(updated));

        // Also sync legacy key for backward compatibility
        const legacy: Record<number, any> = {};
        if (updated['GRV-2024-27-0045']?.checked) {
          legacy[2] = { checked: true, reviewer: 'Governance Auditor', timestamp: updated['GRV-2024-27-0045'].timestamp, status: 'VERIFIED' };
          legacy[4] = { checked: true, reviewer: 'Governance Auditor', timestamp: updated['GRV-2024-27-0045'].timestamp, status: 'VERIFIED' };
        }
        localStorage.setItem(LEGACY_PHOTO_CHECKS_KEY, JSON.stringify(legacy));
      } catch (e) {
        console.error('Failed to persist review status:', e);
      }

      return updated;
    });
  };

  const handleMarkAll = () => {
    const all: Record<string, GrievanceReviewMeta> = {};
    const timestamp = new Date().toISOString();
    resolvedGrievances.forEach((g) => {
      all[g.id] = {
        checked: true,
        reviewer: currentUser?.displayName || 'Governance Auditor',
        timestamp,
        status: 'VERIFIED',
      };
    });
    setReviews(all);
    try {
      localStorage.setItem(QA_GRIEVANCE_REVIEWS_KEY, JSON.stringify(all));
      localStorage.setItem(LEGACY_PHOTO_CHECKS_KEY, JSON.stringify({ 2: true, 4: true, 10: true }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setReviews({});
    try {
      localStorage.removeItem(QA_GRIEVANCE_REVIEWS_KEY);
      localStorage.removeItem(LEGACY_PHOTO_CHECKS_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const completedCount = useMemo(() => {
    return resolvedGrievances.filter((g) => reviews[g.id]?.checked).length;
  }, [resolvedGrievances, reviews]);

  // Helper to resolve ward and corporator for each grievance
  const getWardInfo = (wardId: number) => {
    const found = (wards || []).find((w) => w.id === wardId) || WARDS.find((w) => w.id === wardId);
    return {
      name: found?.name || `Ward ${wardId}`,
      corporator: found?.corporator || `Ward ${wardId} Corporator`,
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      {/* Banner Strip */}
      <BannerStrip
        title={t("Compliance QA — Resolved Grievance Audit")}
        tagline={t("Governance Auditor Independent Verification of Resolved Grievances")}
        actionButton={
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-700 text-white font-bold px-3 py-1 rounded-md shadow uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{completedCount} / {resolvedGrievances.length} {t("Audited")}</span>
            </span>
          </div>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 w-full">
        
        {/* Auditor Guidance & Control Strip */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h2 className="text-base font-bold font-heading uppercase text-slate-900">
                  {t("Resolved Grievances Audit Matrix")}
                </h2>
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  {resolvedGrievances.length} {t("Resolved Issues")}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {t("Click \"Open\" on any resolved grievance to inspect authentic before-and-after photographic evidence, ground field technician work, Corporator sign-off, and SLA compliance.")}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleMarkAll}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase rounded-lg shadow transition flex items-center gap-1"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{t("Mark All Audited")}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-lg border border-slate-300 transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t("Reset")}</span>
              </button>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500 font-medium">
            {t("Displaying exclusively resolved civic complaints awaiting or completed under Governance Auditor verification.")}
          </div>
        </section>

        {/* List of Resolved Grievances */}
        <section className="space-y-4">
          {resolvedGrievances.map((grievance, index) => {
            const reviewMeta = reviews[grievance.id];
            const isChecked = !!reviewMeta?.checked;
            const wardInfo = getWardInfo(grievance.wardId);
            const detailUrl = `/qa/grievances/${encodeURIComponent(grievance.id)}?qaInspect=true`;

            return (
              <div
                key={grievance.id}
                className={`bg-white rounded-xl shadow-card border-2 p-5 transition-all ${
                  isChecked ? 'border-emerald-300 bg-emerald-50/15' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Complaint Details */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        {t("Resolved")}
                      </span>

                      <span className="text-xs font-mono font-bold text-kmc-navy bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                        {grievance.id}
                      </span>

                      <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded border border-slate-200">
                        {t(grievance.category)}
                      </span>

                      <span className="text-xs font-bold bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded border border-amber-200">
                        {t(`Ward ${grievance.wardId}`)} • {t(wardInfo.name)}
                      </span>

                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <Eye className="w-3 h-3 text-emerald-700" />
                        {t("Before & After Photos Available")}
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-heading text-slate-900">
                      {index + 1}. {t(grievance.description)}
                    </h3>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span><strong>{t("Location")}:</strong> {t(grievance.location)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span><strong>{t("Solved by")}:</strong> <span className="text-slate-900 font-semibold">{t(grievance.assignedTo || "Field Staff")}</span></span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span><strong>{t("Corporator")}:</strong> <span className="text-slate-900 font-semibold">{t(wardInfo.corporator)}</span></span>
                      </div>
                    </div>

                    {/* Reviewer Verified Tag if Checked */}
                    {isChecked && (
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-100/80 px-2.5 py-1 rounded-md border border-emerald-300">
                          <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-700" />
                          <span>
                            {t("Audited by {{reviewer}}", { reviewer: t(reviewMeta.reviewer) })}
                            {reviewMeta.timestamp && ` • ${new Date(reviewMeta.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
                    <Link
                      to={detailUrl}
                      state={{ qaInspect: true, fromQa: true, grievanceId: grievance.id }}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 font-bold text-xs uppercase rounded-lg shadow transition flex items-center gap-1.5 active:scale-95"
                    >
                      <span>{t("Open")}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                    </Link>

                    <label className="flex items-center gap-2 text-xs font-semibold min-h-[38px] cursor-pointer select-none bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleReview(grievance.id)}
                        className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-700 cursor-pointer"
                      />
                      <span className={isChecked ? 'text-emerald-900 font-bold' : 'text-slate-700'}>
                        {t("Reviewer checked")}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

      </main>

      <FooterStrip
        tagline={t("Karimnagar Municipal Corporation • Digital Governance Audit & Compliance Verification")}
      />
    </div>
  );
};
