import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthContext';
import { DepartmentName } from '../../data/grievances';
import { Camera, Send, CheckCircle2, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { SearchableSelect } from '../common/SearchableSelect';
import { FullImagePreview } from '../common/FullImagePreview';

interface GrievanceFormProps {
  onSuccess?: (id: string) => void;
  compact?: boolean;
}

export const GrievanceForm: React.FC<GrievanceFormProps> = ({ onSuccess, compact = false }) => {
  const { submitGrievance, activeWardId, wards } = useApp();
  const { currentUser } = useAuth();

  const [category, setCategory] = useState('Drainage Issue');
  const [selectedWard, setSelectedWard] = useState<number>(currentUser?.assignedWardIds?.[0] || activeWardId || 27);
  const [location, setLocation] = useState(
    currentUser?.assignedWardName ? `${currentUser.assignedWardName}` : 'Green Park Colony, Ward 27'
  );
  const [description, setDescription] = useState('Drain water is overflowing on the road.');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const homeWardId = currentUser?.assignedWardIds?.[0] || 27;
  const targetWard = wards.find((w) => w.id === selectedWard) || wards[0];
  const isCrossWard = homeWardId ? selectedWard !== homeWardId : false;

  // Map category to responsible Municipal Department
  const getDepartmentForCategory = (cat: string): DepartmentName => {
    switch (cat) {
      case 'Drainage Issue':
      case 'Roads & Potholes':
        return 'Engineering';
      case 'Sanitation & Garbage':
        return 'Sanitation';
      case 'Water Supply & Leakage':
        return 'Water Supply';
      case 'Street Light Problem':
        return 'Electrical';
      case 'Town Planning Violation':
        return 'Town Planning';
      default:
        return 'Engineering';
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, JPEG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Image size should be under 2MB for demo local storage.');
      return;
    }

    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      setErrorMessage('Please enter the specific location or colony.');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setErrorMessage('Please provide a descriptive explanation of the problem.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const dept = getDepartmentForCategory(category);
      const created = submitGrievance(
        {
          citizenId: currentUser?.id || 'USR-CITIZEN-01',
          category,
          department: dept,
          location: location.trim(),
          description: description.trim(),
          wardId: selectedWard,
          slaHours: dept === 'Water Supply' ? 24 : dept === 'Engineering' ? 72 : 48,
          beforePhoto: photoPreview || undefined,
          latitude: 17.986,
          longitude: 79.1188,
        },
        currentUser?.displayName || 'Resident Citizen'
      );

      setSubmittedId(created.id);
      setIsSubmitting(false);
      if (onSuccess) onSuccess(created.id);
    } catch (err) {
      console.error('Failed to submit grievance', err);
      setErrorMessage('Failed to register grievance. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 text-center animate-fade-in">
        <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto mb-2" />
        <h4 className="text-sm font-bold font-heading text-emerald-900 uppercase">
          Grievance Registered Successfully!
        </h4>
        <div className="mt-2 inline-block bg-white border border-emerald-300 px-3 py-1 rounded-lg">
          <span className="text-[11px] uppercase font-bold text-slate-500 block">Complaint Tracking ID</span>
          <span className="text-sm font-mono font-bold text-emerald-800">{submittedId}</span>
        </div>
        <p className="text-xs text-emerald-700 mt-2">
          SMS confirmation dispatched. Auto-routed to <strong>Ward {selectedWard} Corporator ({targetWard?.corporator})</strong> & <strong>{getDepartmentForCategory(category)}</strong> Department.
        </p>
        <p className="text-[11px] text-emerald-800 font-medium mt-1">
          Ground task created on Ward {selectedWard} roster • Real-time status visible on Ward Dashboard.
        </p>
        <button
          onClick={() => {
            setSubmittedId(null);
            setDescription('');
            removePhoto();
          }}
          className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold uppercase shadow transition-all"
        >
          Submit Another Grievance
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card border border-slate-200 p-4 space-y-3">
      <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold font-heading uppercase text-slate-800">
            Submit a Public Grievance
          </h4>
          <p className="text-[11px] text-slate-500">
            Filing as: <strong>{currentUser?.displayName || 'Citizen Resident'}</strong>
          </p>
        </div>
        <span className="text-[11px] bg-blue-50 text-kmc-navy font-bold px-2 py-0.5 rounded border border-blue-200">
          Ward {selectedWard} ({targetWard?.name || 'KMC'})
        </span>
      </div>

      {errorMessage && (
        <div className="p-2 bg-rose-50 border border-rose-300 text-rose-800 rounded-lg text-xs flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Category
          </label>
          <SearchableSelect
            value={category}
            onChange={(val) => setCategory(val)}
            searchPlaceholder="Search issue category..."
            options={[
              { value: 'Drainage Issue', label: 'Drainage Issue (Engineering)' },
              { value: 'Sanitation & Garbage', label: 'Sanitation & Garbage' },
              { value: 'Water Supply & Leakage', label: 'Water Supply & Leakage' },
              { value: 'Street Light Problem', label: 'Street Light Problem (Electrical)' },
              { value: 'Roads & Potholes', label: 'Roads & Potholes (Engineering)' },
              { value: 'Town Planning Violation', label: 'Town Planning Violation' },
            ]}
            fullWidth
            size="sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold text-slate-600">
              Ward Division (Any of 66 Wards)
            </label>
            {isCrossWard && (
              <span className="text-[11px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                Cross-Ward
              </span>
            )}
          </div>
          <SearchableSelect
            value={selectedWard}
            onChange={(val) => {
              const newWardId = Number(val);
              setSelectedWard(newWardId);
              const found = wards.find((w) => w.id === newWardId);
              if (found && (!location || location.includes('Ward '))) {
                setLocation(`${found.name}, Ward ${newWardId}`);
              }
            }}
            searchPlaceholder="Search 66 municipal wards..."
            options={wards.map((w) => ({
              value: w.id,
              label: `Ward ${w.id}: ${w.name}`,
              sublabel: w.corporator ? `Corp. ${w.corporator}` : undefined,
            }))}
            fullWidth
            size="sm"
          />
        </div>
      </div>

      {/* Auto-Routing Intelligence Preview */}
      <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-bold text-kmc-navy tracking-wide">
            Automated Governance Routing
          </span>
          <span className="text-[11px] font-mono bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-semibold">
            Ward {selectedWard}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-700">
          <div>
            <span className="text-slate-500">Elected Corporator:</span>{' '}
            <strong className="text-slate-900">{targetWard?.corporator || 'Ward Representative'}</strong>
            {targetWard?.party && (
              <span className="text-[11px] text-slate-500 ml-1">({targetWard.party})</span>
            )}
          </div>
          <div>
            <span className="text-slate-500">Executive Wing:</span>{' '}
            <strong className="text-slate-900">{getDepartmentForCategory(category)} Department</strong>
          </div>
        </div>
        {isCrossWard && (
          <p className="text-[11px] text-purple-700 font-medium pt-1 border-t border-blue-100 flex items-center gap-1">
            <span>ℹ️</span>
            <span>
              Reporting an issue outside your home ward (Ward {homeWardId}). This will route directly to <strong>Ward {selectedWard} Corporator ({targetWard?.corporator})</strong> and trigger ground tasks in {targetWard?.name}.
            </span>
          </p>
        )}
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          Exact Location / Landmark
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Near Community Hall, Booth Colony, Ward 12"
          className="form-field"
          required
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          Problem Description
        </label>
        <textarea
          rows={compact ? 2 : 3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue, urgency, or nearby landmarks..."
          className="form-field"
          required
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          Photographic Evidence (Optional)
        </label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoSelect}
          accept="image/*"
          className="hidden"
        />

        {photoPreview ? (
          <div className="relative border border-emerald-300 bg-emerald-50/60 rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FullImagePreview 
                src={photoPreview} 
                alt="Preview" 
                title={photoName || 'Site Photo Preview'}
                variant="thumbnail"
                className="w-12 h-12 rounded border border-emerald-200 shrink-0" 
              />
              <div className="text-left">
                <span className="text-xs font-semibold text-emerald-900 block truncate max-w-[200px]">
                  {photoName || 'Site Photo Attached'}
                </span>
                <span className="text-[11px] text-emerald-700">GPS: 17.9860° N, 79.1188° E</span>
              </div>
            </div>
            <button
              type="button"
              onClick={removePhoto}
              className="p-1 hover:bg-emerald-200 text-emerald-800 rounded"
              title="Remove Photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-kmc-navy bg-slate-50 hover:bg-slate-100 rounded-lg p-3 text-center cursor-pointer transition-all"
          >
            <Camera className="w-5 h-5 mx-auto mb-1 text-slate-500" />
            <span className="text-[11px] font-semibold text-slate-700 block">
              Click to attach camera photo evidence
            </span>
            <span className="text-[11px] text-slate-500">JPG, PNG up to 2MB (Geo-tagged automatically)</span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 min-h-[36px] bg-kmc-navy hover:bg-kmc-navy-light disabled:bg-slate-400 text-white text-xs font-bold rounded-lg shadow uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
      >
        <Send className="w-3.5 h-3.5" />
        <span>{isSubmitting ? 'Registering Grievance...' : 'SUBMIT GRIEVANCE'}</span>
      </button>
    </form>
  );
};
