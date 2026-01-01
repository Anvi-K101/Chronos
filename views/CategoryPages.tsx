import React, { useState, useEffect } from 'react';
import { DailyEntry, RatingScale } from '../types';
import { COMMON_EMOTIONS } from '../constants';
import { StorageService } from '../services/storage';
import { useAuth } from '../services/authContext';
import { 
  PageContainer, SectionHeader, Card, MoodPicker, 
  Counter, SliderInput, TextInput, CheckItem,
  SaveIndicator 
} from '../components/ui/Controls';
import { Check, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

// Shared Logic Hook with Async Support
const useDailyEntry = (dateStr: string) => {
  const { user } = useAuth();
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  useEffect(() => {
    let mounted = true;
    StorageService.getEntry(dateStr, user?.uid).then(data => {
      if (mounted) setEntry(data);
    });
    return () => { mounted = false; };
  }, [dateStr, user]);

  const save = (updater: (prev: DailyEntry) => DailyEntry) => {
    if (!entry) return;
    const next = updater(entry);
    setEntry(next); // Optimistic
    setSaveStatus('saving');
    StorageService.saveEntry(next, user?.uid).then(() => {
       setSaveStatus('saved');
       setTimeout(() => setSaveStatus('idle'), 2000);
    });
  };

  return { entry, save, saveStatus };
};

// Wrapper for all Pages to handle Date State
const PageWrapper = ({ Component, title, subtitle }: { Component: any, title: string, subtitle: string }) => {
   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
   const { entry, save, saveStatus } = useDailyEntry(date);

   if (!entry) return <div className="min-h-screen pt-24 text-center text-gray-400">Loading timeline...</div>;

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
                    isActive ? 'bg-organic-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
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
          <SliderInput label="Mental Clarity" value={entry.state.mentalClarity} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, mentalClarity: v as RatingScale}}))} />
          <SliderInput label="Anxiety" value={entry.state.anxiety} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, anxiety: v as RatingScale}}))} />
        </Card>
        <Card>
           <Counter label="Times Cried" value={entry.state.timesCried} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, timesCried: v}}))} />
           <Counter label="Times Laughed" value={entry.state.timesLaughed} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, timesLaughed: v}}))} />
        </Card>
      </div>
      <Card title="Physical Body">
        <TextInput 
          value={entry.state.physicalDiscomfort} 
          onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, physicalDiscomfort: v}}))} 
          placeholder="Pain, tension, or vitality notes..." 
        />
      </Card>
  </>
);

// --- B. EFFORT PAGE ---
const EffortContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Deep Work">
          <Counter label="Work Hours" value={entry.effort.workHours} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, workHours: v}}))} />
          <Counter label="Creative Hours" value={entry.effort.creativeHours} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, creativeHours: v}}))} />
          <div className="mt-4 pt-4 border-t border-gray-100">
             <SliderInput label="Focus Quality" value={entry.effort.focusQuality} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, focusQuality: v as RatingScale}}))} />
          </div>
        </Card>

        <Card title="Rest">
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
        <TextInput label="Daily Wins" value={entry.achievements.dailyWins} onChange={(v) => save((p: DailyEntry) => ({...p, achievements: {...p.achievements, dailyWins: v}}))} placeholder="Small or big wins..." rows={2} />
      </Card>
      <Card>
        <TextInput label="Breakthroughs" value={entry.achievements.breakthroughs} onChange={(v) => save((p: DailyEntry) => ({...p, achievements: {...p.achievements, breakthroughs: v}}))} placeholder="Realizations made today..." rows={2} />
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
           <TextInput label="Failures / Rejections" value={entry.achievements.failures} onChange={(v) => save((p: DailyEntry) => ({...p, achievements: {...p.achievements, failures: v}}))} placeholder="Neutral observation..." rows={3} />
        </Card>
        <Card>
           <TextInput label="Lessons Learned" value={entry.achievements.lessons} onChange={(v) => save((p: DailyEntry) => ({...p, achievements: {...p.achievements, lessons: v}}))} placeholder="Takeaway for the future..." rows={3} />
        </Card>
      </div>
    </>
);

// --- D. REFLECTIONS ---
const ReflectionsContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <>
      <Card className="min-h-[50vh]">
        <label className="block font-serif text-lg font-bold text-gray-300 mb-4">Long Form Journal</label>
        <textarea 
          className="w-full h-full min-h-[40vh] bg-transparent border-none p-0 text-xl font-serif text-ink leading-loose placeholder-gray-200 focus:ring-0 resize-none"
          placeholder="Write without distraction..."
          value={entry.reflections.longForm}
          onChange={(e) => save((p: DailyEntry) => ({...p, reflections: {...p.reflections, longForm: e.target.value}}))}
        />
      </Card>
      <Card>
        <TextInput label="What changed my mind?" value={entry.reflections.changedMind} onChange={(v) => save((p: DailyEntry) => ({...p, reflections: {...p.reflections, changedMind: v}}))} placeholder="Evolution of thought..." rows={2} />
      </Card>
    </>
);

// --- E. MEMORIES ---
const MemoriesContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card title="Moments">
            <TextInput label="Happy Moments" value={entry.memory.happyMoments} onChange={(v) => save((p: DailyEntry) => ({...p, memory: {...p.memory, happyMoments: v}}))} rows={2} />
            <TextInput label="Meaningful / Sad" value={entry.memory.sadMoments} onChange={(v) => save((p: DailyEntry) => ({...p, memory: {...p.memory, sadMoments: v}}))} rows={2} />
         </Card>
         <Card title="Context">
            <TextInput label="People" value={entry.memory.peopleMet} onChange={(v) => save((p: DailyEntry) => ({...p, memory: {...p.memory, peopleMet: v}}))} />
            <TextInput label="Places" value={entry.memory.placesVisited} onChange={(v) => save((p: DailyEntry) => ({...p, memory: {...p.memory, placesVisited: v}}))} />
            <TextInput label="Media" value={entry.memory.media} onChange={(v) => save((p: DailyEntry) => ({...p, memory: {...p.memory, media: v}}))} placeholder="Books, Music, Art..." />
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

      <Card title="Goals for Tomorrow" action={<button onClick={addGoal} className="text-xs font-bold uppercase text-organic-600 bg-organic-50 px-3 py-1 rounded-full">Add Goal</button>}>
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
            {entry.future.shortTermGoals.length === 0 && <p className="text-gray-400 text-sm italic">No goals set.</p>}
         </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Anticipation">
           <TextInput label="Looking Forward To" value={entry.future.lookingForward} onChange={(v) => save((p: DailyEntry) => ({...p, future: {...p.future, lookingForward: v}}))} rows={3} />
        </Card>
        <Card title="Vision">
           <TextInput label="Wishes & Hopes" value={entry.future.wishes} onChange={(v) => save((p: DailyEntry) => ({...p, future: {...p.future, wishes: v}}))} rows={3} />
        </Card>
      </div>
    </>
  );
};

// Exports
export const StatePage = () => <PageWrapper Component={StateContent} title="Daily State" subtitle="Emotional & Physical Baseline" />;
export const EffortPage = () => <PageWrapper Component={EffortContent} title="Time & Effort" subtitle="Where energy went" />;
export const AchievementsPage = () => <PageWrapper Component={AchievementsContent} title="Achievements" subtitle="Wins, lessons, and progress" />;
export const ReflectionsPage = () => <PageWrapper Component={ReflectionsContent} title="Reflections" subtitle="Deep thought processing" />;
export const MemoriesPage = () => <PageWrapper Component={MemoriesContent} title="Memories" subtitle="Moments to preserve" />;
export const FuturePage = () => <PageWrapper Component={FutureContent} title="Future & Gratitude" subtitle="Orientation" />;