import React, { useState } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthContext';
import { SearchableSelect } from '../common/SearchableSelect';
import { usePrefs } from '../../i18n';

interface StarRatingProps {
  selectedGrievanceId?: string;
  onRatingSubmitted?: () => void;
}

export const StarRating: React.FC<StarRatingProps> = ({ selectedGrievanceId, onRatingSubmitted }) => {
  const { grievances, rateGrievance } = useApp();
  const { currentUser } = useAuth();
  const { t } = usePrefs();

  // Find candidate grievances for this user that are completed or resolved
  const myGrievances = grievances.filter(
    (g) => !currentUser || currentUser.role !== 'citizen' || g.citizenId === currentUser.id
  );

  const defaultId =
    selectedGrievanceId ||
    myGrievances.find((g) => g.status === 'Resolved' || g.status === 'Completed')?.id ||
    myGrievances[0]?.id ||
    '#GRV2024-00234';

  const [activeId, setActiveId] = useState(defaultId);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('Work completed efficiently with quality proof. Very satisfied!');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    rateGrievance(
      activeId,
      rating,
      comment,
      currentUser?.id || 'USR-CITIZEN-01',
      currentUser?.displayName || 'Resident Citizen'
    );
    setSubmitted(true);
    if (onRatingSubmitted) onRatingSubmitted();
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center animate-fade-in">
        <CheckCircle className="w-8 h-8 text-emerald-700 mx-auto mb-1.5" />
        <h5 className="text-xs font-bold text-emerald-900 uppercase">{t('Thank You for Your Feedback!')}</h5>
        <p className="text-[11px] text-emerald-700 mt-1">
          {t('Your rating of {{rating}}/5 stars for {{id}} has been logged to the KMC Citizen Satisfaction Index.', { rating, id: activeId })}
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-3 text-[11px] text-emerald-800 underline font-semibold hover:text-emerald-950"
        >
          {t('Rate another service')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card border border-slate-200 p-4">
      <div className="border-b border-slate-100 pb-2 mb-3">
        <h4 className="text-xs font-bold font-heading uppercase text-slate-800">
          {t('Rate Completed Municipal Services')}
        </h4>
        <p className="text-[11px] text-slate-500">
          {t('Direct citizen feedback directly influences ward rankings and officer scorecards.')}
        </p>
      </div>

      <div className="mb-3">
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          {t('Select Grievance to Rate')}
        </label>
        <SearchableSelect
          value={activeId}
          onChange={(val) => setActiveId(val)}
          searchPlaceholder={t('Search complaint ID or issue...')}
          options={
            myGrievances.length > 0
              ? myGrievances.map((g) => ({
                  value: g.id,
                  label: `${g.id} – ${t(g.category)}`,
                  sublabel: `${t('Status')}: ${t(g.status)} · ${t('Ward')} ${g.wardId}`,
                  badge: t(g.status),
                }))
              : [{ value: '#GRV2024-00234', label: `#GRV2024-00234 – ${t('Drainage Issue')}`, badge: t('Resolved') }]
          }
          fullWidth
          size="sm"
        />
      </div>

      <div className="flex items-center justify-center gap-1.5 my-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                (hoverRating || rating) >= star
                  ? 'fill-amber-400 text-amber-500'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-center text-xs font-bold text-amber-700 mb-2">
        {rating === 5
          ? `★★★★★ ${t('Excellent Service')}`
          : rating === 4
          ? `★★★★☆ ${t('Very Good')}`
          : rating === 3
          ? `★★★☆☆ ${t('Good')}`
          : rating === 2
          ? `★★☆☆☆ ${t('Average')}`
          : `★☆☆☆☆ ${t('Needs Immediate Improvement')}`}
      </p>

      <textarea
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('Share your experience with ground execution...')}
        className="form-field mb-3"
        required
      />

      <button
        type="submit"
        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow uppercase tracking-wider"
      >
        {t('SUBMIT OFFICIAL RATING')}
      </button>
    </form>
  );
};
