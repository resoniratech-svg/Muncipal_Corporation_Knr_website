import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { DataMode, APP_CONFIG } from '../data/config';
import { Ward } from '../data/wards';
import { GrievanceItem, TaskAssignment, getBeforePhotos } from '../data/grievances';
import { ESCALATION_LADDER } from '../data/departments';
import { PhotoEvidence } from '../photos/photoStore';
import { NotificationItem } from '../data/notifications';
import { ProjectItem } from '../data/budget';
import { Department } from '../data/departments';
import {
  STORAGE_KEYS,
  storageService,
  initializeStorage,
  grievanceRepository,
  taskRepository,
  notificationRepository,
  wardRepository,
  userRepository,
  staffCategoryRepository,
  departmentRepository,
  feedbackRepository,
  projectRepository,
  auditRepository,
  FeedbackItem,
  AuditLogEntry,
} from '../storage';

interface AppContextType {
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
  activeWardId: number;
  setActiveWardId: (id: number) => void;
  activeWard: Ward;
  wards: Ward[];
  departments: Department[];
  grievances: GrievanceItem[];
  tasks: TaskAssignment[];
  notifications: NotificationItem[];
  feedback: FeedbackItem[];
  projects: ProjectItem[];
  auditLog: AuditLogEntry[];
  submitGrievance: (item: Partial<GrievanceItem>, citizenName?: string) => GrievanceItem;
  /** Completing a task needs an after photo; returns ok:false (and changes nothing) without one. */
  updateTaskStatus: (
    taskId: string,
    status: 'Pending' | 'In Progress' | 'Completed',
    notes?: string,
    photo?: string
  ) => ActionResult;
  completeTaskWithPhotos: (taskId: string, photos: PhotoEvidence[], notes?: string) => ActionResult;
  /** Corporator validates a new complaint and sends it to field staff (deck Page 13, step 2–3). */
  routeComplaint: (grievanceId: string, staffName: string, corporatorName?: string) => void;
  approveAndClose: (grievanceId: string, corporatorName?: string) => void;
  sendBackComplaint: (grievanceId: string, reason: string, corporatorName?: string) => ActionResult;
  /** Citizen says "Not solved": reopens and escalates one level up the deck's ladder. */
  reopenComplaint: (grievanceId: string, reason: string) => ActionResult;
  assignGrievanceToStaff: (
    grievanceId: string,
    staffName: string,
    dueDate?: string,
    officerName?: string
  ) => void;
  approveGrievanceResolution: (grievanceId: string, officerName?: string) => void;
  rateGrievance: (
    id: string,
    rating: number,
    comment: string,
    citizenId?: string,
    citizenName?: string
  ) => void;
  broadcastNotification: (item: Omit<NotificationItem, 'id' | 'timestamp'>) => NotificationItem;
  simulationStep: number;
  runSimulationStep: () => void;
  resetSimulation: () => void;
  isDelayEscalated: boolean;
  toggleDelayEscalation: () => void;
  resetAllDemoData: () => void;
  exportDemoBackup: () => string;
  importDemoBackup: (jsonContent: string) => { success: boolean; message: string };
  refreshAllData: () => void;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ensure storage is initialized
  useEffect(() => {
    initializeStorage(false);
  }, []);

  const [dataMode, setDataMode] = useState<DataMode>(() => {
    const settings = storageService.getItem<{ dataMode: DataMode }>(STORAGE_KEYS.SETTINGS);
    return settings?.dataMode || APP_CONFIG.dataMode;
  });

  const [activeWardId, setActiveWardId] = useState<number>(27);

  // Core domain entities loaded directly from repositories
  const [wards, setWards] = useState<Ward[]>(() => wardRepository.getAll());
  const [departments, setDepartments] = useState<Department[]>(() => departmentRepository.getAll());
  const [grievances, setGrievances] = useState<GrievanceItem[]>(() => grievanceRepository.getAll());
  const [tasks, setTasks] = useState<TaskAssignment[]>(() => taskRepository.getAll());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => notificationRepository.getAll());
  const [feedback, setFeedback] = useState<FeedbackItem[]>(() => feedbackRepository.getAll());
  const [projects, setProjects] = useState<ProjectItem[]>(() => projectRepository.getAll());
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(() => auditRepository.getAll());

  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [isDelayEscalated, setIsDelayEscalated] = useState<boolean>(false);

  // Reload all states from localStorage
  const refreshAllData = useCallback(() => {
    setWards(wardRepository.getAll());
    setDepartments(departmentRepository.getAll());
    setGrievances(grievanceRepository.getAll());
    setTasks(taskRepository.getAll());
    setNotifications(notificationRepository.getAll());
    setFeedback(feedbackRepository.getAll());
    setProjects(projectRepository.getAll());
    setAuditLog(auditRepository.getAll());
  }, []);

  // Listen to centralized storage events
  useEffect(() => {
    const unsubscribe = storageService.subscribe((key) => {
      if (key === STORAGE_KEYS.GRIEVANCES) setGrievances(grievanceRepository.getAll());
      else if (key === STORAGE_KEYS.TASKS) setTasks(taskRepository.getAll());
      else if (key === STORAGE_KEYS.NOTIFICATIONS) setNotifications(notificationRepository.getAll());
      else if (key === STORAGE_KEYS.WARDS) setWards(wardRepository.getAll());
      else if (key === STORAGE_KEYS.FEEDBACK) setFeedback(feedbackRepository.getAll());
      else if (key === STORAGE_KEYS.PROJECTS) setProjects(projectRepository.getAll());
      else if (key === STORAGE_KEYS.AUDIT_LOG) setAuditLog(auditRepository.getAll());
      else if (key === STORAGE_KEYS.META) refreshAllData();
    });
    return unsubscribe;
  }, [refreshAllData]);

  const activeWard = useMemo(() => {
    return wards.find((w) => w.id === activeWardId) || wards[26];
  }, [wards, activeWardId]);

  const handleSetDataMode = (mode: DataMode) => {
    setDataMode(mode);
    storageService.setItem(STORAGE_KEYS.SETTINGS, {
      dataMode: mode,
      autoEscalationSimulation: isDelayEscalated,
      smsSimulationActive: true,
    });
  };

  /**
   * Citizen submits grievance:
   * 1. Auto-resolves target ward and assigned corporator
   * 2. Creates persistent grievance record with routing timeline
   * 3. Auto-creates linked field staff task for that ward
   * 4. Dispatches automated SMS and multi-channel notification to ward & corporator
   * 5. Logs to system audit trail
   */
  const submitGrievance = (newItem: Partial<GrievanceItem>, citizenName?: string): GrievanceItem => {
    // Resolve target ward and elected corporator
    const targetWardId = newItem.wardId || activeWardId || 27;
    const targetWard = wards.find((w) => w.id === targetWardId);
    const corpName = targetWard?.corporator || `Ward ${targetWardId} Corporator`;

    const createdGrievance = grievanceRepository.create(newItem, citizenName, corpName);

    // The ward corporator validates the complaint and sends it to field staff (routeComplaint)
    notificationRepository.create({
      type: 'WardUpdate',
      title: `Complaint ${createdGrievance.id} received`,
      message: `We have received your complaint ${createdGrievance.id} at ${createdGrievance.location}. Your ward councillor (${corpName}) will check it within 1 day.`,
      wardId: createdGrievance.wardId,
      channel: ['app', 'sms', 'portal'],
      smsText: `KMC: We have received your complaint ${createdGrievance.id}. Ward ${createdGrievance.wardId} councillor will check it within 1 day. – MCKNRG`,
      urgency: 'info',
    });

    auditRepository.log({
      actorId: createdGrievance.citizenId || 'CITIZEN',
      actorName: citizenName || 'Resident Citizen',
      role: 'citizen',
      action: 'SUBMIT_GRIEVANCE',
      resource: 'grievances',
      resourceId: createdGrievance.id,
      details: `Registered ${createdGrievance.category} at ${createdGrievance.location} (Ward ${createdGrievance.wardId}, Corporator: ${corpName})`,
    });

    refreshAllData();
    return createdGrievance;
  };

  const findTaskGrievance = (task: TaskAssignment): GrievanceItem | undefined => {
    const all = grievanceRepository.getAll();
    if (task.grievanceId) return all.find((g) => g.id === task.grievanceId);
    // Older tasks were linked by text only
    return all.find(
      (g) =>
        g.description.toLowerCase().includes(task.task.toLowerCase().slice(0, 15)) ||
        task.task.toLowerCase().includes(g.id.toLowerCase())
    );
  };

  /**
   * Field staff completes a task with AFTER photo(s):
   * task → Completed, complaint → "Work Completed – Waiting for Verification" (status Completed).
   */
  const completeTaskWithPhotos = (taskId: string, photos: PhotoEvidence[], notes?: string): ActionResult => {
    const task = taskRepository.getById(taskId);
    if (!task) return { ok: false, error: 'Task not found.' };
    if (!photos.length) return { ok: false, error: 'Please upload the photo of the completed work.' };

    taskRepository.updateStatus(taskId, 'Completed', notes, photos[0].src);
    const grievance = findTaskGrievance(task);
    if (grievance) {
      grievanceRepository.updateStatus(
        grievance.id,
        'Completed',
        notes ? `After photo uploaded by ${task.assignedTo}. Note: ${notes}` : `After photo uploaded by ${task.assignedTo}.`,
        task.assignedTo,
        {
          afterPhotos: photos,
          afterPhoto: photos[0].src,
          timelineTitle: 'Work Completed – Waiting for Verification',
          timelinePhoto: photos[0].src,
        }
      );
      auditRepository.log({
        actorId: 'FIELD-STAFF',
        actorName: task.assignedTo,
        role: 'field_staff',
        action: 'UPLOAD_AFTER_PHOTO',
        resource: 'grievances',
        resourceId: grievance.id,
        details: `Uploaded ${photos.length} after photo(s); waiting for corporator verification`,
      });
    }
    refreshAllData();
    return { ok: true };
  };

  /**
   * Field staff or officer updates task status. Moving a task to Completed requires an after photo.
   */
  const updateTaskStatus = (
    taskId: string,
    status: 'Pending' | 'In Progress' | 'Completed',
    notes?: string,
    photo?: string
  ): ActionResult => {
    const task = taskRepository.getById(taskId);
    if (!task) return { ok: false, error: 'Task not found.' };

    if (status === 'Completed') {
      if (!photo) return { ok: false, error: 'Please upload the photo of the completed work.' };
      const g = findTaskGrievance(task);
      return completeTaskWithPhotos(taskId, [{
        src: photo,
        takenAt: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        lat: g?.latitude ?? 17.986,
        lng: g?.longitude ?? 79.1188,
        location: g?.location || `Ward ${task.wardId}`,
      }], notes);
    }

    taskRepository.updateStatus(taskId, status, notes, photo);
    const matchGrievance = findTaskGrievance(task);
    if (matchGrievance && matchGrievance.status !== 'In Progress') {
      grievanceRepository.updateStatus(
        matchGrievance.id,
        'In Progress',
        notes ? `Ground update: ${notes}` : `Field staff started the work`,
        task.assignedTo,
        { timelineTitle: 'Work in Progress' }
      );
    }

    refreshAllData();
    return { ok: true };
  };

  const routeComplaint = (grievanceId: string, staffName: string, corporatorName?: string) => {
    const grievance = grievanceRepository.getById(grievanceId);
    if (!grievance) return;
    const corp = corporatorName || wards.find((w) => w.id === grievance.wardId)?.corporator || 'Ward Corporator';

    // Validate staff eligibility (ward, skill/category, department, active status)
    const validStaff = staffCategoryRepository.validateAssignment(
      staffName,
      grievance.wardId,
      grievance
    );

    const existing = taskRepository.getAll().find((t) => t.grievanceId === grievance.id);
    if (existing) {
      taskRepository.update(existing.id, {
        assignedTo: validStaff.displayName,
        assignedFieldStaffId: validStaff.id,
        staffCategory: validStaff.staffCategory,
        status: 'Pending',
      });
    } else {
      taskRepository.create({
        task: `${grievance.category}: ${grievance.description} (${grievance.location})`,
        assignedTo: validStaff.displayName,
        assignedFieldStaffId: validStaff.id,
        role: 'Field Staff',
        staffCategory: validStaff.staffCategory,
        requiredStaffCategory: grievance.requiredStaffCategory,
        dueDate: `Within ${grievance.slaHours} hours`,
        status: 'Pending',
        wardId: grievance.wardId,
        departmentId: grievance.departmentId,
        grievanceId: grievance.id,
      });
    }

    grievanceRepository.updateStatus(
      grievance.id,
      'In Progress',
      `Validated by ${corp} and sent to ${validStaff.displayName} (${validStaff.staffCategory || grievance.department}). Target: ${grievance.slaHours} hours.`,
      corp,
      {
        assignedTo: validStaff.displayName,
        assignedFieldStaffId: validStaff.id,
        timelineTitle: 'Checked by Councillor & Sent to Field Staff',
      }
    );
    auditRepository.log({
      actorId: 'CORPORATOR',
      actorName: corp,
      role: 'corporator',
      action: 'ROUTE_COMPLAINT',
      resource: 'grievances',
      resourceId: grievance.id,
      details: `Validated and assigned to ${validStaff.displayName} (${validStaff.staffCategory}, Ward ${grievance.wardId})`,
    });
    refreshAllData();
  };

  const approveAndClose = (grievanceId: string, corporatorName?: string) => {
    const grievance = grievanceRepository.getById(grievanceId);
    if (!grievance) return;
    const corp = corporatorName || wards.find((w) => w.id === grievance.wardId)?.corporator || 'Ward Corporator';

    grievanceRepository.updateStatus(
      grievance.id,
      'Resolved',
      `${corp} compared the before and after photos and closed the complaint.`,
      corp,
      { timelineTitle: 'Approved & Closed', sendBackReason: undefined }
    );
    notificationRepository.create({
      type: 'WardUpdate',
      title: `Complaint ${grievance.id} fixed`,
      message: `Your complaint ${grievance.id} has been resolved. Please check the photo.`,
      wardId: grievance.wardId,
      channel: ['app', 'sms', 'portal'],
      smsText: `KMC: Your complaint ${grievance.id} has been resolved. Please check the photo. – MCKNRG`,
      urgency: 'info',
    });
    auditRepository.log({
      actorId: 'CORPORATOR',
      actorName: corp,
      role: 'corporator',
      action: 'APPROVE_CLOSE',
      resource: 'grievances',
      resourceId: grievance.id,
      details: 'Before/after verified; complaint resolved',
    });
    refreshAllData();
  };

  const sendBackComplaint = (grievanceId: string, reason: string, corporatorName?: string): ActionResult => {
    if (!reason.trim()) return { ok: false, error: 'Please write why the work is sent back.' };
    const grievance = grievanceRepository.getById(grievanceId);
    if (!grievance) return { ok: false, error: 'Complaint not found.' };
    const corp = corporatorName || wards.find((w) => w.id === grievance.wardId)?.corporator || 'Ward Corporator';

    grievanceRepository.updateStatus(grievance.id, 'In Progress', `Sent back by ${corp}: ${reason}`, corp, {
      sendBackReason: reason,
      afterPhotos: [],
      afterPhoto: undefined,
      timelineTitle: 'Sent Back for Rework',
    });
    const task = taskRepository.getAll().find((t) => t.grievanceId === grievance.id);
    if (task) taskRepository.update(task.id, { status: 'In Progress', photo: undefined, notes: `Sent back: ${reason}` });
    auditRepository.log({
      actorId: 'CORPORATOR',
      actorName: corp,
      role: 'corporator',
      action: 'SEND_BACK',
      resource: 'grievances',
      resourceId: grievance.id,
      details: reason,
    });
    refreshAllData();
    return { ok: true };
  };

  const reopenComplaint = (grievanceId: string, reason: string): ActionResult => {
    if (!reason.trim()) return { ok: false, error: 'Please tell us in a few words what is still wrong.' };
    const grievance = grievanceRepository.getById(grievanceId);
    if (!grievance) return { ok: false, error: 'Complaint not found.' };

    const nextLevel = Math.min(5, (grievance.escalationLevel || 1) + 1);
    const rung = ESCALATION_LADDER.find((l) => l.level === nextLevel);
    grievanceRepository.updateStatus(
      grievance.id,
      'Reopened',
      `Citizen said not solved: "${reason}". Escalated to Level ${nextLevel} – ${rung?.title}.`,
      'Citizen',
      { reopenReason: reason, escalationLevel: nextLevel, timelineTitle: `Reopened – Escalated to ${rung?.title}` }
    );
    const task = taskRepository.getAll().find((t) => t.grievanceId === grievance.id);
    if (task) taskRepository.update(task.id, { status: 'In Progress', notes: `Reopened by citizen: ${reason}` });

    notificationRepository.create({
      type: 'Emergency',
      title: `Complaint ${grievance.id} reopened`,
      message: `Citizen reported the problem is not solved (Ward ${grievance.wardId}). Escalated to ${rung?.title}.`,
      wardId: grievance.wardId,
      channel: ['app', 'portal'],
      urgency: 'high',
    });
    auditRepository.log({
      actorId: grievance.citizenId || 'CITIZEN',
      actorName: 'Citizen',
      role: 'citizen',
      action: 'REOPEN_ESCALATE',
      resource: 'grievances',
      resourceId: grievance.id,
      details: `Reopened (${reason}); escalated to Level ${nextLevel} ${rung?.title}`,
    });
    refreshAllData();
    return { ok: true };
  };

  /**
   * Department Officer assigns a grievance to a specific field technician
   */
  const assignGrievanceToStaff = (
    grievanceId: string,
    staffName: string,
    dueDate = 'Next 48 Hours',
    officerName = 'Superintending Engineer'
  ) => {
    const grievance = grievanceRepository.getById(grievanceId);
    if (!grievance) return;

    // Validate staff eligibility (ward, skill/category, department, active status)
    const validStaff = staffCategoryRepository.validateAssignment(
      staffName,
      grievance.wardId,
      grievance
    );

    // Create or update task
    const createdTask = taskRepository.create({
      task: `${grievance.id}: ${grievance.description}`,
      assignedTo: validStaff.displayName,
      assignedFieldStaffId: validStaff.id,
      departmentId: grievance.departmentId,
      role: 'Field Staff',
      staffCategory: validStaff.staffCategory,
      requiredStaffCategory: grievance.requiredStaffCategory,
      dueDate,
      status: 'Pending',
      wardId: grievance.wardId,
      grievanceId: grievance.id,
    });

    grievanceRepository.updateStatus(
      grievanceId,
      'In Progress',
      `Assigned to ${validStaff.displayName} (${validStaff.staffCategory || grievance.department}) by ${officerName}. Target: ${dueDate}.`,
      officerName,
      {
        assignedTo: validStaff.displayName,
        assignedFieldStaffId: validStaff.id,
        taskId: createdTask.id,
        timelineTitle: 'Task Dispatched to Field Staff',
      }
    );

    auditRepository.log({
      actorId: 'DEPT-OFFICER',
      actorName: officerName,
      role: 'department_officer',
      action: 'ASSIGN_FIELD_TASK',
      resource: 'grievances',
      resourceId: grievanceId,
      details: `Assigned grievance to ${validStaff.displayName} (${validStaff.staffCategory}) in Ward ${grievance.wardId} with target ${dueDate}`,
    });

    refreshAllData();
  };

  /**
   * Department Officer signs off on completion and approves final resolution
   */
  const approveGrievanceResolution = (grievanceId: string, officerName = 'Superintending Engineer') => {
    const grievance = grievanceRepository.getById(grievanceId);
    if (!grievance) return;
    // Closure is based on the after photo, same rule as the corporator's Approve & Close
    if (!grievance.afterPhotos?.length && !grievance.afterPhoto) return;

    grievanceRepository.updateStatus(
      grievanceId,
      'Resolved',
      `Inspection verified and approved for closure by ${officerName}. Photographic proof verified.`,
      officerName
    );

    // Notify citizen
    notificationRepository.create({
      type: 'WardUpdate',
      title: `Grievance ${grievance.id} Resolved`,
      message: `Your grievance at ${grievance.location} has been resolved and approved by ${officerName}. Please rate our service.`,
      wardId: grievance.wardId,
      channel: ['app', 'sms', 'portal'],
      smsText: `Municipal Corporation, Karimnagar: Your grievance ${grievance.id} has been resolved. Kindly provide your valuable feedback at mykarimnagar.gov.in – MCKNRG`,
      urgency: 'info',
    });

    auditRepository.log({
      actorId: 'DEPT-OFFICER',
      actorName: officerName,
      role: 'department_officer',
      action: 'RESOLVE_GRIEVANCE',
      resource: 'grievances',
      resourceId: grievanceId,
      details: `Resolution approved with verified proof for ${grievanceId}`,
    });

    refreshAllData();
  };

  /**
   * Citizen rates a resolved grievance
   */
  const rateGrievance = (
    id: string,
    rating: number,
    comment: string,
    citizenId = 'USR-CITIZEN-01',
    citizenName = 'Resident Citizen'
  ) => {
    grievanceRepository.rateGrievance(id, rating, comment);
    feedbackRepository.create({
      grievanceId: id,
      citizenId,
      citizenName,
      rating,
      comment,
    });

    auditRepository.log({
      actorId: citizenId,
      actorName: citizenName,
      role: 'citizen',
      action: 'RATE_SERVICE',
      resource: 'feedback',
      resourceId: id,
      details: `Rated ${rating}/5 stars: "${comment}"`,
    });

    refreshAllData();
  };

  /**
   * Admin dispatches live broadcast notice
   */
  const broadcastNotification = (item: Omit<NotificationItem, 'id' | 'timestamp'>): NotificationItem => {
    const created = notificationRepository.create(item);
    auditRepository.log({
      actorId: 'ADMIN',
      actorName: 'Municipal Administrator',
      role: 'super_admin',
      action: 'DISPATCH_BROADCAST',
      resource: 'notifications',
      resourceId: created.id,
      details: `Broadcast: "${item.title}" to target ward: ${item.wardId || 'City-Wide'}`,
    });
    refreshAllData();
    return created;
  };

  const runSimulationStep = () => {
    setSimulationStep((prev) => (prev + 1) % 6);
  };

  const resetSimulation = () => {
    setSimulationStep(0);
  };

  const toggleDelayEscalation = () => {
    setIsDelayEscalated((prev) => !prev);
  };

  const resetAllDemoData = () => {
    initializeStorage(true);
    refreshAllData();
  };

  const exportDemoBackup = (): string => {
    const data = storageService.exportData();
    return JSON.stringify(data, null, 2);
  };

  const importDemoBackup = (jsonContent: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonContent);
      const res = storageService.importData(parsed);
      if (res.success) {
        refreshAllData();
      }
      return res;
    } catch {
      return { success: false, message: 'Invalid JSON format in uploaded file.' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        dataMode,
        setDataMode: handleSetDataMode,
        activeWardId,
        setActiveWardId,
        activeWard,
        wards,
        departments,
        grievances,
        tasks,
        notifications,
        feedback,
        projects,
        auditLog,
        submitGrievance,
        updateTaskStatus,
        completeTaskWithPhotos,
        routeComplaint,
        approveAndClose,
        sendBackComplaint,
        reopenComplaint,
        assignGrievanceToStaff,
        approveGrievanceResolution,
        rateGrievance,
        broadcastNotification,
        simulationStep,
        runSimulationStep,
        resetSimulation,
        isDelayEscalated,
        toggleDelayEscalation,
        resetAllDemoData,
        exportDemoBackup,
        importDemoBackup,
        refreshAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
