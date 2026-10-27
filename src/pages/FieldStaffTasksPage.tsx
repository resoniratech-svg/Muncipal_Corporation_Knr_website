import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { StatusChip } from '../components/common/StatusChip';
import { PhotoPicker } from '../components/photos/PhotoPicker';
import { BeforeAfterViewer } from '../components/photos/BeforeAfterViewer';
import { CitizenStatus } from '../components/photos/CitizenStatus';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../ui/Toast';
import { getAfterPhotos, getBeforePhotos, GrievanceItem, TaskAssignment } from '../data/grievances';
import { storePhotos, resolvePhoto, nowStamp } from '../photos/photoStore';
import { wardCoords } from '../photos/geo';
import { MapPin, CalendarClock, Camera, PlayCircle, Info, ImageOff, RotateCcw, ShieldAlert, CheckCircle2, Clock, AlertTriangle, ArrowLeft, Wrench } from 'lucide-react';
import { auditRepository, userRepository } from '../storage';
import { usePrefs } from '../i18n';
import { FullImagePreview } from '../components/common/FullImagePreview';

export const FieldStaffTasksPage: React.FC = () => {
  const { tasks, grievances, updateTaskStatus, completeTaskWithPhotos, wards } = useApp();
  const { currentUser } = useAuth();
  const { t } = usePrefs();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const staffName = currentUser?.role === 'field_staff' ? currentUser.displayName : 'Ramesh (Field Staff)';
  const staffWardId = currentUser?.role === 'field_staff' ? (currentUser.wardId || currentUser.assignedWardIds?.[0] || 27) : null;
  const wardName = staffWardId ? wards.find((w) => w.id === staffWardId)?.name || `Ward ${staffWardId}` : 'All Municipal Wards';

  // Check for direct-route request (e.g. ?taskId=TASK-06)
  const requestedTaskId = searchParams.get('taskId');
  const requestedTask = requestedTaskId ? tasks.find((t) => t.id.toUpperCase() === requestedTaskId.toUpperCase()) : null;

  // Security Check: Cross-Ward direct-route attack defense (Rule 8 & Test E)
  const isDirectRouteDenied = Boolean(
    requestedTask &&
    staffWardId !== null &&
    requestedTask.wardId !== staffWardId
  );

  useEffect(() => {
    if (isDirectRouteDenied && requestedTask) {
      auditRepository.log({
        actorId: currentUser?.id || 'FIELD-STAFF',
        actorName: staffName,
        role: 'field_staff',
        action: 'CROSS_WARD_ACCESS_DENIED',
        resource: 'tasks',
        resourceId: requestedTask.id,
        details: `Access Denied: ${staffName} (authorized Ward ${staffWardId}) attempted direct navigation to task ${requestedTask.id} in Ward ${requestedTask.wardId}.`,
      });
    }
  }, [isDirectRouteDenied, requestedTask, staffName, staffWardId, currentUser?.id]);

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  // Strict Field Staff Filter:
  // Must belong to staff member's assigned ward AND be assigned to them!
  const assignedTasks = tasks.filter((t) => {
    if (currentUser?.role === 'super_admin') return true;
    if (staffWardId !== null && t.wardId !== staffWardId) return false;
    const isAssigned =
      (t.assignedFieldStaffId && t.assignedFieldStaffId === currentUser?.id) ||
      t.assignedTo.toLowerCase() === staffName.toLowerCase() ||
      t.assignedTo.toLowerCase().includes(staffName.split(' ')[0].toLowerCase());
    return isAssigned;
  });

  const pending = assignedTasks.filter((t) => t.status === 'Pending');
  const inProgress = assignedTasks.filter((t) => t.status === 'In Progress');
  const done = assignedTasks.filter((t) => t.status === 'Completed');

  const displayedTasks = activeTab === 'all'
    ? assignedTasks
    : activeTab === 'pending'
    ? pending
    : activeTab === 'in_progress'
    ? inProgress
    : done;

  const findGrievance = (task: TaskAssignment) =>
    grievances.find((g) => (task.grievanceId ? g.id === task.grievanceId : task.task.includes(g.id)));

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      <BannerStrip
        title={`${t('Field Operations Portal')} • ${staffName}`}
        tagline="Receive tasks, update status, upload evidence, and close assignments"
        actionButton={
          <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{t('Assigned Operational Scope: Ward')} {staffWardId || t('Global')}</span>
          </div>
        }
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 w-full">
        {/* Direct URL Security Alert (Rule 8 & Test E) */}
        {isDirectRouteDenied && requestedTask && (
          <div role="alert" className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2 shadow-card">
            <div className="flex items-center gap-2 font-bold text-base text-rose-800">
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
              <span>{t('ACCESS DENIED — Strict Ward Isolation Enforced')}</span>
            </div>
            <p className="text-sm">
              {t('You do not have authorization to view, execute, or inspect tasks in')} <strong>{t('Ward')} {requestedTask.wardId}</strong>.
              {t('Your operational assignment is strictly restricted to')} <strong>{t('Ward')} {staffWardId} ({wardName})</strong>.
            </p>
            <p className="text-xs text-rose-700 font-mono">
              {t('Attempted Target')}: {requestedTask.id} • {t('Security incident logged to system audit registry.')}
            </p>
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="mt-2 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('Return to My Authorized Tasks')}
            </button>
          </div>
        )}

        {/* Staff Identity & Ward Scope Card */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold font-mono bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                {t('Ward')} {staffWardId} {t('Division')}
              </span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                {t('Active Ground Worker')}
              </span>
              {(() => {
                const staffObj = userRepository.getStaffByIdOrName(currentUser?.id || staffName);
                const cat = staffObj?.staffCategory || currentUser?.staffCategory;
                return cat ? (
                  <span className="text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    <span>{t(cat)}</span>
                  </span>
                ) : null;
              })()}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading uppercase text-slate-900">
              {staffName} — Operational Ground Queue
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Authorized Operational Ward: <strong>Ward {staffWardId} ({wardName})</strong>.
              You cannot be assigned or view operational work outside this ward.
            </p>
            {(() => {
              const staffObj = userRepository.getStaffByIdOrName(currentUser?.id || staffName);
              if (staffObj?.skills && staffObj.skills.length > 0) {
                return (
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Verified Skills:</span>
                    {staffObj.skills.map((skill, idx) => (
                      <span key={idx} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                );
              }
              return null;
            })()}
          </div>

          <div className="flex gap-2 text-center shrink-0">
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 min-w-[70px]">
              <p className="text-xl font-bold text-slate-900">{assignedTasks.length}</p>
              <p className="text-[11px] text-slate-500 font-semibold uppercase">{t('Total')}</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 min-w-[70px]">
              <p className="text-xl font-bold text-amber-700">{pending.length}</p>
              <p className="text-[11px] text-amber-800 font-semibold uppercase">{t('Pending')}</p>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 min-w-[70px]">
              <p className="text-xl font-bold text-blue-700">{inProgress.length}</p>
              <p className="text-[11px] text-blue-800 font-semibold uppercase">{t('Progress')}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 min-w-[70px]">
              <p className="text-xl font-bold text-emerald-700">{done.length}</p>
              <p className="text-[11px] text-emerald-800 font-semibold uppercase">{t('Done')}</p>
            </div>
          </div>
        </section>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'all' ? 'bg-kmc-navy text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            {t('All Tasks')} ({assignedTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'pending' ? 'bg-kmc-navy text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            {t('Pending Tasks')} ({pending.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('in_progress')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'in_progress' ? 'bg-kmc-navy text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            {t('In-Progress Tasks')} ({inProgress.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'completed' ? 'bg-kmc-navy text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            {t('Completed Tasks')} ({done.length})
          </button>
        </div>

        {/* Tasks List */}
        <section className="space-y-4">
          {displayedTasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-slate-300 text-sm text-slate-600">
              {t('No tasks currently in this queue for Ward')} {staffWardId}. {t('All work is up to date.')}
            </div>
          ) : (
            displayedTasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                grievance={findGrievance(task)}
                first={i === 0}
                onStart={() => updateTaskStatus(task.id, 'In Progress', 'Work started on site', undefined)}
                onComplete={completeTaskWithPhotos}
              />
            ))
          )}
        </section>
      </main>

      <FooterStrip tagline="Stronger Wards. Efficient Services. Happier Citizens." />
    </div>
  );
};

interface TaskCardProps {
  task: TaskAssignment;
  grievance?: GrievanceItem;
  first?: boolean;
  onStart: () => void;
  onComplete: ReturnType<typeof useApp>['completeTaskWithPhotos'];
}

const TaskCard: React.FC<TaskCardProps> = ({ task, grievance, first, onStart, onComplete }) => {
  const { toast } = useToast();
  const { t } = usePrefs();
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const before = grievance ? getBeforePhotos(grievance) : [];
  const after = grievance ? getAfterPhotos(grievance) : [];
  const coords = grievance?.latitude ? { lat: grievance.latitude, lng: grievance.longitude ?? 79.1188 } : wardCoords(task.wardId);
  const place = grievance?.location || `Ward ${task.wardId}`;
  const problem = (grievance?.category || task.task).toLowerCase();
  const isDone = task.status === 'Completed';

  const submit = () => {
    if (!photos.length) {
      setError(t('Please upload the photo of the completed work.'));
      return;
    }
    const stored = storePhotos(photos, place, coords.lat, coords.lng);
    if (!stored.ok) {
      setError(t('There is no space left for photos in this demo. Remove a photo or use Reset Demo in the Demo menu.'));
      return;
    }
    const res = onComplete(task.id, stored.photos, notes.trim() || undefined);
    if (!res.ok) {
      setError(res.error || t('Could not save. Please try again.'));
      return;
    }
    setUploading(false);
    setPhotos([]);
    toast(t('Work marked as done. The ward councillor will check the photos.'));
  };

  return (
    <article
      data-task-id={task.id}
      data-tour={first ? 'task' : undefined}
      className="bg-white rounded-2xl shadow-card border-2 border-slate-200 p-5 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{task.id}</span>
            <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded font-mono">{t('Ward')} {task.wardId}</span>
            {grievance ? <CitizenStatus status={grievance.status} /> : <StatusChip status={task.status} />}
          </div>
          <h4 className="text-lg font-bold text-slate-900 mt-2">{t(task.task)}</h4>
          <p className="text-base text-slate-600 flex items-center gap-1.5 mt-1">
            <MapPin className="w-4 h-4 text-red-700 shrink-0" aria-hidden="true" />
            {t(place)}
          </p>
          {grievance && <p className="text-sm font-mono text-slate-500 mt-0.5">{t('Complaint')} {grievance.id}</p>}
        </div>
        <span className="text-base font-semibold text-slate-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 self-start">{t('Due')}: {task.dueDate}</span>
      </div>

      {grievance?.sendBackReason && !isDone && (
        <p className="flex items-start gap-2 rounded-xl bg-amber-50 border-2 border-amber-300 p-3 text-base text-amber-950">
          <RotateCcw className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          {t('Sent back by the councillor')}: {grievance.sendBackReason}
        </p>
      )}
      {grievance?.status === 'Reopened' && (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 border-2 border-red-300 p-3 text-base text-red-950">
          <RotateCcw className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          {t('Citizen says not solved')}: {grievance.reopenReason}
        </p>
      )}

      {isDone ? (
        <BeforeAfterViewer before={before} after={after.length ? after : task.photo ? [{ src: task.photo, takenAt: '', lat: coords.lat, lng: coords.lng, location: place }] : []} problem={problem} compact />
      ) : uploading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BEFORE photo beside the upload box so the after shot matches the spot */}
          <div className="rounded-xl border-2 border-slate-200 overflow-hidden flex flex-col justify-between">
            <p className="px-3 py-2 bg-orange-700 text-white text-base font-bold">{t('BEFORE (citizen photo)')}</p>
            {before[0] ? (
              <div className="h-64 sm:h-72">
                <FullImagePreview
                  src={before[0].src}
                  alt={`Before photo of ${problem}`}
                  title={`${t('BEFORE')}: ${problem}`}
                  location={`${before[0].location || ''} · ${before[0].lat.toFixed(4)}, ${before[0].lng.toFixed(4)}`}
                  date={before[0].takenAt}
                  badge="BEFORE"
                  badgeVariant="before"
                  className="h-full rounded-none border-0"
                />
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-base text-slate-600 px-4 text-center bg-slate-50">
                <ImageOff className="w-8 h-8 text-slate-400" aria-hidden="true" />
                {t('The citizen did not add a photo.')}
              </div>
            )}
          </div>

          <div className="rounded-xl border-2 border-emerald-300 p-3 space-y-3">
            <p className="text-base font-bold text-emerald-900 flex items-center gap-2">
              <Camera className="w-5 h-5" aria-hidden="true" />
              {t('AFTER photo of the completed work')}
            </p>
            <PhotoPicker photos={photos} onChange={(p) => { setPhotos(p); setError(null); }} altPrefix={`After photo of ${problem}`} />
            <p className="text-sm text-slate-700 flex items-center gap-1.5">
              <CalendarClock className="w-4 h-4" aria-hidden="true" />
              Geo-tag {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} · {nowStamp()}
            </p>
            <label htmlFor={`notes-${task.id}`} className="block text-base font-semibold">{t('What did you do? (optional)')}</label>
            <textarea id={`notes-${task.id}`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-xl border-2 border-slate-300 p-3 text-base" />
          </div>

          <div className="md:col-span-2 space-y-2">
            {!photos.length && (
              <p id={`help-${task.id}`} className="flex items-center gap-2 text-base text-slate-700">
                <Info className="w-5 h-5 text-kmc-navy" aria-hidden="true" />
                {t('Please upload the photo of the completed work.')}
              </p>
            )}
            {error && <p role="alert" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 text-base text-rose-900">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => setUploading(false)} className="min-h-[52px] rounded-xl border-2 border-slate-300 text-base font-semibold">
                {t('Cancel')}
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!photos.length}
                aria-describedby={!photos.length ? `help-${task.id}` : undefined}
                data-testid="submit-done"
                className="min-h-[52px] rounded-xl bg-kmc-green text-white text-base font-bold disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed"
              >
                {t('Submit as Done (Resolved)')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {before[0] ? (
            <div className="sm:col-span-2 h-56 sm:h-64">
              <FullImagePreview
                src={before[0].src}
                alt={`Before photo of ${problem}`}
                title={`${t('BEFORE')}: ${problem}`}
                location={`${before[0].location || ''} · ${before[0].lat.toFixed(4)}, ${before[0].lng.toFixed(4)}`}
                date={before[0].takenAt}
                badge="BEFORE"
                badgeVariant="before"
                className="w-full h-full"
              />
            </div>
          ) : null}
          {task.status === 'Pending' ? (
            <button type="button" onClick={onStart} className="min-h-[52px] rounded-xl border-2 border-kmc-navy text-kmc-navy text-base font-bold flex items-center justify-center gap-2">
              <PlayCircle className="w-5 h-5" aria-hidden="true" />
              {t('Start Work')}
            </button>
          ) : (
            <span className="hidden sm:block" />
          )}
          <button
            type="button"
            data-tour={first ? 'done-btn' : undefined}
            onClick={() => setUploading(true)}
            className="min-h-[52px] rounded-xl bg-kmc-navy text-white text-base font-bold flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" aria-hidden="true" />
            {t('Mark as Done & Upload Photo')}
          </button>
        </div>
      )}
    </article>
  );
};
