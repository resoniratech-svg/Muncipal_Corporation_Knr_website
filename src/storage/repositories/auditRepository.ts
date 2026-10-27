import { STORAGE_KEYS } from '../storageKeys';
import { storageService } from '../storageService';
import { AuditLogEntry } from '../storageSchemas';

export const auditRepository = {
  getAll(): AuditLogEntry[] {
    const list = storageService.getItem<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOG);
    if (!list || !Array.isArray(list)) {
      return [];
    }
    return list;
  },

  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const all = this.getAll();
    const id = `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullEntry: AuditLogEntry = {
      ...entry,
      id,
      timestamp: new Date().toISOString(),
    };

    const updated = [fullEntry, ...all].slice(0, 500); // keep last 500 actions
    storageService.setItem(STORAGE_KEYS.AUDIT_LOG, updated);
    return fullEntry;
  },
};
