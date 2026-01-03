
import { DailyEntry, AppData, ChecklistItemConfig } from '../types';
import { EMPTY_ENTRY } from '../constants';
import { db, auth, isConfigured } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from '@firebase/firestore';

const STORAGE_KEY = 'chronos_data_v1';

const DEFAULT_CHECKLIST: ChecklistItemConfig[] = [
  { id: 'journal', label: 'Write in Journal', enabled: true },
  { id: 'move', label: 'Physical Movement', enabled: true },
  { id: 'read', label: 'Read (15m)', enabled: true },
];

export const StorageService = {
  // --- Local Source of Truth ---
  loadLocal: (): AppData => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { entries: {}, principles: [], essays: [], checklistConfig: DEFAULT_CHECKLIST };
      const data = JSON.parse(raw);
      return { 
        entries: data.entries || {},
        principles: data.principles || [],
        essays: data.essays || [],
        checklistConfig: data.checklistConfig || DEFAULT_CHECKLIST
      };
    } catch (e) {
      return { entries: {}, principles: [], essays: [], checklistConfig: DEFAULT_CHECKLIST };
    }
  },

  saveLocal: (data: AppData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  },

  // --- Global Sync (For New Devices/Mobile) ---
  fetchAllEntries: async (userId: string): Promise<Record<string, DailyEntry>> => {
    if (!db) return {};
    try {
      const entriesRef = collection(db, 'users', userId, 'entries');
      const q = query(entriesRef);
      const querySnapshot = await getDocs(q);
      
      const remoteEntries: Record<string, DailyEntry> = {};
      querySnapshot.forEach((doc) => {
        remoteEntries[doc.id] = doc.data() as DailyEntry;
      });

      // Merge with local
      const local = StorageService.loadLocal();
      local.entries = { ...local.entries, ...remoteEntries };
      StorageService.saveLocal(local);
      
      return remoteEntries;
    } catch (e: any) {
      console.warn("[Storage] Failed to fetch vault history:", e.message);
      return {};
    }
  },

  // --- Configuration Management ---
  getChecklistConfig: async (userId?: string): Promise<ChecklistItemConfig[]> => {
    const local = StorageService.loadLocal();
    const uid = userId || auth.currentUser?.uid;
    if (!uid || !db) return local.checklistConfig;

    try {
      const snap = await getDoc(doc(db, 'users', uid, 'config', 'checklist'));
      if (snap.exists()) {
        const remote = snap.data().items as ChecklistItemConfig[];
        local.checklistConfig = remote;
        StorageService.saveLocal(local);
        return remote;
      }
    } catch (e: any) {
      if (e.code !== 'permission-denied') console.warn("[Storage] Config sync issue:", e.message);
    }
    return local.checklistConfig;
  },

  saveChecklistConfig: async (config: ChecklistItemConfig[], userId?: string) => {
    const local = StorageService.loadLocal();
    local.checklistConfig = config;
    StorageService.saveLocal(local);

    const uid = userId || auth.currentUser?.uid;
    if (uid && db) {
      try {
        await setDoc(doc(db, 'users', uid, 'config', 'checklist'), { 
          items: config, 
          updatedAt: Date.now() 
        }, { merge: true });
      } catch (e: any) {
        console.warn("[Storage] Config write issue:", e.message);
      }
    }
  },

  // --- Daily Entry Logic ---
  getEntry: async (dateStr: string, userId?: string): Promise<DailyEntry> => {
    const local = StorageService.loadLocal();
    const cached = local.entries[dateStr] || { ...EMPTY_ENTRY, id: dateStr };
    const uid = userId || auth.currentUser?.uid;

    if (!uid || !db) return cached;

    try {
      const snap = await getDoc(doc(db, 'users', uid, 'entries', dateStr));
      if (snap.exists()) {
        const remote = snap.data() as DailyEntry;
        const merged: DailyEntry = {
          ...EMPTY_ENTRY,
          ...remote,
          id: dateStr,
          state: { ...EMPTY_ENTRY.state, ...remote.state },
          effort: { ...EMPTY_ENTRY.effort, ...remote.effort },
          checklist: remote.checklist || {},
        };
        local.entries[dateStr] = merged;
        StorageService.saveLocal(local);
        return merged;
      }
    } catch (e: any) {
      console.warn(`[Storage] Remote fetch skipped for ${dateStr}:`, e.message);
    }
    return cached;
  },

  saveEntry: async (entry: DailyEntry, userId?: string): Promise<void> => {
    const local = StorageService.loadLocal();
    local.entries[entry.id] = entry;
    StorageService.saveLocal(local);

    const uid = userId || auth.currentUser?.uid;
    if (!uid || !db) return;

    try {
      await setDoc(doc(db, 'users', uid, 'entries', entry.id), { 
        ...entry, 
        userId: uid, 
        updatedAt: Date.now() 
      }, { merge: true });
    } catch (e: any) {
      console.error(`[Storage] Cloud sync failed for ${entry.id}:`, e.message);
      throw e;
    }
  },

  isCloudAvailable: () => !!(isConfigured && auth.currentUser),

  exportData: () => {
     const data = StorageService.loadLocal();
     const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `chronos_vault_${new Date().toISOString().split('T')[0]}.json`;
     a.click();
  }
};
