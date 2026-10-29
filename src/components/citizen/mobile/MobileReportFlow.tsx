import React, { useState, useEffect, useRef } from 'react';
import {
  Waves, Construction, Trash2, Lightbulb, Droplet, CircleEllipsis,
  Camera, ImagePlus, LocateFixed, CheckCircle2, ChevronRight,
  ChevronLeft, AlertCircle, Loader2, Sparkles, X, MapPin, Clock,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../auth/AuthContext';
import { usePrefs } from '../../../i18n';
import { PROBLEM_CATEGORIES, ProblemCategory, categoryFor } from '../../../data/categories';
import { wardCoords } from '../../../photos/geo';
import { storePhotos, resolvePhoto } from '../../../photos/photoStore';

interface MobileReportFlowProps {
  initialCategory?: string | null;
  onDone: (createdId?: string) => void;
  onTrackCreated: (createdId: string) => void;
  onCancel: () => void;
}

export const MobileReportFlow: React.FC<MobileReportFlowProps> = ({
  initialCategory,
  onDone,
  onTrackCreated,
  onCancel,
}) => {
  const { submitGrievance, wards, activeWardId } = useApp();
  const { currentUser } = useAuth();
  const { t } = usePrefs();

  const homeWard = currentUser?.assignedWardIds?.[0] || activeWardId || 27;

  // Step: 0 = Category, 1 = Photo, 2 = Location & Details, 3 = Review, 4 = Success
  const [step, setStep] = useState<number>(0);
  const [category, setCategory] = useState<ProblemCategory | null>(() => {
    if (initialCategory) {
      return categoryFor(initialCategory);
    }
    return null;
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [wardId, setWardId] = useState<number>(homeWard);
  const [landmark, setLandmark] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [locating, setLocating] = useState<boolean>(false);
  const [locatedAddress, setLocatedAddress] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{ id: string; time: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialCategory) {
      const match = categoryFor(initialCategory);
      setCategory(match);
      setStep(1); // Jump to photo if category already picked from Services
    }
  }, [initialCategory]);

  const targetWard = wards.find((w) => w.id === wardId) || wards[0];

  const handleSelectCategory = (cat: ProblemCategory) => {
    setCategory(cat);
    setError(null);
    setStep(1);
  };

  const handleUseGps = () => {
    setLocating(true);
    setError(null);
    setTimeout(() => {
      setWardId(27);
      const spot = 'Green Park Colony Main Road, Beside Community Park';
      setLocatedAddress(spot);
      if (!landmark.trim()) {
        setLandmark(spot);
      }
      setLocating(false);
    }, 600);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPhotos([result]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUseSamplePhoto = (demoKey: string) => {
    setPhotos([demoKey]);
  };

  const handleSubmit = () => {
    if (!category) return;
    setSubmitting(true);
    setError(null);

    try {
      const coords = wardCoords(wardId);
      const locationText = `${landmark.trim() || locatedAddress || 'Ward ' + wardId}, Ward ${targetWard.id} – ${targetWard.name}`;
      
      const stored = storePhotos(photos, locationText, coords.lat, coords.lng);
      const photoRefs = stored.ok ? stored.photos : [];

      const created = submitGrievance(
        {
          citizenId: currentUser?.role === 'citizen' ? currentUser.id : 'USR-CITIZEN-01',
          category: category.category,
          department: category.department,
          description: description.trim() || `${category.category} issue reported via citizen app.`,
          location: locationText,
          wardId: targetWard.id,
          slaHours: category.slaHours,
          latitude: coords.lat,
          longitude: coords.lng,
          beforePhotos: photoRefs,
        },
        currentUser?.displayName || 'Resident Citizen'
      );

      setCreatedResult({
        id: created.id,
        time: created.reportedOn || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setStep(4); // Success screen
    } catch (err: any) {
      setError(err?.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // STEP 4: Success Screen
  if (step === 4 && createdResult) {
    return (
      <div className="space-y-4 py-2 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {t('Grievance Registered Successfully')}
          </span>
          <h4 className="text-base font-extrabold font-heading text-slate-900 mt-1">
            {createdResult.id}
          </h4>
          <p className="text-[11px] text-slate-500">
            {t('Official SMS notification dispatched to your registered phone.')}
          </p>
        </div>

        <div className="bg-slate-100 rounded-xl p-3 text-left space-y-2 border border-slate-200 text-xs">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500">{t('Category:')}</span>
            <span className="font-bold text-slate-900">{category?.category}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500">{t('Ward:')}</span>
            <span className="font-bold text-slate-900">Ward {targetWard.id} ({targetWard.name})</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500">{t('Assigned To:')}</span>
            <span className="font-bold text-emerald-700">{targetWard.corporator}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500">{t('Expected SLA:')}</span>
            <span className="font-bold text-slate-900">{category?.slaHours} {t('Hours')}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => onTrackCreated(createdResult.id)}
            className="w-full min-h-[46px] rounded-xl bg-kmc-navy text-white text-xs font-bold shadow-md hover:bg-kmc-navy-light flex items-center justify-center gap-1.5 transition-all"
          >
            <span>{t('Track Live Progress & Status')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDone(createdResult.id)}
            className="w-full min-h-[42px] rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all"
          >
            {t('Return to Mobile Home')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Step Tracker Indicator */}
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
        <span>
          {t('Step')} {step + 1} {t('of')} 4
        </span>
        <span className="text-kmc-navy">
          {step === 0 && t('Select Category')}
          {step === 1 && t('Add Photo Evidence')}
          {step === 2 && t('Location & Notes')}
          {step === 3 && t('Review & Submit')}
        </span>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 transition-all duration-300 rounded-full"
          style={{ width: `${((step + 1) / 4) * 100}%` }}
        />
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 0: Category Selection */}
      {step === 0 && (
        <div className="space-y-2.5">
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-900 uppercase font-heading">
              {t('What problem would you like to report?')}
            </h4>
            <p className="text-[11px] text-slate-500">
              {t('Choose the civic department responsible for your issue.')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PROBLEM_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category?.key === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between min-h-[96px] transition-all ${
                    isSelected
                      ? 'border-kmc-navy bg-blue-50/70 ring-1 ring-kmc-navy shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="w-8 h-8 rounded-lg bg-blue-100/70 text-kmc-navy flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      SLA: {cat.slaHours}h
                    </span>
                  </div>

                  <div className="mt-2">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {t(`report.cat.${cat.key}`) || cat.category}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {cat.department}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 1: Photo Evidence */}
      {step === 1 && (
        <div className="space-y-3">
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-900 uppercase font-heading">
              {t('Add Photo Evidence')}
            </h4>
            <p className="text-[11px] text-slate-500">
              {t('A photo helps municipal workers identify and resolve the issue quickly.')}
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Photo Preview or Upload Zone */}
          {photos.length > 0 ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 bg-slate-900 aspect-video flex items-center justify-center shadow-md">
              <img
                src={resolvePhoto(photos[0])}
                alt="Evidence"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPhotos([])}
                className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow"
                title={t('Remove photo')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{t('Photo Attached')}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-white text-center space-y-2.5">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-kmc-navy flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">
                  {t('Take or Upload Evidence Photo')}
                </p>
                <p className="text-[10px] text-slate-400">
                  {t('Supports camera capture or gallery selection')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-kmc-navy text-white text-xs font-bold rounded-xl shadow hover:bg-kmc-navy-light flex items-center justify-center gap-1.5 mx-auto"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                <span>{t('Choose Image / Camera')}</span>
              </button>
            </div>
          )}

          {/* Quick Demo Photo Presets for Testing */}
          <div className="bg-slate-100 rounded-xl p-2.5 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
              {t('Quick Sample Photos for Testing:')}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleUseSamplePhoto('images/field-evidence/drain-before.jpg')}
                className="px-2 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold hover:border-kmc-navy truncate text-left"
              >
                💧 {t('Drain Overflow')}
              </button>
              <button
                type="button"
                onClick={() => handleUseSamplePhoto('images/civic-works/street-lighting.jpg')}
                className="px-2 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold hover:border-kmc-navy truncate text-left"
              >
                💡 {t('Streetlight Out')}
              </button>
              <button
                type="button"
                onClick={() => handleUseSamplePhoto('images/sanitation/sanitation-collection.jpg')}
                className="px-2 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold hover:border-kmc-navy truncate text-left"
              >
                🗑️ {t('Garbage Dump')}
              </button>
              <button
                type="button"
                onClick={() => handleUseSamplePhoto('images/field-evidence/road-before.jpg')}
                className="px-2 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold hover:border-kmc-navy truncate text-left"
              >
                🚧 {t('Road Pothole')}
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="flex-1 min-h-[42px] rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{t('Back')}</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 min-h-[42px] rounded-xl bg-kmc-navy text-white text-xs font-bold hover:bg-kmc-navy-light flex items-center justify-center gap-1 shadow"
            >
              <span>{t('Next: Location')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Location & Details */}
      {step === 2 && (
        <div className="space-y-3">
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-900 uppercase font-heading">
              {t('Where is the problem located?')}
            </h4>
            <p className="text-[11px] text-slate-500">
              {t('Specify the ward and a nearby landmark.')}
            </p>
          </div>

          {/* Auto GPS Button */}
          <button
            type="button"
            onClick={handleUseGps}
            disabled={locating}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all shadow-xs"
          >
            {locating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                <span>{t('Detecting GPS location...')}</span>
              </>
            ) : (
              <>
                <LocateFixed className="w-4 h-4 text-emerald-700" />
                <span>{t('Use My GPS Location (Ward 27)')}</span>
              </>
            )}
          </button>

          {/* Ward Select */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold text-slate-700 block">
              {t('Select Ward')}
            </label>
            <select
              value={wardId}
              onChange={(e) => setWardId(Number(e.target.value))}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:ring-1 focus:ring-kmc-navy"
            >
              {wards.slice(0, 15).map((w) => (
                <option key={w.id} value={w.id}>
                  Ward {w.id} – {w.name} ({w.corporator})
                </option>
              ))}
            </select>
          </div>

          {/* Landmark Input */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold text-slate-700 block">
              {t('Landmark / Street Name')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder={t('e.g., Near Deepthi Hospital, Main Road')}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:ring-1 focus:ring-kmc-navy"
            />
          </div>

          {/* Description Textarea */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold text-slate-700 block">
              {t('Problem Description (Optional)')}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('Provide any additional details for field staff...')}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:ring-1 focus:ring-kmc-navy resize-none"
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 min-h-[42px] rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{t('Back')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!landmark.trim()) {
                  setError(t('Please enter a landmark or location.'));
                  return;
                }
                setError(null);
                setStep(3);
              }}
              className="flex-1 min-h-[42px] rounded-xl bg-kmc-navy text-white text-xs font-bold hover:bg-kmc-navy-light flex items-center justify-center gap-1 shadow"
            >
              <span>{t('Next: Review')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Submit */}
      {step === 3 && (
        <div className="space-y-3">
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-900 uppercase font-heading">
              {t('Review & Confirm Report')}
            </h4>
            <p className="text-[11px] text-slate-500">
              {t('Please confirm the details before dispatching to KMC.')}
            </p>
          </div>

          <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2 text-left text-xs shadow-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500 text-[11px]">{t('Category')}</span>
              <span className="font-bold text-kmc-navy">{category?.category}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500 text-[11px]">{t('Department')}</span>
              <span className="font-bold text-slate-800">{category?.department}</span>
            </div>

            <div className="border-b border-slate-100 pb-2">
              <span className="text-slate-500 text-[11px] block">{t('Location')}</span>
              <span className="font-semibold text-slate-800 block text-[11px] mt-0.5">
                {landmark.trim() || locatedAddress}, Ward {targetWard.id} ({targetWard.name})
              </span>
            </div>

            {photos.length > 0 && (
              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-500 text-[11px] block mb-1">{t('Attached Photo')}</span>
                <img
                  src={resolvePhoto(photos[0])}
                  alt="Review Evidence"
                  className="w-20 h-14 object-cover rounded-lg border border-slate-200"
                />
              </div>
            )}

            <div className="flex justify-between items-center pt-1 text-[11px]">
              <span className="text-slate-500">{t('Expected Resolution')}</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Within {category?.slaHours} Hours
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={submitting}
              className="flex-1 min-h-[44px] rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{t('Back')}</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-2 min-h-[44px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('Submitting...')}</span>
                </>
              ) : (
                <>
                  <span>{t('Submit Complaint')}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
