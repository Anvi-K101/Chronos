
import { DailyEntry, AppData, ChecklistItemConfig } from '../types';
import { EMPTY_ENTRY } from '../constants';
import { db, auth, isConfigured } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

const STORAGE_KEY = 'chronos_data_v1';

// Added notificationsEnabled: false to satisfy ChecklistItemConfig type requirement
const DEFAULT_CHECKLIST: ChecklistItemConfig[] = [
  { id: 'journal', label: 'Write in Journal', enabled: true, notificationsEnabled: false },
  { id: 'move', label: 'Physical Movement', enabled: true, notificationsEnabled: false },
  { id: 'read', label: 'Read (15m)', enabled: true, notificationsEnabled: false },
];

export const StorageService = {
  // --- Local Management ---
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
    } catch (e) {
      console.warn("[Storage] Local cache failed", e);
    }
  },

  // --- Checklist Config (Cloud First) ---
  getChecklistConfig: async (userId: string): Promise<ChecklistItemConfig[]> => {
    const local = StorageService.loadLocal();
    if (!userId || !db) return local.checklistConfig;

    try {
      const snap = await getDoc(doc(db, 'users', userId, 'config', 'checklist'));
      if (snap.exists()) {
        const remote = snap.data().items as ChecklistItemConfig[];
        local.checklistConfig = remote;
        StorageService.saveLocal(local);
        return remote;
      }
    } catch (e: any) {
      console.warn("[Storage] Cloud config fetch failed, using local.", e.message);
    }
    return local.checklistConfig;
  },

  saveChecklistConfig: async (config: ChecklistItemConfig[], userId: string) => {
    const local = StorageService.loadLocal();
    local.checklistConfig = config;
    StorageService.saveLocal(local);

    if (userId && db) {
      try {
        await setDoc(doc(db, 'users', userId, 'config', 'checklist'), { 
          items: config, 
          updatedAt: Date.now() 
        }, { merge: true });
      } catch (e: any) {
        console.error("[Storage] Failed to save checklist to cloud:", e.message);
        throw e;
      }
    }
  },

  // --- Single Entry (Cloud First) ---
  getEntry: async (dateStr: string, userId: string): Promise<DailyEntry> => {
    const local = StorageService.loadLocal();
    
    if (!userId || !db) {
      return local.entries[dateStr] || { ...EMPTY_ENTRY, id: dateStr };
    }

    try {
      const snap = await getDoc(doc(db, 'users', userId, 'entries', dateStr));
      if (snap.exists()) {
        const remote = snap.data() as DailyEntry;
        // Merge with defaults to ensure UI doesn't break if schema changes
        const merged: DailyEntry = {
          ...EMPTY_ENTRY,
          ...remote,
          id: dateStr,
          state: { ...EMPTY_ENTRY.state, ...remote.state },
          effort: { ...EMPTY_ENTRY.effort, ...remote.effort },
          achievements: { ...EMPTY_ENTRY.achievements, ...remote.achievements },
          reflections: { ...EMPTY_ENTRY.reflections, ...remote.reflections },
          memory: { ...EMPTY_ENTRY.memory, ...remote.memory },
          future: { ...EMPTY_ENTRY.future, ...remote.future },
          checklist: remote.checklist || {},
        };
        local.entries[dateStr] = merged;
        StorageService.saveLocal(local);
        return merged;
      }
    } catch (e: any) {
      console.error(`[Storage] Cloud fetch error for ${dateStr}:`, e.message);
    }
    
    return local.entries[dateStr] || { ...EMPTY_ENTRY, id: dateStr };
  },

  // --- Bulk Archive Fetch (Essential for Cross-Device) ---
  getAllEntries: async (userId: string): Promise<DailyEntry[]> => {
    if (!userId || !db) {
      const local = StorageService.loadLocal();
      return Object.values(local.entries).sort((a, b) => b.id.localeCompare(a.id));
    }

    try {
      const q = query(collection(db, 'users', userId, 'entries'), orderBy('id', 'desc'));
      const snap = await getDocs(q);
      const entries = snap.docs.map(doc => doc.data() as DailyEntry);
      
      // Update local cache with full history
      const local = StorageService.loadLocal();
      entries.forEach(e => { local.entries[e.id] = e; });
      StorageService.saveLocal(local);
      
      return entries;
    } catch (e: any) {
      console.error("[Storage] Global fetch failed:", e.message);
      const local = StorageService.loadLocal();
      return Object.values(local.entries).sort((a, b) => b.id.localeCompare(a.id));
    }
  },

  saveEntry: async (entry: DailyEntry, userId: string): Promise<void> => {
    // 1. Immediate local cache for UI responsiveness
    const local = StorageService.loadLocal();
    local.entries[entry.id] = entry;
    StorageService.saveLocal(local);

    if (!userId || !db) return;

    // 2. Mandatory Cloud Write
    try {
      await setDoc(doc(db, 'users', userId, 'entries', entry.id), { 
        ...entry, 
        userId, 
        updatedAt: Date.now() 
      }, { merge: true });
    } catch (e: any) {
      console.error("[Storage] Firestore write failed:", e.message);
      throw e; // Bubble up for UI "Error" state
    }
  },

  isCloudAvailable: () => !!(auth.currentUser && db),

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
