import React, { useState, useMemo, useEffect } from 'react';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { StatusChip } from '../components/common/StatusChip';
import { PhotoThumbnail } from '../components/common/EvidencePhotoModal';
import { FullImageModal } from '../components/common/FullImagePreview';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/AuthContext';
import { 
  Building, Wrench, CheckCircle2, Clock, AlertTriangle, 
  MapPin, Check, Filter, UserCheck, ChevronRight, UserPlus, X, ShieldAlert,
  ChevronDown, ChevronUp, Waves, Construction, Trash2, Lightbulb, Droplet,
  Search, ArrowUpDown, Calendar, Eye, CheckCheck, RefreshCw, Layers,
  Banknote, FileText, HeartPulse, Users, Receipt, Landmark
} from 'lucide-react';
import { SearchableSelect } from '../components/common/SearchableSelect';
import { userRepository, staffCategoryRepository } from '../storage';
import { usePrefs } from '../i18n';
import { GrievanceItem } from '../data/grievances';
import { getPaymentsForSection } from '../data/payments';

export interface CategoryMeta {
  key: string;
  name: string;
  department: string;
  icon: React.ElementType;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
  defaultSla: number;
}

export const CATEGORY_DEFINITIONS: Record<string, CategoryMeta> = {
  drainage: {
    key: 'drainage',
    name: 'Drainage',
    department: 'Engineering Section',
    icon: Waves,
    color: 'text-cyan-700',
    borderAccent: 'border-l-cyan-600',
    badgeBg: 'bg-cyan-50 border-cyan-200',
    badgeText: 'text-cyan-900',
    defaultSla: 72,
  },
  roads: {
    key: 'roads',
    name: 'Roads',
    department: 'Engineering Section',
    icon: Construction,
    color: 'text-amber-700',
    borderAccent: 'border-l-amber-600',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-900',
    defaultSla: 72,
  },
  civil: {
    key: 'civil',
    name: 'Civil Works',
    department: 'Engineering Section',
    icon: Building,
    color: 'text-indigo-700',
    borderAccent: 'border-l-indigo-600',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-900',
    defaultSla: 72,
  },
  'street-lights': {
    key: 'street-lights',
    name: 'Street Lights',
    department: 'Engineering Section',
    icon: Lightbulb,
    color: 'text-yellow-700',
    borderAccent: 'border-l-yellow-600',
    badgeBg: 'bg-yellow-50 border-yellow-200',
    badgeText: 'text-yellow-900',
    defaultSla: 48,
  },
  'water-supply': {
    key: 'water-supply',
    name: 'Water Supply',
    department: 'Engineering Section',
    icon: Droplet,
    color: 'text-sky-700',
    borderAccent: 'border-l-sky-600',
    badgeBg: 'bg-sky-50 border-sky-200',
    badgeText: 'text-sky-900',
    defaultSla: 24,
  },
  sanitation: {
    key: 'sanitation',
    name: 'Sanitation & Garbage',
    department: 'Sanitation Section',
    icon: Trash2,
    color: 'text-emerald-700',
    borderAccent: 'border-l-emerald-600',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-900',
    defaultSla: 48,
  },
  'public-health': {
    key: 'public-health',
    name: 'Public Health & Fogging',
    department: 'Sanitation Section',
    icon: HeartPulse,
    color: 'text-rose-700',
    borderAccent: 'border-l-rose-600',
    badgeBg: 'bg-rose-50 border-rose-200',
    badgeText: 'text-rose-900',
    defaultSla: 48,
  },
  'building-perm': {
    key: 'building-perm',
    name: 'Building Permissions',
    department: 'Town Planning Section (TPS)',
    icon: Building,
    color: 'text-purple-700',
    borderAccent: 'border-l-purple-600',
    badgeBg: 'bg-purple-50 border-purple-200',
    badgeText: 'text-purple-900',
    defaultSla: 72,
  },
  parks: {
    key: 'parks',
    name: 'Parks & Greening',
    department: 'Town Planning Section (TPS)',
    icon: Building,
    color: 'text-teal-700',
    borderAccent: 'border-l-teal-600',
    badgeBg: 'bg-teal-50 border-teal-200',
    badgeText: 'text-teal-900',
    defaultSla: 72,
  },
  'property-tax': {
    key: 'property-tax',
    name: 'Property Tax (House Tax)',
    department: 'Revenue Section',
    icon: Banknote,
    color: 'text-green-700',
    borderAccent: 'border-l-green-600',
    badgeBg: 'bg-green-50 border-green-200',
    badgeText: 'text-green-900',
    defaultSla: 48,
  },
  'staff-postings': {
    key: 'staff-postings',
    name: 'Staff Postings & HR',
    department: 'Establishment Section',
    icon: UserCheck,
    color: 'text-blue-700',
    borderAccent: 'border-l-blue-600',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-900',
    defaultSla: 48,
  },
  certificates: {
    key: 'certificates',
    name: 'Birth & Death Registry',
    department: 'Statistics / Birth & Death Registration Section',
    icon: FileText,
    color: 'text-slate-700',
    borderAccent: 'border-l-slate-600',
    badgeBg: 'bg-slate-50 border-slate-200',
    badgeText: 'text-slate-900',
    defaultSla: 48,
  },
  'asara-pension': {
    key: 'asara-pension',
    name: 'Urban Welfare & Asara',
    department: 'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)',
    icon: HeartPulse,
    color: 'text-pink-700',
    borderAccent: 'border-l-pink-600',
    badgeBg: 'bg-pink-50 border-pink-200',
    badgeText: 'text-pink-900',
    defaultSla: 72,
  },
  'vlt-tax': {
    key: 'vlt-tax',
    name: 'Vacant Land Tax (VLT)',
    department: 'Revenue Section',
    icon: Landmark,
    color: 'text-teal-700',
    borderAccent: 'border-l-teal-600',
    badgeBg: 'bg-teal-50 border-teal-200',
    badgeText: 'text-teal-900',
    defaultSla: 48,
  },
  'trade-license': {
    key: 'trade-license',
    name: 'Trade License & Commercial',
    department: 'Revenue Section',
    icon: Receipt,
    color: 'text-purple-700',
    borderAccent: 'border-l-purple-600',
    badgeBg: 'bg-purple-50 border-purple-200',
    badgeText: 'text-purple-900',
    defaultSla: 48,
  },
};

export function resolveCategoryKey(g: GrievanceItem): string {
  const c = (g.category || '').toLowerCase();
  const d = (g.description || '').toLowerCase();
  if (c.includes('drain') || d.includes('drain')) return 'drainage';
  if (c.includes('road') || c.includes('pothole') || d.includes('road') || d.includes('pothole')) return 'roads';
  if (c.includes('light') || c.includes('electric') || d.includes('light')) return 'street-lights';
  if (c.includes('water') || c.includes('pipe') || d.includes('water') || d.includes('pipe') || c.includes('leak')) return 'water-supply';
  if (c.includes('garbage') || c.includes('waste') || c.includes('sanitation') || c.includes('clean')) return 'sanitation';
  if (c.includes('pest') || c.includes('fogging') || d.includes('mosquito')) return 'public-health';
  if (c.includes('building') || c.includes('layout') || c.includes('permission') || c.includes('tgbpass') || c.includes('tg-bpass')) return 'building-perm';
  if (c.includes('park') || c.includes('green') || d.includes('tree')) return 'parks';
  if (c.includes('vacant') || c.includes('vlt') || d.includes('vacant') || d.includes('vlt')) return 'vlt-tax';
  if (c.includes('trade') || c.includes('commercial') || d.includes('trade')) return 'trade-license';
  if (c.includes('tax') || c.includes('revenue') || c.includes('property') || c.includes('house')) return 'property-tax';
  if (c.includes('staff') || c.includes('posting') || c.includes('hr')) return 'staff-postings';
  if (c.includes('birth') || c.includes('death') || c.includes('certificate') || d.includes('birth') || d.includes('death')) return 'certificates';
  if (c.includes('pension') || c.includes('asara') || c.includes('mepma') || c.includes('shg') || c.includes('vendor')) return 'asara-pension';
  return 'civil';
}

export const MCK_SECTIONS = [
  { id: 'engineering', name: 'Engineering Section', shortName: 'Engineering', description: 'Roads, bridges, water supply, drainage & street lights' },
  { id: 'sanitation', name: 'Sanitation Section', shortName: 'Sanitation', description: 'Solid waste management, city cleanliness & public health' },
  { id: 'town-planning', name: 'Town Planning Section (TPS)', shortName: 'Town Planning', description: 'City layouts, building permissions, mutations & parks' },
  { id: 'revenue', name: 'Revenue Section', shortName: 'Revenue', description: 'Property tax, vacant land tax (VLT) & evaluations' },
  { id: 'establishment', name: 'Establishment Section', shortName: 'Establishment', description: 'General administration, HR & staff postings' },
  { id: 'statistics', name: 'Statistics / Birth & Death Registration Section', shortName: 'Statistics / Civil Registry', description: 'Birth & death certificates and civil registry records' },
  { id: 'urban-welfare', name: 'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)', shortName: 'Urban Welfare (MEPMA & Asara)', description: 'MEPMA self-help groups & Asara pensions' },
];

const SECTION_DEFAULT_CATEGORIES: Record<string, { key: string; label: string; icon: React.ElementType }[]> = {
  'Engineering Section': [
    { key: 'drainage', label: 'Drainage', icon: Waves },
    { key: 'roads', label: 'Roads', icon: Construction },
    { key: 'street-lights', label: 'Street Lights', icon: Lightbulb },
    { key: 'water-supply', label: 'Water Supply', icon: Droplet },
    { key: 'civil', label: 'Civil Works', icon: Building },
  ],
  'Sanitation Section': [
    { key: 'sanitation', label: 'Sanitation & Garbage', icon: Trash2 },
    { key: 'public-health', label: 'Public Health & Fogging', icon: HeartPulse },
  ],
  'Town Planning Section (TPS)': [
    { key: 'building-perm', label: 'Building Permissions (TG-bPASS)', icon: Building },
    { key: 'parks', label: 'Parks & Greening', icon: Building },
  ],
  'Revenue Section': [
    { key: 'property-tax', label: 'Property Tax (House Tax)', icon: Banknote },
    { key: 'vlt-tax', label: 'Vacant Land Tax (VLT)', icon: Landmark },
    { key: 'trade-license', label: 'Trade License & Commercial', icon: Receipt },
  ],
  'Establishment Section': [
    { key: 'staff-postings', label: 'Staff Postings & HR', icon: UserCheck },
  ],
  'Statistics / Birth & Death Registration Section': [
    { key: 'certificates', label: 'Birth & Death Registry', icon: FileText },
  ],
  'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)': [
    { key: 'asara-pension', label: 'Urban Welfare & Asara', icon: HeartPulse },
  ],
};

export const DepartmentDashboardPage: React.FC = () => {
  const { grievances, tasks, wards, assignGrievanceToStaff, approveAndClose } = useApp();
  const { currentUser } = useAuth();
  const { t } = usePrefs();

  const officerName = currentUser?.displayName || 'Er. P. Venkateshwarlu';

  // MCK Administrative Section state (defaults to user's assigned department or Engineering Section)
  const initialSection = useMemo(() => {
    const raw = currentUser?.departmentName || '';
    if (raw) {
      const found = MCK_SECTIONS.find(s => 
        raw.toLowerCase().includes(s.id) ||
        raw.toLowerCase().includes(s.shortName.toLowerCase()) ||
        s.name.toLowerCase().includes(raw.toLowerCase())
      );
      if (found) return found.name;
    }
    return 'Engineering Section';
  }, [currentUser]);

  const [selectedSection, setSelectedSection] = useState<string>(() => {
    try {
      return sessionStorage.getItem(`kmc_dept_selected_section_${currentUser?.id || 'default'}`) || initialSection;
    } catch {
      return initialSection;
    }
  });

  const handleSectionChange = (newSec: string) => {
    setSelectedSection(newSec);
    try {
      sessionStorage.setItem(`kmc_dept_selected_section_${currentUser?.id || 'default'}`, newSec);
    } catch {}
    const defaultCats = SECTION_DEFAULT_CATEGORIES[newSec] || SECTION_DEFAULT_CATEGORIES['Engineering Section'];
    if (defaultCats && defaultCats.length > 0) {
      setActiveCategoryKey(defaultCats[0].key);
    }
  };

  // Automatically sync section and default category when initialSection / current officer changes
  useEffect(() => {
    if (initialSection) {
      setSelectedSection(initialSection);
      try {
        sessionStorage.setItem(`kmc_dept_selected_section_${currentUser?.id || 'default'}`, initialSection);
      } catch {}
      const defaultCats = SECTION_DEFAULT_CATEGORIES[initialSection] || SECTION_DEFAULT_CATEGORIES['Engineering Section'];
      if (defaultCats && defaultCats.length > 0) {
        setActiveCategoryKey(defaultCats[0].key);
      }
    }
  }, [currentUser?.id, initialSection]);

  const sectionOptions = useMemo(() => {
    return MCK_SECTIONS.map((sec) => ({
      value: sec.name,
      label: sec.name,
      sublabel: sec.description,
    }));
  }, []);

  // 1. Ward Selection State: default to Ward 27 or session
  const [selectedWard, setSelectedWard] = useState<string>(() => {
    try {
      return sessionStorage.getItem('kmc_dept_selected_ward') || '27';
    } catch {
      return '27';
    }
  });

  const handleWardChange = (newWard: string) => {
    setSelectedWard(newWard);
    try {
      sessionStorage.setItem('kmc_dept_selected_ward', newWard);
    } catch {}
  };

  // 2. Active Category Tab State (dynamically defaults to current section's primary category)
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>(() => {
    try {
      const sec = sessionStorage.getItem(`kmc_dept_selected_section_${currentUser?.id || 'default'}`) || initialSection;
      const initialCats = SECTION_DEFAULT_CATEGORIES[sec] || SECTION_DEFAULT_CATEGORIES['Engineering Section'];
      return initialCats[0]?.key || 'drainage';
    } catch {
      return 'drainage';
    }
  });

  // Whenever selectedSection changes, ensure activeCategoryKey is valid for this section
  useEffect(() => {
    const defaultCats = SECTION_DEFAULT_CATEGORIES[selectedSection] || SECTION_DEFAULT_CATEGORIES['Engineering Section'];
    if (defaultCats && defaultCats.length > 0) {
      if (!defaultCats.some((c) => c.key === activeCategoryKey)) {
        setActiveCategoryKey(defaultCats[0].key);
      }
    }
  }, [selectedSection, activeCategoryKey]);

  // 3. Status Filter State (per hand-drawn layout; completed unified under resolved)
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'In Progress' | 'Resolved' | 'Overdue'>('all');

  // 4. Search and Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'sla'>('newest');

  // 5. Collapsible task section state
  const [showDispatchedTasks, setShowDispatchedTasks] = useState(false);

  // 6. Modal and preview state
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);
  const [assigneeName, setAssigneeName] = useState('');
  const [targetDueDate, setTargetDueDate] = useState('Next 48 Hours');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ src: string; title: string; location: string } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reconciled payments & collections for Revenue Section or Engineering Section
  const sectionPayments = useMemo(() => {
    return getPaymentsForSection(selectedSection, selectedWard === 'all' ? undefined : parseInt(selectedWard, 10));
  }, [selectedSection, selectedWard]);

  // Department-wide grievances belonging strictly to selected section
  const deptGrievancesAll = useMemo(() => {
    return grievances.filter(g => {
      const deptLower = (g.department || '').toLowerCase();
      const catLower = (g.category || '').toLowerCase();
      const descLower = (g.description || '').toLowerCase();

      if (selectedSection.includes('Engineering')) {
        return (
          deptLower.includes('engineering') || 
          deptLower.includes('electrical') ||
          deptLower.includes('water') ||
          catLower.includes('drainage') || 
          catLower.includes('road') ||
          catLower.includes('light') ||
          catLower.includes('electric') ||
          catLower.includes('water') ||
          catLower.includes('civil') ||
          descLower.includes('drain') ||
          descLower.includes('road') ||
          descLower.includes('pipe') ||
          g.department === 'Engineering' ||
          g.department === 'Engineering Section'
        );
      }
      if (selectedSection.includes('Sanitation')) {
        return (
          deptLower.includes('sanitation') || 
          deptLower.includes('health') ||
          catLower.includes('garbage') || 
          catLower.includes('sanitation') || 
          catLower.includes('waste') ||
          catLower.includes('pest') ||
          descLower.includes('garbage') ||
          descLower.includes('cleaning') ||
          g.department === 'Sanitation' ||
          g.department === 'Sanitation Section'
        );
      }
      if (selectedSection.includes('Town Planning')) {
        return (
          deptLower.includes('town') || 
          deptLower.includes('planning') ||
          catLower.includes('building') || 
          catLower.includes('layout') ||
          catLower.includes('park') ||
          catLower.includes('green') ||
          g.department === 'Town Planning' ||
          g.department === 'Town Planning Section (TPS)'
        );
      }
      if (selectedSection.includes('Revenue')) {
        return (
          deptLower.includes('revenue') || 
          catLower.includes('tax') || 
          catLower.includes('property') ||
          descLower.includes('tax') ||
          g.department === 'Revenue' ||
          g.department === 'Revenue Section'
        );
      }
      if (selectedSection.includes('Establishment')) {
        return (
          deptLower.includes('establishment') || 
          catLower.includes('staff') || 
          catLower.includes('hr') ||
          g.department === 'Establishment Section'
        );
      }
      if (selectedSection.includes('Statistics')) {
        return (
          deptLower.includes('statistic') || 
          catLower.includes('birth') || 
          catLower.includes('death') || 
          catLower.includes('certificate') ||
          g.department === 'Statistics / Birth & Death Registration Section'
        );
      }
      if (selectedSection.includes('Welfare') || selectedSection.includes('MEPMA')) {
        return (
          deptLower.includes('welfare') || 
          deptLower.includes('mepma') || 
          deptLower.includes('asara') || 
          catLower.includes('pension') ||
          g.department === 'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)'
        );
      }
      return true;
    });
  }, [grievances, selectedSection]);

  // Ward Selector options
  const wardOptions = useMemo(() => {
    const allOption = {
      value: 'all',
      label: t('All Wards (66 Wards — City-Wide Oversight)'),
      sublabel: t('View and dispatch department grievances across the entire municipality'),
    };

    const perWard = wards.map((w) => {
      const count = deptGrievancesAll.filter((g) => g.wardId === w.id).length;
      const pendingInWard = deptGrievancesAll.filter((g) => g.wardId === w.id && g.status === 'Pending').length;
      return {
        value: String(w.id),
        label: `Ward ${w.id} — ${w.name}`,
        sublabel: `Corporator: ${w.corporator} • ${count} grievance(s) (${pendingInWard} pending)`,
      };
    });

    return [allOption, ...perWard];
  }, [wards, deptGrievancesAll, t]);

  // Grievances filtered strictly by the selected Ward!
  const wardFilteredGrievances = useMemo(() => {
    if (selectedWard === 'all') {
      return deptGrievancesAll;
    }
    const targetWardNum = parseInt(selectedWard, 10);
    return deptGrievancesAll.filter((g) => g.wardId === targetWardNum);
  }, [deptGrievancesAll, selectedWard]);

  // Active ward info object
  const activeWardObj = useMemo(() => {
    if (selectedWard === 'all') return null;
    return wards.find(w => w.id === parseInt(selectedWard, 10)) || null;
  }, [wards, selectedWard]);

  // Counts for the current ward
  const totalCount = wardFilteredGrievances.length;
  const pendingCount = wardFilteredGrievances.filter(g => g.status === 'Pending').length;

  // Category list and counts in current ward
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    wardFilteredGrievances.forEach(g => {
      const k = resolveCategoryKey(g);
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [wardFilteredGrievances]);

  const availableCategories = useMemo(() => {
    const base = SECTION_DEFAULT_CATEGORIES[selectedSection] || SECTION_DEFAULT_CATEGORIES['Engineering Section'];

    const extraKeys = new Set<string>();
    wardFilteredGrievances.forEach(g => {
      const k = resolveCategoryKey(g);
      if (!base.some(b => b.key === k)) {
        extraKeys.add(k);
      }
    });

    const extras = Array.from(extraKeys).map(k => ({
      key: k,
      label: CATEGORY_DEFINITIONS[k]?.name || k.toUpperCase(),
      icon: CATEGORY_DEFINITIONS[k]?.icon || Wrench,
    }));

    return [...base, ...extras];
  }, [wardFilteredGrievances, selectedSection]);

  // Keep active category synced whenever availableCategories or selectedSection changes
  useEffect(() => {
    if (!availableCategories.some((c) => c.key === activeCategoryKey)) {
      if (availableCategories.length > 0) {
        setActiveCategoryKey(availableCategories[0].key);
      }
    }
  }, [availableCategories, activeCategoryKey]);

  // Active category metadata
  const activeCategoryMeta = useMemo(() => {
    return CATEGORY_DEFINITIONS[activeCategoryKey] || {
      key: activeCategoryKey,
      name: activeCategoryKey.toUpperCase(),
      department: selectedSection,
      icon: Wrench,
      color: 'text-slate-700',
      borderAccent: 'border-l-slate-600',
      badgeBg: 'bg-slate-50 border-slate-200',
      badgeText: 'text-slate-900',
      defaultSla: 72,
    };
  }, [activeCategoryKey, selectedSection]);

  // Grievances filtered strictly by: (Selected Ward) AND (Selected Category Tab) AND (Selected Status) AND (Search)
  const filteredCategoryGrievances = useMemo(() => {
    return wardFilteredGrievances
      .filter(g => resolveCategoryKey(g) === activeCategoryKey)
      .filter(g => {
        // Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'Overdue') {
            if (g.status !== 'Overdue') return false;
          } else if (statusFilter === 'Resolved') {
            if (g.status !== 'Resolved' && g.status !== 'Completed') return false;
          } else if (g.status !== statusFilter) {
            return false;
          }
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchId = g.id.toLowerCase().includes(q);
          const matchDesc = g.description.toLowerCase().includes(q);
          const matchLoc = g.location.toLowerCase().includes(q);
          const matchAssignee = (g.assignedTo || '').toLowerCase().includes(q);
          if (!matchId && !matchDesc && !matchLoc && !matchAssignee) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'sla') {
          return (a.slaHours || 72) - (b.slaHours || 72);
        }
        if (sortBy === 'oldest') {
          return a.id.localeCompare(b.id);
        }
        return b.id.localeCompare(a.id);
      });
  }, [wardFilteredGrievances, activeCategoryKey, statusFilter, searchQuery, sortBy]);

  // Modal Handlers
  const handleOpenAssignModal = (gid: string) => {
    setSelectedGrievanceId(gid);
    const { eligibleStaff } = staffCategoryRepository.getEligibleFieldStaff(gid, currentUser?.id);
    setAssigneeName(eligibleStaff.length > 0 ? eligibleStaff[0].displayName : '');
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrievanceId) return;

    try {
      const { eligibleStaff, targetWardId, requiredCategory } = staffCategoryRepository.getEligibleFieldStaff(selectedGrievanceId, currentUser?.id);
      const targetAssignee = assigneeName || (eligibleStaff.length > 0 ? eligibleStaff[0].displayName : '');
      if (!targetAssignee) {
        throw new Error(`No eligible ${requiredCategory?.name || 'field staff'} selected for Ward ${targetWardId}.`);
      }
      assignGrievanceToStaff(selectedGrievanceId, targetAssignee, targetDueDate, officerName);
      showToast(t(`Grievance ${selectedGrievanceId} assigned to ${targetAssignee} (Ward ${targetWardId}). Task dispatched to Field Staff portal!`));
      setSelectedGrievanceId(null);
      setAssigneeName('');
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch task.');
    }
  };

  const handleApproveGrievance = (gid: string) => {
    approveAndClose(gid, officerName);
    showToast(t(`Resolution verified and approved for Grievance ${gid}!`));
  };

  // Dispatched tasks strictly filtered to selected ward and section
  const displayedTasks = useMemo(() => {
    const deptTasks = tasks.filter(t => {
      const deptLower = (t.departmentId || '').toLowerCase();
      if (selectedSection.includes('Engineering')) {
        return deptLower.includes('engineering') || deptLower.includes('electrical') || deptLower.includes('water');
      }
      if (selectedSection.includes('Sanitation')) {
        return deptLower.includes('sanitation') || deptLower.includes('health');
      }
      if (selectedSection.includes('Town Planning')) {
        return deptLower.includes('town') || deptLower.includes('planning');
      }
      if (selectedSection.includes('Revenue')) {
        return deptLower.includes('revenue');
      }
      if (selectedSection.includes('Establishment')) {
        return deptLower.includes('establishment');
      }
      if (selectedSection.includes('Statistics')) {
        return deptLower.includes('statistic');
      }
      if (selectedSection.includes('Welfare')) {
        return deptLower.includes('welfare');
      }
      return true;
    });
    if (selectedWard === 'all') return deptTasks;
    const targetWardNum = parseInt(selectedWard, 10);
    return deptTasks.filter(t => t.wardId === targetWardNum);
  }, [tasks, selectedWard, selectedSection]);

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      {/* A. Existing Application Header */}
      <BannerStrip
        title={`${t('Department Officer Portal')} • ${selectedSection.toUpperCase()}`}
        tagline="Ward-Specific Grievance Redressal, Category Grouping & Ground Staff Dispatch"
        actionButton={
          <span className="text-xs bg-orange-700 text-white font-bold px-3 py-1 rounded-md shadow uppercase tracking-wide">
            {t('72h SLA Active')}
          </span>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 w-full">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-white hover:text-emerald-200">✕</button>
          </div>
        )}

        {/* B. MCK Section Switcher & Ward Selector */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-4 border-l-4 border-l-kmc-navy">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            {/* 1. Administrative Department Section (7 Core MCK Sections) */}
            <div className="lg:col-span-5">
              <label htmlFor="dept-section-select" className="block text-xs font-bold text-slate-800 uppercase mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-kmc-navy" />
                <span>{t('MCK Administrative Section (7 Core Sections)')}:</span>
              </label>
              <SearchableSelect
                value={selectedSection}
                onChange={(newSec) => handleSectionChange(String(newSec))}
                searchPlaceholder={t('Search MCK Section...')}
                options={sectionOptions}
                fullWidth
                size="md"
              />
            </div>

            {/* 2. Ward Selector */}
            <div className="lg:col-span-4">
              <label htmlFor="dept-ward-select" className="block text-xs font-bold text-slate-800 uppercase mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-kmc-navy" />
                <span>{t('Select Ward')}:</span>
              </label>
              <SearchableSelect
                value={selectedWard}
                onChange={handleWardChange}
                searchPlaceholder={t('Search ward number or colony name...')}
                options={wardOptions}
                fullWidth
                size="md"
              />
            </div>

            {/* 3. Compact Ward Status Badge */}
            <div className="lg:col-span-3 flex items-center justify-between gap-3 text-xs bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-lg shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">{t('Ward Status')}</span>
                <span className="font-bold text-slate-800 line-clamp-1">
                  {selectedWard === 'all'
                    ? t('All 66 Wards')
                    : activeWardObj
                      ? `Ward ${activeWardObj.id}`
                      : `Ward ${selectedWard}`}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  const el = document.getElementById('filtered-grievance-table');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    el.classList.add('ring-4', 'ring-kmc-navy/30');
                    setTimeout(() => el.classList.remove('ring-4', 'ring-kmc-navy/30'), 1500);
                  }
                }}
                className={`text-left group cursor-pointer px-2 py-1 rounded-lg transition-all ${
                  statusFilter === 'all' ? 'bg-blue-50 ring-1 ring-kmc-navy/40 shadow-xs' : 'hover:bg-slate-100'
                }`}
                title={t('Show all grievances')}
              >
                <span className="text-[10px] uppercase font-bold text-slate-500 block group-hover:text-kmc-navy">{t('Total')}</span>
                <span className="font-bold font-mono text-kmc-navy text-sm">{totalCount}</span>
              </button>
              <div className="h-6 w-px bg-slate-200" />
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('Pending');
                  const el = document.getElementById('filtered-grievance-table');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    el.classList.add('ring-4', 'ring-amber-400/40');
                    setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400/40'), 1500);
                  }
                }}
                className={`text-left group cursor-pointer px-2 py-1 rounded-lg transition-all ${
                  statusFilter === 'Pending' ? 'bg-amber-100 ring-2 ring-amber-500 shadow-xs' : 'hover:bg-amber-50'
                }`}
                title={t('Filter pending grievances')}
              >
                <span className="text-[10px] uppercase font-bold text-amber-700 block group-hover:text-amber-900">{t('Pending')}</span>
                <span className="font-bold font-mono text-amber-800 text-sm">{pendingCount}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Special Ledger: Municipal Tax Collections & Reconciled Receipts for Revenue / Engineering */}
        {(selectedSection.includes('Revenue') || selectedSection.includes('Engineering')) && (
          <section className="bg-white rounded-xl shadow-card border border-slate-200 p-4 border-l-4 border-l-emerald-600 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Landmark className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-heading uppercase text-slate-900">
                    {selectedSection.includes('Revenue')
                      ? t("Revenue Section · Municipal Tax Collections & Reconciled Ledger")
                      : t("Engineering Section · Water Supply Charges Collection Ledger")
                    }
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedSection.includes('Revenue')
                      ? t("Reconciled in General Revenue Treasury Account (MCK-REV-TREASURY-01) • SBI Collectorate Branch")
                      : t("Reconciled in Water Works O&M Account (MCK-ENG-WATER-02) • SBI Collectorate Branch")
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Total Settled Collections")}</span>
                  <span className="text-lg font-mono font-bold text-emerald-700">
                    ₹{sectionPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-md">
                  {sectionPayments.length} {t("Paid Receipts")}
                </span>
              </div>
            </div>

            {sectionPayments.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                {t("No reconciled payments recorded for the selected ward.")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">{t("Receipt No")}</th>
                      <th className="py-2 px-3">{t("Tax / Utility Head")}</th>
                      <th className="py-2 px-3">{t("Payer & Door No")}</th>
                      <th className="py-2 px-3">{t("Assessment / Ref")}</th>
                      <th className="py-2 px-3">{t("Amount")}</th>
                      <th className="py-2 px-3">{t("Credited Account")}</th>
                      <th className="py-2 px-3">{t("Paid Date & Time")}</th>
                      <th className="py-2 px-3 text-right">{t("Treasury Status")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {sectionPayments.map((p) => (
                      <tr key={p.receiptNo} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 font-mono font-bold text-kmc-navy whitespace-nowrap">
                          {p.receiptNo}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">
                          {t(p.taxType)}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <strong className="text-slate-900">{p.citizenName}</strong>
                          <span className="text-slate-500 block text-[10px]">Door {p.doorNo}, Ward {p.wardId}</span>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap">
                          {p.refValue}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-800 whitespace-nowrap">
                          ₹{p.amount.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap font-mono text-slate-600">
                          {p.receivingAccount}
                        </td>
                        <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                          {p.paidTimeStr}
                        </td>
                        <td className="py-2 px-3 text-right whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {t("Reconciled & Credited")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* C. Category Tabs (Directly below Ward Selector per hand-drawn reference) */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-kmc-navy" />
              <span>{t('Category Tabs')}</span>
            </span>
            <span className="text-[11px] text-slate-400">
              {t('Click a tab to view that category')}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {availableCategories.map((cat) => {
              const isActive = activeCategoryKey === cat.key;
              const count = categoryCounts[cat.key] || 0;
              const Icon = cat.icon;

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setActiveCategoryKey(cat.key);
                    const el = document.getElementById('filtered-grievance-table');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm ring-2 ring-amber-400/50 scale-[1.02]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                  <span>{t(cat.label)}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-slate-950 text-amber-300'
                        : count > 0
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* D. Status Filter (Directly below Category Tabs per reference sketch) */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Dropdown */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-kmc-navy" />
              <span>{t('Status')}:</span>
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-kmc-navy/30 cursor-pointer"
            >
              <option value="all">{t('All Statuses')}</option>
              <option value="Pending">{t('Pending Assignment')}</option>
              <option value="In Progress">{t('Assigned / In Progress')}</option>
              <option value="Resolved">{t('Resolved / Closed')}</option>
              <option value="Overdue">{t('Overdue SLA')}</option>
            </select>

            {/* Quick status pills for fast access */}
            <div className="hidden lg:flex items-center gap-1 ml-2 border-l border-slate-200 pl-2">
              {(['all', 'Pending', 'In Progress', 'Resolved'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                    statusFilter === st
                      ? 'bg-kmc-navy text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st === 'all' ? t('All') : t(st)}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Search & Sort Controls */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search ID, keyword...')}
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-kmc-navy/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
              >
                <option value="newest">{t('Newest')}</option>
                <option value="oldest">{t('Oldest')}</option>
                <option value="sla">{t('SLA Target')}</option>
              </select>
            </div>

            <span className="text-xs text-slate-500 font-medium pl-1 shrink-0">
              {filteredCategoryGrievances.length} {t('records')}
            </span>
          </div>
        </section>

        {/* E. Filtered Grievance List (Clean compact table below status filter per sketch) */}
        <section id="filtered-grievance-table" className="scroll-mt-24 bg-white rounded-xl shadow-card border border-slate-200 overflow-hidden">
          {/* Active Category Header Bar */}
          <div className="p-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <activeCategoryMeta.icon className={`w-4 h-4 ${activeCategoryMeta.color}`} />
              <span className="font-bold text-xs font-heading uppercase text-slate-800">
                {t(activeCategoryMeta.name)}
              </span>
              <span className="text-[11px] text-slate-500">
                • {selectedWard === 'all' ? t('All Wards') : `Ward ${selectedWard}`} • SLA: {activeCategoryMeta.defaultSla}h
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600">
              {filteredCategoryGrievances.length} {t('complaints shown')}
            </span>
          </div>

          {filteredCategoryGrievances.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-b-xl bg-slate-50/40">
              <activeCategoryMeta.icon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">
                {t('No grievances in {{cat}} matching current filters.', { cat: t(activeCategoryMeta.name) })}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                {selectedWard === 'all'
                  ? t('No complaints currently match the selected status in this category across all wards.')
                  : t('Ward {{ward}} has no active complaints under {{cat}} matching the selected criteria.', { ward: selectedWard, cat: t(activeCategoryMeta.name) })}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">{t('Grievance ID')}</th>
                    <th className="py-2.5 px-3">{t('Issue Description')}</th>
                    <th className="py-2.5 px-3">{t('Location & Ward')}</th>
                    <th className="py-2.5 px-3">{t('Site Photo')}</th>
                    <th className="py-2.5 px-3">{t('SLA Target')}</th>
                    <th className="py-2.5 px-3">{t('Status')}</th>
                    <th className="py-2.5 px-3">{t('Assigned Staff')}</th>
                    <th className="py-2.5 px-3 text-right">{t('Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategoryGrievances.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-kmc-navy whitespace-nowrap">
                        {g.id}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs">
                        {g.category && g.category !== activeCategoryMeta.name && (
                          <span className="inline-block px-2 py-0.5 mb-1 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            {t(g.category)}
                          </span>
                        )}
                        <p className="line-clamp-2">{t(g.description)}</p>
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                          {t('Reported')}: {g.reportedOn} {g.citizenName ? `• ${t('Applicant')}: ${g.citizenName}` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{t(g.location)}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-bold block mt-0.5">
                          Ward {g.wardId}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {g.beforePhoto ? (
                          <button
                            type="button"
                            onClick={() => setPreviewPhoto({
                              src: g.beforePhoto!,
                              title: `${g.id}: ${g.category}`,
                              location: `${g.location} (Ward ${g.wardId})`,
                            })}
                            className="relative group block"
                            title={t('Click to inspect full photograph evidence')}
                          >
                            <PhotoThumbnail
                              src={g.beforePhoto}
                              alt={`Site Photo for ${g.id}`}
                              location={t(g.location)}
                              size="sm"
                            />
                            <span className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 rounded-lg flex items-center justify-center transition opacity-0 group-hover:opacity-100">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">{t('No photo')}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-xs font-bold text-amber-800 whitespace-nowrap">
                        {g.slaHours || activeCategoryMeta.defaultSla} {t('Hours')}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusChip status={g.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {g.assignedTo ? (
                          <div className="flex items-center gap-1.5 text-slate-800">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-semibold text-xs">{g.assignedTo}</span>
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {t('Awaiting Assignment')}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {g.status === 'Pending' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(g.id)}
                            className="px-3 py-1.5 min-h-[34px] bg-kmc-navy hover:bg-kmc-navy-light text-white font-bold text-xs rounded-lg flex items-center gap-1.5 ml-auto shadow-sm transition active:scale-95"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>{t('Assign Staff')}</span>
                          </button>
                        ) : g.status === 'Completed' ? (
                          <button
                            type="button"
                            onClick={() => handleApproveGrievance(g.id)}
                            className="px-3 py-1.5 min-h-[34px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 ml-auto shadow-sm transition active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{t('Approve & Close')}</span>
                          </button>
                        ) : g.status === 'Resolved' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                            {t('Signed Off')}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {t('In Execution')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Compact Field Staff Task Progress (Collapsible at bottom) */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-4">
          <div
            onClick={() => setShowDispatchedTasks(!showDispatchedTasks)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-kmc-navy" />
              <h3 className="text-xs font-bold font-heading uppercase text-slate-800">
                {selectedWard === 'all'
                  ? t('Field Staff Dispatched Tasks (City-Wide)')
                  : t('Field Staff Dispatched Tasks (Ward {{ward}})', { ward: selectedWard })}
              </h3>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full ml-1">
                {displayedTasks.length}
              </span>
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 p-1 flex items-center gap-1 text-xs font-medium"
            >
              <span>{showDispatchedTasks ? t('Hide') : t('View')}</span>
              {showDispatchedTasks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showDispatchedTasks && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              {displayedTasks.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                  {t('No active dispatched tasks in this scope.')}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {displayedTasks.map((task) => (
                    <div key={task.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold text-slate-500">{task.id}</span>
                          <StatusChip status={task.status} size="sm" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 font-heading uppercase">
                          {task.task}
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-1">
                          {t('Assigned')}: <strong>{task.assignedTo}</strong>
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {t('Due Date')}: {task.dueDate}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 font-bold">Ward {task.wardId}</span>
                        {task.status !== 'Completed' ? (
                          <span className="text-amber-800 font-bold">{t('Waiting for after photo')}</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">✓ {t('Completed')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

      </main>

      {/* WARD-SPECIFIC STAFF ASSIGNMENT MODAL DIALOG */}
      {selectedGrievanceId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold font-heading uppercase text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-kmc-navy" />
                <span>{t('Dispatch Task to Field Staff')}</span>
              </h4>
              <button
                onClick={() => setSelectedGrievanceId(null)}
                className="text-slate-500 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const {
                eligibleStaff: eligibleWardStaff,
                grievance: targetG,
                requiredCategory,
                targetWardId,
              } = staffCategoryRepository.getEligibleFieldStaff(selectedGrievanceId || '', currentUser?.id);
              
              const hasStaff = eligibleWardStaff.length > 0;
              const effectiveAssignee = assigneeName || (hasStaff ? eligibleWardStaff[0].displayName : '');

              return (
                <>
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-kmc-navy">{selectedGrievanceId}</span>
                      <span className="text-xs font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                        Ward {targetWardId}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {targetG ? t(targetG.description) : t('Grievance')}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{targetG?.location}</span>
                    </p>

                    {requiredCategory && (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200 mt-2">
                        <span className="text-[11px] font-bold text-slate-600 uppercase">{t('Required Staff Category')}:</span>
                        <span className="text-[11px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                          {requiredCategory.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {!hasStaff ? (
                    <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>{t('No active {{cat}} is assigned to Ward {{ward}}.', { cat: requiredCategory?.name || 'Field Staff', ward: targetWardId })}</span>
                      </p>
                      <p className="text-amber-800 leading-relaxed text-[11px]">
                        {t('This grievance will remain in the Awaiting Assignment queue. Cross-ward staff assignments are strictly prohibited by KMC governance rules to ensure ward-level accountability.')}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {t('{{count}} eligible {{cat}} worker(s) assigned to Ward {{ward}} ready for deployment.', {
                          count: eligibleWardStaff.length,
                          cat: requiredCategory?.name || 'Field Staff',
                          ward: targetWardId,
                        })}
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleConfirmAssignment} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        {t('Select Eligible Field Worker (Ward {{ward}})', { ward: targetWardId })}
                      </label>
                      {hasStaff ? (
                        <SearchableSelect
                          value={effectiveAssignee}
                          onChange={(val) => setAssigneeName(val)}
                          searchPlaceholder={t('Search {{cat}} in Ward {{ward}}...', { cat: requiredCategory?.name || 'Field Staff', ward: targetWardId })}
                          options={eligibleWardStaff.map((s) => {
                            const workload = tasks.filter((t) => (t.assignedFieldStaffId === s.id || t.assignedTo === s.displayName) && t.status !== 'Completed').length;
                            return {
                              value: s.displayName,
                              label: s.displayName,
                              sublabel: `ID: ${s.id} • Ward ${s.wardId} • ${s.staffCategory || s.roleTitle} • ${workload} active task(s)`,
                            };
                          })}
                          fullWidth
                          size="sm"
                        />
                      ) : (
                        <input
                          type="text"
                          disabled
                          value={t('No active {{cat}} assigned to Ward {{ward}}', { cat: requiredCategory?.name || 'staff', ward: targetWardId })}
                          className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 text-xs cursor-not-allowed opacity-75"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        {t('Target Completion SLA Deadline')}
                      </label>
                      <input
                        type="text"
                        value={targetDueDate}
                        onChange={(e) => setTargetDueDate(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-kmc-navy/30 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSelectedGrievanceId(null)}
                        className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 text-xs"
                      >
                        {t('Cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={!hasStaff || (!assigneeName && !effectiveAssignee)}
                        className="px-4 py-2 bg-kmc-navy hover:bg-kmc-navy-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg uppercase shadow text-xs transition"
                      >
                        {t('Confirm & Dispatch Task')}
                      </button>
                    </div>
                  </form>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* FULL PHOTO EVIDENCE PREVIEW MODAL */}
      {previewPhoto && (
        <FullImageModal
          src={previewPhoto.src}
          alt={previewPhoto.title}
          title={previewPhoto.title}
          location={previewPhoto.location}
          badge={t('Site Evidence')}
          badgeVariant="before"
          onClose={() => setPreviewPhoto(null)}
        />
      )}

      <FooterStrip
        tagline="Departmental Workflow & Grievance SLA Redressal System • Karimnagar Municipal Corporation"
      />
    </div>
  );
};
