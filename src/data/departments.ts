export interface DepartmentInfo {
  id: string;
  name: string;
  scope: string[];
  head: string;
  resolutionRate: number;
  complaintShare: number; // percentage in leadership overview
  color: string;
}

export type Department = DepartmentInfo;

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: "water-supply",
    name: "Water Supply",
    scope: ["Water Supply", "Leakage", "Pipe Maintenance"],
    head: "Executive Engineer (Water Works)",
    resolutionRate: 75,
    complaintShare: 15,
    color: "#0288D1",
  },
  {
    id: "engineering",
    name: "Engineering",
    scope: ["Roads", "Buildings", "Drainage", "Bridges"],
    head: "Superintending Engineer",
    resolutionRate: 68,
    complaintShare: 30,
    color: "#F57C00",
  },
  {
    id: "sanitation",
    name: "Sanitation",
    scope: ["Garbage Collection", "Cleaning", "Waste Management"],
    head: "Chief Sanitation Officer",
    resolutionRate: 82,
    complaintShare: 25,
    color: "#2E7D32",
  },
  {
    id: "electrical",
    name: "Electrical",
    scope: ["Street Lights", "Electrical Maintenance"],
    head: "Divisional Electrical Engineer",
    resolutionRate: 75,
    complaintShare: 10,
    color: "#FBC02D",
  },
  {
    id: "town-planning",
    name: "Town Planning",
    scope: ["Building Approval", "Land Use", "Layout Planning"],
    head: "City Planner",
    resolutionRate: 70,
    complaintShare: 10,
    color: "#7B1FA2",
  },
  {
    id: "revenue",
    name: "Revenue",
    scope: ["Property Tax", "Trade License", "Land Records", "Collections"],
    head: "Revenue Officer",
    resolutionRate: 84,
    complaintShare: 10,
    color: "#00897B",
  },
  {
    id: "health",
    name: "Health",
    scope: ["Public Health", "Disease Control", "Health Services"],
    head: "Municipal Health Officer",
    resolutionRate: 78,
    complaintShare: 10,
    color: "#E53935",
  },
  {
    id: "it-data",
    name: "IT & Data Management",
    scope: ["System Management", "Data Analytics", "Reporting"],
    head: "Chief Information Officer",
    resolutionRate: 92,
    complaintShare: 5,
    color: "#3949AB",
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
