import {
  Waves, Construction, Trash2, Lightbulb, Droplet, CircleEllipsis,
  Banknote, Building2, UserCheck, FileText, HeartPulse
} from 'lucide-react';
import type { ElementType } from 'react';
import { DepartmentName } from './grievances';

export interface ProblemCategory {
  key: string;
  /** Category name stored on the complaint (English, used on staff screens) */
  category: string;
  department: DepartmentName;
  /** SLA from the official KMC SLA matrix */
  slaHours: number;
  icon: ElementType;
  /** Placeholder photos used by the Quick Demo */
  demoBefore?: string;
  demoAfter?: string;
  description?: string;
}

export const PROBLEM_CATEGORIES: ProblemCategory[] = [
  { key: 'drainage', category: 'Drainage', department: 'Engineering Section', slaHours: 72, icon: Waves, demoBefore: 'images/field-evidence/drain-before.jpg', demoAfter: 'images/field-evidence/drain-after.jpg' },
  { key: 'roads', category: 'Roads', department: 'Engineering Section', slaHours: 72, icon: Construction, demoBefore: 'images/field-evidence/road-before.jpg', demoAfter: 'images/field-evidence/road-after.jpg' },
  { key: 'garbage', category: 'Garbage', department: 'Sanitation Section', slaHours: 48, icon: Trash2, demoBefore: 'images/sanitation/sanitation-collection.jpg', demoAfter: 'images/field-evidence/sanitation-work.jpg' },
  { key: 'light', category: 'Street Lights', department: 'Engineering Section', slaHours: 48, icon: Lightbulb, demoBefore: 'images/civic-works/street-lighting.jpg', demoAfter: 'images/field-evidence/street-lights-fixed.jpg' },
  { key: 'water', category: 'Water Supply', department: 'Engineering Section', slaHours: 24, icon: Droplet, demoBefore: 'images/field-evidence/water-before.jpg', demoAfter: 'images/field-evidence/water-after.jpg' },
  { key: 'other', category: 'Other', department: 'Engineering Section', slaHours: 72, icon: CircleEllipsis, demoBefore: 'images/field-evidence/park-beautification.jpg', demoAfter: 'images/parks-projects/urban-park.jpg' },
];

export interface MCKDepartmentCategory {
  id: string;
  department: DepartmentName;
  title: string;
  description: string;
  slaHours: number;
  icon: ElementType;
  subcategories: { key: string; label: string; slaHours: number }[];
  defaultSubcategory: string;
}

export const MCK_DEPARTMENT_CATEGORIES: MCKDepartmentCategory[] = [
  {
    id: 'engineering',
    department: 'Engineering Section',
    title: 'Engineering Section',
    description: 'Oversees public works, city infrastructure development, road layout and repairs, water supply planning, and street lighting networks.',
    slaHours: 72,
    icon: Construction,
    subcategories: [
      { key: 'drainage', label: 'Drainage Overflow & Desilting', slaHours: 72 },
      { key: 'roads', label: 'Road Potholes & Surface Repairs', slaHours: 72 },
      { key: 'light', label: 'Street Light Not Working', slaHours: 48 },
      { key: 'water', label: 'Water Supply Pipeline Leakage', slaHours: 24 },
      { key: 'civil', label: 'Civil Works & Culvert Reconstruction', slaHours: 72 },
    ],
    defaultSubcategory: 'Drainage Overflow & Desilting',
  },
  {
    id: 'sanitation',
    department: 'Sanitation Section',
    title: 'Sanitation Section',
    description: 'Directs city cleanliness programs, solid waste management, sewage upkeep, and public health cleaning protocols.',
    slaHours: 48,
    icon: Trash2,
    subcategories: [
      { key: 'garbage', label: 'Door-to-Door Garbage Collection', slaHours: 48 },
      { key: 'waste_dump', label: 'Open Garbage Dump Clearance', slaHours: 48 },
      { key: 'fogging', label: 'Anti-Larval Mosquito Fogging & Bleaching', slaHours: 24 },
    ],
    defaultSubcategory: 'Door-to-Door Garbage Collection',
  },
  {
    id: 'revenue',
    department: 'Revenue Section',
    title: 'Revenue Section',
    description: 'Responsible for collecting local taxes, including Property Tax (House Tax), Vacant Land Tax (VLT), and municipal revenue evaluations.',
    slaHours: 48,
    icon: Banknote,
    subcategories: [
      { key: 'property_tax', label: 'Property Tax (House Tax) Assessment', slaHours: 48 },
      { key: 'vlt', label: 'Vacant Land Tax (VLT) Demand Notice', slaHours: 48 },
      { key: 'trade_license', label: 'Trade License & Mutation Verification', slaHours: 48 },
    ],
    defaultSubcategory: 'Property Tax (House Tax) Assessment',
  },
  {
    id: 'town-planning',
    department: 'Town Planning Section (TPS)',
    title: 'Town Planning Section (TPS)',
    description: 'Regulates city layouts, manages Building Permissions, acts against unauthorized structures, and processes mutations.',
    slaHours: 72,
    icon: Building2,
    subcategories: [
      { key: 'building_perm', label: 'Building Permission (TG-bPASS)', slaHours: 72 },
      { key: 'encroachment', label: 'Unauthorized Structure / Setback Encroachment', slaHours: 72 },
      { key: 'parks', label: 'Colony Parks & Green Space Maintenance', slaHours: 72 },
    ],
    defaultSubcategory: 'Building Permission (TG-bPASS)',
  },
  {
    id: 'establishment',
    department: 'Establishment Section',
    title: 'Establishment Section',
    description: 'Manages general administration, human resources, municipal staff postings, and inner corporate affairs.',
    slaHours: 48,
    icon: UserCheck,
    subcategories: [
      { key: 'staff_posting', label: 'Municipal Staff Vacancy & Roster', slaHours: 48 },
      { key: 'biometrics', label: 'Biometric Attendance & Muster Roll', slaHours: 48 },
      { key: 'admin', label: 'Citizen Charter & Ward Office Admin Inquiry', slaHours: 48 },
    ],
    defaultSubcategory: 'Municipal Staff Vacancy & Roster',
  },
  {
    id: 'statistics',
    department: 'Statistics / Birth & Death Registration Section',
    title: 'Statistics / Birth & Death Registration Section',
    description: 'Manages civil registry work including issuing unified certificates for births and deaths within municipal limits.',
    slaHours: 48,
    icon: FileText,
    subcategories: [
      { key: 'birth_cert', label: 'Digital Birth Certificate (QR Hologram)', slaHours: 48 },
      { key: 'death_cert', label: 'Death Registration & Certificate', slaHours: 48 },
      { key: 'cert_correction', label: 'Record Spelling & Aadhaar Linkage Correction', slaHours: 48 },
    ],
    defaultSubcategory: 'Digital Birth Certificate (QR Hologram)',
  },
  {
    id: 'urban-welfare',
    department: 'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)',
    title: 'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)',
    description: 'Works alongside state initiatives like MEPMA and distributes welfare programs like the Asara pension.',
    slaHours: 72,
    icon: HeartPulse,
    subcategories: [
      { key: 'asara_pension', label: 'Asara Disability / Old Age Pension', slaHours: 72 },
      { key: 'mepma_shg', label: 'MEPMA Mahila SHG Revolving Fund Subsidy', slaHours: 72 },
      { key: 'street_vendor', label: 'PM SVANidhi Street Vendor Card', slaHours: 72 },
    ],
    defaultSubcategory: 'Asara Disability / Old Age Pension',
  },
];

/** Maps any stored category name (including older seed names) to one of the tiles. */
export const categoryFor = (name: string): ProblemCategory => {
  const n = name.toLowerCase();
  if (n.includes('drain')) return PROBLEM_CATEGORIES[0];
  if (n.includes('road') || n.includes('pothole')) return PROBLEM_CATEGORIES[1];
  if (n.includes('garbage') || n.includes('sanitation') || n.includes('waste')) return PROBLEM_CATEGORIES[2];
  if (n.includes('light')) return PROBLEM_CATEGORIES[3];
  if (n.includes('water') || n.includes('leak')) return PROBLEM_CATEGORIES[4];
  return PROBLEM_CATEGORIES[5];
};
