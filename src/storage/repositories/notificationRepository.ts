import { STORAGE_KEYS } from '../storageKeys';
import { storageService } from '../storageService';
import { NotificationItem, INITIAL_NOTIFICATIONS } from '../../data/notifications';

export const notificationRepository = {
  getAll(): NotificationItem[] {
    const list = storageService.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS);
    if (!list || !Array.isArray(list)) {
      return INITIAL_NOTIFICATIONS;
    }
    return list;
  },

  getByWard(wardId: number | 'all'): NotificationItem[] {
    const all = this.getAll();
    if (wardId === 'all') return all;
    return all.filter((n) => !n.wardId || n.wardId === wardId);
  },

  create(newItem: Omit<NotificationItem, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): NotificationItem {
    const all = this.getAll();
    const id = newItem.id || `NOTIF-${Date.now()}`;
    const timestamp = newItem.timestamp || 'Just now';

    const fullItem: NotificationItem = {
      ...newItem,
      id,
      timestamp,
    };

    const updated = [fullItem, ...all];
    storageService.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
    return fullItem;
  },
};
