import { STORAGE_KEYS, CURRENT_SCHEMA_VERSION, STORAGE_EVENT_NAME } from './storageKeys';
import { StorageMeta, ExportBundle, validateStoragePayload } from './storageSchemas';

type StorageListener = (key: string) => void;

class StorageService {
  private listeners: Set<StorageListener> = new Set();
  private isStorageAvailable: boolean = true;

  constructor() {
    this.checkAvailability();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key && event.key.startsWith('kmc:')) {
          this.notifySubscribers(event.key);
        }
      });
    }
  }

  private checkAvailability(): void {
    try {
      const testKey = '__kmc_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      this.isStorageAvailable = true;
    } catch (e) {
      console.warn('KMC StorageService: LocalStorage unavailable or restricted. Falling back to memory.', e);
      this.isStorageAvailable = false;
    }
  }

  public subscribe(listener: StorageListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifySubscribers(key: string): void {
    this.listeners.forEach((listener) => {
      try {
        listener(key);
      } catch (err) {
        console.error(`Error in storage listener for ${key}:`, err);
      }
    });

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent(STORAGE_EVENT_NAME, { detail: { key } }));
      } catch {
        // Ignore custom event errors in test environments
      }
    }
  }

  public getItem<T>(key: string, defaultValue: T | null = null): T | null {
    if (!this.isStorageAvailable) return defaultValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null || raw === undefined) return defaultValue;
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(`KMC StorageService: Failed to parse item for key "${key}"`, error);
      return defaultValue;
    }
  }

  public setItem<T>(key: string, value: T): boolean {
    if (!this.isStorageAvailable) return false;
    try {
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      
      // Update metadata timestamp whenever records change
      if (key !== STORAGE_KEYS.META && key !== STORAGE_KEYS.SESSION) {
        this.updateMetaTimestamp();
      }

      this.notifySubscribers(key);
      return true;
    } catch (error) {
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)) {
        console.warn('KMC StorageService: LocalStorage quota exceeded', error);
        // The app shows a friendly toast for this event (see ToastProvider)
        try {
          window.dispatchEvent(new CustomEvent('kmc:storage-full', { detail: { key } }));
        } catch {
          // ignore in non-browser environments
        }
      } else {
        console.error(`KMC StorageService: Error setting key "${key}"`, error);
      }
      return false;
    }
  }

  public removeItem(key: string): void {
    if (!this.isStorageAvailable) return;
    try {
      window.localStorage.removeItem(key);
      this.notifySubscribers(key);
    } catch (error) {
      console.error(`KMC StorageService: Error removing key "${key}"`, error);
    }
  }

  private updateMetaTimestamp(): void {
    try {
      const meta = this.getItem<StorageMeta>(STORAGE_KEYS.META) || {
        version: CURRENT_SCHEMA_VERSION,
        initializedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      };
      meta.lastUpdatedAt = new Date().toISOString();
      const raw = JSON.stringify(meta);
      window.localStorage.setItem(STORAGE_KEYS.META, raw);
    } catch {
      // Ignore meta write errors
    }
  }

  public clearAllKmcData(): void {
    if (!this.isStorageAvailable) return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith('kmc:')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      this.notifySubscribers(STORAGE_KEYS.META);
    } catch (error) {
      console.error('KMC StorageService: Error clearing KMC keys', error);
    }
  }

  public exportData(): ExportBundle {
    const meta = this.getItem<StorageMeta>(STORAGE_KEYS.META) || {
      version: CURRENT_SCHEMA_VERSION,
      initializedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };

    return {
      version: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      meta,
      users: this.getItem(STORAGE_KEYS.USERS, {}) || {},
      wards: this.getItem(STORAGE_KEYS.WARDS, []) || [],
      departments: this.getItem(STORAGE_KEYS.DEPARTMENTS, []) || [],
      grievances: this.getItem(STORAGE_KEYS.GRIEVANCES, []) || [],
      tasks: this.getItem(STORAGE_KEYS.TASKS, []) || [],
      notifications: this.getItem(STORAGE_KEYS.NOTIFICATIONS, []) || [],
      feedback: this.getItem(STORAGE_KEYS.FEEDBACK, []) || [],
      projects: this.getItem(STORAGE_KEYS.PROJECTS, []) || [],
      auditLog: this.getItem(STORAGE_KEYS.AUDIT_LOG, []) || [],
      settings: this.getItem(STORAGE_KEYS.SETTINGS, {
        dataMode: 'harmonized',
        autoEscalationSimulation: false,
        smsSimulationActive: true,
      }) || {
        dataMode: 'harmonized',
        autoEscalationSimulation: false,
        smsSimulationActive: true,
      },
    };
  }

  public importData(bundle: unknown): { success: boolean; message: string } {
    if (!validateStoragePayload(bundle)) {
      return { success: false, message: 'Invalid or incompatible KMC backup bundle format.' };
    }

    try {
      this.setItem(STORAGE_KEYS.META, bundle.meta);
      this.setItem(STORAGE_KEYS.USERS, bundle.users);
      this.setItem(STORAGE_KEYS.WARDS, bundle.wards);
      this.setItem(STORAGE_KEYS.DEPARTMENTS, bundle.departments);
      this.setItem(STORAGE_KEYS.GRIEVANCES, bundle.grievances);
      this.setItem(STORAGE_KEYS.TASKS, bundle.tasks);
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, bundle.notifications);
      this.setItem(STORAGE_KEYS.FEEDBACK, bundle.feedback);
      this.setItem(STORAGE_KEYS.PROJECTS, bundle.projects);
      this.setItem(STORAGE_KEYS.AUDIT_LOG, bundle.auditLog);
      if (bundle.settings) {
        this.setItem(STORAGE_KEYS.SETTINGS, bundle.settings);
      }

      this.notifySubscribers(STORAGE_KEYS.META);
      return { success: true, message: `Successfully restored KMC platform data (v${bundle.version}).` };
    } catch (err) {
      console.error('KMC StorageService: Failed to import data', err);
      return { success: false, message: 'Failed to write restored records to browser storage.' };
    }
  }
}

export const storageService = new StorageService();
