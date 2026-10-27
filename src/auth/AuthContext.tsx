import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Permission, AuthSession } from './authTypes';
import { DemoUserRecord } from './mockUsers';
import { hasPermission as checkPermission, hasAnyRole } from './permissions';
import { isQaInspectionActive } from './qaInspection';
import { userRepository } from '../storage/repositories/userRepository';
import { auditRepository } from '../storage/repositories/auditRepository';
import { STORAGE_KEYS } from '../storage/storageKeys';
import { storageService } from '../storage/storageService';
import { initializeStorage } from '../storage/storageMigration';

interface AuthContextType {
  currentUser: User | null;
  activeRole: UserRole | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => { success: boolean; error?: string };
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  previewRole: UserRole | null;
  setPreviewRole: (role: UserRole | null) => void;
  allDemoUsers: Record<string, DemoUserRecord>;
  toggleUserStatus: (username: string) => boolean;
  createUser: (record: DemoUserRecord) => boolean;
  updateUser: (email: string, updates: Partial<User>) => boolean;
  resetDemoData: () => void;
}

const SESSION_KEY = STORAGE_KEYS.SESSION;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ensure storage is initialized on first load
  useEffect(() => {
    initializeStorage(false);
  }, []);

  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const stored = window.localStorage.getItem(SESSION_KEY) || window.sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('KMC Auth: Failed to parse stored session', e);
    }
    return null;
  });

  const [previewRole, setPreviewRole] = useState<UserRole | null>(null);
  const [usersState, setUsersState] = useState<Record<string, DemoUserRecord>>(() => userRepository.getAll());

  // Subscribe to storage changes for multi-tab / cross-component sync
  useEffect(() => {
    const unsubscribe = storageService.subscribe((key) => {
      if (key === STORAGE_KEYS.USERS || key === STORAGE_KEYS.META) {
        setUsersState(userRepository.getAll());
      }
    });
    return unsubscribe;
  }, []);

  const currentUser = session?.user || null;
  const isAuthenticated = !!currentUser;
  const activeRole = previewRole || currentUser?.role || null;

  const login = (username: string, password: string, rememberMe = true): { success: boolean; error?: string } => {
    const record = userRepository.getByEmail(username);
    if (!record) {
      return { success: false, error: 'User account not found. Please check your email or select a demo account.' };
    }

    if (!record.user.isActive) {
      return { success: false, error: 'This demonstration account has been deactivated by the Super Administrator.' };
    }

    if (record.passwordHash !== password) {
      return { success: false, error: 'Invalid password. Please enter the correct password.' };
    }

    const newSession: AuthSession = {
      user: record.user,
      token: `kmc_token_${Date.now()}_${Math.random().toString(36).substr(2)}`,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRemembered: rememberMe,
    };

    setSession(newSession);
    setPreviewRole(null);

    try {
      const serialized = JSON.stringify(newSession);
      window.localStorage.setItem(SESSION_KEY, serialized);
      window.sessionStorage.setItem(SESSION_KEY, serialized);
    } catch (e) {
      console.warn('Failed to store session in storage', e);
    }

    auditRepository.log({
      actorId: record.user.id,
      actorName: record.user.displayName,
      role: record.user.role,
      action: 'USER_LOGIN',
      resource: 'auth',
      details: `User logged in successfully with role: ${record.user.role}`,
    });

    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      auditRepository.log({
        actorId: currentUser.id,
        actorName: currentUser.displayName,
        role: currentUser.role,
        action: 'USER_LOGOUT',
        resource: 'auth',
        details: 'User logged out and session cleared.',
      });
    }

    setSession(null);
    setPreviewRole(null);
    try {
      window.localStorage.removeItem(SESSION_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.warn('Failed to clear session', e);
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    return checkPermission(currentUser, permission);
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!currentUser) return false;
    const roles = Array.isArray(role) ? role : [role];
    return hasAnyRole(currentUser, roles);
  };

  const toggleUserStatus = (username: string): boolean => {
    if (currentUser?.role === 'governance_auditor' || isQaInspectionActive(currentUser)) {
      console.warn('KMC Auth: User status toggle blocked in QA Inspection Mode.');
      return false;
    }
    const newStatus = userRepository.toggleActive(username);
    setUsersState(userRepository.getAll());

    if (currentUser) {
      auditRepository.log({
        actorId: currentUser.id,
        actorName: currentUser.displayName,
        role: currentUser.role,
        action: 'TOGGLE_USER_STATUS',
        resource: 'users',
        resourceId: username,
        details: `Account ${username} set to ${newStatus ? 'Active' : 'Deactivated'}`,
      });
    }
    return newStatus;
  };

  const createUser = (newRecord: DemoUserRecord): boolean => {
    if (currentUser?.role === 'governance_auditor' || isQaInspectionActive(currentUser)) {
      console.warn('KMC Auth: User creation blocked in QA Inspection Mode.');
      return false;
    }
    const success = userRepository.createUser(newRecord);
    if (success) {
      setUsersState(userRepository.getAll());
      if (currentUser) {
        auditRepository.log({
          actorId: currentUser.id,
          actorName: currentUser.displayName,
          role: currentUser.role,
          action: 'CREATE_USER',
          resource: 'users',
          resourceId: newRecord.user.id,
          details: `Created new user ${newRecord.user.username} (${newRecord.user.displayName}) with role ${newRecord.user.role}`,
        });
      }
    }
    return success;
  };

  const updateUser = (email: string, updates: Partial<User>): boolean => {
    if (currentUser?.role === 'governance_auditor' || isQaInspectionActive(currentUser)) {
      console.warn('KMC Auth: User updates blocked in QA Inspection Mode.');
      return false;
    }
    const success = userRepository.updateUser(email, updates);
    if (success) {
      setUsersState(userRepository.getAll());
    }
    return success;
  };

  const resetDemoData = () => {
    initializeStorage(true);
    setUsersState(userRepository.getAll());
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        isAuthenticated,
        login,
        logout,
        hasPermission,
        hasRole,
        previewRole,
        setPreviewRole,
        allDemoUsers: usersState,
        toggleUserStatus,
        createUser,
        updateUser,
        resetDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
