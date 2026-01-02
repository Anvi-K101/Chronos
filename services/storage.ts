
import { DailyEntry, AppData, ChecklistItemConfig } from '../types';
import { EMPTY_ENTRY } from '../constants';
import { db, auth } from './firebase';
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
      console.error("Chronos: Local load failed", e);
      return { entries: {}, principles: [], essays: [], checklistConfig: DEFAULT_CHECKLIST };
    }
  },

  saveLocal: (data: AppData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Chronos: Local save failed", e);
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
    const currentUid = auth.currentUser?.uid || userId;
    const localData = StorageService.loadLocal();
    const fallback = localData.entries[dateStr] || { ...EMPTY_ENTRY, id: dateStr };

    if (currentUid && db) {
      try {
        const docRef = doc(db, 'users', currentUid, 'entries', dateStr);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const remoteData = docSnap.data() as DailyEntry;
          const cleanedEntry = {
            ...EMPTY_ENTRY,
            ...remoteData,
            id: dateStr,
            checklist: remoteData.checklist || {},
            state: { ...EMPTY_ENTRY.state, ...remoteData.state },
            effort: { ...EMPTY_ENTRY.effort, ...remoteData.effort },
          };
          
          localData.entries[dateStr] = cleanedEntry;
          StorageService.saveLocal(localData);
          return cleanedEntry;
        }
      } catch (e: any) {
        console.warn("Chronos: Cloud fetch bypassed/failed. Using vault cache.", e.message);
      }
    }

    return fallback;
  },

  saveEntry: async (entry: DailyEntry, userId?: string) => {
    const currentUid = auth.currentUser?.uid || userId;

    const data = StorageService.loadLocal();
    data.entries[entry.id] = entry;
    StorageService.saveLocal(data);

    if (currentUid && db) {
      try {
        const docRef = doc(db, 'users', currentUid, 'entries', entry.id);
        // Ensure document strictly matches rule requirements
        await setDoc(docRef, { 
          ...entry, 
          userId: currentUid, 
          date: entry.id, // Explicitly match field requirements if any
          timestamp: Date.now() 
        }, { merge: true });
      } catch (e: any) {
        console.error("Chronos: Cloud save error", e.message);
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
