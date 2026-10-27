import { Waves, Construction, Trash2, Lightbulb, Droplet, CircleEllipsis } from 'lucide-react';
import type { ElementType } from 'react';
import { DepartmentName } from './grievances';

export interface ProblemCategory {
  key: 'drainage' | 'roads' | 'garbage' | 'light' | 'water' | 'other';
  /** Category name stored on the complaint (English, used on staff screens) */
  category: string;
  department: DepartmentName;
  /** SLA from the deck's Page 14 table */
  slaHours: number;
  icon: ElementType;
  /** Placeholder photos used by the Quick Demo */
  demoBefore: string;
  demoAfter: string;
}

export const PROBLEM_CATEGORIES: ProblemCategory[] = [
  { key: 'drainage', category: 'Drainage', department: 'Engineering', slaHours: 72, icon: Waves, demoBefore: 'images/field-evidence/drain-before.jpg', demoAfter: 'images/field-evidence/drain-after.jpg' },
  { key: 'roads', category: 'Roads', department: 'Engineering', slaHours: 72, icon: Construction, demoBefore: 'images/field-evidence/road-before.jpg', demoAfter: 'images/field-evidence/road-after.jpg' },
  { key: 'garbage', category: 'Garbage', department: 'Sanitation', slaHours: 48, icon: Trash2, demoBefore: 'images/sanitation/sanitation-collection.jpg', demoAfter: 'images/field-evidence/sanitation-work.jpg' },
  { key: 'light', category: 'Street Lights', department: 'Electrical', slaHours: 48, icon: Lightbulb, demoBefore: 'images/civic-works/street-lighting.jpg', demoAfter: 'images/field-evidence/street-lights-fixed.jpg' },
  { key: 'water', category: 'Water Supply', department: 'Water Supply', slaHours: 24, icon: Droplet, demoBefore: 'images/field-evidence/water-before.jpg', demoAfter: 'images/field-evidence/water-after.jpg' },
  { key: 'other', category: 'Other', department: 'Engineering', slaHours: 72, icon: CircleEllipsis, demoBefore: 'images/field-evidence/park-beautification.jpg', demoAfter: 'images/parks-projects/urban-park.jpg' },
];

/** Maps any stored category name (including older seed names) to one of the six tiles. */
export const categoryFor = (name: string): ProblemCategory => {
  const n = name.toLowerCase();
  if (n.includes('drain')) return PROBLEM_CATEGORIES[0];
  if (n.includes('road') || n.includes('pothole')) return PROBLEM_CATEGORIES[1];
  if (n.includes('garbage') || n.includes('sanitation') || n.includes('waste')) return PROBLEM_CATEGORIES[2];
  if (n.includes('light')) return PROBLEM_CATEGORIES[3];
  if (n.includes('water') || n.includes('leak')) return PROBLEM_CATEGORIES[4];
  return PROBLEM_CATEGORIES[5];
};
