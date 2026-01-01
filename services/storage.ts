
import { DailyEntry, AppData, ChecklistItemConfig } from '../types';
import { EMPTY_ENTRY } from '../constants';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'chronos_data_v1';

const DEFAULT_CHECKLIST: ChecklistItemConfig[] = [
  { id: 'journal', label: 'Write in Journal', enabled: true },
  { id: 'move', label: 'Physical Movement', enabled: true },
  { id: 'read', label: 'Read (15m)', enabled: true },
];

export const StorageService = {
  loadLocal: (): AppData => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { entries: {}, principles: [], essays: [], checklistConfig: DEFAULT_CHECKLIST };
      }
      const data = JSON.parse(raw);
      if (!data.checklistConfig) {
        data.checklistConfig = DEFAULT_CHECKLIST;
      }
      return data;
    } catch (e) {
      console.error("Failed to load local data", e);
      return { entries: {}, principles: [], essays: [], checklistConfig: DEFAULT_CHECKLIST };
    }
  },

  saveLocal: (data: AppData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save local data", e);
    }
  },

  getChecklistConfig: (): ChecklistItemConfig[] => {
    const data = StorageService.loadLocal();
    return data.checklistConfig || DEFAULT_CHECKLIST;
  },

  saveChecklistConfig: (config: ChecklistItemConfig[]) => {
    const data = StorageService.loadLocal();
    data.checklistConfig = config;
    StorageService.saveLocal(data);
  },

  getEntry: async (dateStr: string, userId?: string): Promise<DailyEntry> => {
    // 1. If user is logged in, try to fetch from Cloud
    if (userId && db) {
      try {
        const docRef = doc(db, 'users', userId, 'entries', dateStr);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const remoteData = docSnap.data() as DailyEntry;
          if (!remoteData.checklist) remoteData.checklist = {};
          if (!remoteData.state) remoteData.state = { ...EMPTY_ENTRY.state };
          if (!remoteData.effort) remoteData.effort = { ...EMPTY_ENTRY.effort };
          
          const localData = StorageService.loadLocal();
          localData.entries[dateStr] = remoteData;
          StorageService.saveLocal(localData);
          
          return remoteData;
        }
      } catch (e: any) {
        if (e.code === 'permission-denied') {
          console.error("Chronos: Critical Permission Error. Check Auth/Rules binding.", e);
        } else {
          console.warn("Chronos: Cloud fetch failed, using local cache", e);
        }
      }
    }

    const data = StorageService.loadLocal();
    if (data.entries[dateStr]) {
      const localEntry = data.entries[dateStr];
      if (!localEntry.checklist) localEntry.checklist = {};
      return localEntry;
    }
    
    return { ...EMPTY_ENTRY, id: dateStr };
  },

  saveEntry: async (entry: DailyEntry, userId?: string) => {
    const data = StorageService.loadLocal();
    data.entries[entry.id] = entry;
    StorageService.saveLocal(data);

    if (userId && db) {
      try {
        const docRef = doc(db, 'users', userId, 'entries', entry.id);
        await setDoc(docRef, { 
          ...entry, 
          userId, // Explicitly tag with userId for security rules
          timestamp: Date.now() 
        }, { merge: true });
      } catch (e: any) {
        if (e.code === 'permission-denied') {
          console.error("Chronos: Sync Blocked. Permission Insufficient.", e);
        } else {
          console.error("Chronos: Cloud sync failed", e);
        }
      }
    }
  },
  
  exportData: () => {
     const data = StorageService.loadLocal();
     const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `chronos_archive_2026_${new Date().toISOString().split('T')[0]}.json`;
     a.click();
  }
};
