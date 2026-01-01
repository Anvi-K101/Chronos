import { DailyEntry, AppData } from '../types';
import { EMPTY_ENTRY } from '../constants';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const STORAGE_KEY = 'chronos_data_v1';

// Helpers to flatten/unflatten data if needed, but we keep it simple for now
export const StorageService = {
  // Load entire dataset (Legacy/Offline)
  loadLocal: (): AppData => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { entries: {}, principles: [], essays: [] };
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to load local data", e);
      return { entries: {}, principles: [], essays: [] };
    }
  },

  // Save entire dataset (Legacy/Offline)
  saveLocal: (data: AppData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save local data", e);
    }
  },

  // Get a single entry (Smart Hybrid)
  getEntry: async (dateStr: string, userId?: string): Promise<DailyEntry> => {
    // 1. If user is logged in, try to fetch from Cloud
    if (userId && db) {
      try {
        const docRef = doc(db, 'users', userId, 'entries', dateStr);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as DailyEntry;
        }
      } catch (e) {
        console.warn("Offline or FireStore error, falling back to local cache", e);
      }
    }

    // 2. Fallback to LocalStorage
    const data = StorageService.loadLocal();
    if (data.entries[dateStr]) {
      return data.entries[dateStr];
    }
    
    // 3. Return Empty if new
    return { ...EMPTY_ENTRY, id: dateStr };
  },

  // Save a single entry (Smart Hybrid)
  saveEntry: async (entry: DailyEntry, userId?: string) => {
    // 1. Always save to LocalStorage for immediate UI feedback (Optimistic)
    const data = StorageService.loadLocal();
    data.entries[entry.id] = entry;
    StorageService.saveLocal(data);

    // 2. If logged in, sync to Cloud in background
    if (userId && db) {
      try {
        const docRef = doc(db, 'users', userId, 'entries', entry.id);
        await setDoc(docRef, entry, { merge: true });
      } catch (e) {
        console.error("Cloud sync failed", e);
        // Add to a "pending sync" queue in real app
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