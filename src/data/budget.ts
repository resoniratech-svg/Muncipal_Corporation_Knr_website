export interface DepartmentBudget {
  department: string;
  budgetCr: number;
  utilizedCr: number;
  percentage: number;
}

export type DepartmentExpenditure = DepartmentBudget;
export type ProjectItem = WardProject;
export type BudgetSummary = typeof BUDGET_PAGE_5_LEADERSHIP;

export const DEPARTMENT_EXPENDITURE_PAGE_2: DepartmentBudget[] = [
  { department: "Engineering", budgetCr: 46.0, utilizedCr: 34.5, percentage: 77 },
  { department: "Sanitation", budgetCr: 30.0, utilizedCr: 24.0, percentage: 80 },
  { department: "Water Supply", budgetCr: 25.0, utilizedCr: 18.5, percentage: 74 },
  { department: "Health", budgetCr: 20.0, utilizedCr: 15.0, percentage: 75 },
  { department: "Others", budgetCr: 30.0, utilizedCr: 23.0, percentage: 77 },
];

export const DEPARTMENT_EXPENDITURE_PAGE_5: DepartmentBudget[] = [
  { department: "Sanitation", budgetCr: 55.0, utilizedCr: 45.1, percentage: 82 },
  { department: "Roads", budgetCr: 48.0, utilizedCr: 36.5, percentage: 76 },
  { department: "Water Supply", budgetCr: 42.0, utilizedCr: 31.5, percentage: 75 },
  { department: "Street Lights", budgetCr: 25.0, utilizedCr: 18.8, percentage: 75 },
  { department: "Engineering", budgetCr: 45.0, utilizedCr: 30.6, percentage: 68 },
];

export const DEPARTMENT_EXPENDITURE_HARMONIZED: DepartmentBudget[] = [
  { department: "Engineering & Roads", budgetCr: 75.0, utilizedCr: 54.0, percentage: 72 },
  { department: "Sanitation & Health", budgetCr: 65.0, utilizedCr: 52.0, percentage: 80 },
  { department: "Water Supply", budgetCr: 50.0, utilizedCr: 38.0, percentage: 76 },
  { department: "Electrical & Lighting", budgetCr: 35.0, utilizedCr: 26.0, percentage: 74 },
  { department: "Town Planning & Revenue", budgetCr: 40.0, utilizedCr: 28.0, percentage: 70 },
];

export interface WardProject {
  id: string;
  name: string;
  wardId: number;
  status: 'In Progress' | 'Completed' | 'Planned';
  progress: number;
  budgetLakhs: number;
  completionDate: string;
  image?: string;
  location?: string;
}

export const BUDGET_PAGE_1 = {
  totalBudgetCr: 350,
  allocatedCr: 350,
  utilizedCr: 215,
  balanceCr: 135,
  percentage: 61,
};

export const BUDGET_PAGE_2_DEPARTMENTS: DepartmentBudget[] = [
  { department: "Engineering", budgetCr: 46.0, utilizedCr: 34.5, percentage: 77 },
  { department: "Sanitation", budgetCr: 30.0, utilizedCr: 24.0, percentage: 80 },
  { department: "Water Supply", budgetCr: 25.0, utilizedCr: 18.5, percentage: 74 },
  { department: "Health", budgetCr: 20.0, utilizedCr: 15.0, percentage: 75 },
  { department: "Others", budgetCr: 30.0, utilizedCr: 23.0, percentage: 77 },
];

export const BUDGET_PAGE_5_LEADERSHIP = {
  totalBudgetCr: 215,
  allocatedCr: 215,
  utilizedCr: 138,
  balanceCr: 77,
  percentage: 64,
};

export const BUDGET_HARMONIZED = {
  totalBudgetCr: 315,
  allocatedCr: 315,
  utilizedCr: 215,
  balanceCr: 100,
  percentage: 68,
};

export const WARD_27_PROJECTS: WardProject[] = [
  { 
    id: "PRJ-01", 
    name: "Drainage Improvement", 
    wardId: 27, 
    status: "In Progress", 
    progress: 70, 
    budgetLakhs: 45.00, 
    completionDate: "Jun 2024",
    image: "images/field-evidence/sanitation-work.jpg",
    location: "Green Park Colony, Ward 27"
  },
  { 
    id: "PRJ-02", 
    name: "Street Light Installation", 
    wardId: 27, 
    status: "Completed", 
    progress: 100, 
    budgetLakhs: 22.50, 
    completionDate: "Apr 2024",
    image: "images/civic-works/street-lighting.jpg",
    location: "Main Arterial Avenue, Ward 27"
  },
  { 
    id: "PRJ-03", 
    name: "Road Repair & Maintenance", 
    wardId: 27, 
    status: "In Progress", 
    progress: 40, 
    budgetLakhs: 38.00, 
    completionDate: "Jul 2024",
    image: "images/civic-works/cable-bridge.jpg",
    location: "River Link Road, Ward 27"
  },
  { 
    id: "PRJ-04", 
    name: "Park Development", 
    wardId: 27, 
    status: "Planned", 
    progress: 0, 
    budgetLakhs: 30.00, 
    completionDate: "Aug 2024",
    image: "images/parks-projects/urban-park.jpg",
    location: "Community Center Park, Ward 27"
  },
];
