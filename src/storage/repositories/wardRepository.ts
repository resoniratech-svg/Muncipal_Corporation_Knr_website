import { STORAGE_KEYS } from '../storageKeys';
import { storageService } from '../storageService';
import { Ward, WARDS } from '../../data/wards';

export const wardRepository = {
  getAll(): Ward[] {
    const list = storageService.getItem<Ward[]>(STORAGE_KEYS.WARDS);
    if (!list || !Array.isArray(list)) {
      return WARDS;
    }
    return list;
  },

  getById(id: number): Ward | null {
    const all = this.getAll();
    return all.find((w) => w.id === id) || null;
  },

  update(id: number, updates: Partial<Ward>): Ward | null {
    const all = this.getAll();
    const index = all.findIndex((w) => w.id === id);
    if (index === -1) return null;

    const updated = { ...all[index], ...updates };
    all[index] = updated;
    storageService.setItem(STORAGE_KEYS.WARDS, all);
    return updated;
  },
};
