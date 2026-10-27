export interface KpiMetric {
  name: string;
  value: string;
  delta: string;
  deltaType: 'positive' | 'negative';
  ward27Value: number;
  cityAvgValue: number;
  unit: string;
}

export interface ActionPlanItem {
  kpi: string;
  current: string;
  target: string;
  actionPlan: string;
  department: string;
  deadline: string;
}

export const WARD_27_KPIS: KpiMetric[] = [
  { name: "Average Resolution Time", value: "2.4 Days", delta: "↓15% vs Apr 2024", deltaType: "positive", ward27Value: 2.4, cityAvgValue: 3.5, unit: "Days" },
  { name: "Issues Resolved", value: "86%", delta: "↑8%", deltaType: "positive", ward27Value: 86, cityAvgValue: 72, unit: "%" },
  { name: "Quality of Work (Citizen Rating)", value: "4.3 / 5", delta: "↑0.4", deltaType: "positive", ward27Value: 4.3, cityAvgValue: 3.8, unit: "★/5" },
  { name: "Budget Utilization", value: "78%", delta: "↑12%", deltaType: "positive", ward27Value: 78, cityAvgValue: 65, unit: "%" },
  { name: "Cleanliness & Infrastructure Score", value: "80%", delta: "↑10%", deltaType: "positive", ward27Value: 80, cityAvgValue: 68, unit: "%" },
];

export const KPI_TRENDS_6_MONTHS = [
  { month: "Dec 2023", resolutionDays: 3.6, issuesResolvedPct: 70, qualityRating: 3.6, budgetUtilPct: 55, cleanlinessScore: 66 },
  { month: "Jan 2024", resolutionDays: 3.3, issuesResolvedPct: 74, qualityRating: 3.8, budgetUtilPct: 60, cleanlinessScore: 70 },
  { month: "Feb 2024", resolutionDays: 3.0, issuesResolvedPct: 78, qualityRating: 3.9, budgetUtilPct: 65, cleanlinessScore: 72 },
  { month: "Mar 2024", resolutionDays: 2.8, issuesResolvedPct: 80, qualityRating: 4.0, budgetUtilPct: 70, cleanlinessScore: 75 },
  { month: "Apr 2024", resolutionDays: 2.8, issuesResolvedPct: 80, qualityRating: 3.9, budgetUtilPct: 66, cleanlinessScore: 70 },
  { month: "May 2024", resolutionDays: 2.4, issuesResolvedPct: 86, qualityRating: 4.3, budgetUtilPct: 78, cleanlinessScore: 80 },
];

export const TOP_5_PAGE_8 = [
  { rank: 1, ward: "Ward 12", score: 91, performance: "Excellent" },
  { rank: 2, ward: "Ward 27 (You)", score: 85, performance: "Very Good" },
  { rank: 3, ward: "Ward 33", score: 78, performance: "Good" },
  { rank: 4, ward: "Ward 18", score: 67, performance: "Average" },
  { rank: 5, ward: "Ward 45", score: 55, performance: "Needs Improvement" },
];

export const ACTION_PLAN_PAGE_8: ActionPlanItem[] = [
  {
    kpi: "Grievance Resolution Time",
    current: "2.4 Days",
    target: "≤ 2 Days",
    actionPlan: "Improve field response & faster escalation",
    department: "Sanitation Department",
    deadline: "30 Jun 2024",
  },
  {
    kpi: "Issues Resolved",
    current: "86%",
    target: "≥ 90%",
    actionPlan: "Increase manpower & monitor pending cases",
    department: "Health Department",
    deadline: "30 Jun 2024",
  },
  {
    kpi: "Quality of Work",
    current: "4.3 / 5",
    target: "≥ 4.5 / 5",
    actionPlan: "Ensure quality checks & citizen feedback",
    department: "Engineering Department",
    deadline: "30 Jun 2024",
  },
  {
    kpi: "Budget Utilization",
    current: "78%",
    target: "≥ 90%",
    actionPlan: "Plan better & avoid fund under-utilization",
    department: "Finance Department",
    deadline: "30 Jun 2024",
  },
  {
    kpi: "Cleanliness & Infra. Score",
    current: "80%",
    target: "≥ 90%",
    actionPlan: "Increase cleaning frequency & maintenance",
    department: "Sanitation Department",
    deadline: "30 Jun 2024",
  },
];

export const RANKING_TABLE_PAGE_9 = [
  { rank: 1, name: "Ward 27 – Green Park Colony", score: 89, grade: "A+", level: "Excellent", trend: "↑5", trendType: "up" },
  { rank: 2, name: "Ward 12 – Satellite Colony", score: 86, grade: "A", level: "Very Good", trend: "↑3", trendType: "up" },
  { rank: 3, name: "Ward 33 – Huzurabad Road", score: 78, grade: "B+", level: "Good", trend: "↑2", trendType: "up" },
  { rank: 4, name: "Ward 18 – Ramakrishna Nagar", score: 64, grade: "B", level: "Average", trend: "↓1", trendType: "down" },
  { rank: 5, name: "Ward 45 – LMD Colony", score: 52, grade: "C", level: "Needs Improvement", trend: "↓3", trendType: "down" },
  { rank: 6, name: "Ward 39 – Housing Board Colony", score: 47, grade: "C", level: "Poor", trend: "↓2", trendType: "down" },
  { rank: 7, name: "Ward 22 – Kaman", score: 41, grade: "D", level: "Poor", trend: "–", trendType: "neutral" },
];

export const PERFORMANCE_DISTRIBUTION_66 = [
  { name: "Excellent (A+)", percentage: 20, count: 13, color: "#2E7D32" },
  { name: "Very Good (A)", percentage: 30, count: 20, color: "#7CB342" },
  { name: "Good (B+)", percentage: 25, count: 17, color: "#0288D1" },
  { name: "Average (B)", percentage: 15, count: 10, color: "#F57C00" },
  { name: "Needs Improvement (C/D)", percentage: 10, count: 6, color: "#D32F2F" },
];

export const UNDERPERFORMING_WARDS = [
  {
    ward: "Ward 45 – LMD Colony",
    score: 52,
    concerns: "Grievance Resolution, Cleanliness, Budget Utilization",
    action: "Intensive Monitoring, Department Coordination, Weekly Review",
  },
  {
    ward: "Ward 39 – Housing Board Colony",
    score: 47,
    concerns: "Infrastructure Maintenance, Citizen Feedback",
    action: "Field Inspection, Resource Allocation, Performance Review",
  },
  {
    ward: "Ward 22 – Kaman",
    score: 41,
    concerns: "Grievance Resolution, Quality of Work",
    action: "Corrective Action Plan, Capacity Building, Close Monitoring",
  },
];
