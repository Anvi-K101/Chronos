import React, { useState, useCallback, useEffect } from 'react';
import { DailyEntry } from '../types';
import { COMMON_EMOTIONS, MOOD_LABELS, EMPTY_ENTRY } from '../constants';
import { StorageService } from '../services/storage';
import { Tile, MoodPicker, Stepper, ChipGroup, MinimalInput, SaveIndicator } from '../components/ui/Controls';
import { Sun, Moon, Coffee, Book, Heart, Feather, Briefcase, Zap, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../services/authContext';

interface DailyLoggerProps {
  date: string;
}

// --- Icons mapped to concepts ---
const Icons = {
  Morning: Sun,
  Evening: Moon,
  Focus: Zap,
  Work: Briefcase,
  Study: Book,
  Love: Heart,
  Note: Feather,
  Rest: Coffee
};

export const DailyLogger: React.FC<DailyLoggerProps> = ({ date }) => {
  const { user } = useAuth();
  const [entry, setEntry] = useState<DailyEntry>({ ...EMPTY_ENTRY, id: date });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    StorageService.getEntry(date, user?.uid).then((loadedEntry) => {
      if (mounted && loadedEntry) {
        setEntry(loadedEntry);
      }
    });
    return () => { mounted = false; };
  }, [date, user]);

  // Time of Day Logic for greetings/sorting
  const hour = new Date().getHours();
  const timeContext = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const greeting = timeContext === 'morning' ? "The day awaits." : timeContext === 'afternoon' ? "In the flow." : "Rest and reflect.";

  // Auto-save logic
  const updateEntry = useCallback((updater: (prev: DailyEntry) => DailyEntry) => {
    setEntry(prev => {
      const next = updater(prev);
      setSaveStatus('saving');
      StorageService.saveEntry(next, user?.uid);
      setTimeout(() => setSaveStatus('saved'), 600);
      setTimeout(() => setSaveStatus('idle'), 2500);
      return next;
    });
  }, [user]);

  // Helpers
  const updateState = (key: keyof DailyEntry['state'], val: any) => 
    updateEntry(prev => ({ ...prev, state: { ...prev.state, [key]: val } }));
  
  const updateEffort = (key: keyof DailyEntry['effort'], val: any) => 
    updateEntry(prev => ({ ...prev, effort: { ...prev.effort, [key]: val } }));

  const updateAchieve = (key: keyof DailyEntry['achievements'], val: any) => 
    updateEntry(prev => ({ ...prev, achievements: { ...prev.achievements, [key]: val } }));

  const updateReflect = (key: keyof DailyEntry['reflections'], val: any) => 
    updateEntry(prev => ({ ...prev, reflections: { ...prev.reflections, [key]: val } }));

  const updateFuture = (key: keyof DailyEntry['future'], val: any) => 
    updateEntry(prev => ({ ...prev, future: { ...prev.future, [key]: val } }));

  return (
    <div className="min-h-screen pb-32 px-4 md:px-8 max-w-4xl mx-auto pt-6">
      <SaveIndicator status={saveStatus} />

      {/* Header Section */}
      <header className="mb-8 mt-2">
        <h1 className="font-serif text-3xl md:text-4xl text-ink font-bold mb-1">
          {new Date(date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}
        </h1>
        <p className="font-sans text-sm font-medium text-gray-400 uppercase tracking-widest">{greeting}</p>
      </header>

      {/* COMMAND SURFACE: GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">

        {/* 1. MOOD & ESSENCE (Full Width on Mobile, 6 cols on Desktop) */}
        <Tile className="col-span-1 lg:col-span-6 flex flex-col justify-center min-h-[160px]">
          <h3 className="font-serif text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Essence</h3>
          <MoodPicker 
            value={entry.state.mood} 
            onChange={(v) => updateState('mood', v)} 
          />
          <div className="mt-6">
            <MinimalInput 
              value={entry.state.descriptors.join(', ')} 
              onChange={(v) => updateState('descriptors', v.split(',').map(s => s.trim()))} 
              placeholder="Tag your feelings (e.g. calm, focused)..." 
              className="text-sm border-b border-gray-100 pb-1"
            />
          </div>
        </Tile>

        {/* 2. VITALITY (Sleep & Body) */}
        <Tile title="Vitality" className="col-span-1 lg:col-span-6 bg-stone-50/50">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-white rounded-full shadow-sm text-organic-600"><Icons.Evening size={18} /></div>
               <div>
                  <div className="font-serif text-ink font-medium">Sleep</div>
                  <div className="text-xs text-gray-400 font-sans">Hours rested</div>
               </div>
             </div>
             <Stepper 
                value={entry.effort.sleepDuration} 
                onChange={(v) => updateEffort('sleepDuration', v)} 
                step={0.5} 
                max={16}
             />
          </div>
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-white rounded-full shadow-sm text-orange-600"><Icons.Focus size={18} /></div>
               <div>
                  <div className="font-serif text-ink font-medium">Energy</div>
                  <div className="text-xs text-gray-400 font-sans">Physical state</div>
               </div>
             </div>
             <ChipGroup 
                options={['Low', 'OK', 'High']} 
                selected={[entry.state.physicalDiscomfort === 'Low' ? 'Low' : entry.state.physicalDiscomfort === 'High' ? 'High' : 'OK']} 
                onChange={(v) => updateState('physicalDiscomfort', v[0])}
                single
             />
          </div>
        </Tile>

        {/* 3. FOCUS (Work & Flow) */}
        <Tile title="Output" className="col-span-1 lg:col-span-4">
           <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <span className="font-serif text-ink">Deep Work</span>
                 <Stepper value={entry.effort.workHours} onChange={(v) => updateEffort('workHours', v)} step={0.5} unit="h" />
              </div>
              <div className="flex justify-between items-center">
                 <span className="font-serif text-ink">Creative</span>
                 <Stepper value={entry.effort.creativeHours} onChange={(v) => updateEffort('creativeHours', v)} step={0.5} unit="h" />
              </div>
           </div>
        </Tile>

        {/* 4. QUICK CAPTURE (Journal) */}
        <Tile className="col-span-1 lg:col-span-8 bg-organic-50/30 border-organic-100">
           <div className="h-full flex flex-col">
             <h3 className="font-serif text-sm font-bold text-organic-700 uppercase tracking-widest mb-3 flex items-center gap-2">
               <Feather size={14} /> Quick Chronicle
             </h3>
             <div className="space-y-4 flex-grow">
               <MinimalInput 
                  value={entry.achievements.dailyWins} 
                  onChange={(v) => updateAchieve('dailyWins', v)} 
                  placeholder="Win of the day..." 
                  className="text-lg font-serif text-ink placeholder-organic-300/50"
               />
               <MinimalInput 
                  value={entry.future.gratitude} 
                  onChange={(v) => updateFuture('gratitude', v)} 
                  placeholder="One thing I am grateful for..." 
                  className="text-base font-serif text-gray-600 placeholder-gray-300"
               />
             </div>
             <button 
                onClick={() => setActiveOverlay('journal')}
                className="mt-4 self-start text-xs font-bold text-organic-600 uppercase tracking-widest border-b border-organic-200 pb-0.5 hover:text-organic-800 transition-colors"
             >
               Open Full Journal <ArrowRight size={10} className="inline ml-1"/>
             </button>
           </div>
        </Tile>

        {/* 5. MIND (Stress & Clarity) - Compact */}
        <Tile className="col-span-1 lg:col-span-6 flex flex-col justify-between">
           <div className="mb-4">
              <div className="flex justify-between text-sm font-serif mb-2 text-gray-500">
                <span>Anxiety</span>
                <span className="text-ink font-bold">{entry.state.anxiety || '-'}/10</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-stone-400 transition-all duration-300" 
                  style={{ width: `${(entry.state.anxiety || 0) * 10}%` }}
                />
              </div>
              <input 
                type="range" min="1" max="10" 
                value={entry.state.anxiety || 1} 
                onChange={(e) => updateState('anxiety', parseInt(e.target.value))}
                className="w-full h-6 -mt-4 opacity-0 cursor-pointer relative z-10"
              />
           </div>
           
           <div>
              <div className="flex justify-between text-sm font-serif mb-2 text-gray-500">
                <span>Clarity</span>
                <span className="text-ink font-bold">{entry.state.mentalClarity || '-'}/10</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-organic-400 transition-all duration-300" 
                  style={{ width: `${(entry.state.mentalClarity || 0) * 10}%` }}
                />
              </div>
              <input 
                type="range" min="1" max="10" 
                value={entry.state.mentalClarity || 1} 
                onChange={(e) => updateState('mentalClarity', parseInt(e.target.value))}
                className="w-full h-6 -mt-4 opacity-0 cursor-pointer relative z-10"
              />
           </div>
        </Tile>

        {/* 6. MEMORY & PEOPLE */}
        <Tile className="col-span-1 lg:col-span-6 bg-white">
           <h3 className="font-serif text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Connections</h3>
           <MinimalInput 
              value={entry.memory.peopleMet}
              onChange={(v) => updateEntry(p => ({...p, memory: {...p.memory, peopleMet: v}}))}
              placeholder="Who did you see today?"
              multiline
              className="text-base text-gray-700"
           />
           <div className="my-3 border-t border-gray-100 w-1/3" />
           <MinimalInput 
              value={entry.memory.conversations}
              onChange={(v) => updateEntry(p => ({...p, memory: {...p.memory, conversations: v}}))}
              placeholder="Conversations that mattered..."
              multiline
              className="text-base text-gray-700"
           />
        </Tile>

      </div>

      {/* FULL JOURNAL OVERLAY */}
      {activeOverlay === 'journal' && (
        <div className="fixed inset-0 z-50 bg-paper/95 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
           <div className="max-w-3xl mx-auto p-6 pt-12 min-h-screen flex flex-col">
              <div className="flex justify-between items-center mb-12">
                 <h2 className="font-serif text-3xl font-bold text-ink">Deep Reflection</h2>
                 <button 
                   onClick={() => setActiveOverlay(null)}
                   className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                 >
                   <X size={24} />
                 </button>
              </div>

              <div className="space-y-12 flex-grow">
                 <div>
                    <label className="block font-sans text-xs font-bold text-organic-600 uppercase tracking-widest mb-4">Long Form</label>
                    <textarea 
                       value={entry.reflections.longForm}
                       onChange={(e) => updateReflect('longForm', e.target.value)}
                       placeholder="Write without distraction..."
                       className="w-full h-64 bg-transparent border-none p-0 text-xl font-serif text-ink leading-relaxed placeholder-gray-200 focus:ring-0 resize-none"
                    />
                 </div>
                 
                 <div>
                    <label className="block font-sans text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">What changed my mind</label>
                    <textarea 
                       value={entry.reflections.changedMind}
                       onChange={(e) => updateReflect('changedMind', e.target.value)}
                       placeholder="An idea I am reconsidering..."
                       className="w-full h-32 bg-transparent border-none p-0 text-lg font-serif text-gray-700 leading-relaxed placeholder-gray-200 focus:ring-0 resize-none"
                    />
                 </div>

                  <div>
                    <label className="block font-sans text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Looking Forward</label>
                    <textarea 
                       value={entry.future.lookingForward}
                       onChange={(e) => updateFuture('lookingForward', e.target.value)}
                       placeholder="What gives you hope?"
                       className="w-full h-32 bg-transparent border-none p-0 text-lg font-serif text-gray-700 leading-relaxed placeholder-gray-200 focus:ring-0 resize-none"
                    />
                 </div>
              </div>

              <div className="py-8 text-center">
                <button onClick={() => setActiveOverlay(null)} className="text-gray-400 hover:text-ink transition-colors font-sans text-sm font-bold uppercase tracking-widest">
                  Close & Save
                </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};