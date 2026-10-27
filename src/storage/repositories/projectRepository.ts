import { STORAGE_KEYS } from '../storageKeys';
import { storageService } from '../storageService';
import { ProjectItem, WARD_27_PROJECTS } from '../../data/budget';

export const projectRepository = {
  getAll(): ProjectItem[] {
    const list = storageService.getItem<ProjectItem[]>(STORAGE_KEYS.PROJECTS);
    if (!list || !Array.isArray(list)) {
      return WARD_27_PROJECTS;
    }
    return list;
  },

  getByWard(wardId: number): ProjectItem[] {
    const all = this.getAll();
    return all.filter((p) => p.wardId === wardId);
  },

  updateProgress(id: string, progress: number, status: ProjectItem['status']): ProjectItem | null {
    const all = this.getAll();
    const index = all.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updated: ProjectItem = {
      ...all[index],
      progress,
      status,
    };

    all[index] = updated;
    storageService.setItem(STORAGE_KEYS.PROJECTS, all);
    return updated;
  },
};
