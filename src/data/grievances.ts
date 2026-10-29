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
const kmcBuilding = 'images/city/kmc-headquarters.jpg';
const towerCircle = 'images/city/tower-circle.png';

/**
 * Pending      → shown to citizens as "Waiting"
 * In Progress  → "Work in progress"
 * Completed    → "Work Completed – Waiting for Verification" (after photo uploaded, corporator to approve)
 * Resolved     → "Fixed"
 * Overdue      → "Delayed"
 * Reopened     → citizen said "Not solved"; escalated one level up the ladder
 */
export type GrievanceStatus = 'Pending' | 'In Progress' | 'Completed' | 'Resolved' | 'Overdue' | 'Reopened';

/**
 * Official 7 Core Administrative Departments of MCK:
 * 1. Establishment Section
 * 2. Revenue Section
 * 3. Engineering Section
 * 4. Town Planning Section (TPS)
 * 5. Sanitation Section
 * 6. Statistics / Birth & Death Registration Section
 * 7. Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)
 */
export type DepartmentName =
  | 'Establishment Section'
  | 'Revenue Section'
  | 'Engineering Section'
  | 'Town Planning Section (TPS)'
  | 'Sanitation Section'
  | 'Statistics / Birth & Death Registration Section'
  | 'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)'
  | 'Water Supply'
  | 'Engineering'
  | 'Sanitation'
  | 'Electrical'
  | 'Town Planning'
  | 'Revenue'
  | 'Health'
  | 'IT & Data Management';

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
  citizenName?: string;
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
    department: "Engineering Section",
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
    department: "Engineering Section",
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
  {
    id: "GRV-2024-27-0050",
    category: "Civil Works",
    department: "Engineering Section",
    description: "Culvert retaining wall reconstruction and storm slab replacement near community center",
    location: "Sector 3 Road, Green Park Colony, Ward 27",
    wardId: 27,
    reportedOn: "18 May 2024, 09:45 AM",
    status: "In Progress",
    slaHours: 72,
    assignedTo: "Venkatesh (Field Staff)",
    escalationLevel: 1,
    latitude: 17.9868,
    longitude: 79.1192,
    beforePhoto: roadBefore,
    beforePhotos: [ev(roadBefore, "Sector 3 Road, Green Park Colony, Ward 27", 17.9868, 79.1192, "18 May 2024, 09:45 AM")],
    timeline: [
      { time: "18 May 2024, 09:45 AM", title: "Complaint Registered", note: "Damaged culvert slab reported by colony association", photo: roadBefore },
      { time: "18 May 2024, 11:30 AM", title: "Work in Progress", note: "Civil engineering contractor deployed for masonry reconstruction" },
    ],
  },
  {
    id: "GRV-2024-27-0051",
    category: "Civil Works",
    department: "Engineering Section",
    description: "Footpath interlocking pavers sinking and safety railing repair along school corridor",
    location: "School Road, Green Park Colony, Ward 27",
    wardId: 27,
    reportedOn: "19 May 2024, 08:15 AM",
    status: "Pending",
    slaHours: 72,
    assignedTo: "Venkatesh (Field Staff)",
    escalationLevel: 1,
    latitude: 17.9875,
    longitude: 79.1182,
    beforePhoto: roadBefore,
    beforePhotos: [ev(roadBefore, "School Road, Green Park Colony, Ward 27", 17.9875, 79.1182, "19 May 2024, 08:15 AM")],
    timeline: [
      { time: "19 May 2024, 08:15 AM", title: "Complaint Registered", note: "Pedestrian hazard flagged for field civil inspection", photo: roadBefore },
    ],
  },

  // ---------- Waiting (3) ----------
  {
    id: "GRV-2024-27-0018",
    citizenId: "USR-CITIZEN-01",
    category: "Sanitation",
    department: "Sanitation Section",
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

  // =========================================================================
  // 1. Establishment Section (General Administration, HR, Staff Postings)
  // =========================================================================
  {
    id: "GRV-2024-27-0110",
    category: "Staff Postings & HR",
    department: "Establishment Section",
    description: "Municipal sanitation worker vacancy unfilled at Green Park Colony division",
    location: "Ward Office, Green Park Colony, Ward 27",
    wardId: 27,
    reportedOn: "19 May 2024, 10:00 AM",
    status: "Pending",
    slaHours: 48,
    assignedTo: "Sri. K. Chandrashekar",
    escalationLevel: 1,
    beforePhoto: kmcBuilding,
    beforePhotos: [ev(kmcBuilding, "Ward Office, Green Park Colony, Ward 27", 17.986, 79.1188, "19 May 2024, 10:00 AM")],
    timeline: [
      { time: "19 May 2024, 10:00 AM", title: "Complaint Registered", note: "Submitted to Establishment Section for staffing roster verification", photo: kmcBuilding },
    ],
  },
  {
    id: "GRV-2024-27-0111",
    category: "Staff Postings & HR",
    department: "Establishment Section",
    description: "Biometric muster roll sync & ward staff roster regularization request",
    location: "Division Staff Center, Green Park Colony, Ward 27",
    wardId: 27,
    reportedOn: "18 May 2024, 11:30 AM",
    status: "In Progress",
    slaHours: 48,
    assignedTo: "Sri. K. Chandrashekar",
    escalationLevel: 1,
    beforePhoto: kmcBuilding,
    beforePhotos: [ev(kmcBuilding, "Division Staff Center, Green Park Colony, Ward 27", 17.986, 79.1188, "18 May 2024, 11:30 AM")],
    timeline: [
      { time: "18 May 2024, 11:30 AM", title: "Complaint Registered", note: "Muster roll flagged for verification", photo: kmcBuilding },
      { time: "18 May 2024, 02:00 PM", title: "Work in Progress", note: "Administrative Officer assigned field IT auditor" },
    ],
  },
  {
    id: "GRV-2024-12-0112",
    category: "Staff Postings & HR",
    department: "Establishment Section",
    description: "Field supervisor deputation and attendance reconciliation for monsoon preparedness",
    location: "Satellite Colony Administrative Center, Ward 12",
    wardId: 12,
    reportedOn: "15 May 2024, 09:15 AM",
    status: "Resolved",
    slaHours: 48,
    assignedTo: "Sri. K. Chandrashekar",
    escalationLevel: 1,
    beforePhoto: kmcBuilding,
    afterPhoto: kmcBuilding,
    beforePhotos: [ev(kmcBuilding, "Satellite Colony Center, Ward 12", 18.0125, 79.135, "15 May 2024, 09:15 AM")],
    afterPhotos: [ev(kmcBuilding, "Satellite Colony Center, Ward 12", 18.0125, 79.135, "16 May 2024, 04:00 PM")],
    citizenRating: 5,
    feedbackComment: "Roster resolved and additional personnel deployed on schedule.",
    timeline: [
      { time: "15 May 2024, 09:15 AM", title: "Complaint Registered", note: "Submitted to Establishment Section", photo: kmcBuilding },
      { time: "15 May 2024, 11:00 AM", title: "Work in Progress", note: "Order issued by Administrative Officer" },
      { time: "16 May 2024, 04:00 PM", title: "Work Completed", note: "Staff postings confirmed and logged", photo: kmcBuilding },
      { time: "16 May 2024, 05:00 PM", title: "Approved & Closed", note: "Verified by Establishment Section" },
    ],
  },

  // =========================================================================
  // 2. Revenue Section (Property Tax, Vacant Land Tax, Revenue Assessments)
  // =========================================================================
  {
    id: "GRV-2024-27-0201",
    category: "Property Tax (House Tax)",
    department: "Revenue Section",
    citizenId: "USR-CITIZEN-01",
    citizenName: "Smt. Lavanya Reddy",
    description: "Property tax assessment demand settlement and early-bird rebate reconciliation for PTIN-KNR-27-0428 (Door No: 8-4-122)",
    location: "Plot 42, Green Park Colony, Ward 27",
    wardId: 27,
    reportedOn: "19 May 2024, 08:30 AM",
    status: "Resolved",
    slaHours: 48,
    assignedTo: "Sri. M. Sudhakar",
    escalationLevel: 1,
    beforePhoto: towerCircle,
    afterPhoto: towerCircle,
    beforePhotos: [ev(towerCircle, "Plot 42, Green Park Colony, Ward 27", 17.986, 79.1188, "19 May 2024, 08:30 AM")],
    afterPhotos: [ev(towerCircle, "Plot 42, Green Park Colony, Ward 27", 17.986, 79.1188, "20 May 2024, 11:30 AM")],
    timeline: [
      { time: "19 May 2024, 08:30 AM", title: "Complaint Registered", note: "Property tax demand review submitted by citizen", photo: towerCircle },
      { time: "20 May 2024, 11:30 AM", title: "Payment Reconciled", note: "Receipt #RCT-MCK-2024-8192 verified in Treasury Account MCK-REV-TREASURY-01", photo: towerCircle },
    ],
  },
  {
    id: "GRV-2024-27-0202",
    category: "Property Tax (House Tax)",
    department: "Revenue Section",
    description: "Vacant Land Tax (VLT) challan generation and mutation fee receipt verification",
    location: "Commercial Complex Road, Green Park Colony, Ward 27",
    wardId: 27,
    reportedOn: "18 May 2024, 10:15 AM",
    status: "In Progress",
    slaHours: 48,
    assignedTo: "Sri. M. Sudhakar",
    escalationLevel: 1,
    beforePhoto: towerCircle,
    beforePhotos: [ev(towerCircle, "Commercial Complex Road, Ward 27", 17.986, 79.1188, "18 May 2024, 10:15 AM")],
    timeline: [
      { time: "18 May 2024, 10:15 AM", title: "Complaint Registered", note: "Challan generation issue reported", photo: towerCircle },
      { time: "18 May 2024, 01:30 PM", title: "Work in Progress", note: "Assigned to Revenue Inspector for system reconcilation" },
    ],
  },
  {
    id: "GRV-2024-12-0205",
    category: "Property Tax (House Tax)",
    department: "Revenue Section",
    description: "Online PTIN registration and dual payment reconciliation processed",
    location: "Booth Colony Extension, Ward 12",
    wardId: 12,
    reportedOn: "14 May 2024, 02:20 PM",
    status: "Resolved",
    slaHours: 48,
    assignedTo: "Sri. M. Sudhakar",
    escalationLevel: 1,
    beforePhoto: towerCircle,
    afterPhoto: towerCircle,
    beforePhotos: [ev(towerCircle, "Booth Colony, Ward 12", 18.0125, 79.135, "14 May 2024, 02:20 PM")],
    afterPhotos: [ev(towerCircle, "Booth Colony, Ward 12", 18.0125, 79.135, "15 May 2024, 04:30 PM")],
    citizenRating: 5,
    feedbackComment: "Tax receipt reconciled and updated on the citizen portal.",
    timeline: [
      { time: "14 May 2024, 02:20 PM", title: "Complaint Registered", note: "Payment reconciliation ticket logged", photo: towerCircle },
      { time: "14 May 2024, 04:00 PM", title: "Work in Progress", note: "Bank payment gateway transaction verified" },
      { time: "15 May 2024, 04:30 PM", title: "Work Completed", note: "Duplicate payment refunded and revised receipt generated", photo: towerCircle },
      { time: "15 May 2024, 05:00 PM", title: "Approved & Closed", note: "Verified and closed by Revenue Officer" },
    ],
  },

  // =========================================================================
  // 3. Town Planning Section (TPS) (Layouts, Building Permissions, Mutations)
  // =========================================================================
  {
    id: "APP-2024-27-0301",
    category: "Building Permissions",
    department: "Town Planning Section (TPS)",
    citizenId: "USR-CITIZEN-01",
    citizenName: "Smt. Lavanya Reddy",
    description: "Citizen Application for Building Permission (TG-bPASS Instant) for residential G+1 layout at Plot 42, Green Park Colony. Survey #418.",
    location: "Plot 42, Green Park Colony, Ward 27",
    wardId: 27,
    reportedOn: "19 May 2024, 10:15 AM",
    status: "In Progress",
    slaHours: 72,
    assignedTo: "Smt. D. Vani",
    escalationLevel: 1,
    beforePhoto: parkBefore,
    beforePhotos: [ev(parkBefore, "Plot 42, Green Park Colony, Ward 27", 17.986, 79.1188, "19 May 2024, 10:15 AM")],
    timeline: [
      { time: "19 May 2024, 10:15 AM", title: "Application Lodged", note: "TG-bPASS online application submitted with structural layout", photo: parkBefore },
      { time: "19 May 2024, 02:30 PM", title: "Site Scrutiny", note: "Town Planning Inspector verified plot coordinates and setbacks" },
    ],
  },
  {
    id: "GRV-2024-27-0301",
    category: "Building Permissions",
    department: "Town Planning Section (TPS)",
    description: "Unauthorized construction deviating from approved G+1 residential building plan",
    location: "Lane 4, Green Park Colony, Ward 27",
    wardId: 27,
    reportedOn: "19 May 2024, 11:45 AM",
    status: "Pending",
    slaHours: 72,
    assignedTo: "Smt. D. Vani",
    escalationLevel: 1,
    beforePhoto: parkBefore,
    beforePhotos: [ev(parkBefore, "Lane 4, Green Park Colony, Ward 27", 17.986, 79.1188, "19 May 2024, 11:45 AM")],
    timeline: [
      { time: "19 May 2024, 11:45 AM", title: "Complaint Registered", note: "Unauthorized construction violation flagged by colony residents", photo: parkBefore },
    ],
  },
  {
    id: "GRV-2024-27-0302",
    category: "Parks & Greening",
    department: "Town Planning Section (TPS)",
    description: "Colony municipal park walking track damaged and playground tree pruning required",
    location: "Municipal Park, Green Park Colony, Ward 27",
    wardId: 27,
    reportedOn: "18 May 2024, 04:10 PM",
    status: "In Progress",
    slaHours: 72,
    assignedTo: "Smt. D. Vani",
    escalationLevel: 1,
    beforePhoto: parkBefore,
    beforePhotos: [ev(parkBefore, "Municipal Park, Green Park Colony, Ward 27", 17.986, 79.1188, "18 May 2024, 04:10 PM")],
    timeline: [
      { time: "18 May 2024, 04:10 PM", title: "Complaint Registered", note: "Park beautification and maintenance requested", photo: parkBefore },
      { time: "19 May 2024, 09:00 AM", title: "Work in Progress", note: "Assigned to horticulture field crew for track repairs and tree pruning" },
    ],
  },
  {
    id: "GRV-2024-12-0308",
    category: "Building Permissions",
    department: "Town Planning Section (TPS)",
    description: "Road setback encroachment cleared and 30-feet colony approach road restored",
    location: "Booth Colony Sector B, Ward 12",
    wardId: 12,
    reportedOn: "13 May 2024, 10:00 AM",
    status: "Resolved",
    slaHours: 72,
    assignedTo: "Smt. D. Vani",
    escalationLevel: 1,
    beforePhoto: parkBefore,
    afterPhoto: parkAfter,
    beforePhotos: [ev(parkBefore, "Booth Colony Sector B, Ward 12", 18.0125, 79.135, "13 May 2024, 10:00 AM")],
    afterPhotos: [ev(parkAfter, "Booth Colony Sector B, Ward 12", 18.0125, 79.135, "16 May 2024, 03:00 PM")],
    citizenRating: 5,
    feedbackComment: "Encroachment removed quickly without disrupting colony movement.",
    timeline: [
      { time: "13 May 2024, 10:00 AM", title: "Complaint Registered", note: "Encroachment reported with survey boundary map", photo: parkBefore },
      { time: "14 May 2024, 11:30 AM", title: "Work in Progress", note: "Town Planning inspection team surveyed site and issued notice" },
      { time: "16 May 2024, 03:00 PM", title: "Work Completed", note: "Obstruction cleared and road setback restored", photo: parkAfter },
      { time: "16 May 2024, 05:00 PM", title: "Approved & Closed", note: "Verified by City Planner" },
    ],
  },

  // =========================================================================
  // 4. Sanitation Section (Solid Waste, Cleanliness, Public Health Fogging)
  // =========================================================================
  {
    id: "GRV-2024-27-0401",
    category: "Sanitation & Garbage",
    department: "Sanitation Section",
    description: "Overflowing commercial dump bin attracting stray animals near Santoshnagar market",
    location: "Santoshnagar Market Junction, Ward 27",
    wardId: 27,
    reportedOn: "20 May 2024, 07:30 AM",
    status: "Pending",
    slaHours: 48,
    assignedTo: "Ramesh (Field Staff)",
    escalationLevel: 1,
    beforePhoto: garbageBefore,
    beforePhotos: [ev(garbageBefore, "Santoshnagar Market, Ward 27", 17.9894, 79.1229, "20 May 2024, 07:30 AM")],
    timeline: [
      { time: "20 May 2024, 07:30 AM", title: "Complaint Registered", note: "Reported by local shopkeepers", photo: garbageBefore },
    ],
  },
  {
    id: "GRV-2024-27-0402",
    category: "Public Health & Fogging",
    department: "Sanitation Section",
    description: "Stagnant rainwater causing intense mosquito breeding — urgent thermal fogging required",
    location: "Near Substation, Green Park Colony, Ward 27",
    wardId: 27,
    reportedOn: "19 May 2024, 05:15 PM",
    status: "In Progress",
    slaHours: 48,
    assignedTo: "Ramesh (Field Staff)",
    escalationLevel: 1,
    beforePhoto: garbageBefore,
    beforePhotos: [ev(garbageBefore, "Near Substation, Ward 27", 17.986, 79.1188, "19 May 2024, 05:15 PM")],
    timeline: [
      { time: "19 May 2024, 05:15 PM", title: "Complaint Registered", note: "Public health request submitted", photo: garbageBefore },
      { time: "20 May 2024, 08:30 AM", title: "Work in Progress", note: "Sanitation team dispatched with thermal fogging machinery" },
    ],
  },
  {
    id: "GRV-2024-12-0405",
    category: "Sanitation & Garbage",
    department: "Sanitation Section",
    description: "Secondary garbage dump cleared and bio-spraying executed",
    location: "Satellite Colony Main Road, Ward 12",
    wardId: 12,
    reportedOn: "16 May 2024, 08:00 AM",
    status: "Resolved",
    slaHours: 48,
    assignedTo: "Kiran (Field Staff)",
    escalationLevel: 1,
    beforePhoto: garbageBefore,
    afterPhoto: garbageAfter,
    beforePhotos: [ev(garbageBefore, "Satellite Colony Main Road, Ward 12", 18.0125, 79.135, "16 May 2024, 08:00 AM")],
    afterPhotos: [ev(garbageAfter, "Satellite Colony Main Road, Ward 12", 18.0125, 79.135, "17 May 2024, 11:30 AM")],
    citizenRating: 5,
    feedbackComment: "Road is completely clean and disinfected.",
    timeline: [
      { time: "16 May 2024, 08:00 AM", title: "Complaint Registered", note: "Reported with site photo", photo: garbageBefore },
      { time: "16 May 2024, 10:00 AM", title: "Work in Progress", note: "Sanitation truck dispatched" },
      { time: "17 May 2024, 11:30 AM", title: "Work Completed", note: "Dump removed and after photo taken", photo: garbageAfter },
      { time: "17 May 2024, 02:00 PM", title: "Approved & Closed", note: "Verified by Sanitation Officer" },
    ],
  },

  // =========================================================================
  // 5. Statistics / Birth & Death Registration Section (Civil Registry)
  // =========================================================================
  {
    id: "GRV-2024-27-0501",
    category: "Birth & Death Registry",
    department: "Statistics / Birth & Death Registration Section",
    citizenId: "USR-CITIZEN-01",
    citizenName: "Smt. Lavanya Reddy",
    description: "Citizen Application for Digital Birth Certificate (QR Hologram) under civil registry file #MCK-BC-8921. Applicant: Smt. Lavanya Reddy.",
    location: "Citizen Seva Center, Green Park Colony, Ward 27",
    wardId: 27,
    reportedOn: "19 May 2024, 03:00 PM",
    status: "In Progress",
    slaHours: 48,
    assignedTo: "Sri. B. Anjaneyulu",
    escalationLevel: 1,
    beforePhoto: kmcBuilding,
    beforePhotos: [ev(kmcBuilding, "Citizen Seva Center, Ward 27", 17.986, 79.1188, "19 May 2024, 03:00 PM")],
    timeline: [
      { time: "19 May 2024, 03:00 PM", title: "Application Registered", note: "Hospital birth registration #MCH-8921 verified by applicant", photo: kmcBuilding },
      { time: "19 May 2024, 04:30 PM", title: "Civil Record Verified", note: "Civil Registrar Sri. B. Anjaneyulu initiated digital seal verification" },
    ],
  },
  {
    id: "GRV-2024-27-0502",
    category: "Birth & Death Registry",
    department: "Statistics / Birth & Death Registration Section",
    description: "Spelling correction in child name on civil registry birth record #BR-2024-412",
    location: "Ward Citizen Helpdesk, Green Park Colony, Ward 27",
    wardId: 27,
    reportedOn: "18 May 2024, 09:30 AM",
    status: "In Progress",
    slaHours: 48,
    assignedTo: "Sri. B. Anjaneyulu",
    escalationLevel: 1,
    beforePhoto: kmcBuilding,
    beforePhotos: [ev(kmcBuilding, "Ward Helpdesk, Green Park Colony, Ward 27", 17.986, 79.1188, "18 May 2024, 09:30 AM")],
    timeline: [
      { time: "18 May 2024, 09:30 AM", title: "Complaint Registered", note: "Correction affidavit submitted by parents", photo: kmcBuilding },
      { time: "18 May 2024, 11:45 AM", title: "Work in Progress", note: "Civil Registrar initiated hospital record reconciliation" },
    ],
  },
  {
    id: "APP-2024-27-0503",
    category: "Death Registration Certificate",
    department: "Statistics / Birth & Death Registration Section",
    citizenId: "USR-CITIZEN-01",
    citizenName: "Smt. Lavanya Reddy",
    description: "Citizen Application for Death Registration Certificate with hospital verification & digital seal for Late Sri. R. Narayana. Hospital Death Reg #MCH-D-2024-0419. Applicant: Smt. Lavanya Reddy.",
    location: "Ward Citizen Helpdesk, Green Park Colony, Ward 27",
    wardId: 27,
    reportedOn: "20 May 2024, 10:15 AM",
    status: "Pending",
    slaHours: 48,
    assignedTo: "Sri. B. Anjaneyulu",
    escalationLevel: 1,
    beforePhoto: kmcBuilding,
    beforePhotos: [ev(kmcBuilding, "Ward Helpdesk, Green Park Colony, Ward 27", 17.986, 79.1188, "20 May 2024, 10:15 AM")],
    timeline: [
      { time: "20 May 2024, 10:15 AM", title: "Application Registered", note: "Hospital death record #MCH-D-2024-0419 submitted online by applicant Smt. Lavanya Reddy", photo: kmcBuilding },
      { time: "20 May 2024, 10:30 AM", title: "Assigned to Civil Registrar", note: "Assigned to Sri. B. Anjaneyulu for civil registry validation" },
    ],
  },
  {
    id: "GRV-2024-12-0504",
    category: "Birth & Death Registry",
    department: "Statistics / Birth & Death Registration Section",
    description: "Death registration certified and official bilingual digital certificate issued with QR code",
    location: "Municipal Citizen Kiosk, Ward 12",
    wardId: 12,
    reportedOn: "15 May 2024, 11:00 AM",
    status: "Resolved",
    slaHours: 48,
    assignedTo: "Sri. B. Anjaneyulu",
    escalationLevel: 1,
    beforePhoto: kmcBuilding,
    afterPhoto: kmcBuilding,
    beforePhotos: [ev(kmcBuilding, "Municipal Citizen Kiosk, Ward 12", 18.0125, 79.135, "15 May 2024, 11:00 AM")],
    afterPhotos: [ev(kmcBuilding, "Municipal Citizen Kiosk, Ward 12", 18.0125, 79.135, "16 May 2024, 02:15 PM")],
    citizenRating: 5,
    feedbackComment: "Certificate received digitally in WhatsApp and portal.",
    timeline: [
      { time: "15 May 2024, 11:00 AM", title: "Complaint Registered", note: "Civil death record correction ticket logged", photo: kmcBuilding },
      { time: "15 May 2024, 02:00 PM", title: "Work in Progress", note: "Medical death certificate verified" },
      { time: "16 May 2024, 02:15 PM", title: "Work Completed", note: "Digitally signed certificate issued", photo: kmcBuilding },
      { time: "16 May 2024, 04:00 PM", title: "Approved & Closed", note: "Closed by Civil Registrar" },
    ],
  },

  // =========================================================================
  // 6. Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)
  // =========================================================================
  {
    id: "GRV-2024-27-0601",
    category: "Urban Welfare & Asara",
    department: "Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)",
    citizenId: "USR-CITIZEN-01",
    citizenName: "Smt. Lavanya Reddy",
    description: "Citizen Application for Asara Social Security Senior Citizen Pension file #ASR-KNR-5541 with DBT Aadhaar linkage. Applicant: Smt. Lavanya Reddy.",
    location: "Community Hall, Green Park Colony, Ward 27",
    wardId: 27,
    reportedOn: "19 May 2024, 04:00 PM",
    status: "Pending",
    slaHours: 72,
    assignedTo: "Smt. K. Madhavi",
    escalationLevel: 1,
    beforePhoto: kmcBuilding,
    beforePhotos: [ev(kmcBuilding, "Community Hall, Ward 27", 17.986, 79.1188, "19 May 2024, 04:00 PM")],
    timeline: [
      { time: "19 May 2024, 04:00 PM", title: "Application Registered", note: "Pension eligibility application and Aadhaar biometric linkage submitted", photo: kmcBuilding },
    ],
  },
  {
    id: "GRV-2024-27-0602",
    category: "Urban Welfare & Asara",
    department: "Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)",
    description: "MEPMA Self-Help Group (SHG) revolving fund subsidy bank linkage facilitation",
    location: "Mahila Bhavan, Green Park Colony, Ward 27",
    wardId: 27,
    reportedOn: "18 May 2024, 02:30 PM",
    status: "In Progress",
    slaHours: 72,
    assignedTo: "Smt. K. Madhavi",
    escalationLevel: 1,
    beforePhoto: kmcBuilding,
    beforePhotos: [ev(kmcBuilding, "Mahila Bhavan, Ward 27", 17.986, 79.1188, "18 May 2024, 02:30 PM")],
    timeline: [
      { time: "18 May 2024, 02:30 PM", title: "Complaint Registered", note: "SHG subsidy release documentation submitted", photo: kmcBuilding },
      { time: "19 May 2024, 10:00 AM", title: "Work in Progress", note: "Project Director coordinated with Lead District Bank" },
    ],
  },
  {
    id: "GRV-2024-12-0604",
    category: "Urban Welfare & Asara",
    department: "Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)",
    description: "PM SVANidhi urban street vendor ID card registration & vending certificate issued",
    location: "Booth Colony Slum Livelihood Center, Ward 12",
    wardId: 12,
    reportedOn: "14 May 2024, 01:15 PM",
    status: "Resolved",
    slaHours: 72,
    assignedTo: "Smt. K. Madhavi",
    escalationLevel: 1,
    beforePhoto: kmcBuilding,
    afterPhoto: kmcBuilding,
    beforePhotos: [ev(kmcBuilding, "Booth Colony Slum Center, Ward 12", 18.0125, 79.135, "14 May 2024, 01:15 PM")],
    afterPhotos: [ev(kmcBuilding, "Booth Colony Slum Center, Ward 12", 18.0125, 79.135, "16 May 2024, 05:00 PM")],
    citizenRating: 5,
    feedbackComment: "Vendor certificate and identity card generated successfully.",
    timeline: [
      { time: "14 May 2024, 01:15 PM", title: "Complaint Registered", note: "Street vendor registration ticket opened", photo: kmcBuilding },
      { time: "15 May 2024, 09:30 AM", title: "Work in Progress", note: "MEPMA Town Level Federation verified vending location" },
      { time: "16 May 2024, 05:00 PM", title: "Work Completed", note: "Vending certificate and QR badge delivered", photo: kmcBuilding },
      { time: "16 May 2024, 05:30 PM", title: "Approved & Closed", note: "Verified by Project Director" },
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
  {
    id: "TASK-07",
    task: "Biometric muster roll sync & ward staff roster regularization",
    assignedTo: "Sri. K. Chandrashekar",
    role: "Administrative Officer",
    departmentId: "establishment",
    dueDate: "22 May 2024",
    status: "In Progress",
    wardId: 27,
    grievanceId: "GRV-2024-27-0111",
  },
  {
    id: "TASK-08",
    task: "Conduct door-to-door property tax measurement & assessment review",
    assignedTo: "Sri. M. Sudhakar",
    role: "Revenue Inspector",
    departmentId: "revenue",
    dueDate: "21 May 2024",
    status: "Pending",
    wardId: 27,
    grievanceId: "GRV-2024-27-0201",
  },
  {
    id: "TASK-09",
    task: "Inspect 30ft master plan setback deviation and encroachment notice",
    assignedTo: "Sri. P. Ravinder",
    role: "Town Planning Officer",
    departmentId: "town-planning",
    dueDate: "21 May 2024",
    status: "In Progress",
    wardId: 27,
    grievanceId: "GRV-2024-27-0301",
  },
  {
    id: "TASK-10",
    task: "Deploy anti-larval thermal fogging & drain bleaching team",
    assignedTo: "Dr. B. Venkanna",
    role: "Sanitation Inspector",
    departmentId: "sanitation",
    dueDate: "20 May 2024",
    status: "Pending",
    wardId: 27,
    grievanceId: "GRV-2024-27-0402",
  },
  {
    id: "TASK-11",
    task: "Issue QR hologram verified digitised birth certificate",
    assignedTo: "Sri. B. Anjaneyulu",
    role: "Civil Registrar",
    departmentId: "statistics",
    dueDate: "21 May 2024",
    status: "In Progress",
    wardId: 27,
    grievanceId: "GRV-2024-27-0501",
  },
  {
    id: "TASK-12",
    task: "Physical verification of Asara disability pension applicant file",
    assignedTo: "Smt. K. Madhavi",
    role: "Project Director",
    departmentId: "urban-welfare",
    dueDate: "22 May 2024",
    status: "Pending",
    wardId: 27,
    grievanceId: "GRV-2024-27-0601",
  },
  {
    id: "TASK-13",
    task: "Culvert retaining wall reconstruction and storm slab repair",
    assignedTo: "Venkatesh (Field Staff)",
    assignedFieldStaffId: "USR-FIELD-05",
    role: "Field Staff",
    departmentId: "engineering",
    dueDate: "21 May 2024",
    status: "In Progress",
    wardId: 27,
    grievanceId: "GRV-2024-27-0050",
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
