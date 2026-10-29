import React, { useState } from 'react';
import {
  ChevronLeft, MapPin, Clock, Calendar, CheckCircle2,
  AlertCircle, Star, ShieldCheck, User, Wrench, Building2,
  ArrowRight, Sparkles, MessageSquare
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../auth/AuthContext';
import { usePrefs } from '../../../i18n';
import { GrievanceItem, getBeforePhotos, getAfterPhotos } from '../../../data/grievances';
import { resolvePhoto } from '../../../photos/photoStore';
import { categoryFor } from '../../../data/categories';

interface MobileDetailFlowProps {
  grievanceId: string;
  onBack: () => void;
  onHome: () => void;
}

export const MobileDetailFlow: React.FC<MobileDetailFlowProps> = ({
  grievanceId,
  onBack,
  onHome,
}) => {
  const { grievances, rateGrievance } = useApp();
  const { currentUser } = useAuth();
  const { t } = usePrefs();

  // Normalize ID (handle with or without #)
  const normalizedId = grievanceId.startsWith('#') ? grievanceId : `#${grievanceId}`;
  const grievance = grievances.find(
    (g) => g.id.toLowerCase() === grievanceId.toLowerCase() || g.id.toLowerCase() === normalizedId.toLowerCase()
  );

  // Photo viewer tab: 'before' | 'after'
  const [activePhotoTab, setActivePhotoTab] = useState<'before' | 'after'>('before');

  // Star Rating state
  const [stars, setStars] = useState<number>(grievance?.citizenRating || 0);
  const [hoverStars, setHoverStars] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>(grievance?.feedbackComment || grievance?.citizenFeedback || '');
  const [ratedSuccess, setRatedSuccess] = useState<boolean>(Boolean(grievance?.citizenRating));
  const [ratingError, setRatingError] = useState<string | null>(null);

  if (!grievance) {
    return (
      <div className="p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">
          {t('Grievance Not Found')}
        </h4>
        <p className="text-xs text-slate-500">
          {t('The requested grievance ID')} {grievanceId} {t('could not be located.')}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-kmc-navy text-white text-xs font-bold rounded-xl shadow"
        >
          {t('Back to Complaints List')}
        </button>
      </div>
    );
  }

  const beforePhotos = getBeforePhotos(grievance);
  const afterPhotos = getAfterPhotos(grievance);
  const hasAfterPhoto = afterPhotos.length > 0;
  const isResolved = grievance.status === 'Resolved' || grievance.status === 'Completed';

  const cat = categoryFor(grievance.category);
  const Icon = cat.icon;

  const handleRateSubmit = () => {
    if (stars === 0) {
      setRatingError(t('Please select a rating from 1 to 5 stars.'));
      return;
    }
    setRatingError(null);
    const citizenId = currentUser?.role === 'citizen' ? currentUser.id : 'USR-CITIZEN-01';
    rateGrievance(
      grievance.id,
      stars,
      feedbackText.trim() || 'Work completed satisfactorily by KMC municipal team.',
      citizenId,
      currentUser?.displayName || 'Resident Citizen'
    );
    setRatedSuccess(true);
  };

  const getStatusBadge = () => {
    switch (grievance.status) {
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

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-3.5 pb-2">
      {/* Top Navigation Back */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-kmc-navy hover:underline flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>{t('Back to List')}</span>
        </button>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusBadge.className}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Main Ticket Summary Card */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <span className="font-mono text-xs font-extrabold text-slate-900 block">
              {grievance.id}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {t('Reported on')} {grievance.reportedOn}
            </span>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {grievance.department}
          </span>
        </div>

        {/* Issue & Description */}
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-kmc-navy flex items-center justify-center shrink-0 mt-0.5">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h5 className="text-xs font-bold text-slate-900">
              {grievance.category}
            </h5>
            <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
              {grievance.description}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-150">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>{grievance.location}</span>
        </div>
      </div>

      {/* Photographic Evidence Section */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
            {t('Photographic Evidence')}
          </span>

          {hasAfterPhoto && (
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setActivePhotoTab('before')}
                className={`px-2 py-0.5 rounded ${
                  activePhotoTab === 'before'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t('Before')}
              </button>
              <button
                type="button"
                onClick={() => setActivePhotoTab('after')}
                className={`px-2 py-0.5 rounded ${
                  activePhotoTab === 'after'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t('After (Fixed)')}
              </button>
            </div>
          )}
        </div>

        {/* Photo Display */}
        {activePhotoTab === 'before' && beforePhotos.length > 0 && (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-950 flex items-center justify-center">
            <img
              src={resolvePhoto(beforePhotos[0].src)}
              alt="Before issue"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-semibold">
              {t('Citizen Before-Photo Evidence')}
            </div>
          </div>
        )}

        {activePhotoTab === 'after' && hasAfterPhoto && (
          <div className="relative rounded-xl overflow-hidden border border-emerald-400 aspect-video bg-slate-950 flex items-center justify-center shadow-xs">
            <img
              src={resolvePhoto(afterPhotos[0].src)}
              alt="After resolution"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1 border border-emerald-700">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{t('Verified Resolution Proof')}</span>
            </div>
          </div>
        )}

        {beforePhotos.length === 0 && !hasAfterPhoto && (
          <div className="py-4 text-center text-slate-400 text-xs">
            {t('No photographic evidence uploaded for this issue.')}
          </div>
        )}
      </div>

      {/* Progress Timeline Tracker */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
          {t('Resolution Timeline')}
        </span>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
          {/* Step 1: Issue Registered */}
          <div className="flex items-start gap-3 relative">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 ring-2 ring-white">
              ✓
            </div>
            <div className="min-w-0 flex-1">
              <h6 className="text-xs font-bold text-slate-900">{t('Issue Registered')}</h6>
              <p className="text-[10px] text-slate-500">{t('Logged with GPS coordinates and auto-routed.')}</p>
            </div>
          </div>

          {/* Step 2: Corporator & Officer Assigned */}
          <div className="flex items-start gap-3 relative">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ring-2 ring-white ${
              grievance.status !== 'Pending' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
            }`}>
              {grievance.status !== 'Pending' ? '✓' : '2'}
            </div>
            <div className="min-w-0 flex-1">
              <h6 className="text-xs font-bold text-slate-900">
                {t('Assigned to Ward 27 Team')}
              </h6>
              <p className="text-[10px] text-slate-500">
                {grievance.assignedTo || 'Sri. K. Ramesh Rao'} & {t('Department Officer')}
              </p>
            </div>
          </div>

          {/* Step 3: Work in Progress */}
          <div className="flex items-start gap-3 relative">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ring-2 ring-white ${
              isResolved ? 'bg-emerald-500 text-white' : grievance.status === 'In Progress' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {isResolved ? '✓' : '3'}
            </div>
            <div className="min-w-0 flex-1">
              <h6 className="text-xs font-bold text-slate-900">{t('Field Work Dispatched')}</h6>
              <p className="text-[10px] text-slate-500">
                {isResolved ? t('Ground work executed by municipal team.') : grievance.status === 'In Progress' ? t('Staff actively working on-site.') : t('Awaiting field staff dispatch.')}
              </p>
            </div>
          </div>

          {/* Step 4: Resolved & Verified */}
          <div className="flex items-start gap-3 relative">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ring-2 ring-white ${
              isResolved ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {isResolved ? '✓' : '4'}
            </div>
            <div className="min-w-0 flex-1">
              <h6 className="text-xs font-bold text-slate-900">{t('Resolved with Proof')}</h6>
              <p className="text-[10px] text-slate-500">
                {isResolved ? t('Verified with after-photo and closed.') : t('Pending completion & inspection.')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Citizen Rating & Feedback Box */}
      {isResolved && (
        <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h6 className="text-xs font-bold text-slate-900">
                {t('Rate Service Quality')}
              </h6>
            </div>
            {ratedSuccess && (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                {t('✓ Verified Feedback')}
              </span>
            )}
          </div>

          {ratedSuccess ? (
            <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-amber-100">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= (grievance.citizenRating || stars)
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-slate-800 ml-1.5">
                  {grievance.citizenRating || stars} / 5 {t('Stars')}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 italic">
                "{grievance.feedbackComment || grievance.citizenFeedback || feedbackText || t('Work completed satisfactorily.')}"
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-600">
                {t('How satisfied are you with the resolution of this issue?')}
              </p>

              {/* Interactive Stars */}
              <div className="flex items-center gap-2 py-1 justify-center bg-white rounded-xl border border-amber-150 p-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHoverStars(s)}
                    onMouseLeave={() => setHoverStars(0)}
                    onClick={() => {
                      setStars(s);
                      setRatingError(null);
                    }}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        s <= (hoverStars || stars)
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {ratingError && (
                <p className="text-[10px] text-rose-600 font-semibold">{ratingError}</p>
              )}

              {/* Feedback text */}
              <input
                type="text"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={t('Optional comments on service quality...')}
                className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 text-slate-800 outline-none focus:ring-1 focus:ring-kmc-navy"
              />

              <button
                type="button"
                onClick={handleRateSubmit}
                className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                {t('Submit Citizen Rating')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 min-h-[40px] rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>{t('All Complaints')}</span>
        </button>

        <button
          type="button"
          onClick={onHome}
          className="flex-1 min-h-[40px] rounded-xl bg-kmc-navy text-white text-xs font-bold hover:bg-kmc-navy-light flex items-center justify-center gap-1 shadow"
        >
          <span>{t('Mobile Home')}</span>
        </button>
      </div>
    </div>
  );
};
