import { Ward } from './wards';
import { GrievanceItem, TaskAssignment } from './grievances';

// Demo directory for the ward overview. Every name and mobile number here is sample data
// (numbers use the reserved-looking 90000 prefix); replace with the KMC HR roster when integrated.

export interface StaffMember {
  name: string;
  role: string;
  department: string;
  mobile: string;
  /** Field staff only: open tasks assigned in this ward */
  openTasks?: number;
}

export interface CitizenUser {
  name: string;
  /** Masked: citizens' numbers are never shown in full to officials */
  mobile: string;
  joined: string;
  complaints: number;
}

export interface WardDirectory {
  corporator: StaffMember;
  fieldStaff: StaffMember[];
  otherStaff: StaffMember[];
  citizensRegistered: number;
  citizensActive: number;
  recentCitizens: CitizenUser[];
}

const FIRST = ['Ravi', 'Srinivas', 'Lakshmi', 'Mahesh', 'Anitha', 'Prakash', 'Swathi', 'Naresh', 'Kavitha', 'Raju', 'Sunil', 'Padma', 'Vijay', 'Rekha', 'Kiran', 'Saritha', 'Ramesh', 'Shankar', 'Madhavi', 'Anil'];
const INITIAL = ['A', 'B', 'G', 'K', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'Y'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

const pick = <T,>(list: T[], seed: number) => list[seed % list.length];
const personName = (seed: number) => `${pick(INITIAL, seed * 7 + 3)}. ${pick(FIRST, seed * 13 + 5)}`;
const mobile = (wardId: number, slot: number) => `+91 90000 ${String(wardId).padStart(2, '0')}${String(slot).padStart(3, '0')}`;
const masked = (wardId: number, slot: number) => `+91 9•••• ••${String((wardId * 37 + slot * 11) % 1000).padStart(3, '0')}`;

const FIELD_ROLES: { role: string; department: string }[] = [
  { role: 'Sanitation Worker', department: 'Sanitation' },
  { role: 'Drainage Worker', department: 'Engineering' },
  { role: 'Electrician (Street Lights)', department: 'Street Lighting' },
  { role: 'Water Lineman', department: 'Water Supply' },
  { role: 'Road Maintenance Worker', department: 'Engineering' },
];

const OTHER_ROLES: { role: string; department: string }[] = [
  { role: 'Ward Officer', department: 'Administration' },
  { role: 'Assistant Engineer', department: 'Engineering' },
  { role: 'Sanitary Inspector', department: 'Sanitation' },
  { role: 'Bill Collector', department: 'Revenue' },
  { role: 'Town Planning Supervisor', department: 'Town Planning' },
];

/** Builds the ward's staff and citizen directory; field staff already named on complaints/tasks are kept. */
export const buildWardDirectory = (ward: Ward, grievances: GrievanceItem[], tasks: TaskAssignment[]): WardDirectory => {
  const w = ward.id;
  const openTask = (name: string) =>
    tasks.filter((t) => t.wardId === w && t.assignedTo === name && t.status !== 'Completed').length +
    grievances.filter((g) => g.wardId === w && g.assignedTo === name && (g.status === 'Pending' || g.status === 'In Progress' || g.status === 'Reopened')).length;

  // Names already used by the complaint records for this ward, e.g. "Mahesh (Field Staff)"
  const known = Array.from(
    new Set([...grievances.filter((g) => g.wardId === w).map((g) => g.assignedTo), ...tasks.filter((t) => t.wardId === w).map((t) => t.assignedTo)].filter(Boolean) as string[]),
  );

  const fieldStaff: StaffMember[] = known.map((name, i) => {
    const electrician = /electric/i.test(name);
    return {
      name,
      role: electrician ? 'Electrician (Street Lights)' : 'Field Staff',
      department: electrician ? 'Street Lighting' : 'Sanitation / Engineering',
      mobile: mobile(w, 100 + i),
      openTasks: openTask(name),
    };
  });
  const fieldCount = 4 + (w % 3);
  for (let i = 0; fieldStaff.length < fieldCount; i++) {
    const r = FIELD_ROLES[(w + i) % FIELD_ROLES.length];
    const name = personName(w * 5 + i);
    if (fieldStaff.some((s) => s.name === name)) continue;
    fieldStaff.push({ name, ...r, mobile: mobile(w, 120 + i), openTasks: openTask(name) });
  }

  const otherStaff: StaffMember[] = OTHER_ROLES.map((r, i) => ({ name: personName(w * 11 + i + 40), ...r, mobile: mobile(w, 200 + i) }));

  const citizensRegistered = Math.round(ward.population * (0.18 + (w % 7) * 0.015));
  const recentCitizens: CitizenUser[] = Array.from({ length: 6 }, (_, i) => ({
    name: personName(w * 17 + i + 90),
    mobile: masked(w, i),
    joined: `${1 + ((w + i * 5) % 27)} ${pick(MONTHS, w + i)} 2026`,
    complaints: (w + i * 3) % 5,
  }));
  if (w === 27) recentCitizens.unshift({ name: 'Sri. P. Rajesh Kumar', mobile: masked(w, 99), joined: '12 Jan 2026', complaints: grievances.filter((g) => g.citizenId === 'USR-CITIZEN-01').length });

  return {
    corporator: { name: ward.corporator, role: 'Elected Corporator', department: `Ward ${w}`, mobile: mobile(w, 1) },
    fieldStaff,
    otherStaff,
    citizensRegistered,
    citizensActive: Math.round(citizensRegistered * 0.42),
    recentCitizens,
  };
};
