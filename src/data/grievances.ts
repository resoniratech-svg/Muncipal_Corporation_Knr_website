import { PhotoEvidence } from '../photos/photoStore';

// Authentic field photographs stored in public/images/
const drainBefore = 'images/field-evidence/drain-before.jpg';
const drainAfter = 'images/field-evidence/drain-after.jpg';
const roadBefore = 'images/field-evidence/road-before.jpg';
const roadAfter = 'images/field-evidence/road-after.jpg';
const garbageBefore = 'images/sanitation/sanitation-collection.jpg';
const garbageAfter = 'images/field-evidence/sanitation-work.jpg';
const lightBefore = 'images/civic-works/street-lighting.jpg';
const lightAfter = 'images/field-evidence/street-lights-fixed.jpg';
const waterBefore = 'images/field-evidence/water-before.jpg';
const waterAfter = 'images/field-evidence/water-after.jpg';
const parkBefore = 'images/field-evidence/park-beautification.jpg';
const parkAfter = 'images/parks-projects/urban-park.jpg';

/**
 * Pending      → shown to citizens as "Waiting"
 * In Progress  → "Work in progress"
 * Completed    → "Work Completed – Waiting for Verification" (after photo uploaded, corporator to approve)
 * Resolved     → "Fixed"
 * Overdue      → "Delayed"
 * Reopened     → citizen said "Not solved"; escalated one level up the ladder
 */
export type GrievanceStatus = 'Pending' | 'In Progress' | 'Completed' | 'Resolved' | 'Overdue' | 'Reopened';
export type DepartmentName = 'Water Supply' | 'Engineering' | 'Sanitation' | 'Electrical' | 'Town Planning' | 'Revenue' | 'Health' | 'IT & Data Management';

export interface TimelineEntry {
  time: string;
  title: string;
  note: string;
  /** Thumbnail shown on the "Registered" (before) and "Work Completed" (after) steps */
  photo?: string;
}

export interface GrievanceItem {
  id: string;
  citizenId?: string;
  category: string;
  department: DepartmentName;
  departmentId?: string;
  requiredStaffCategory?: string;
  description: string;
  location: string;
  wardId: number;
  reportedOn: string;
  createdAt?: string;
  status: GrievanceStatus;
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
  slaHours: number;
  assignedTo?: string;
  assignedFieldStaffId?: string;
  assignedOfficerId?: string;
  taskId?: string;
  /** Current level on the deck's 5-level escalation ladder (1 = Field Staff) */
  escalationLevel?: number;
  latitude?: number;
  longitude?: number;
  /** Legacy single photo fields; kept in sync with the first entry of the photo lists */
  beforePhoto?: string;
  afterPhoto?: string;
  beforePhotos?: PhotoEvidence[];
  afterPhotos?: PhotoEvidence[];
  sendBackReason?: string;
  reopenReason?: string;
  timeline?: TimelineEntry[];
  citizenRating?: number;
  feedbackComment?: string;
  citizenFeedback?: string;
}

export interface TaskAssignment {
  id: string;
  task: string;
  assignedTo: string;
  assignedFieldStaffId?: string;
  role: string;
  staffCategory?: string;
  requiredStaffCategory?: string;
  dueDate: string;
  dueAt?: string;
  createdAt?: string;
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  wardId: number;
  departmentId?: string;
  /** The complaint this task resolves */
  grievanceId?: string;
  notes?: string;
  completionNotes?: string;
  photo?: string;
  evidence?: any;
}

const ev = (src: string, location: string, lat: number, lng: number, takenAt: string): PhotoEvidence => ({ src, location, lat, lng, takenAt });

// Ward 27 coordinates are the deck's Page 6 geo-tags; the rest are nearby sample points.
const RK_NAGAR = { lat: 17.986, lng: 79.1188 };
const HUZURABAD = { lat: 18.0065, lng: 79.126 };

export const INITIAL_GRIEVANCES: GrievanceItem[] = [
  // ---------- Fixed (6) ----------
  {
    id: "GRV-2024-27-0045",
    citizenId: "USR-CITIZEN-01",
    category: "Drainage",
    department: "Engineering",
    description: "Drain Overflow near main intersection",
    location: "Ramakrishna Nagar",
    wardId: 27,
    reportedOn: "17 May 2024, 09:00 AM",
    status: "Resolved",
    slaHours: 72,
    assignedTo: "Mahesh (Field Staff)",
    escalationLevel: 1,
    latitude: RK_NAGAR.lat,
    longitude: RK_NAGAR.lng,
    beforePhoto: drainBefore,
    afterPhoto: drainAfter,
    beforePhotos: [ev(drainBefore, "Ramakrishna Nagar, Ward 27", RK_NAGAR.lat, RK_NAGAR.lng, "17 May 2024, 09:00 AM")],
    afterPhotos: [ev(drainAfter, "Ramakrishna Nagar, Ward 27", RK_NAGAR.lat, RK_NAGAR.lng, "17 May 2024, 04:30 PM")],
    timeline: [
      { time: "17 May 2024, 09:00 AM", title: "Complaint Registered", note: "Reported by resident with photo evidence", photo: drainBefore },
      { time: "17 May 2024, 09:30 AM", title: "Corporator Validated", note: "Forwarded to Engineering team" },
      { time: "17 May 2024, 11:00 AM", title: "Work in Progress", note: "Desilting and cover replacement started" },
      { time: "17 May 2024, 04:30 PM", title: "Work Completed", note: "Geo-tagged after photo uploaded", photo: drainAfter },
      { time: "17 May 2024, 05:00 PM", title: "Approved & Closed", note: "Corporator compared before/after photos and closed the complaint" },
    ],
  },
  {
    id: "GRV-2024-27-0031",
    category: "Roads",
    department: "Engineering",
    description: "Road potholes",
    location: "SRR Thota",
    wardId: 27,
    reportedOn: "17 May 2024, 08:40 AM",
    status: "Resolved",
    slaHours: 72,
    assignedTo: "Venkatesh (Field Staff)",
    escalationLevel: 1,
    latitude: 17.9902,
    longitude: 79.1211,
    beforePhoto: roadBefore,
    afterPhoto: roadAfter,
    beforePhotos: [ev(roadBefore, "SRR Thota, Ward 27", 17.9902, 79.1211, "17 May 2024, 08:40 AM")],
    afterPhotos: [ev(roadAfter, "SRR Thota, Ward 27", 17.9902, 79.1211, "21 May 2024, 03:10 PM")],
    citizenRating: 4,
    feedbackComment: "Road is smooth now.",
    timeline: [
      { time: "17 May 2024, 08:40 AM", title: "Complaint Registered", note: "Reported with photo", photo: roadBefore },
      { time: "18 May 2024, 10:00 AM", title: "Work in Progress", note: "Assigned to Venkatesh (Field Staff)" },
      { time: "21 May 2024, 03:10 PM", title: "Work Completed", note: "Potholes filled; after photo uploaded", photo: roadAfter },
      { time: "21 May 2024, 05:00 PM", title: "Approved & Closed", note: "Verified by Ward 27 Corporator" },
    ],
  },
  {
    id: "#GRV2024-00234",
    citizenId: "USR-CITIZEN-01",
    category: "Drainage Issue",
    department: "Engineering",
    description: "Drain water is overflowing on the road.",
    location: "Green Park Colony, Ward 27",
    wardId: 27,
    reportedOn: "20 May 2024, 10:15 AM",
    status: "Resolved",
    slaHours: 72,
    escalationLevel: 1,
    latitude: 17.9881,
    longitude: 79.1174,
    beforePhoto: drainBefore,
    afterPhoto: drainAfter,
    beforePhotos: [ev(drainBefore, "Green Park Colony, Ward 27", 17.9881, 79.1174, "20 May 2024, 10:15 AM")],
    afterPhotos: [ev(drainAfter, "Green Park Colony, Ward 27", 17.9881, 79.1174, "20 May 2024, 04:00 PM")],
    citizenRating: 5,
    feedbackComment: "Very prompt and effective action. Thank you!",
    timeline: [
      { time: "20 May 2024, 10:15 AM", title: "Registered", note: "Your grievance #GRV2024-00234 has been registered successfully.", photo: drainBefore },
      { time: "20 May 2024, 11:45 AM", title: "In Progress", note: "Your grievance #GRV2024-00234 is in progress." },
      { time: "20 May 2024, 04:00 PM", title: "Work Completed", note: "After photo uploaded by field staff", photo: drainAfter },
      { time: "20 May 2024, 04:20 PM", title: "Resolved", note: "Your grievance #GRV2024-00234 has been resolved." },
    ],
  },
  {
    id: "GRV-2024-12-0101",
    category: "Garbage",
    department: "Sanitation",
    description: "Garbage heap not cleared for 3 days",
    location: "Satellite Colony, Ward 12",
    wardId: 12,
    reportedOn: "14 May 2024, 07:50 AM",
    status: "Resolved",
    slaHours: 48,
    assignedTo: "Naresh (Field Staff)",
    escalationLevel: 1,
    latitude: 18.0125,
    longitude: 79.135,
    beforePhoto: garbageBefore,
    afterPhoto: garbageAfter,
    beforePhotos: [ev(garbageBefore, "Satellite Colony, Ward 12", 18.0125, 79.135, "14 May 2024, 07:50 AM")],
    afterPhotos: [ev(garbageAfter, "Satellite Colony, Ward 12", 18.0125, 79.135, "15 May 2024, 11:20 AM")],
    citizenRating: 5,
    feedbackComment: "Cleared next morning. Thank you.",
    timeline: [
      { time: "14 May 2024, 07:50 AM", title: "Complaint Registered", note: "Reported with photo", photo: garbageBefore },
      { time: "14 May 2024, 09:00 AM", title: "Work in Progress", note: "Sanitation team assigned" },
      { time: "15 May 2024, 11:20 AM", title: "Work Completed", note: "Bins placed; after photo uploaded", photo: garbageAfter },
      { time: "15 May 2024, 01:00 PM", title: "Approved & Closed", note: "Verified by Ward 12 Corporator" },
    ],
  },
  {
    id: "GRV-2024-33-0057",
    category: "Street Lights",
    department: "Electrical",
    description: "Three street lights not working",
    location: "Huzurabad Road, Ward 33",
    wardId: 33,
    reportedOn: "12 May 2024, 08:10 PM",
    status: "Resolved",
    slaHours: 48,
    assignedTo: "Suresh (Electrician)",
    escalationLevel: 1,
    latitude: HUZURABAD.lat,
    longitude: HUZURABAD.lng,
    beforePhoto: lightBefore,
    afterPhoto: lightAfter,
    beforePhotos: [ev(lightBefore, "Huzurabad Road, Ward 33", HUZURABAD.lat, HUZURABAD.lng, "12 May 2024, 08:10 PM")],
    afterPhotos: [ev(lightAfter, "Huzurabad Road, Ward 33", HUZURABAD.lat, HUZURABAD.lng, "13 May 2024, 07:40 PM")],
    timeline: [
      { time: "12 May 2024, 08:10 PM", title: "Complaint Registered", note: "Reported with photo", photo: lightBefore },
      { time: "13 May 2024, 10:00 AM", title: "Work in Progress", note: "Electrician assigned" },
      { time: "13 May 2024, 07:40 PM", title: "Work Completed", note: "LED lamps replaced; after photo uploaded", photo: lightAfter },
      { time: "14 May 2024, 09:00 AM", title: "Approved & Closed", note: "Verified by Ward 33 Corporator" },
    ],
  },
  {
    id: "GRV-2024-18-0029",
    category: "Other",
    department: "Engineering",
    description: "Broken bench and dry grass in the colony park",
    location: "Ramakrishna Nagar Park, Ward 18",
    wardId: 18,
    reportedOn: "08 May 2024, 06:30 AM",
    status: "Resolved",
    slaHours: 72,
    assignedTo: "Venkatesh (Field Staff)",
    escalationLevel: 1,
    latitude: 17.9975,
    longitude: 79.1302,
    beforePhoto: parkBefore,
    afterPhoto: parkAfter,
    beforePhotos: [ev(parkBefore, "Ramakrishna Nagar Park, Ward 18", 17.9975, 79.1302, "08 May 2024, 06:30 AM")],
    afterPhotos: [ev(parkAfter, "Ramakrishna Nagar Park, Ward 18", 17.9975, 79.1302, "10 May 2024, 05:15 PM")],
    citizenRating: 4,
    feedbackComment: "Park looks good again.",
    timeline: [
      { time: "08 May 2024, 06:30 AM", title: "Complaint Registered", note: "Reported with photo", photo: parkBefore },
      { time: "08 May 2024, 11:00 AM", title: "Work in Progress", note: "Assigned to Venkatesh (Field Staff)" },
      { time: "10 May 2024, 05:15 PM", title: "Work Completed", note: "Bench repaired, lawn restored", photo: parkAfter },
      { time: "11 May 2024, 10:00 AM", title: "Approved & Closed", note: "Verified by Ward 18 Corporator" },
    ],
  },

  // ---------- Work in progress (3, before photo only) ----------
  {
    id: "#GRV2024/001245",
    category: "Water Supply",
    department: "Water Supply",
    description: "Water leakage on Road, Booth Colony",
    location: "Booth Colony, Ward 12",
    wardId: 12,
    reportedOn: "16 May 2024, 10:30 AM",
    status: "In Progress",
    slaHours: 24,
    assignedTo: "Naresh (Field Staff)",
    escalationLevel: 1,
    latitude: 18.0125,
    longitude: 79.1350,
    beforePhoto: waterBefore,
    beforePhotos: [ev(waterBefore, "Booth Colony, Ward 12", 18.0125, 79.135, "16 May 2024, 10:30 AM")],
    timeline: [
      { time: "16 May 2024, 10:30 AM", title: "Complaint Registered", note: "Citizen registered complaint via My Karimnagar App", photo: waterBefore },
      { time: "16 May 2024, 11:15 AM", title: "Assigned to Officer", note: "Auto-routed to Water Supply Dept Assistant Engineer" },
      { time: "16 May 2024, 11:15 AM", title: "In Progress", note: "Work order created and pipeline maintenance team dispatched" }
    ]
  },
  {
    id: "GRV-2024-27-0082",
    category: "Street Lights",
    department: "Electrical",
    description: "Street Light Not Working on main stretch",
    location: "Huzurabad Road",
    wardId: 27,
    reportedOn: "18 May 2024, 08:15 AM",
    status: "In Progress",
    slaHours: 48,
    assignedTo: "Suresh (Electrician)",
    escalationLevel: 1,
    latitude: HUZURABAD.lat,
    longitude: HUZURABAD.lng,
    beforePhoto: lightBefore,
    beforePhotos: [ev(lightBefore, "Huzurabad Road, Ward 27", HUZURABAD.lat, HUZURABAD.lng, "18 May 2024, 08:15 AM")],
    timeline: [
      { time: "18 May 2024, 08:15 AM", title: "Issue Logged", note: "Reported via Citizen App", photo: lightBefore },
      { time: "18 May 2024, 09:00 AM", title: "Work Assigned", note: "Replacement LED luminaire ordered" }
    ]
  },
  {
    id: "GRV-2024-27-0022",
    citizenId: "USR-CITIZEN-01",
    category: "Water Supply",
    department: "Water Supply",
    description: "Water leakage",
    location: "Green Park Colony",
    wardId: 27,
    reportedOn: "17 May 2024, 07:20 AM",
    status: "In Progress",
    slaHours: 24,
    assignedTo: "Mahesh (Field Staff)",
    escalationLevel: 1,
    latitude: 17.9881,
    longitude: 79.1174,
    beforePhoto: waterBefore,
    beforePhotos: [ev(waterBefore, "Green Park Colony, Ward 27", 17.9881, 79.1174, "17 May 2024, 07:20 AM")],
    timeline: [
      { time: "17 May 2024, 07:20 AM", title: "Complaint Registered", note: "Reported with photo", photo: waterBefore },
      { time: "17 May 2024, 09:00 AM", title: "Work in Progress", note: "Assigned to Mahesh (Field Staff)" },
    ],
  },

  // ---------- Waiting (3) ----------
  {
    id: "GRV-2024-27-0018",
    citizenId: "USR-CITIZEN-01",
    category: "Sanitation",
    department: "Sanitation",
    description: "Garbage not cleared",
    location: "Santoshnagar",
    wardId: 27,
    reportedOn: "18 May 2024, 07:05 AM",
    status: "Pending",
    slaHours: 48,
    assignedTo: "Ramesh (Field Staff)",
    escalationLevel: 1,
    latitude: 17.9894,
    longitude: 79.1229,
    beforePhoto: garbageBefore,
    beforePhotos: [ev(garbageBefore, "Santoshnagar, Ward 27", 17.9894, 79.1229, "18 May 2024, 07:05 AM")],
    timeline: [
      { time: "18 May 2024, 07:05 AM", title: "Complaint Registered", note: "Reported with photo", photo: garbageBefore },
    ],
  },
  {
    id: "GRV-2024-45-0012",
    category: "Roads",
    department: "Engineering",
    description: "Big pothole near the bus stop",
    location: "LMD Colony, Ward 45",
    wardId: 45,
    reportedOn: "19 May 2024, 06:40 PM",
    status: "Pending",
    slaHours: 72,
    escalationLevel: 1,
    timeline: [
      { time: "19 May 2024, 06:40 PM", title: "Complaint Registered", note: "Reported without a photo" },
    ],
  },
  {
    id: "GRV-2024-39-0008",
    category: "Drainage",
    department: "Engineering",
    description: "Drain blocked, bad smell",
    location: "Housing Board Colony, Ward 39",
    wardId: 39,
    reportedOn: "20 May 2024, 08:00 AM",
    status: "Pending",
    slaHours: 72,
    escalationLevel: 1,
    timeline: [
      { time: "20 May 2024, 08:00 AM", title: "Complaint Registered", note: "Reported without a photo" },
    ],
  },
];

export const INITIAL_TASKS: TaskAssignment[] = [
  {
    id: "TASK-01",
    task: "Clean garbage at Santoshnagar",
    assignedTo: "Ramesh (Field Staff)",
    assignedFieldStaffId: "USR-FIELD-01",
    departmentId: "sanitation",
    role: "Field Staff",
    dueDate: "20 May 2024",
    status: "Pending",
    wardId: 27,
    grievanceId: "GRV-2024-27-0018",
  },
  {
    id: "TASK-02",
    task: "Repair street light",
    assignedTo: "Suresh (Electrician)",
    assignedFieldStaffId: "USR-FIELD-04",
    departmentId: "electrical",
    role: "Electrician",
    dueDate: "19 May 2024",
    status: "In Progress",
    wardId: 27,
    grievanceId: "GRV-2024-27-0082",
  },
  {
    id: "TASK-03",
    task: "Desilt drain at Green Park Colony",
    assignedTo: "Mahesh (Field Staff)",
    assignedFieldStaffId: "USR-FIELD-03",
    departmentId: "engineering",
    role: "Field Staff",
    dueDate: "20 May 2024",
    status: "In Progress",
    wardId: 27,
  },
  {
    id: "TASK-04",
    task: "Fill potholes on SRR Thota Road",
    assignedTo: "Venkatesh (Field Staff)",
    assignedFieldStaffId: "USR-FIELD-05",
    departmentId: "engineering",
    role: "Field Staff",
    dueDate: "21 May 2024",
    status: "Completed",
    wardId: 27,
    grievanceId: "GRV-2024-27-0031",
    photo: roadAfter,
  },
  {
    id: "TASK-05",
    task: "Fix water leakage at Green Park Colony",
    assignedTo: "Mahesh (Field Staff)",
    assignedFieldStaffId: "USR-FIELD-03",
    departmentId: "engineering",
    role: "Field Staff",
    dueDate: "18 May 2024",
    status: "In Progress",
    wardId: 27,
    grievanceId: "GRV-2024-27-0022",
  },
  {
    id: "TASK-06",
    task: "Repair water pipe leak on Booth Colony road",
    assignedTo: "Naresh (Field Staff)",
    assignedFieldStaffId: "USR-FIELD-02",
    departmentId: "water-supply",
    role: "Field Staff",
    dueDate: "17 May 2024",
    status: "In Progress",
    wardId: 12,
    grievanceId: "#GRV2024/001245",
  },
];

export const SLA_MASTER = [
  { category: "Water Supply", example: "Leakage Repair", sla: "24 Hours", hours: 24, escalation: "Department Head → Commissioner" },
  { category: "Sanitation", example: "Garbage Not Collected", sla: "48 Hours", hours: 48, escalation: "Department Head → Commissioner" },
  { category: "Engineering", example: "Road / Drainage Issue", sla: "72 Hours", hours: 72, escalation: "Department Head → Commissioner" },
  { category: "Electrical", example: "Street Light Not Working", sla: "48 Hours", hours: 48, escalation: "Department Head → Commissioner" },
  { category: "Town Planning", example: "Illegal Construction", sla: "72 Hours", hours: 72, escalation: "Department Head → Commissioner" },
  { category: "Health", example: "Public Health Issue", sla: "24 Hours", hours: 24, escalation: "Department Head → Commissioner" },
];

/** Before photos of a complaint, falling back to the legacy single-photo field. */
export const getBeforePhotos = (g: GrievanceItem): PhotoEvidence[] => {
  if (g.beforePhotos?.length) return g.beforePhotos;
  if (g.beforePhoto && isPhotoSource(g.beforePhoto)) {
    return [{ src: g.beforePhoto, takenAt: g.reportedOn, lat: g.latitude ?? 17.986, lng: g.longitude ?? 79.1188, location: g.location }];
  }
  return [];
};

export const getAfterPhotos = (g: GrievanceItem): PhotoEvidence[] => {
  if (g.afterPhotos?.length) return g.afterPhotos;
  if (g.afterPhoto && isPhotoSource(g.afterPhoto)) {
    return [{ src: g.afterPhoto, takenAt: g.reportedOn, lat: g.latitude ?? 17.986, lng: g.longitude ?? 79.1188, location: g.location }];
  }
  return [];
};

/** True for things that can be shown as an image (old seed records stored text captions instead). */
export const isPhotoSource = (src: string) =>
  src.startsWith('data:image') || src.startsWith('http') || src.startsWith('kmc-photo:') || src.startsWith('demo-photo:') || src.startsWith('/') ||
  /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(src);
