import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusChip } from '../common/StatusChip';
import { PhotoThumbnail } from '../common/EvidencePhotoModal';
import { Link } from 'react-router-dom';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { usePrefs } from '../../i18n';

export const TaskTable: React.FC = () => {
  const { tasks, updateTaskStatus, activeWardId, grievances } = useApp();
  const { t } = usePrefs();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter tasks strictly for active ward - never fallback to other wards
  const displayTasks = tasks.filter((t) => t.wardId === activeWardId);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStart = (taskId: string) => {
    const res = updateTaskStatus(taskId, 'In Progress');
    showToast(res.ok ? `Task ${taskId} started.` : res.error || 'Could not update the task.');
  };

  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-200 overflow-hidden">
      {toastMessage && (
        <div className="p-2.5 bg-emerald-600 text-white text-xs font-semibold flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white">✕</button>
        </div>
      )}

      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold font-heading uppercase text-slate-800">
            {t('Task Assignments')} ({t('Ground Staff Operations')} – {t('Ward')} {activeWardId})
          </h4>
          <p className="text-[11px] text-slate-500">
            {t('Field workers receive tasks, update status, upload evidence, and submit assignments')}
          </p>
        </div>
        <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-semibold">
          {displayTasks.length} {t('Active Tasks')}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">{t('Task ID & Description')}</th>
              <th className="py-2.5 px-3">{t('Assigned To')}</th>
              <th className="py-2.5 px-3">{t('Due Date')}</th>
              <th className="py-2.5 px-3">{t('Status')}</th>
              <th className="py-2.5 px-3 text-right">{t('Action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayTasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <AlertCircle className="w-6 h-6 text-slate-400" />
                    <p className="font-semibold text-slate-700">No ground operational tasks currently assigned in Ward {activeWardId}.</p>
                    <p className="text-[11px] text-slate-400">Tasks assigned to field staff in this ward will appear here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              displayTasks.map((task) => {
              const linkedGrievance = grievances.find(
                (g) =>
                  g.id === task.grievanceId ||
                  task.task.includes(g.id) ||
                  g.id === task.id ||
                  (g.description && task.task.toLowerCase().includes(g.description.toLowerCase().slice(0, 15)))
              );

              return (
                <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      {linkedGrievance?.beforePhoto && (
                        <PhotoThumbnail
                          src={linkedGrievance.beforePhoto}
                          alt={`Evidence for ${task.id}`}
                          size="sm"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-slate-900">{task.task}</div>
                        <div className="text-[11px] font-mono text-slate-500">{task.id} • Ward {task.wardId}</div>
                      </div>
                    </div>
                  </td>
                <td className="py-3 px-3 text-slate-700">
                  <span className="font-semibold">{task.assignedTo}</span>
                </td>
                <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                  {task.dueDate}
                </td>
                <td className="py-3 px-3">
                  <StatusChip status={task.status} size="sm" />
                </td>
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    {task.status === 'Pending' ? (
                      <button
                        onClick={() => handleStart(task.id)}
                        className="min-h-[44px] px-3 bg-kmc-navy hover:bg-kmc-navy-light text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{t('Start Work')}</span>
                      </button>
                    ) : task.status === 'In Progress' ? (
                      // Completion needs an after photo, which field staff upload on their task screen
                      <Link
                        to="/field-tasks"
                        className="min-h-[44px] px-3 border-2 border-kmc-navy text-kmc-navy rounded-lg text-xs font-bold flex items-center gap-1"
                        title="Field staff mark this done with an after photo"
                      >
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{t('Done needs after photo →')}</span>
                      </Link>
                    ) : (
                      <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                        {t('✓ After photo uploaded')}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
