
import React, { useState, useEffect } from 'react';
import { DailyEntry, RatingScale } from '../types';
import { COMMON_EMOTIONS, EMPTY_ENTRY } from '../constants';
import { StorageService } from '../services/storage';
import { useAuth } from '../services/authContext';
import { 
  PageContainer, SectionHeader, Card, MoodPicker, 
  Counter, SliderInput, TextInput, CheckItem,
  SaveIndicator 
} from '../components/ui/Controls';
import { Check, Calendar, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

// --- Shared Date Navigator ---
const DateNavigator = ({ date, setDate }: { date: string, setDate: (d: string) => void }) => {
  const changeDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-xl p-2 mb-6 shadow-sm border border-gray-100">
       <button onClick={() => changeDate(-1)} className="p-2 hover:bg-stone-50 rounded-lg text-gray-400 hover:text-ink"><ChevronLeft size={20} /></button>
       <div className="flex items-center gap-2">
          <Calendar size={14} className="text-organic-600" />
          <span className="font-serif font-bold text-ink text-sm">
             {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
       </div>
       <button onClick={() => changeDate(1)} className="p-2 hover:bg-stone-50 rounded-lg text-gray-400 hover:text-ink"><ChevronRight size={20} /></button>
    </div>
  );
};

// Shared Logic Hook with Non-Blocking Initialization
const useDailyEntry = (dateStr: string) => {
  const { user, loading: authLoading } = useAuth();
  const [entry, setEntry] = useState<DailyEntry>({ ...EMPTY_ENTRY, id: dateStr });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // We render immediately with EMPTY_ENTRY, then hydrate when data arrives
    let mounted = true;
    const currentUid = user?.uid;

    const fetchData = async () => {
      try {
        const data = await StorageService.getEntry(dateStr, currentUid);
        if (mounted) {
           setEntry(data);
           setLoadError(null);
        }
      } catch (err: any) {
        if (mounted) {
          console.warn("Chronos: Async load issue, remaining on local baseline.");
        }
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [dateStr, user, authLoading]);

  const save = (updater: (prev: DailyEntry) => DailyEntry) => {
    const next = updater(entry);
    setEntry(next); // Immediate UI update
    setSaveStatus('saving');
    
    StorageService.saveEntry(next, user?.uid).then(() => {
       setSaveStatus('saved');
       setTimeout(() => setSaveStatus('idle'), 1500);
    }).catch(err => {
      setSaveStatus('idle');
      console.error("Chronos: Save bypassed", err.message);
    });
  };

  return { entry, save, saveStatus, loadError };
};

// Wrapper for all Pages
const PageWrapper = ({ Component, title, subtitle }: { Component: any, title: string, subtitle: string }) => {
   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
   const { entry, save, saveStatus, loadError } = useDailyEntry(date);

   if (loadError) return (
      <PageContainer>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
           <AlertTriangle size={48} className="text-red-400 mb-6" />
           <h2 className="font-serif text-2xl font-bold text-ink mb-2">Vault Sync Interrupted</h2>
           <p className="text-gray-500 italic mb-8 max-w-sm">Unable to confirm cloud permissions. Data will remain in local storage.</p>
           <button onClick={() => window.location.reload()} className="px-6 py-3 bg-ink text-white rounded-full font-bold uppercase tracking-widest text-xs">Retry Vault Connection</button>
        </div>
      </PageContainer>
   );

   return (
     <PageContainer>
        <SaveIndicator status={saveStatus} />
        <DateNavigator date={date} setDate={setDate} />
        <SectionHeader title={title} subtitle={subtitle} />
        <Component entry={entry} save={save} />
     </PageContainer>
   );
};

// --- A. STATE PAGE ---
const StateContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
  <>
      <Card title="Mood">
        <MoodPicker value={entry.state.mood} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, mood: v as RatingScale}}))} />
      </Card>
      <Card title="Emotions">
         <div className="flex flex-wrap gap-2">
            {COMMON_EMOTIONS.map(emo => {
              const isActive = entry.state.descriptors.includes(emo);
              return (
                <button
                  key={emo}
                  onClick={() => save((p: DailyEntry) => ({
                    ...p, 
                    state: {
                      ...p.state, 
                      descriptors: isActive 
                        ? p.state.descriptors.filter(d => d !== emo)
                        : [...p.state.descriptors, emo]
                    }
                  }))}
                  className={`px-4 py-2 rounded-full text-sm font-sans font-medium transition-all ${
                    isActive ? 'bg-organic-600 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {emo}
                </button>
              )
            })}
         </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <SliderInput label="Stress" value={entry.state.stress} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, stress: v as RatingScale}}))} />
          <SliderInput label="Clarity" value={entry.state.mentalClarity} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, mentalClarity: v as RatingScale}}))} />
          <SliderInput label="Anxiety" value={entry.state.anxiety} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, anxiety: v as RatingScale}}))} />
        </Card>
        <Card>
           <Counter label="Times Cried" value={entry.state.timesCried} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, timesCried: v}}))} />
           <Counter label="Times Laughed" value={entry.state.timesLaughed} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, timesLaughed: v}}))} />
        </Card>
      </div>
      <Card title="Body Notes">
        <TextInput 
          value={entry.state.physicalDiscomfort} 
          onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, physicalDiscomfort: v}}))} 
          placeholder="Physical state..." 
        />
      </Card>
  </>
);

// --- B. EFFORT PAGE ---
const EffortContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Focus Volume">
          <Counter label="Work Hours" value={entry.effort.workHours} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, workHours: v}}))} />
          <Counter label="Creative Hours" value={entry.effort.creativeHours} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, creativeHours: v}}))} />
          <div className="mt-4 pt-4 border-t border-gray-100">
             <SliderInput label="Focus Quality" value={entry.effort.focusQuality} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, focusQuality: v as RatingScale}}))} />
          </div>
        </Card>

        <Card title="Recovery">
          <Counter label="Sleep Hours" value={entry.effort.sleepDuration} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, sleepDuration: v}}))} />
          <div className="mt-4">
             <TextInput label="Wake Time" value={entry.effort.wakeTime} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, wakeTime: v}}))} placeholder="07:00 AM" />
          </div>
          <SliderInput label="Sleep Quality" value={entry.effort.sleepQuality} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, sleepQuality: v as RatingScale}}))} />
        </Card>
      </div>
    </>
);

// --- C. ACHIEVEMENTS ---
const AchievementsContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <>
      <Card>
        <TextInput label="Wins of the Day" value={entry.achievements.dailyWins} onChange={(v) => save((p: DailyEntry) => ({...p, achievements: {...p.achievements, dailyWins: v}}))} placeholder="Progress made..." rows={2} />
      </Card>
      <Card>
        <TextInput label="Realizations" value={entry.achievements.breakthroughs} onChange={(v) => save((p: DailyEntry) => ({...p, achievements: {...p.achievements, breakthroughs: v}}))} placeholder="What clicked today?" rows={2} />
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
           <TextInput label="Friction / Failures" value={entry.achievements.failures} onChange={(v) => save((p: DailyEntry) => ({...p, achievements: {...p.achievements, failures: v}}))} placeholder="Observations..." rows={3} />
        </Card>
        <Card>
           <TextInput label="Key Lessons" value={entry.achievements.lessons} onChange={(v) => save((p: DailyEntry) => ({...p, achievements: {...p.achievements, lessons: v}}))} placeholder="Takeaway..." rows={3} />
        </Card>
      </div>
    </>
);

// --- D. REFLECTIONS ---
const ReflectionsContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <>
      <Card className="min-h-[50vh]">
        <label className="block font-serif text-lg font-bold text-gray-300 mb-4">Daily Journal</label>
        <textarea 
          className="w-full h-full min-h-[40vh] bg-transparent border-none p-0 text-xl font-serif text-ink leading-loose placeholder-gray-200 focus:ring-0 resize-none"
          placeholder="Unfiltered thoughts..."
          value={entry.reflections.longForm}
          onChange={(e) => save((p: DailyEntry) => ({...p, reflections: {...p.reflections, longForm: e.target.value}}))}
        />
      </Card>
      <Card>
        <TextInput label="Refinement of Thought" value={entry.reflections.changedMind} onChange={(v) => save((p: DailyEntry) => ({...p, reflections: {...p.reflections, changedMind: v}}))} placeholder="What is evolving?" rows={2} />
      </Card>
    </>
);

// --- E. MEMORIES ---
const MemoriesContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card title="The Day's Texture">
            <TextInput label="Happy Moments" value={entry.memory.happyMoments} onChange={(v) => save((p: DailyEntry) => ({...p, memory: {...p.memory, happyMoments: v}}))} rows={2} />
            <TextInput label="Heavier Moments" value={entry.memory.sadMoments} onChange={(v) => save((p: DailyEntry) => ({...p, memory: {...p.memory, sadMoments: v}}))} rows={2} />
         </Card>
         <Card title="Social & Surroundings">
            <TextInput label="People Seen" value={entry.memory.peopleMet} onChange={(v) => save((p: DailyEntry) => ({...p, memory: {...p.memory, peopleMet: v}}))} />
            <TextInput label="Places Visited" value={entry.memory.placesVisited} onChange={(v) => save((p: DailyEntry) => ({...p, memory: {...p.memory, placesVisited: v}}))} />
            {/* Fix: Access p.memory instead of non-existent p.media */}
            <TextInput label="Media Consumed" value={entry.memory.media} onChange={(v) => save((p: DailyEntry) => ({...p, memory: {...p.memory, media: v}}))} placeholder="Books, Music..." />
         </Card>
      </div>
      <Card>
         <TextInput label="Conversations" value={entry.memory.conversations} onChange={(v) => save((p: DailyEntry) => ({...p, memory: {...p.memory, conversations: v}}))} rows={3} />
      </Card>
    </>
);

// --- F. FUTURE ---
const FutureContent = ({ entry, save }: { entry: DailyEntry, save: any }) => {
  const addGoal = () => {
     const newId = Date.now().toString();
     save((p: DailyEntry) => ({...p, future: {...p.future, shortTermGoals: [...p.future.shortTermGoals, { id: newId, text: '', done: false }]}}));
  };

  const updateGoal = (id: string, text: string) => {
     save((p: DailyEntry) => ({...p, future: {...p.future, shortTermGoals: p.future.shortTermGoals.map(g => g.id === id ? { ...g, text } : g)}}));
  };

  const toggleGoal = (id: string) => {
     save((p: DailyEntry) => ({...p, future: {...p.future, shortTermGoals: p.future.shortTermGoals.map(g => g.id === id ? { ...g, done: !g.done } : g)}}));
  };

  return (
    <>
      <Card title="Gratitude">
        <TextInput value={entry.future.gratitude} onChange={(v) => save((p: DailyEntry) => ({...p, future: {...p.future, gratitude: v}}))} placeholder="I am grateful for..." rows={3} />
      </Card>

      <Card title="Near-Term Intentions" action={<button onClick={addGoal} className="text-xs font-bold uppercase text-organic-600 bg-organic-50 px-3 py-1 rounded-full">Add Goal</button>}>
         <div className="space-y-3">
            {entry.future.shortTermGoals.map(goal => (
               <div key={goal.id} className="flex items-center gap-3">
                  <button onClick={() => toggleGoal(goal.id)} className={`w-5 h-5 rounded border flex items-center justify-center ${goal.done ? 'bg-organic-500 border-organic-500 text-white' : 'border-gray-300'}`}>
                     {goal.done && <Check size={12} />}
                  </button>
                  <input 
                    className={`flex-grow bg-transparent border-b border-transparent focus:border-gray-200 outline-none font-serif ${goal.done ? 'line-through text-gray-400' : 'text-ink'}`}
                    value={goal.text}
                    onChange={(e) => updateGoal(goal.id, e.target.value)}
                    placeholder="Goal..."
                  />
               </div>
            ))}
            {entry.future.shortTermGoals.length === 0 && <p className="text-gray-400 text-sm italic">No goals set for tomorrow.</p>}
         </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Anticipation">
           <TextInput label="Looking Forward" value={entry.future.lookingForward} onChange={(v) => save((p: DailyEntry) => ({...p, future: {...p.future, lookingForward: v}}))} rows={3} />
        </Card>
        <Card title="Vision Board">
           <TextInput label="Wishes" value={entry.future.wishes} onChange={(v) => save((p: DailyEntry) => ({...p, future: {...p.future, wishes: v}}))} rows={3} />
        </Card>
      </div>
    </>
  );
};

// Exports
export const StatePage = () => <PageWrapper Component={StateContent} title="Vital Signs" subtitle="Daily State" />;
export const EffortPage = () => <PageWrapper Component={EffortContent} title="Energy Allocation" subtitle="Effort & Recovery" />;
export const AchievementsPage = () => <PageWrapper Component={AchievementsContent} title="Daily Progress" subtitle="Wins & Lessons" />;
export const ReflectionsPage = () => <PageWrapper Component={ReflectionsContent} title="Introspection" subtitle="Daily Reflections" />;
export const MemoriesPage = () => <PageWrapper Component={MemoriesContent} title="Archive" subtitle="Preserving Moments" />;
export const FuturePage = () => <PageWrapper Component={FutureContent} title="Orientation" subtitle="Gratitude & Future" />;
