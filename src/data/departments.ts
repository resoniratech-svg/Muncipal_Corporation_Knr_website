export interface DepartmentInfo {
  id: string;
  name: string;
  scope: string[];
  head: string;
  description: string;
  resolutionRate: number;
  complaintShare: number; // percentage in leadership overview
  color: string;
}

export type Department = DepartmentInfo;

/**
 * The 7 Core Administrative Departments / Sections of Municipal Corporation of Karimnagar (MCK), Telangana:
 * 1. Establishment Section
 * 2. Revenue Section
 * 3. Engineering Section
 * 4. Town Planning Section (TPS)
 * 5. Sanitation Section
 * 6. Statistics / Birth & Death Registration Section
 * 7. Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)
 */
export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: "establishment",
    name: "Establishment Section",
    scope: [
      "General Administration",
      "Human Resources",
      "Municipal Staff Postings",
      "Inner Corporate Affairs",
      "Council Affairs"
    ],
    head: "Administrative Officer / Municipal Secretary",
    description: "Manages general administration, human resources, municipal staff postings, and inner corporate affairs.",
    resolutionRate: 88,
    complaintShare: 8,
    color: "#3949AB",
  },
  {
    id: "revenue",
    name: "Revenue Section",
    scope: [
      "Property Tax (House Tax)",
      "Vacant Land Tax (VLT)",
      "Municipal Revenue Evaluations",
      "Trade Licenses",
      "Tax Assessments"
    ],
    head: "Revenue Officer (RO)",
    description: "Responsible for collecting local taxes, including Property Tax (House Tax), Vacant Land Tax (VLT), and municipal revenue evaluations.",
    resolutionRate: 84,
    complaintShare: 14,
    color: "#00897B",
  },
  {
    id: "engineering",
    name: "Engineering Section",
    scope: [
      "Public Works",
      "City Infrastructure Development",
      "Road Layout & Repairs",
      "Water Supply Planning",
      "Street Lighting Networks",
      "Drainage & Bridges"
    ],
    head: "Superintending Engineer (SE)",
    description: "Oversees public works, city infrastructure development, road layout and repairs, water supply planning, and street lighting networks.",
    resolutionRate: 72,
    complaintShare: 32,
    color: "#F57C00",
  },
  {
    id: "town-planning",
    name: "Town Planning Section (TPS)",
    scope: [
      "City Layouts",
      "Building Permissions",
      "Anti-Encroachment Actions",
      "Mutations",
      "Master Plan Compliance"
    ],
    head: "City Planner / TPS",
    description: "Regulates city layouts, manages Building Permissions, acts against unauthorized structures, and processes mutations.",
    resolutionRate: 70,
    complaintShare: 12,
    color: "#7B1FA2",
  },
  {
    id: "sanitation",
    name: "Sanitation Section",
    scope: [
      "City Cleanliness Programs",
      "Solid Waste Management",
      "Sewage Upkeep",
      "Public Health Cleaning Protocols",
      "Anti-Mosquito Fogging"
    ],
    head: "Chief Sanitation Officer / Health Officer",
    description: "Directs city cleanliness programs, solid waste management, sewage upkeep, and public health cleaning protocols.",
    resolutionRate: 85,
    complaintShare: 22,
    color: "#2E7D32",
  },
  {
    id: "statistics",
    name: "Statistics / Birth & Death Registration Section",
    scope: [
      "Birth Registration & Certificates",
      "Death Registration & Certificates",
      "Civil Registry",
      "Vital Statistics Records",
      "Citizen Certificates"
    ],
    head: "Statistical Officer / Civil Registrar",
    description: "Manages civil registry work including issuing unified certificates for births and deaths within municipal limits.",
    resolutionRate: 94,
    complaintShare: 6,
    color: "#0288D1",
  },
  {
    id: "urban-welfare",
    name: "Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)",
    scope: [
      "MEPMA Initiatives",
      "Asara Pensions",
      "Self-Help Groups (SHG)",
      "Urban Poverty Alleviation",
      "Livelihood Programs"
    ],
    head: "Project Director (MEPMA) / Welfare Officer",
    description: "Works alongside state initiatives like the Mission for Elimination of Poverty in Municipal Areas (MEPMA) and distributes welfare programs like the Asara pension.",
    resolutionRate: 90,
    complaintShare: 6,
    color: "#E53935",
  },
];

export const ESCALATION_LADDER = [
  {
    level: 1,
    title: "Field Staff",
    target: "2 Days",
    roleDescription: "Receives and acts on grievance. Escalate if not resolved.",
    officerDesignation: "Assistant Engineer / Sanitary Inspector / Lineman",
    color: "bg-blue-700",
  },
  {
    level: 2,
    title: "Department Officer",
    target: "5 Days",
    roleDescription: "Reviews and ensures resolution. Escalate if not resolved.",
    officerDesignation: "Executive Engineer / Health Officer / Electrical Inspector",
    color: "bg-amber-700",
  },
  {
    level: 3,
    title: "Head of Department",
    target: "7 Days",
    roleDescription: "Monitors and directs for resolution. Escalate if not resolved.",
    officerDesignation: "Superintending Engineer / Chief Medical Officer / City Planner",
    color: "bg-orange-700",
  },
  {
    level: 4,
    title: "Municipal Commissioner",
    target: "10 Days",
    roleDescription: "Intervenes and ensures closure. Escalate if not resolved.",
    officerDesignation: "Municipal Commissioner, KMC",
    color: "bg-red-700",
  },
  {
    level: 5,
    title: "Mayor / Council",
    target: "As Required",
    roleDescription: "Final oversight and policy directive.",
    officerDesignation: "Hon'ble Mayor, Karimnagar Municipal Corporation",
    color: "bg-purple-600",
  },
];

export const ESCALATION_TRIGGERS = [
  "No action within prescribed time",
  "Unsatisfactory resolution",
  "Repeated grievances on same issue",
  "Citizen dissatisfaction (low rating)",
  "Critical / High impact issues",
];
