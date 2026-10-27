import React, { useState } from 'react';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { KpiCard } from '../components/common/KpiCard';
import { StatusChip } from '../components/common/StatusChip';
import { DonutChart } from '../components/charts/DonutChart';
import { PhotoThumbnail } from '../components/common/EvidencePhotoModal';
import { FullImagePreview } from '../components/common/FullImagePreview';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/AuthContext';
import { 
  Building, Wrench, CheckCircle2, Clock, AlertTriangle, 
  MapPin, Check, Filter, UserCheck, ChevronRight, UserPlus, X, ShieldAlert 
} from 'lucide-react';
import { SearchableSelect } from '../components/common/SearchableSelect';
import { userRepository, staffCategoryRepository } from '../storage';
import { usePrefs } from '../i18n';

export const DepartmentDashboardPage: React.FC = () => {
  const { grievances, tasks, assignGrievanceToStaff, approveAndClose } = useApp();
  const { currentUser } = useAuth();
  const { t } = usePrefs();

  const userDept = currentUser?.departmentName || 'Engineering Department';
  const officerName = currentUser?.displayName || 'Er. P. Venkateshwarlu';

  // Filter grievances belonging strictly to this department
  const deptGrievances = grievances.filter(g => 
    g.department.toLowerCase().includes('engineering') || 
    g.category.toLowerCase().includes('drainage') || 
    g.category.toLowerCase().includes('road')
  );

  const pendingCount = deptGrievances.filter(g => g.status === 'Pending').length;
  const inProgressCount = deptGrievances.filter(g => g.status === 'In Progress').length;
  const completedCount = deptGrievances.filter(g => g.status === 'Completed' || g.status === 'Resolved').length;
  const overdueCount = deptGrievances.filter(g => g.status === 'Overdue').length;

  const donutData = [
    { name: 'Pending', value: pendingCount || 1, color: '#F57C00' },
    { name: 'In Progress', value: inProgressCount || 2, color: '#0288D1' },
    { name: 'Completed/Resolved', value: completedCount || 3, color: '#2E7D32' },
  ];

  // Assign Task Modal State
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);
  const [assigneeName, setAssigneeName] = useState('');
  const [targetDueDate, setTargetDueDate] = useState('Next 48 Hours');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAssignModal = (gid: string) => {
    setSelectedGrievanceId(gid);
    const { eligibleStaff } = staffCategoryRepository.getEligibleFieldStaff(gid, currentUser?.id);
    setAssigneeName(eligibleStaff.length > 0 ? eligibleStaff[0].displayName : '');
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrievanceId) return;

    try {
      const { eligibleStaff } = staffCategoryRepository.getEligibleFieldStaff(selectedGrievanceId, currentUser?.id);
      const targetAssignee = assigneeName || (eligibleStaff.length > 0 ? eligibleStaff[0].displayName : '');
      if (!targetAssignee) {
        throw new Error('Please select an eligible field staff member.');
      }
      assignGrievanceToStaff(selectedGrievanceId, targetAssignee, targetDueDate, officerName);
      showToast(t(`Assigned ${selectedGrievanceId} to ${targetAssignee}!`));
      setSelectedGrievanceId(null);
      setAssigneeName('');
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch task.');
    }
  };

  const handleApproveGrievance = (gid: string) => {
    approveAndClose(gid, officerName);
    showToast(`Resolution verified and approved for Grievance ${gid}!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      <BannerStrip
        title={`${t('Department Officer Portal')} • ${t(userDept)}`}
        tagline="Assigned Grievances, SLA Oversight & Ground Execution Workflow"
        actionButton={
          <span className="text-xs bg-orange-700 text-white font-bold px-3 py-1 rounded-md shadow uppercase tracking-wide">
            {t('72h SLA Active')}
          </span>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 w-full">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-white hover:text-emerald-200">✕</button>
          </div>
        )}

        {/* Officer Welcome Banner */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-orange-500">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono bg-orange-100 text-orange-900 px-2 py-0.5 rounded">
                {t('Operational Wing')}: {t('Engineering')}
              </span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                {t('SLA Compliance: 85% On-Time')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading uppercase text-slate-900 mt-1">
              {officerName} – {t('Command Console')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('Assigned Scope: Roads, Buildings, Drainage, Bridges, and Stormwater Culverts across all 66 Wards.')}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-500 uppercase font-bold">{t('Standard SLA')}</span>
            <p className="text-lg font-bold font-heading text-orange-700">{t('72 Hours Max')}</p>
          </div>
        </section>

        {/* 4 KPI Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            label="Total Dept Grievances"
            value={deptGrievances.length}
            sublabel="Assigned to Engineering"
            icon={<Building className="w-5 h-5 text-orange-700" />}
            highlightColor="border-l-orange-500"
          />
          <KpiCard
            label="Pending Action"
            value={pendingCount}
            sublabel="Awaiting Field Assignment"
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            highlightColor="border-l-amber-500"
          />
          <KpiCard
            label="Under Execution"
            value={inProgressCount}
            sublabel="Field Teams Deployed"
            icon={<Wrench className="w-5 h-5 text-blue-600" />}
            highlightColor="border-l-blue-600"
          />
          <KpiCard
            label="Resolved with Proof"
            value={completedCount}
            sublabel="Verified Before/After"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-700" />}
            highlightColor="border-l-emerald-600"
          />
        </section>

        {/* Department Infrastructure & Civic Asset Spotlight */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 flex flex-col md:flex-row items-center gap-5">
          <div className="w-full md:w-56 h-36 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-sm relative group bg-slate-950">
            <FullImagePreview
              src="images/civic-works/cable-bridge.jpg"
              alt="Engineering Civic Works - Manair River Cable Bridge"
              title="Manair River Cable-Stayed Bridge & Arterial Approaches"
              variant="preview"
              className="w-full h-full rounded-xl"
            />
            <span className="absolute top-2 left-2 bg-slate-950/80 text-white font-bold text-[11px] uppercase px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
              Engineering Asset
            </span>
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold text-kmc-navy bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Major Civic Infrastructure
              </span>
              <span className="text-xs font-bold text-slate-700">Manair River Cable-Stayed Bridge & Arterial Approaches</span>
            </div>
            <h4 className="text-sm font-bold font-heading uppercase text-slate-900">
              Corridor Maintenance & Structural Redressal Program
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Supervising ongoing road surfacing, stormwater drains, culverts, and structural maintenance connecting Karimnagar across all municipal divisions.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono">
              <span>✓ Inspection Status: Verified</span>
              <span>•</span>
              <span>Field Teams: Deployed</span>
              <span>•</span>
              <span>Executive Wing: Roads, Bridges & Culverts</span>
            </div>
          </div>
        </section>

        {/* Grievance Table Filtered to this Department */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 overflow-hidden">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold font-heading uppercase text-slate-800">
                Active Department Grievances (Engineering Wing Only)
              </h3>
              <p className="text-[11px] text-slate-500">
                Departmental records segregated from unrelated wings (Sanitation, Town Planning, etc.)
              </p>
            </div>
            <span className="text-xs font-bold font-mono text-kmc-navy bg-slate-100 px-2.5 py-1 rounded">
              {deptGrievances.length} Active Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">{t('Grievance ID')}</th>
                  <th className="py-2.5 px-3">{t('Issue Category')}</th>
                  <th className="py-2.5 px-3">{t('Site Photo')}</th>
                  <th className="py-2.5 px-3">{t('Location')}</th>
                  <th className="py-2.5 px-3">{t('SLA Target')}</th>
                  <th className="py-2.5 px-3">{t('Status')}</th>
                  <th className="py-2.5 px-3 text-right">{t('Officer Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deptGrievances.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-kmc-navy">
                      {g.id}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {t(g.description)}
                    </td>
                    <td className="py-3 px-3">
                      {g.beforePhoto ? (
                        <PhotoThumbnail
                          src={g.beforePhoto}
                          alt={`Site Photo for ${g.id}`}
                          location={t(g.location)}
                          size="sm"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">{t('No image')}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{t(g.location)}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs font-bold text-amber-800">
                      {g.slaHours} {t('Hours')}
                    </td>
                    <td className="py-3 px-3">
                      <StatusChip status={g.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      {g.status === 'Pending' ? (
                        <button
                          onClick={() => handleOpenAssignModal(g.id)}
                          className="px-2.5 py-2 min-h-[36px] bg-kmc-navy hover:bg-kmc-navy-light text-white font-bold text-[11px] rounded flex items-center gap-1 ml-auto shadow-sm"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>{t('Assign Staff')}</span>
                        </button>
                      ) : g.status === 'Completed' ? (
                        <button
                          onClick={() => handleApproveGrievance(g.id)}
                          className="px-2.5 py-2 min-h-[36px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded flex items-center gap-1 ml-auto shadow-sm"
                        >
                          <Check className="w-3 h-3" />
                          <span>{t('Approve & Close')}</span>
                        </button>
                      ) : g.status === 'Resolved' ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {t('✓ Signed Off')}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">
                          {t(g.assignedTo || 'Assigned')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Department Field Staff Tasks */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold font-heading uppercase text-slate-800">
                Field Staff Task Progress (Ground Execution)
              </h3>
              <p className="text-[11px] text-slate-500">
                Monitor work dispatched to field technicians, desilting operators, and road crews
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
              {tasks.length} Dispatched Tasks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-slate-500">{task.id}</span>
                    <StatusChip status={task.status} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 font-heading uppercase">
                    {task.task}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Assigned: <strong>{task.assignedTo}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Due Date: {task.dueDate}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Ward {task.wardId}</span>
                  {task.status !== 'Completed' ? (
                    // Field staff close tasks with an after photo; officers verify the complaint above
                    <span className="text-amber-800 font-bold">Waiting for after photo</span>
                  ) : (
                    <span className="text-emerald-700 font-bold">✓ Completed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Assignment Modal Dialog */}
      {selectedGrievanceId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold font-heading uppercase text-slate-900">
                Dispatch Task to Field Staff
              </h4>
              <button
                onClick={() => setSelectedGrievanceId(null)}
                className="text-slate-500 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const {
                eligibleStaff: eligibleWardStaff,
                grievance: targetG,
                requiredCategory,
                targetWardId,
              } = staffCategoryRepository.getEligibleFieldStaff(selectedGrievanceId || '', currentUser?.id);
              const hasStaff = eligibleWardStaff.length > 0;
              const effectiveAssignee = assigneeName || (hasStaff ? eligibleWardStaff[0].displayName : '');

              return (
                <>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600">
                      Assigning Grievance <strong className="font-mono text-kmc-navy">{selectedGrievanceId}</strong> (Ward {targetWardId} • {targetG?.category}) to authorized ground personnel.
                    </p>
                    {requiredCategory && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Required Staff Category:</span>
                        <span className="text-[11px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                          {requiredCategory.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {!hasStaff ? (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>No Active {requiredCategory?.name || 'Field Staff'} Assigned to Ward {targetWardId}</span>
                      </p>
                      <p>
                        This grievance will remain in the <strong>Awaiting Assignment</strong> queue. Contact Super Admin to deploy qualified staff to Ward {targetWardId}.
                      </p>
                    </div>
                  ) : null}

                  <form onSubmit={handleConfirmAssignment} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Select Field Worker (Ward {targetWardId} • {requiredCategory?.name || 'Qualified'} Roster)
                      </label>
                      {hasStaff ? (
                        <SearchableSelect
                          value={effectiveAssignee}
                          onChange={(val) => setAssigneeName(val)}
                          searchPlaceholder={`Search ${requiredCategory?.name || 'Ward field staff'}...`}
                          options={eligibleWardStaff.map((s) => {
                            const workload = tasks.filter((t) => (t.assignedFieldStaffId === s.id || t.assignedTo === s.displayName) && t.status !== 'Completed').length;
                            return {
                              value: s.displayName,
                              label: s.displayName,
                              sublabel: `ID: ${s.id} • Ward ${s.wardId} • ${s.staffCategory || s.roleTitle} (${s.departmentName || 'Engineering'}) • ${workload} active task(s)`,
                            };
                          })}
                          fullWidth
                          size="sm"
                        />
                      ) : (
                        <input
                          type="text"
                          disabled
                          value={`No active ${requiredCategory?.name || 'staff'} assigned to Ward ${targetWardId}`}
                          className="form-field opacity-60 cursor-not-allowed"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Target Completion Deadline
                      </label>
                      <input
                        type="text"
                        value={targetDueDate}
                        onChange={(e) => setTargetDueDate(e.target.value)}
                        className="form-field"
                        required
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedGrievanceId(null)}
                        className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!hasStaff || (!assigneeName && !effectiveAssignee)}
                        className="px-4 py-2 bg-kmc-navy hover:bg-kmc-navy-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg uppercase shadow transition-colors"
                      >
                        Confirm & Dispatch
                      </button>
                    </div>
                  </form>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <FooterStrip
        tagline="Departmental Workflow & Grievance SLA Redressal System • Karimnagar Municipal Corporation"
      />
    </div>
  );
};
