import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { useAuth } from '../auth/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole } from '../auth/authTypes';
import { ROLE_DESTINATIONS, ROLE_DISPLAY_NAMES } from '../auth/permissions';
import { 
  Users, Shield, Eye, CheckCircle2, XCircle, 
  UserCheck, AlertTriangle, ArrowRight, ExternalLink, 
  Download, Upload, RotateCcw, UserPlus, X, ArrowRightLeft, 
  Building2, HardHat, Phone, RefreshCw, Search, Filter, Edit3, Lock, Check
} from 'lucide-react';
import { SearchableSelect } from '../components/common/SearchableSelect';
import { userRepository } from '../storage/repositories/userRepository';
import { taskRepository } from '../storage/repositories/taskRepository';
import { staffCategoryRepository } from '../storage/repositories/staffCategoryRepository';
import { StaffCategory } from '../data/staffCategories';
import { storageService } from '../storage/storageService';
import { STORAGE_KEYS } from '../storage/storageKeys';
import { Ward } from '../data/wards';
import { User } from '../auth/authTypes';
import { usePrefs } from '../i18n';

export const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { allDemoUsers, toggleUserStatus, setPreviewRole, createUser, updateUser, currentUser } = useAuth();
  const { resetAllDemoData, exportDemoBackup, importDemoBackup, wards } = useApp();
  const { t } = usePrefs();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // User Directory Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deactivated'>('all');

  // View User Modal State
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('citizen');
  const [editWardId, setEditWardId] = useState(27);
  const [editDeptName, setEditDeptName] = useState('Engineering');
  const [editStaffCategoryId, setEditStaffCategoryId] = useState<string>('sanitation-worker');
  const [editIsActive, setEditIsActive] = useState(true);

  // New User Form State
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('KmcDemo@123');
  const [newRole, setNewRole] = useState<UserRole>('citizen');
  const [newWardId, setNewWardId] = useState(27);
  const [newDeptName, setNewDeptName] = useState('Engineering');
  const [newStaffCategoryId, setNewStaffCategoryId] = useState<string>('sanitation-worker');

  // Staff Categories Governance State
  const [staffCategories, setStaffCategories] = useState<StaffCategory[]>(() => staffCategoryRepository.getAll());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StaffCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catDept, setCatDept] = useState('Engineering');
  const [catDesc, setCatDesc] = useState('');
  const [catKeywords, setCatKeywords] = useState('');
  const [catSkills, setCatSkills] = useState('');
  const [catSla, setCatSla] = useState(48);

  // Ward Staff Management State
  const [selectedStaffWardId, setSelectedStaffWardId] = useState<number>(27);
  const [reassignStaffTarget, setReassignStaffTarget] = useState<User | null>(null);
  const [targetNewWardId, setTargetNewWardId] = useState<number>(12);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [, setRefreshStaffKey] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentWardObj = wards.find((w) => w.id === selectedStaffWardId);
  const currentWardStaff = userRepository.getFieldStaff({ wardId: selectedStaffWardId });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePreviewRole = (role: UserRole) => {
    setPreviewRole(role);
    const dest = ROLE_DESTINATIONS[role];
    navigate(dest);
  };

  const handleExportData = () => {
    const jsonStr = exportDemoBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kmc-governance-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('Platform demonstration data exported successfully!'));
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDemoBackup(content);
      if (res.success) {
        showToast(res.message);
      } else {
        alert(res.message);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    resetAllDemoData();
    setShowResetModal(false);
    showToast(t('Platform reset to default demo dataset.'));
  };

  // Open Edit User Modal
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditDisplayName(user.displayName || user.name || '');
    setEditRole(user.role);
    setEditWardId(user.wardId || user.assignedWardIds?.[0] || 27);
    setEditDeptName(user.departmentName || user.departmentId || 'Engineering');
    setEditStaffCategoryId(user.staffCategoryId || 'sanitation-worker');
    setEditIsActive(user.isActive !== false);
  };

  // Save Edit User
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editDisplayName.trim()) {
      alert(t('Please fill all required user fields.'));
      return;
    }

    const selectedCategoryObj = staffCategories.find((c) => c.id === editStaffCategoryId);
    const categoryName = editRole === 'field_staff' ? (selectedCategoryObj?.name || 'Sanitation Worker') : undefined;
    const categoryId = editRole === 'field_staff' ? (selectedCategoryObj?.id || 'sanitation-worker') : undefined;
    const deptId = editRole === 'field_staff' && selectedCategoryObj ? selectedCategoryObj.departmentId : editDeptName;
    const deptName = editRole === 'field_staff' && selectedCategoryObj 
      ? selectedCategoryObj.departmentName 
      : (editDeptName.includes('Section') ? editDeptName : `${editDeptName} Section`);

    const updates: Partial<User> = {
      displayName: editDisplayName.trim(),
      name: editDisplayName.trim(),
      role: editRole,
      roleTitle: editRole === 'field_staff' ? `${categoryName} – Ward ${editWardId}` : ROLE_DISPLAY_NAMES[editRole]?.title || editRole,
      assignedWardIds: editRole === 'corporator' || editRole === 'citizen' || editRole === 'field_staff' ? [editWardId] : undefined,
      assignedWardName: editRole === 'corporator' || editRole === 'citizen' || editRole === 'field_staff' ? `Ward ${editWardId}` : undefined,
      wardId: editRole === 'corporator' || editRole === 'citizen' || editRole === 'field_staff' ? editWardId : undefined,
      departmentId: editRole === 'department_officer' || editRole === 'field_staff' ? deptId : undefined,
      departmentName: editRole === 'department_officer' || editRole === 'field_staff' ? deptName : undefined,
      staffCategory: categoryName,
      staffCategoryId: categoryId,
      skills: editRole === 'field_staff' ? (selectedCategoryObj?.skills || [categoryName!]) : undefined,
      isActive: editIsActive,
    };

    const success = updateUser(editingUser.username, updates);
    if (success) {
      showToast(t('User updated successfully!'));
      setEditingUser(null);
      setRefreshStaffKey((k) => k + 1);
    } else {
      alert(t('Failed to update user record.'));
    }
  };

  // Create User Handler
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim() || !newUsername.trim()) {
      alert(t('Please fill all required user fields.'));
      return;
    }

    const email = newUsername.toLowerCase().trim();
    const id = `USR-CUSTOM-${Date.now()}`;
    const initials = newDisplayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CU';

    const selectedCategoryObj = staffCategories.find((c) => c.id === newStaffCategoryId);
    const categoryName = newRole === 'field_staff' ? (selectedCategoryObj?.name || 'Sanitation Worker') : undefined;
    const categoryId = newRole === 'field_staff' ? (selectedCategoryObj?.id || 'sanitation-worker') : undefined;
    const deptId = newRole === 'field_staff' && selectedCategoryObj ? selectedCategoryObj.departmentId : newDeptName;
    const deptName = newRole === 'field_staff' && selectedCategoryObj 
      ? selectedCategoryObj.departmentName 
      : (newDeptName.includes('Section') ? newDeptName : `${newDeptName} Section`);

    const success = createUser({
      passwordHash: newPassword,
      roleDescription: `Custom account registered by Super Admin with role: ${newRole}`,
      user: {
        id,
        username: email,
        displayName: newDisplayName.trim(),
        name: newDisplayName.trim(),
        role: newRole,
        roleTitle: newRole === 'field_staff' ? `${categoryName} – Ward ${newWardId}` : ROLE_DISPLAY_NAMES[newRole].title,
        assignedWardIds: newRole === 'corporator' || newRole === 'citizen' || newRole === 'field_staff' ? [newWardId] : undefined,
        assignedWardName: newRole === 'corporator' || newRole === 'citizen' || newRole === 'field_staff' ? `Ward ${newWardId}` : undefined,
        wardId: newRole === 'corporator' || newRole === 'citizen' || newRole === 'field_staff' ? newWardId : undefined,
        departmentId: newRole === 'department_officer' || newRole === 'field_staff' ? deptId : undefined,
        departmentName: newRole === 'department_officer' || newRole === 'field_staff' ? deptName : undefined,
        staffCategory: categoryName,
        staffCategoryId: categoryId,
        skills: newRole === 'field_staff' ? (selectedCategoryObj?.skills || [categoryName!]) : undefined,
        permissions: newRole === 'super_admin' ? ['platform:admin', 'users:manage'] : ['citizen:view_own'],
        isActive: true,
        avatarInitials: initials,
      },
    });

    if (success) {
      if (newRole === 'field_staff') {
        const wardsList = storageService.getItem<Ward[]>(STORAGE_KEYS.WARDS) || [];
        const targetWard = wardsList.find((w) => w.id === newWardId);
        if (targetWard) {
          targetWard.assignedStaffIds = [...(targetWard.assignedStaffIds || []), id];
          storageService.setItem(STORAGE_KEYS.WARDS, wardsList);
        }
        setRefreshStaffKey((k) => k + 1);
      }
      showToast(t('User created successfully!'));
      setShowAddModal(false);
      setNewDisplayName('');
      setNewUsername('');
    } else {
      alert(t(`User with email "${email}" already exists.`));
    }
  };

  // Compute User Overview Metrics
  const allUsersList = Object.values(allDemoUsers).map((r) => r.user);
  const totalUsersCount = allUsersList.length;
  const activeUsersCount = allUsersList.filter((u) => u.isActive !== false).length;
  const deactivatedUsersCount = totalUsersCount - activeUsersCount;

  const roleCounts: Record<UserRole, number> = {
    super_admin: 0,
    mayor_commissioner: 0,
    corporator: 0,
    department_officer: 0,
    field_staff: 0,
    citizen: 0,
    governance_auditor: 0,
  };
  allUsersList.forEach((u) => {
    if (roleCounts[u.role] !== undefined) {
      roleCounts[u.role]++;
    }
  });

  // Filtered Users List
  const filteredUsers = Object.entries(allDemoUsers).filter(([email, record]) => {
    const u = record.user;
    const name = u.displayName || u.name || '';
    const q = searchQuery.toLowerCase().trim();

    // Text search
    if (q) {
      const matchName = name.toLowerCase().includes(q);
      const matchEmail = (u.username || email).toLowerCase().includes(q);
      const matchId = (u.id || '').toLowerCase().includes(q);
      const matchWard = (u.assignedWardName || '').toLowerCase().includes(q);
      const matchDept = (u.departmentName || '').toLowerCase().includes(q);
      const matchCategory = (u.staffCategory || '').toLowerCase().includes(q);
      const matchRole = (u.roleTitle || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchId && !matchWard && !matchDept && !matchCategory && !matchRole) {
        return false;
      }
    }

    // Role filter
    if (roleFilter !== 'all' && u.role !== roleFilter) {
      return false;
    }

    // Status filter
    if (statusFilter === 'active' && u.isActive === false) {
      return false;
    }
    if (statusFilter === 'deactivated' && u.isActive !== false) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      <BannerStrip
        title={t("Super Admin • User Governance & Account Management")}
        tagline={t("Manage Demonstration Accounts, Role Assignments & Live Role Previews")}
        actionButton={
          <span className="text-xs bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-md shadow uppercase tracking-wide">
            {t("Super Administrator Access")}
          </span>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 w-full">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-white hover:text-emerald-200">✕</button>
          </div>
        )}

        {/* Header Overview Card */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-amber-500">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                {t('System RBAC Console')}
              </span>
              <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                {t('Persistent Local Storage Active')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading uppercase text-slate-900 mt-1">
              {t('Municipal Platform User Directory')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('Control account status, audit assigned permissions, create demonstration profiles, or preview role portals.')}
            </p>
          </div>

          {/* Action Buttons: Add User, Export, Import, Reset */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-2 min-h-[36px] bg-kmc-navy hover:bg-kmc-navy-light text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('Add User')}</span>
            </button>

            <button
              onClick={handleExportData}
              className="px-3 py-2 min-h-[36px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg flex items-center gap-1.5 border border-slate-300"
              title="Download JSON backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('Export')}</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 min-h-[36px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg flex items-center gap-1.5 border border-slate-300"
              title="Restore from JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t('Import')}</span>
            </button>

            <button
              onClick={() => setShowResetModal(true)}
              className="px-3 py-2 min-h-[36px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg flex items-center gap-1.5 border border-rose-300"
              title="Reset to default seed data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('Reset Data')}</span>
            </button>
          </div>
        </section>

        {/* User Overview KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-card border border-slate-200 p-4 flex items-center justify-between border-l-4 border-l-kmc-navy">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-500">{t('Total Registered Users')}</span>
              <p className="text-2xl font-bold font-heading text-slate-900 mt-0.5">{totalUsersCount}</p>
              <span className="text-[10px] text-slate-400">{t('Across 7 Municipal Roles')}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-kmc-navy flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card border border-slate-200 p-4 flex items-center justify-between border-l-4 border-l-emerald-600">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-500">{t('Active Accounts')}</span>
              <p className="text-2xl font-bold font-heading text-emerald-700 mt-0.5">{activeUsersCount}</p>
              <span className="text-[10px] text-emerald-600 font-medium">
                {Math.round((activeUsersCount / (totalUsersCount || 1)) * 100)}% {t('operational')}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card border border-slate-200 p-4 flex items-center justify-between border-l-4 border-l-rose-500">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-500">{t('Deactivated Accounts')}</span>
              <p className="text-2xl font-bold font-heading text-rose-700 mt-0.5">{deactivatedUsersCount}</p>
              <span className="text-[10px] text-slate-400">{t('Access Suspended')}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card border border-slate-200 p-4 flex items-center justify-between border-l-4 border-l-purple-600">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-500">{t('Field Operations Staff')}</span>
              <p className="text-2xl font-bold font-heading text-purple-700 mt-0.5">{roleCounts.field_staff}</p>
              <span className="text-[10px] text-purple-600 font-medium">{t('Ward Ground Personnel')}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <HardHat className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Role Breakdown Filter Chips */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-3.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] uppercase font-bold text-slate-500 mr-2 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('Role Breakdown')}:</span>
          </span>
          {(Object.keys(roleCounts) as UserRole[]).map((r) => {
            const badge = ROLE_DISPLAY_NAMES[r] || { title: r, bg: 'bg-slate-100', color: 'text-slate-700' };
            const isSelected = roleFilter === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(isSelected ? 'all' : r)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-xs border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'ring-2 ring-kmc-navy shadow-sm ' + badge.bg + ' ' + badge.color
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title={`Filter by ${badge.title}`}
              >
                <span>{t(badge.title)}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/80 border border-slate-300">
                  {roleCounts[r]}
                </span>
              </button>
            );
          })}
          {roleFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline ml-auto"
            >
              {t('Clear Filter')}
            </button>
          )}
        </section>

        {/* Registered Platform Users Directory & Table */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-xs font-bold font-heading uppercase text-slate-800">
                {t('Registered Role Profiles & Directory')}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t('Showing {{count}} of {{total}} registered platform accounts with real-time RBAC permissions', {
                  count: filteredUsers.length,
                  total: totalUsersCount,
                })}
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Search users by name, email, ID...')}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-kmc-navy"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-700"
              >
                <option value="all">{t('All Statuses')}</option>
                <option value="active">{t('Active Only')}</option>
                <option value="deactivated">{t('Deactivated Only')}</option>
              </select>

              {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                  }}
                  className="px-2.5 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg font-semibold border border-rose-200"
                >
                  {t('Reset Filters')}
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t('User / Display Name')}</th>
                  <th className="py-3 px-4">{t('User ID & Identifier')}</th>
                  <th className="py-3 px-4">{t('Role / Title')}</th>
                  <th className="py-3 px-4">{t('Assigned Context')}</th>
                  <th className="py-3 px-4">{t('Status')}</th>
                  <th className="py-3 px-4 text-right">{t('Administrative Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">{t('No matching users found')}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t('Try adjusting your search or filter criteria')}</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(([email, record]) => {
                    const u = record.user;
                    const userName = u.displayName || u.name || 'Unnamed';
                    const badge = ROLE_DISPLAY_NAMES[u.role] || {
                      title: u.role,
                      bg: 'bg-slate-100',
                      color: 'text-slate-800',
                    };

                    return (
                      <tr key={email} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-kmc-navy/10 text-kmc-navy font-bold text-xs flex items-center justify-center shrink-0 border border-kmc-navy/20">
                              {u.avatarInitials || userName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">
                                {userName}
                              </div>
                              <div className="text-slate-500 font-mono text-[11px]">
                                {u.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {u.id}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${badge.bg} ${badge.color}`}>
                            {t(badge.title)}
                          </span>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {t(u.roleTitle)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700">
                          {u.assignedWardName ? (
                            <span className="text-xs font-semibold text-purple-700">
                              {t(u.assignedWardName)}
                            </span>
                          ) : u.departmentName ? (
                            <span className="text-xs font-semibold text-orange-700">
                              {t(u.departmentName)}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 italic">
                              {t('City-Wide (All 66 Wards)')}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {u.isActive !== false ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{t('Active')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" />
                              <span>{t('Deactivated')}</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* View User */}
                            <button
                              type="button"
                              onClick={() => setViewingUser(u)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-kmc-navy hover:bg-slate-100 border border-slate-200 transition-colors"
                              title={t('View User Details')}
                              aria-label={t('View user details')}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit User */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-kmc-navy hover:bg-slate-100 border border-slate-200 transition-colors"
                              title={t('Edit User')}
                              aria-label={t('Edit user')}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle Active status */}
                            <button
                              type="button"
                              onClick={() => {
                                const newStatus = toggleUserStatus(u.username);
                                showToast(t(`Account {{name}} is now {{status}}`, {
                                  name: u.username,
                                  status: newStatus ? t('Active') : t('Deactivated'),
                                }));
                              }}
                              className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all ${
                                u.isActive !== false
                                  ? 'bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 hover:border-rose-300'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              {u.isActive !== false ? t('Deactivate') : t('Activate')}
                            </button>

                            {/* Preview Portal */}
                            <button
                              type="button"
                              onClick={() => handlePreviewRole(u.role)}
                              className="px-2 py-1 min-h-[30px] bg-kmc-navy hover:bg-kmc-navy-light text-white rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all"
                              title={t('Preview portal as this role')}
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span className="hidden sm:inline">{t('Preview')}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Ward Field Staff Deployments & Reassignment Console */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 overflow-hidden border-l-4 border-l-purple-600">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/70">
            <div>
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-kmc-navy" />
                <h3 className="text-xs font-bold font-heading uppercase text-slate-800">
                  {t('Ward-Wise Field Staff Deployments & Reassignment')}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t('Audit authorized operational ground workers by ward, verify workload, and reassign personnel across divisions.')}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="staff-ward-select" className="text-xs text-slate-600 font-bold whitespace-nowrap">
                {t('Inspect Ward')}:
              </label>
              <SearchableSelect
                id="staff-ward-select"
                value={selectedStaffWardId}
                onChange={(val) => setSelectedStaffWardId(Number(val))}
                searchPlaceholder={t('Search 66 wards...')}
                options={wards.map((w) => {
                  const staffCount = userRepository.getFieldStaff({ wardId: w.id }).length;
                  return {
                    value: w.id,
                    label: `${t('Ward')} ${w.id} – ${t(w.name)}`,
                    sublabel: staffCount === 0 ? `⚠ 0 ${t('Staff Assigned')}` : `${staffCount} ${t('Staff Assigned')}`,
                  };
                })}
                className="w-full sm:w-72"
                size="sm"
              />
            </div>
          </div>

          {/* Selected Ward Stats Strip */}
          <div className="px-4 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">{t('Selected Ward')}</span>
                <p className="font-bold text-slate-900">
                  {t('Ward')} {selectedStaffWardId}: {currentWardObj ? t(currentWardObj.name) : 'Municipal Division'}
                </p>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-[10px] uppercase font-bold text-slate-500">{t('Corporator')}</span>
                <p className="font-medium text-slate-700">
                  {currentWardObj?.corporator || t('Unassigned')}
                </p>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-[10px] uppercase font-bold text-slate-500">{t('Assigned Staff')}</span>
                <p className="font-bold text-purple-700">
                  {currentWardStaff.length} {t('Ground Workers')}
                </p>
              </div>
            </div>

            {currentWardStaff.length === 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t('Zero Field Workers Assigned')}
              </span>
            )}
          </div>

          {/* Staff Roster Table */}
          {currentWardStaff.length === 0 ? (
            <div className="p-8 text-center bg-amber-50/30">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                {t('No active field staff are assigned to this ward.')}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
                {t('Tasks for grievances in this ward cannot be dispatched until ground staff are deployed. Use "Add User" or reassign an available worker from another division.')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">{t('Staff Member')}</th>
                    <th className="py-2.5 px-4">{t('Specialized Category & Skills')}</th>
                    <th className="py-2.5 px-4">{t('Department & Role')}</th>
                    <th className="py-2.5 px-4">{t('Contact Phone')}</th>
                    <th className="py-2.5 px-4">{t('Operational Status')}</th>
                    <th className="py-2.5 px-4">{t('Active Incomplete Tasks')}</th>
                    <th className="py-2.5 px-4 text-right">{t('Transfer Assignment')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentWardStaff.map((staff) => {
                    const staffName = staff.displayName || staff.name || staff.username || 'Staff';
                    const firstName = staffName.split(' ')[0] || '';
                    const activeTasks = taskRepository
                      .getByWardId(selectedStaffWardId)
                      .filter(
                        (t) =>
                          t.status !== 'Completed' &&
                          (t.assignedFieldStaffId === staff.id ||
                            (t.assignedTo && staffName && t.assignedTo.toLowerCase() === staffName.toLowerCase()) ||
                            (t.assignedTo && firstName && t.assignedTo.toLowerCase().includes(firstName.toLowerCase())))
                      );

                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{staffName}</div>
                          <div className="text-[10px] font-mono text-slate-500">{staff.id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded">
                            {t(staff.staffCategory || 'Sanitation Worker')}
                          </span>
                          {staff.skills && staff.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {staff.skills.slice(0, 2).map((sk, idx) => (
                                <span key={idx} className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                                  {t(sk)}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800">
                            {t(staff.departmentName || staff.departmentId || 'Operations')}
                          </span>
                          <div className="text-[11px] text-slate-500">{t(staff.role)}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {staff.phone || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          {staff.isActive !== false ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{t('Active')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" />
                              <span>{t('Deactivated')}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              activeTasks.length > 0
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {activeTasks.length} {t('active')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setReassignStaffTarget(staff);
                              setTargetNewWardId(selectedStaffWardId === 12 ? 27 : 12);
                              setReassignModalOpen(true);
                            }}
                            className="px-3 py-1.5 min-h-[32px] bg-kmc-navy hover:bg-kmc-navy-light text-white rounded text-xs font-bold flex items-center gap-1.5 ml-auto shadow-sm transition-all"
                            title={t('Reassign this staff member to another ward')}
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>{t('Reassign Ward')}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Specialized Municipal Field Staff Categories & Skills Configuration */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-kmc-navy" />
                <h3 className="text-xs font-bold font-heading uppercase text-slate-800">
                  {t('Municipal Field Staff Specialized Categories & Skill Governance')}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t('Configurable municipal qualifications, skills, standard SLAs, and automated grievance-to-staff routing rules')}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCatName('');
                setCatDept('Engineering');
                setCatDesc('');
                setCatKeywords('');
                setCatSkills('');
                setCatSla(48);
                setShowCategoryModal(true);
              }}
              className="px-3 py-1.5 min-h-[32px] bg-kmc-navy hover:bg-kmc-navy-light text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('Add Staff Category')}</span>
            </button>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {staffCategories.map((cat) => {
              const allStaff = userRepository.getFieldStaff({ activeOnly: false });
              const deployedCount = allStaff.filter((s) =>
                staffCategoryRepository.isStaffEligible(s, cat.name)
              ).length;

              return (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-2.5"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {t(cat.name)}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 shrink-0">
                        {cat.slaHours}h SLA
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 mt-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{t(cat.departmentName)}</span>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {t(cat.description)}
                    </p>

                    <div className="mt-2 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {t('Mapped Issues')}:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {cat.matchedGrievanceCategories.slice(0, 3).map((kw, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded"
                          >
                            {t(kw)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500">
                      {deployedCount} {t('deployed in city')}
                    </span>
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setCatName(cat.name);
                        setCatDept(cat.departmentName);
                        setCatDesc(cat.description);
                        setCatKeywords(cat.matchedGrievanceCategories.join(', '));
                        setCatSkills(cat.skills.join(', '));
                        setCatSla(cat.slaHours);
                        setShowCategoryModal(true);
                      }}
                      className="text-kmc-navy hover:text-kmc-navy-light font-bold text-xs"
                    >
                      {t('Configure →')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* View User Modal Dialog */}
      {viewingUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-kmc-navy/10 text-kmc-navy font-bold text-sm flex items-center justify-center border border-kmc-navy/20">
                  {viewingUser.avatarInitials || (viewingUser.displayName || viewingUser.name || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-bold font-heading text-slate-900">
                    {viewingUser.displayName || viewingUser.name}
                  </h4>
                  <span className="text-xs font-mono text-slate-500">{viewingUser.username}</span>
                </div>
              </div>
              <button 
                onClick={() => setViewingUser(null)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label={t('Close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('User ID')}</span>
                  <span className="font-mono font-bold text-slate-800">{viewingUser.id}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('Account Status')}</span>
                  {viewingUser.isActive !== false ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('Active')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-rose-700">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{t('Deactivated')}</span>
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('Assigned Role')}</span>
                  <span className="font-bold text-slate-800">{t(ROLE_DISPLAY_NAMES[viewingUser.role]?.title || viewingUser.role)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('Official Title')}</span>
                  <span className="font-semibold text-slate-700">{t(viewingUser.roleTitle)}</span>
                </div>
              </div>

              {/* Geographic and Department Context */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <h5 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">{t('Operational Scope & Assignments')}</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[11px]">{t('Assigned Ward')}</span>
                    <strong className="text-purple-800 font-semibold text-xs">
                      {viewingUser.assignedWardName ? t(viewingUser.assignedWardName) : viewingUser.wardId ? `${t('Ward')} ${viewingUser.wardId}` : t('City-Wide (All 66 Wards)')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">{t('Department / Wing')}</span>
                    <strong className="text-orange-800 font-semibold text-xs">
                      {viewingUser.departmentName ? t(viewingUser.departmentName) : viewingUser.departmentId ? t(viewingUser.departmentId) : t('Central Administration')}
                    </strong>
                  </div>
                </div>

                {viewingUser.role === 'field_staff' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-900 font-bold text-xs">{t('Specialized Staff Category')}:</span>
                      <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                        {t(viewingUser.staffCategory || 'Sanitation Worker')}
                      </span>
                    </div>
                    {viewingUser.skills && viewingUser.skills.length > 0 && (
                      <div>
                        <span className="text-slate-600 text-[11px] block mb-1">{t('Ground Competencies & Skills')}:</span>
                        <div className="flex flex-wrap gap-1">
                          {viewingUser.skills.map((sk, idx) => (
                            <span key={idx} className="bg-white border border-blue-200 text-blue-900 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              {t(sk)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Assigned Permissions */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">{t('Granted RBAC Permissions')}</span>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
                  {viewingUser.permissions && viewingUser.permissions.length > 0 ? (
                    viewingUser.permissions.map((p) => (
                      <span key={p} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">
                        ✓ {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">{t('Standard role permissions active')}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const u = viewingUser;
                  setViewingUser(null);
                  handleOpenEdit(u);
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t('Edit Profile')}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="px-4 py-2 bg-kmc-navy hover:bg-kmc-navy-light text-white rounded-lg font-bold text-xs uppercase shadow transition-colors"
              >
                {t('Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal Dialog */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-kmc-navy" />
                <h4 className="text-sm font-bold font-heading uppercase text-slate-900">
                  {t('Edit User Account Profile')}
                </h4>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('User ID')}:</span>
                  <span className="font-mono font-bold text-slate-800">{editingUser.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('Login Username')}:</span>
                  <span className="font-mono text-slate-800">{editingUser.username}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {t('Full Display Name')} *
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="form-field"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {t('Assigned User Role')} *
                </label>
                <SearchableSelect
                  value={editRole}
                  onChange={(val) => setEditRole(val as UserRole)}
                  searchPlaceholder={t('Search role...')}
                  options={[
                    { value: 'citizen', label: t('Citizen (Resident Portal)'), sublabel: t('View, track & report civic issues') },
                    { value: 'corporator', label: t('Corporator (Ward Representative)'), sublabel: t('Oversee ground operations for a ward') },
                    { value: 'department_officer', label: t('Department Officer (Operational Wing)'), sublabel: t('Assign & manage technical tickets') },
                    { value: 'field_staff', label: t('Field Staff (Ground Operations)'), sublabel: t('Complete tasks & upload evidence') },
                    { value: 'mayor_commissioner', label: t('Mayor / Commissioner (Leadership)'), sublabel: t('City-wide metrics & command console') },
                    { value: 'governance_auditor', label: t('Governance Auditor (Audit & SLA)'), sublabel: t('Independent compliance & audit tracking') },
                    { value: 'super_admin', label: t('Super Administrator (Full System)'), sublabel: t('Full system privileges & user management') },
                  ]}
                  fullWidth
                  size="sm"
                />
              </div>

              {(editRole === 'corporator' || editRole === 'citizen' || editRole === 'field_staff') && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {t('Assigned Ward Division')} {editRole === 'field_staff' && <span className="text-red-600 font-bold">*</span>}
                  </label>
                  <SearchableSelect
                    value={editWardId}
                    onChange={(val) => setEditWardId(Number(val))}
                    searchPlaceholder={t('Search 66 wards...')}
                    options={wards.map((w) => ({
                      value: w.id,
                      label: `${t('Ward')} ${w.id} – ${t(w.name)}`,
                      sublabel: w.corporator ? `${t('Corp')}: ${w.corporator}` : undefined,
                    }))}
                    fullWidth
                    size="sm"
                  />
                </div>
              )}

              {editRole === 'field_staff' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {t('Specialized Municipal Staff Category')} <span className="text-red-600 font-bold">*</span>
                  </label>
                  <SearchableSelect
                    value={editStaffCategoryId}
                    onChange={(val) => {
                      setEditStaffCategoryId(String(val));
                      const cat = staffCategories.find((c) => c.id === String(val));
                      if (cat) {
                        setEditDeptName(cat.departmentName);
                      }
                    }}
                    searchPlaceholder={t('Search staff category...')}
                    options={staffCategories.map((c) => ({
                      value: c.id,
                      label: t(c.name),
                      sublabel: `${t(c.departmentName)} Wing • SLA: ${c.slaHours}h`,
                    }))}
                    fullWidth
                    size="sm"
                  />
                </div>
              )}

              {(editRole === 'department_officer' || editRole === 'field_staff') && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {t('Assigned Municipal Wing')} <span className="text-red-600 font-bold">*</span>
                  </label>
                  <SearchableSelect
                    value={editDeptName}
                    onChange={(val) => setEditDeptName(String(val))}
                    searchPlaceholder={t('Search department...')}
                    options={[
                      { value: 'Engineering Section', label: t('Engineering Section') },
                      { value: 'Sanitation Section', label: t('Sanitation Section') },
                      { value: 'Town Planning Section (TPS)', label: t('Town Planning Section (TPS)') },
                      { value: 'Revenue Section', label: t('Revenue Section') },
                      { value: 'Establishment Section', label: t('Establishment Section') },
                      { value: 'Statistics / Birth & Death Registration Section', label: t('Statistics / Birth & Death Registration Section') },
                      { value: 'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)', label: t('Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)') },
                    ]}
                    fullWidth
                    size="sm"
                  />
                </div>
              )}

              <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-700">{t('Account Status')}:</span>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-kmc-navy focus:ring-kmc-navy"
                  />
                  <span className={`text-xs font-bold ${editIsActive ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {editIsActive ? t('Active') : t('Deactivated')}
                  </span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-kmc-navy hover:bg-kmc-navy-light text-white font-bold rounded-lg uppercase shadow transition-colors"
                >
                  {t('Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold font-heading uppercase text-slate-900">
                {t('Register New Demonstration User')}
              </h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {t('Full Display Name')} *
                </label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="e.g. Smt. Radhika Sharma"
                  className="form-field"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {t('Email / Username')} *
                </label>
                <input
                  type="email"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. radhika@kmc.demo"
                  className="form-field"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {t('Password')} *
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-field"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {t('Assigned User Role')} *
                </label>
                <SearchableSelect
                  value={newRole}
                  onChange={(val) => setNewRole(val as UserRole)}
                  searchPlaceholder={t('Search role...')}
                  options={[
                    { value: 'citizen', label: t('Citizen (Resident Portal)'), sublabel: t('View, track & report civic issues') },
                    { value: 'corporator', label: t('Corporator (Ward Representative)'), sublabel: t('Oversee ground operations for a ward') },
                    { value: 'department_officer', label: t('Department Officer (Operational Wing)'), sublabel: t('Assign & manage technical tickets') },
                    { value: 'field_staff', label: t('Field Staff (Ground Operations)'), sublabel: t('Complete tasks & upload evidence') },
                    { value: 'mayor_commissioner', label: t('Mayor / Commissioner (Leadership)'), sublabel: t('City-wide metrics & command console') },
                    { value: 'governance_auditor', label: t('Governance Auditor (Audit & SLA)'), sublabel: t('Independent compliance & audit tracking') },
                    { value: 'super_admin', label: t('Super Administrator (Full System)'), sublabel: t('Full system privileges & user management') },
                  ]}
                  fullWidth
                  size="sm"
                />
              </div>

              {(newRole === 'corporator' || newRole === 'citizen' || newRole === 'field_staff') && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {t('Assigned Ward Division')} {newRole === 'field_staff' && <span className="text-red-600 font-bold">* ({t('Strict Ward Assignment')})</span>}
                  </label>
                  <SearchableSelect
                    value={newWardId}
                    onChange={(val) => setNewWardId(Number(val))}
                    searchPlaceholder={t('Search 66 wards...')}
                    options={wards.map((w) => ({
                      value: w.id,
                      label: `${t('Ward')} ${w.id} – ${t(w.name)}`,
                      sublabel: w.corporator ? `${t('Corp')}: ${w.corporator}` : undefined,
                    }))}
                    fullWidth
                    size="sm"
                  />
                </div>
              )}

              {newRole === 'field_staff' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {t('Specialized Municipal Staff Category')} <span className="text-red-600 font-bold">*</span>
                  </label>
                  <SearchableSelect
                    value={newStaffCategoryId}
                    onChange={(val) => {
                      setNewStaffCategoryId(String(val));
                      const cat = staffCategories.find((c) => c.id === String(val));
                      if (cat) {
                        setNewDeptName(cat.departmentName);
                      }
                    }}
                    searchPlaceholder={t('Search staff category...')}
                    options={staffCategories.map((c) => ({
                      value: c.id,
                      label: t(c.name),
                      sublabel: `${t(c.departmentName)} Wing • SLA: ${c.slaHours}h`,
                    }))}
                    fullWidth
                    size="sm"
                  />
                </div>
              )}

              {(newRole === 'department_officer' || newRole === 'field_staff') && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {t('Assigned Municipal Wing')} {newRole === 'field_staff' && <span className="text-red-600 font-bold">*</span>}
                  </label>
                  <SearchableSelect
                    value={newDeptName}
                    onChange={(val) => setNewDeptName(String(val))}
                    searchPlaceholder={t('Search department...')}
                    options={[
                      { value: 'Engineering Section', label: t('Engineering Section') },
                      { value: 'Sanitation Section', label: t('Sanitation Section') },
                      { value: 'Town Planning Section (TPS)', label: t('Town Planning Section (TPS)') },
                      { value: 'Revenue Section', label: t('Revenue Section') },
                      { value: 'Establishment Section', label: t('Establishment Section') },
                      { value: 'Statistics / Birth & Death Registration Section', label: t('Statistics / Birth & Death Registration Section') },
                      { value: 'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)', label: t('Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)') },
                    ]}
                    fullWidth
                    size="sm"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-kmc-navy hover:bg-kmc-navy-light text-white font-bold rounded-lg uppercase shadow transition-colors"
                >
                  {t('Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-md w-full p-5 space-y-4 animate-scale-up">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="text-base font-bold font-heading uppercase text-slate-900">
                {t('Confirm Demo Data Reset')}
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {t('Are you sure you want to reset the KMC Digital Governance Platform database? All newly submitted grievances, task updates, feedback ratings, and created user accounts will be reinitialized to the original factory seed dataset.')}
            </p>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                {t('Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg uppercase shadow transition-colors"
              >
                {t('Yes, Reset All Data')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Field Staff Ward Modal */}
      {reassignModalOpen && reassignStaffTarget && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-kmc-navy" />
                <h4 className="text-sm font-bold font-heading uppercase text-slate-900">
                  {t('Reassign Field Staff Member')}
                </h4>
              </div>
              <button
                onClick={() => {
                  setReassignModalOpen(false);
                  setReassignStaffTarget(null);
                }}
                className="text-slate-500 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Staff Summary */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('Staff Member')}:</span>
                <strong className="text-slate-900">
                  {reassignStaffTarget.displayName || reassignStaffTarget.name} ({reassignStaffTarget.id})
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('Department & Role')}:</span>
                <span className="font-semibold text-slate-800">
                  {t(reassignStaffTarget.departmentName || reassignStaffTarget.departmentId || 'Operations')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('Current Assigned Ward')}:</span>
                <span className="font-bold text-purple-700">
                  {t('Ward')} {reassignStaffTarget.wardId || selectedStaffWardId}
                </span>
              </div>
            </div>

            {/* Incomplete Tasks Validation Check */}
            {(() => {
              const currentWard = reassignStaffTarget.wardId || selectedStaffWardId;
              const targetName = reassignStaffTarget.displayName || reassignStaffTarget.name || 'Staff';
              const targetFirstName = targetName.split(' ')[0] || '';
              const activeTasks = taskRepository
                .getByWardId(currentWard)
                .filter(
                  (t) =>
                    t.status !== 'Completed' &&
                    (t.assignedFieldStaffId === reassignStaffTarget.id ||
                      (t.assignedTo && targetName && t.assignedTo.toLowerCase() === targetName.toLowerCase()) ||
                      (t.assignedTo && targetFirstName && t.assignedTo.toLowerCase().includes(targetFirstName.toLowerCase())))
                );

              const hasActiveTasks = activeTasks.length > 0;

              return (
                <div className="space-y-4 text-xs">
                  {hasActiveTasks ? (
                    <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">{t('Reassignment Blocked by Safety Guard')}</strong>
                        <p className="mt-0.5 leading-relaxed text-[11px]">
                          {t('Cannot reassign {{name}}: Worker has {{count}} active incomplete task(s) in Ward {{ward}}. Reassignment is strictly prohibited until all active tasks are completed or formally handed over.', {
                            name: targetName,
                            count: activeTasks.length,
                            ward: currentWard,
                          })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-xs">{t('Pre-Reassignment Check Passed:')}</span>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          {t('Worker has 0 active incomplete tasks in Ward {{ward}}. Safe for reassignment.', { ward: currentWard })}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {t('Select Target Destination Ward')}
                    </label>
                    <SearchableSelect
                      value={targetNewWardId}
                      onChange={(val) => setTargetNewWardId(Number(val))}
                      searchPlaceholder={t('Search 66 wards...')}
                      options={wards
                        .filter((w) => w.id !== currentWard)
                        .map((w) => ({
                          value: w.id,
                          label: `${t('Ward')} ${w.id} – ${t(w.name)}`,
                          sublabel: w.corporator ? `${t('Corp')}: ${w.corporator}` : undefined,
                        }))}
                      fullWidth
                      size="sm"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReassignModalOpen(false);
                        setReassignStaffTarget(null);
                      }}
                      className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                    >
                      {t('Cancel')}
                    </button>
                    <button
                      type="button"
                      disabled={hasActiveTasks || targetNewWardId === currentWard}
                      onClick={() => {
                        const res = userRepository.reassignStaffWard(
                          reassignStaffTarget.id,
                          targetNewWardId,
                          currentUser?.displayName || 'Super Admin'
                        );
                        if (res.success) {
                          showToast(res.message || t('Staff member reassigned successfully.'));
                          setReassignModalOpen(false);
                          setReassignStaffTarget(null);
                          setRefreshStaffKey((k) => k + 1);
                        } else {
                          alert(res.error || res.message || t('Failed to reassign staff.'));
                        }
                      }}
                      className={`px-4 py-2 font-bold rounded-lg uppercase shadow text-xs flex items-center gap-1.5 transition-all ${
                        hasActiveTasks || targetNewWardId === currentWard
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : 'bg-kmc-navy hover:bg-kmc-navy-light text-white'
                      }`}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>{t('Confirm & Reassign to Ward {{ward}}', { ward: targetNewWardId })}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Category Modal (Add / Edit Staff Category) */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-kmc-navy" />
                <h4 className="text-sm font-bold font-heading uppercase text-slate-900">
                  {editingCategory ? t('Edit Staff Category') : t('Add Specialized Staff Category')}
                </h4>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-500 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!catName.trim()) {
                  alert(t('Please enter a category name.'));
                  return;
                }

                const catId = editingCategory
                  ? editingCategory.id
                  : catName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                const deptId = catDept.toLowerCase().replace(/[^a-z0-9]/g, '-');

                const newCat: StaffCategory = {
                  id: catId,
                  name: catName.trim(),
                  departmentId: deptId,
                  departmentName: catDept as any,
                  description: catDesc.trim() || `${catName} specialized municipal operations`,
                  matchedGrievanceCategories: catKeywords
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                  skills: catSkills
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                  slaHours: Number(catSla) || 48,
                };

                if (editingCategory) {
                  staffCategoryRepository.update(editingCategory.id, newCat);
                  showToast(t(`Category "{{name}}" updated successfully.`, { name: catName }));
                } else {
                  const added = staffCategoryRepository.add(newCat);
                  if (!added) {
                    alert(t(`Category "{{name}}" already exists.`, { name: catName }));
                    return;
                  }
                  showToast(t(`Category "{{name}}" registered successfully.`, { name: catName }));
                }

                setStaffCategories(staffCategoryRepository.getAll());
                setShowCategoryModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {t('Category Name')} *
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Electrician / Streetlight Technician"
                  className="form-field"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {t('Assigned Municipal Department')} *
                </label>
                <SearchableSelect
                  value={catDept}
                  onChange={(val) => setCatDept(String(val))}
                  searchPlaceholder={t('Search department...')}
                  options={[
                    { value: 'Engineering Section', label: t('Engineering Section') },
                    { value: 'Sanitation Section', label: t('Sanitation Section') },
                    { value: 'Town Planning Section (TPS)', label: t('Town Planning Section (TPS)') },
                    { value: 'Revenue Section', label: t('Revenue Section') },
                    { value: 'Establishment Section', label: t('Establishment Section') },
                    { value: 'Statistics / Birth & Death Registration Section', label: t('Statistics / Birth & Death Registration Section') },
                    { value: 'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)', label: t('Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)') },
                  ]}
                  fullWidth
                  size="sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {t('Standard SLA Hours')} *
                </label>
                <input
                  type="number"
                  value={catSla}
                  onChange={(e) => setCatSla(Number(e.target.value))}
                  min={1}
                  max={168}
                  className="form-field"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {t('Description')}
                </label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  rows={2}
                  placeholder={t('Operational responsibilities and duties...')}
                  className="form-field"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {t('Mapped Grievance Keywords (comma separated)')}
                </label>
                <input
                  type="text"
                  value={catKeywords}
                  onChange={(e) => setCatKeywords(e.target.value)}
                  placeholder="e.g. Street Lights, Electrical, Light"
                  className="form-field"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {t('Required Ground Skills (comma separated)')}
                </label>
                <input
                  type="text"
                  value={catSkills}
                  onChange={(e) => setCatSkills(e.target.value)}
                  placeholder="e.g. Streetlight Repair, Wiring, Line Testing"
                  className="form-field"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-kmc-navy hover:bg-kmc-navy-light text-white font-bold rounded-lg uppercase shadow transition-colors"
                >
                  {editingCategory ? t('Save Changes') : t('Create Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FooterStrip
        tagline={t("Super Administrator Console • Karimnagar Municipal Corporation Digital Governance")}
      />
    </div>
  );
};
