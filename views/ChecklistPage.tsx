import React, { useState, useEffect } from 'react';
import { DailyEntry, ChecklistItemConfig } from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from '../services/authContext';
import { PageContainer, SectionHeader, Card, SaveIndicator, CheckItem } from '../components/ui/Controls';
import { Settings, Plus, Trash2, Check, Loader2 } from 'lucide-react';
import { EMPTY_ENTRY, getLocalISODate } from '../constants';

export const ChecklistPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [date] = useState(getLocalISODate());
  const [entry, setEntry] = useState<DailyEntry>({ ...EMPTY_ENTRY, id: date });
  const [config, setConfig] = useState<ChecklistItemConfig[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle' | 'error'>('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [isCloudChecking, setIsCloudChecking] = useState(true);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState('Notification' in window && Notification.permission === 'granted');

  useEffect(() => {
    if (authLoading) return;

    let mounted = true;
    setIsCloudChecking(true);
    
    // Initial local load for instant UI
    const local = StorageService.loadLocal();
    setConfig(local.checklistConfig);
    setEntry(local.entries[date] || { ...EMPTY_ENTRY, id: date });

    if (!user) {
        setIsCloudChecking(false);
        return;
    }

    const loadAll = async () => {
        try {
            const [cfg, data] = await Promise.all([
                StorageService.getChecklistConfig(user.uid),
                StorageService.getEntry(date, user.uid)
            ]);
            if (mounted) {
                setConfig(cfg);
                setEntry(data);
                setIsCloudChecking(false);
            }
        } catch (err) {
            if (mounted) setIsCloudChecking(false);
        }
    };

    loadAll();
    return () => { mounted = false; };
  }, [date, user, authLoading]);

  const toggleTask = async (id: string) => {
    const currentVal = entry.checklist[id] || false;
    const newVal = !currentVal;
    
    const updatedEntry = {
        ...entry,
        checklist: {
            ...entry.checklist,
            [id]: newVal
        }
    };

    setEntry(updatedEntry); 
    setSaveStatus('saving');
    
    try {
        if (user) {
            await StorageService.saveEntry(updatedEntry, user.uid);
            setSaveStatus('saved');
        } else {
            setSaveStatus('saved'); // Local-only
        }
        setTimeout(() => setSaveStatus('idle'), 1500);
    } catch (e) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const saveConfig = async (newConfig: ChecklistItemConfig[]) => {
      setConfig(newConfig);
      setSaveStatus('saving');
      try {
        if (user) {
            await StorageService.saveChecklistConfig(newConfig, user.uid);
            setSaveStatus('saved');
        } else {
            setSaveStatus('saved'); // Local-only
        }
        setTimeout(() => setSaveStatus('idle'), 1500);
      } catch (e) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
  };

  const addItem = (e: React.MouseEvent) => {
      e.preventDefault();
      const newItem: ChecklistItemConfig = {
          id: Date.now().toString(),
          label: 'New Habit',
          enabled: true
      };
      saveConfig([...config, newItem]);
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      saveConfig(config.filter(c => c.id !== id));
  };

  const updateItemLabel = (id: string, label: string) => {
      saveConfig(config.map(c => c.id === id ? { ...c, label } : c));
  };

  const requestNotificationPermission = (e: React.MouseEvent) => {
      e.preventDefault();
      if (!('Notification' in window)) return;
      Notification.requestPermission().then(permission => {
          setNotificationsEnabled(permission === 'granted');
      });
  };

  return (
    <PageContainer>
      <SaveIndicator status={saveStatus} />
      
      <div className="flex justify-between items-start mb-8">
          <SectionHeader title="Habit Rituals" subtitle={new Date(date + 'T00:00:00').toLocaleDateString()} />
          <button 
             type="button"
             onClick={(e) => { e.preventDefault(); setIsEditing(!isEditing); }}
             className={`p-3 rounded-full transition-all active:scale-90 ${isEditing ? 'bg-organic-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:text-ink shadow-sm'}`}
          >
              {isEditing ? <Check size={20} /> : <Settings size={20} />}
          </button>
      </div>

      {isCloudChecking && (
          <div className="flex items-center justify-center mb-6 text-organic-300 gap-2">
              <Loader2 className="animate-spin" size={12} />
              <span className="font-bold uppercase tracking-widest text-[10px] opacity-60">Checking Vault</span>
          </div>
      )}

      {isEditing && (
          <div className="animate-in slide-in-from-top-4 mb-8">
             <Card title="Manage Habits">
                <div className="space-y-4">
                    {config.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                            <input 
                                value={item.label}
                                onChange={(e) => updateItemLabel(item.id, e.target.value)}
                                className="flex-grow p-2 bg-stone-50 border-b border-gray-200 font-serif text-ink focus:outline-none focus:border-organic-500"
                            />
                            <button type="button" onClick={(e) => removeItem(item.id, e)} className="text-red-400 hover:text-red-600 p-2">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    <button 
                       type="button"
                       onClick={addItem}
                       className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-400 rounded-xl hover:border-organic-400 hover:text-organic-600 transition-colors flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest"
                    >
                        <Plus size={16} /> New Habit
                    </button>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-serif font-bold text-ink">Quiet Reminders</h4>
                            <p className="text-sm text-gray-400">Enable browser notifications</p>
                        </div>
                        <button 
                           type="button"
                           onClick={requestNotificationPermission}
                           disabled={notificationsEnabled}
                           className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest ${notificationsEnabled ? 'bg-organic-50 text-organic-600' : 'bg-ink text-white'}`}
                        >
                            {notificationsEnabled ? 'Active' : 'Enable'}
                        </button>
                    </div>
                </div>
             </Card>
          </div>
      )}

      <div className="space-y-4">
          {config.filter(c => c.enabled).length === 0 && !isEditing && (
              <div className="text-center py-20 text-gray-400 italic">No ritual configured. Open settings to begin.</div>
          )}
          
          {config.filter(c => c.enabled).map(item => (
              <CheckItem 
                 key={item.id}
                 label={item.label}
                 checked={!!entry.checklist[item.id]}
                 onToggle={() => toggleTask(item.id)}
              />
          ))}
      </div>
    </PageContainer>
  );
};