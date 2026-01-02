
import React, { useState, useEffect } from 'react';
import { DailyEntry, ChecklistItemConfig } from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from '../services/authContext';
import { PageContainer, SectionHeader, Card, SaveIndicator, CheckItem } from '../components/ui/Controls';
import { Settings, Bell, Plus, Trash2, X, Check } from 'lucide-react';
import { EMPTY_ENTRY } from '../constants';

export const ChecklistPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entry, setEntry] = useState<DailyEntry>({ ...EMPTY_ENTRY, id: date });
  const [config, setConfig] = useState<ChecklistItemConfig[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [isEditing, setIsEditing] = useState(false);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState('Notification' in window && Notification.permission === 'granted');

  useEffect(() => {
    if (authLoading) return;

    let mounted = true;
    
    // Load config from Firestore/Local
    StorageService.getChecklistConfig(user?.uid).then(cfg => {
      if (mounted) setConfig(cfg);
    });

    // Load today's entry
    StorageService.getEntry(date, user?.uid).then(data => {
      if (mounted) setEntry(data);
    }).catch((err) => {
      console.warn("Chronos: Checklist entry fetch failed", err);
    });

    return () => { mounted = false; };
  }, [date, user, authLoading]);

  const toggleTask = (id: string) => {
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
    StorageService.saveEntry(updatedEntry, user?.uid).then(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1500);
    });
  };

  const saveConfig = (newConfig: ChecklistItemConfig[]) => {
      setConfig(newConfig);
      setSaveStatus('saving');
      StorageService.saveChecklistConfig(newConfig, user?.uid).then(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1500);
      });
  };

  const addItem = () => {
      const newItem: ChecklistItemConfig = {
          id: Date.now().toString(),
          label: 'New Habit',
          enabled: true
      };
      saveConfig([...config, newItem]);
  };

  const removeItem = (id: string) => {
      saveConfig(config.filter(c => c.id !== id));
  };

  const updateItemLabel = (id: string, label: string) => {
      saveConfig(config.map(c => c.id === id ? { ...c, label } : c));
  };

  const requestNotificationPermission = () => {
      if (!('Notification' in window)) return;
      Notification.requestPermission().then(permission => {
          setNotificationsEnabled(permission === 'granted');
      });
  };

  return (
    <PageContainer>
      <SaveIndicator status={saveStatus} />
      
      <div className="flex justify-between items-start mb-8">
          <SectionHeader title="Habit Rituals" subtitle={new Date(date).toLocaleDateString()} />
          <button 
             type="button"
             onClick={() => setIsEditing(!isEditing)}
             className={`p-3 rounded-full transition-all ${isEditing ? 'bg-organic-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:text-ink shadow-sm'}`}
          >
              {isEditing ? <Check size={20} /> : <Settings size={20} />}
          </button>
      </div>

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
                            <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-2">
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
          {config.filter(c => c.enabled).length === 0 && (
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
