import { DepartmentName } from './grievances';

export interface StaffCategory {
  id: string;
  name: string;
  departmentId: string;
  departmentName: DepartmentName;
  description: string;
  matchedGrievanceCategories: string[];
  skills: string[];
  slaHours: number;
}

export const DEFAULT_STAFF_CATEGORIES: StaffCategory[] = [
  {
    id: 'electrician',
    name: 'Electrician / Streetlight Technician',
    departmentId: 'engineering',
    departmentName: 'Engineering Section',
    description: 'Streetlight maintenance, electrical pole servicing, wiring, timer controls, and transformer safety inspection',
    matchedGrievanceCategories: ['Street Lights', 'Streetlights', 'Electrical', 'Street Light Not Working', 'Light', 'Power'],
    skills: ['Streetlight Repair', 'Wiring & Line Testing', 'Power Pole Maintenance', 'Electrical Safety'],
    slaHours: 48,
  },
  {
    id: 'drainage-worker',
    name: 'Drainage Worker',
    departmentId: 'engineering',
    departmentName: 'Engineering Section',
    description: 'Underground drainage, desilting, stormwater culvert clearance, sewer unclogging, and manhole cover replacement',
    matchedGrievanceCategories: ['Drainage', 'Drain', 'Drainage Issue', 'Drain Overflow', 'Sewerage', 'Manhole', 'Culvert'],
    skills: ['Drainage Desilting', 'Sewer Unclogging', 'Culvert Clearance', 'Manhole Cover Repair'],
    slaHours: 72,
  },
  {
    id: 'sanitation-worker',
    name: 'Sanitation Worker',
    departmentId: 'sanitation',
    departmentName: 'Sanitation Section',
    description: 'Municipal garbage collection, roadside sweeping, commercial waste clearance, open dump removal, and secondary transport',
    matchedGrievanceCategories: ['Garbage', 'Sanitation', 'Waste', 'Garbage Dump', 'Solid Waste', 'Cleaning', 'Litter'],
    skills: ['Garbage Clearance', 'Waste Segregation', 'Street Sweeping', 'Dump Disinfection'],
    slaHours: 48,
  },
  {
    id: 'road-repair-worker',
    name: 'Road Repair Worker',
    departmentId: 'engineering',
    departmentName: 'Engineering Section',
    description: 'Asphalt patching, pothole filling, bitumen road leveling, paver block repairs, and curb restoration',
    matchedGrievanceCategories: ['Roads', 'Road', 'Road Potholes', 'Potholes', 'Pothole', 'Tar Road', 'Curb'],
    skills: ['Pothole Patching', 'Asphalt Laying', 'Road Surfacing', 'Paver Blocks'],
    slaHours: 72,
  },
  {
    id: 'water-technician',
    name: 'Water Supply Technician',
    departmentId: 'engineering',
    departmentName: 'Engineering Section',
    description: 'Drinking water pipeline leaks, sluice valve servicing, water distribution pressure regulation, and pump maintenance',
    matchedGrievanceCategories: ['Water Supply', 'Water', 'Water Pipe Leakage', 'Pipeline Leakage', 'Water Contamination', 'Low Pressure'],
    skills: ['Pipeline Repair', 'Valve Replacement', 'Leak Detection', 'Pressure Regulation'],
    slaHours: 24,
  },
  {
    id: 'public-health-worker',
    name: 'Public Health / Pest Control Worker',
    departmentId: 'sanitation',
    departmentName: 'Sanitation Section',
    description: 'Vector-borne disease control, mosquito fogging, anti-larval spraying, public sanitary disinfection, and rodent control',
    matchedGrievanceCategories: ['Public Health', 'Health', 'Pest Control', 'Mosquito', 'Fogging', 'Sanitary Spraying', 'Disease Control'],
    skills: ['Vector Control', 'Mosquito Fogging', 'Larvicide Spraying', 'Sanitary Inspection'],
    slaHours: 24,
  },
  {
    id: 'parks-worker',
    name: 'Parks and Horticulture Worker',
    departmentId: 'town-planning',
    departmentName: 'Town Planning Section (TPS)',
    description: 'Public garden maintenance, municipal park greenery, tree pruning, lawn maintenance, and play equipment upkeep',
    matchedGrievanceCategories: ['Parks', 'Horticulture', 'Greenery', 'Tree Pruning', 'Garden', 'Play Equipment', 'Park'],
    skills: ['Tree Pruning', 'Garden Maintenance', 'Irrigation Systems', 'Play Equipment Upkeep'],
    slaHours: 72,
  },
  {
    id: 'civil-maintenance-worker',
    name: 'Civil Maintenance Worker',
    departmentId: 'engineering',
    departmentName: 'Engineering Section',
    description: 'Municipal building repairs, pedestrian footpath restoration, divider repair, masonry, and public infrastructure works',
    matchedGrievanceCategories: ['Civil Maintenance', 'Footpath', 'Buildings', 'Bridges', 'Dividers', 'Other', 'other'],
    skills: ['Footpath Restoration', 'Masonry & Concrete', 'Divider Repair', 'Civil Infrastructure'],
    slaHours: 72,
  },
  {
    id: 'revenue-inspector',
    name: 'Revenue Inspector / Bill Collector',
    departmentId: 'revenue',
    departmentName: 'Revenue Section',
    description: 'Property tax assessment, door-to-door measurement verification, vacant land tax (VLT) inspection, and trade license verification',
    matchedGrievanceCategories: ['Property Tax', 'House Tax', 'Tax', 'Revenue', 'Vacant Land Tax', 'VLT', 'Trade License', 'Assessment', 'Demand Notice', 'Property tax assessment revision request'],
    skills: ['Tax Assessment Verification', 'Door-to-Door Measurement', 'VLT Demarcation', 'Trade License Inspection', 'Demand Verification'],
    slaHours: 48,
  },
  {
    id: 'town-planning-inspector',
    name: 'Town Planning Building Inspector',
    departmentId: 'town-planning',
    departmentName: 'Town Planning Section (TPS)',
    description: 'TG-bPASS instant/regular building permission verification, layout demarcation, setback inspection, and unauthorized construction enforcement',
    matchedGrievanceCategories: ['Building Permissions', 'Building Permission', 'TG-bPASS', 'Town Planning', 'Mutation', 'Layout', 'Setback', 'Encroachment', 'Unauthorized Construction', 'Building Permission (TG-bPASS Instant / Regular)'],
    skills: ['TG-bPASS Site Inspection', 'Setback Measurement', 'Structural Encroachment Survey', 'Layout Verification'],
    slaHours: 72,
  },
  {
    id: 'civil-registrar-inspector',
    name: 'Civil Registry Field Verifier',
    departmentId: 'statistics',
    departmentName: 'Statistics / Birth & Death Registration Section',
    description: 'Civil birth & death hospital record verification, institutional register reconciliation, and physical certificate field validation',
    matchedGrievanceCategories: ['Birth & Death Registry', 'Birth Certificate', 'Death Registration Certificate', 'Civil Registry', 'Death Certificate', 'Birth Registration', 'Digital Birth Certificate (QR Hologram)'],
    skills: ['Hospital Record Verification', 'Civil Registry Validation', 'Domicile Verification', 'Crematorium/Burial Reconciliation'],
    slaHours: 48,
  },
  {
    id: 'welfare-organizer',
    name: 'Community Organizer / MEPMA Field Coordinator',
    departmentId: 'urban-welfare',
    departmentName: 'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)',
    description: 'Asara social security pension verification, MEPMA self-help group livelihood audits, and beneficiary KYC checks',
    matchedGrievanceCategories: ['Urban Welfare & Asara', 'Asara Pension', 'MEPMA', 'Self Help Groups', 'SHG', 'Pension', 'Street Vendor Subsidy', 'Welfare', 'Asara Social Security Pension Application'],
    skills: ['Pensioner Physical Verification', 'SHG Group Audit', 'Beneficiary KYC Validation', 'Livelihood Scheme Inspection'],
    slaHours: 72,
  },
];
