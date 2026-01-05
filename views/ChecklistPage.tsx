import React, { useState, useEffect } from 'react';
import { DailyEntry, ChecklistItemConfig } from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from '../services/authContext';
import { PageContainer, SectionHeader, Card, SaveIndicator, CheckItem } from '../components/ui/Controls';
import { Settings, Plus, Trash2, Check, Loader2, Bell, BellOff, Clock } from 'lucide-react';
import { EMPTY_ENTRY, getLocalISODate } from '../constants';

export const ChecklistPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [date] = useState(getLocalISODate());
  const [entry, setEntry] = useState<DailyEntry>({ ...EMPTY_ENTRY, id: date });
  const [config, setConfig] = useState<ChecklistItemConfig[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle' | 'local' | 'error'>('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [isCloudChecking, setIsCloudChecking] = useState(true);
  
  useEffect(() => {
    if (authLoading) return;

    let mounted = true;
    setIsCloudChecking(true);
    
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
    const updatedEntry = {
        ...entry,
        checklist: {
            ...entry.checklist,
            [id]: !entry.checklist[id]
        }
    };
    setEntry(updatedEntry); 
    setSaveStatus('saving');
    try {
        await StorageService.saveEntry(updatedEntry, user?.uid || '');
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1500);
    } catch (e) { setSaveStatus('error'); }
  };

  const saveConfig = async (newConfig: ChecklistItemConfig[]) => {
      setConfig(newConfig);
      setSaveStatus('saving');
      try {
        await StorageService.saveChecklistConfig(newConfig, user?.uid || '');
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1500);
      } catch (e) { setSaveStatus('error'); }
  };

  const addItem = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const newItem: ChecklistItemConfig = {
          id: Date.now().toString(),
          label: 'New Ritual',
          enabled: true,
          notificationsEnabled: false,
          notifyTime: '08:00'
      };
      saveConfig([...config, newItem]);
  };

  const removeItem = (id: string) => {
      saveConfig(config.filter(c => c.id !== id));
  };

  const updateItem = (id: string, updates: Partial<ChecklistItemConfig>) => {
      saveConfig(config.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  return (
    <PageContainer className="max-w-4xl">
      <SaveIndicator status={saveStatus} />
      
      <div className="flex justify-between items-center mb-12">
          <SectionHeader title="Rituals" subtitle="Daily Disciplines" />
          <button 
             type="button"
             onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(!isEditing); }}
             className={`p-4 rounded-3xl transition-all shadow-soft flex items-center gap-2 outline-none ${isEditing ? 'bg-ink text-white' : 'bg-white text-stone-400 hover:text-ink'}`}
          >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2">{isEditing ? 'Save' : 'Edit'}</span>
              {isEditing ? <Check size={18} /> : <Settings size={18} />}
          </button>
      </div>

      {isEditing && (
          <div className="animate-in slide-in-from-top-4 mb-12 space-y-4">
            {config.map(item => (
                <Card key={item.id} className="p-4 border-none shadow-soft bg-white/80">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <input 
                          value={item.label}
                          onChange={(e) => updateItem(item.id, { label: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-grow p-2 bg-transparent font-serif text-lg text-ink focus:outline-none border-b border-stone-100"
                          placeholder="Habit Label"
                      />
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} 
                        className="text-stone-300 hover:text-red-500 p-2 transition-colors outline-none"
                      >
                          <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-6 pt-2">
                       <button 
                         type="button"
                         onClick={(e) => { e.stopPropagation(); updateItem(item.id, { notificationsEnabled: !item.notificationsEnabled }); }}
                         className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest outline-none ${item.notificationsEnabled ? 'text-organic-600' : 'text-stone-300'}`}
                       >
                         {item.notificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                         {item.notificationsEnabled ? 'Reminders On' : 'Reminders Off'}
                       </button>
                       
                       {item.notificationsEnabled && (
                         <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-100">
                           <Clock size={12} className="text-stone-400" />
                           <input 
                              type="time"
                              value={item.notifyTime}
                              onChange={(e) => updateItem(item.id, { notifyTime: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-transparent text-[10px] font-mono text-ink outline-none"
                           />
                         </div>
                       )}
                    </div>
                  </div>
                </Card>
            ))}
            <button 
               type="button"
               onClick={addItem}
               className="w-full py-6 border-2 border-dashed border-stone-200 text-stone-300 rounded-3xl hover:border-ink hover:text-ink transition-all flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.3em] outline-none"
            >
                <Plus size={18} /> New Ritual
            </button>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.map(item => (
            <div key={item.id} className="animate-in fade-in slide-in-from-bottom-2">
              <CheckItem 
                 label={item.label}
                 checked={!!entry.checklist[item.id]}
                 onToggle={() => toggleTask(item.id)}
              />
              {item.notificationsEnabled && (
                <div className="mt-2 px-6 flex items-center gap-2 text-stone-300 opacity-60">
                  <Bell size={10} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Reminding at {item.notifyTime}</span>
                </div>
              )}
            </div>
          ))}
      </div>
    </PageContainer>
  );
};