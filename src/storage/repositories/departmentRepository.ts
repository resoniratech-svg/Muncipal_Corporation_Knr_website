import { STORAGE_KEYS } from '../storageKeys';
import { storageService } from '../storageService';
import { Department, DEPARTMENTS } from '../../data/departments';

export const departmentRepository = {
  getAll(): Department[] {
    const list = storageService.getItem<Department[]>(STORAGE_KEYS.DEPARTMENTS);
    if (!list || !Array.isArray(list)) {
      return DEPARTMENTS;
    }
    return list;
  },

  getById(id: string): Department | null {
    const all = this.getAll();
    const query = id.toLowerCase();
    return all.find((d) => d.id.toLowerCase() === query || d.name.toLowerCase().includes(query)) || null;
  },
};
