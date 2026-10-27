import { STORAGE_KEYS } from '../storageKeys';
import { storageService } from '../storageService';
import { FeedbackItem } from '../storageSchemas';

export const feedbackRepository = {
  getAll(): FeedbackItem[] {
    const list = storageService.getItem<FeedbackItem[]>(STORAGE_KEYS.FEEDBACK);
    if (!list || !Array.isArray(list)) {
      return [];
    }
    return list;
  },

  getByGrievanceId(grievanceId: string): FeedbackItem | null {
    const all = this.getAll();
    const query = grievanceId.trim().toUpperCase();
    return all.find((f) => f.grievanceId.toUpperCase() === query) || null;
  },

  getByCitizenId(citizenId: string): FeedbackItem[] {
    const all = this.getAll();
    return all.filter((f) => f.citizenId === citizenId);
  },

  create(newItem: Omit<FeedbackItem, 'id' | 'submittedAt'>): FeedbackItem {
    const all = this.getAll();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const fullItem: FeedbackItem = {
      ...newItem,
      id: `FB-${Date.now()}`,
      submittedAt: `${dateStr}, ${timeStr}`,
    };

    const updated = [fullItem, ...all];
    storageService.setItem(STORAGE_KEYS.FEEDBACK, updated);
    return fullItem;
  },
};
