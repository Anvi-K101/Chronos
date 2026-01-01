
import React, { useState, useEffect } from 'react';
import { DailyEntry, ChecklistItemConfig } from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from '../services/authContext';
import { PageContainer, SectionHeader, Card, SaveIndicator, CheckItem } from '../components/ui/Controls';
import { Settings, Bell, Plus, Trash2, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ChecklistPage = () => {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [config, setConfig] = useState<ChecklistItemConfig[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [isEditing, setIsEditing] = useState(false);
  
  // Notification Permissions
  const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted');

  useEffect(() => {
    // Load Config and Entry
    setConfig(StorageService.getChecklistConfig());
    
    StorageService.getEntry(date, user?.uid).then(data => {
      setEntry(data);
    });
  }, [date, user]);

  const toggleTask = (id: string) => {
    if (!entry) return;
    const currentVal = entry.checklist[id] || false;
    const newVal = !currentVal;
    
    const updatedEntry = {
        ...entry,
        checklist: {
            ...entry.checklist,
            [id]: newVal
        }
    };

    setEntry(updatedEntry); // Optimistic UI
    setSaveStatus('saving');
    StorageService.saveEntry(updatedEntry, user?.uid).then(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1500);
    });
  };

  const saveConfig = (newConfig: ChecklistItemConfig[]) => {
      setConfig(newConfig);
      StorageService.saveChecklistConfig(newConfig);
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
      Notification.requestPermission().then(permission => {
          setNotificationsEnabled(permission === 'granted');
          if (permission === 'granted') {
              new Notification("Chronos", { body: "Daily reminders enabled." });
          }
      });
  };

  if (!entry) return <PageContainer>Loading...</PageContainer>;

  return (
    <PageContainer>
      <SaveIndicator status={saveStatus} />
      
      {/* Header with Edit Toggle */}
      <div className="flex justify-between items-start mb-8">
          <SectionHeader title="Daily Checklist" subtitle={new Date(date).toLocaleDateString()} />
          <button 
             onClick={() => setIsEditing(!isEditing)}
             className={`p-3 rounded-full transition-all ${isEditing ? 'bg-organic-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:text-ink shadow-sm'}`}
          >
              {isEditing ? <Check size={20} /> : <Settings size={20} />}
          </button>
      </div>

      {/* Editing Mode */}
      {isEditing && (
          <div className="animate-in slide-in-from-top-4 mb-8">
             <Card title="Configure Habits">
                <div className="space-y-4">
                    {config.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                            <input 
                                value={item.label}
                                onChange={(e) => updateItemLabel(item.id, e.target.value)}
                                className="flex-grow p-2 bg-stone-50 border-b border-gray-200 font-serif text-ink focus:outline-none focus:border-organic-500"
                            />
                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-2">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    <button 
                       onClick={addItem}
                       className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-400 rounded-xl hover:border-organic-400 hover:text-organic-600 transition-colors flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest"
                    >
                        <Plus size={16} /> Add Habit
                    </button>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-serif font-bold text-ink">Notifications</h4>
                            <p className="text-sm text-gray-400">Reminders for your checklist</p>
                        </div>
                        <button 
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

      {/* Checklist View */}
      <div className="space-y-4">
          {config.filter(c => c.enabled).length === 0 && (
              <div className="text-center py-20 text-gray-400 italic">No habits configured. Tap settings to add some.</div>
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
