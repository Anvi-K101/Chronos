
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DailyEntry, RatingScale as RatingType } from '../types';
import { COMMON_EMOTIONS, EMPTY_ENTRY } from '../constants';
import { StorageService } from '../services/storage';
import { useAuth } from '../services/authContext';
import { 
  PageContainer, SectionHeader, Card, MoodLevelSelector, 
  Counter, RatingScale, TextInput, 
  SaveIndicator 
} from '../components/ui/Controls';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const DateNavigator = ({ date, setDate }: { date: string, setDate: (d: string) => void }) => {
  const changeDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };
  return (
    <div className="flex items-center justify-between bg-white rounded-xl p-2 mb-6 shadow-sm border border-gray-100">
       <button onClick={() => changeDate(-1)} className="p-2 hover:bg-stone-50 rounded-lg text-gray-400"><ChevronLeft size={20} /></button>
       <div className="flex items-center gap-2">
          <Calendar size={14} className="text-organic-600" />
          <span className="font-serif font-bold text-ink text-sm">
             {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
       </div>
       <button onClick={() => changeDate(1)} className="p-2 hover:bg-stone-50 rounded-lg text-gray-400"><ChevronRight size={20} /></button>
    </div>
  );
};

const useDailyEntry = (dateStr: string) => {
  const { user, loading: authLoading } = useAuth();
  
  const [entry, setEntry] = useState<DailyEntry>(() => {
    const local = StorageService.loadLocal();
    return local.entries[dateStr] || { ...EMPTY_ENTRY, id: dateStr };
  });
  
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle' | 'local'>('idle');
  
  const hydratedRef = useRef(false);
  const userHasEditedRef = useRef(false);
  const dateRef = useRef(dateStr);

  useEffect(() => {
    if (dateRef.current !== dateStr) {
      hydratedRef.current = false;
      userHasEditedRef.current = false;
      dateRef.current = dateStr;
    }
    
    const local = StorageService.loadLocal();
    const cached = local.entries[dateStr] || { ...EMPTY_ENTRY, id: dateStr };
    setEntry(cached);

    if (authLoading) return;

    let mounted = true;
    StorageService.getEntry(dateStr, user?.uid).then(remote => {
      if (mounted && !userHasEditedRef.current && !hydratedRef.current && remote) {
        setEntry(remote);
        hydratedRef.current = true;
      }
    });

    return () => { mounted = false; };
  }, [dateStr, user, authLoading]);

  const save = useCallback(async (updater: (prev: DailyEntry) => DailyEntry) => {
    userHasEditedRef.current = true;
    
    setEntry(prev => {
      const next = updater(prev);
      setSaveStatus('saving');
      
      StorageService.saveEntry(next, user?.uid)
        .then(() => {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        })
        .catch(() => {
          setSaveStatus('idle'); // Local backup is always written by service
        });
        
      return next;
    });
  }, [user]);

  return { entry, save, saveStatus };
};

const PageWrapper = ({ Component, title, subtitle }: { Component: any, title: string, subtitle: string }) => {
   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
   const { entry, save, saveStatus } = useDailyEntry(date);

   return (
     <PageContainer>
        <SaveIndicator status={saveStatus} />
        <DateNavigator date={date} setDate={setDate} />
        <SectionHeader title={title} subtitle={subtitle} />
        <Component entry={entry} save={save} />
     </PageContainer>
   );
};

const StateContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
  <>
      <Card title="Mood Essence">
        <MoodLevelSelector value={entry.state.mood} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, mood: v as RatingType}}))} />
      </Card>
      <Card title="Detailed Emotions">
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
                      descriptors: isActive ? p.state.descriptors.filter(d => d !== emo) : [...p.state.descriptors, emo]
                    }
                  }))}
                  className={`px-4 py-2 rounded-full text-sm font-sans font-medium transition-all ${isActive ? 'bg-organic-600 text-white shadow-sm' : 'bg-gray-50 text-gray-600'}`}
                >
                  {emo}
                </button>
              )
            })}
         </div>
      </Card>
      <div className="grid grid-cols-1 gap-6">
        <Card title="Internal Metrics">
          <div className="space-y-8">
            <RatingScale label="Stress" value={entry.state.stress} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, stress: v as RatingType}}))} />
            <RatingScale label="Clarity" value={entry.state.mentalClarity} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, mentalClarity: v as RatingType}}))} />
            <RatingScale label="Anxiety" value={entry.state.anxiety} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, anxiety: v as RatingType}}))} />
          </div>
        </Card>
        <Card title="Reactions">
           <Counter label="Times Cried" value={entry.state.timesCried} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, timesCried: v}}))} />
           <Counter label="Times Laughed" value={entry.state.timesLaughed} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, timesLaughed: v}}))} />
        </Card>
      </div>
  </>
);

const EffortContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Focus Volume">
          <Counter label="Work Hours" value={entry.effort.workHours} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, workHours: v}}))} />
          <Counter label="Creative Hours" value={entry.effort.creativeHours} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, creativeHours: v}}))} />
          <div className="mt-8 pt-8 border-t border-gray-100">
             <RatingScale label="Focus Quality" value={entry.effort.focusQuality} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, focusQuality: v as RatingType}}))} />
          </div>
        </Card>
        <Card title="Recovery">
          <Counter label="Sleep Hours" value={entry.effort.sleepDuration} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, sleepDuration: v}}))} />
          <div className="mt-8 pt-8 border-t border-gray-100">
            <RatingScale label="Sleep Quality" value={entry.effort.sleepQuality} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, sleepQuality: v as RatingType}}))} />
          </div>
        </Card>
      </div>
    </>
);

const AchievementsContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <>
      <Card><TextInput label="Wins of the Day" value={entry.achievements.dailyWins} onChange={(v) => save((p: DailyEntry) => ({...p, achievements: {...p.achievements, dailyWins: v}}))} rows={2} /></Card>
      <Card><TextInput label="Realizations" value={entry.achievements.breakthroughs} onChange={(v) => save((p: DailyEntry) => ({...p, achievements: {...p.achievements, breakthroughs: v}}))} rows={2} /></Card>
    </>
);

const ReflectionsContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <>
      <Card className="min-h-[50vh]">
        <textarea className="w-full h-full min-h-[40vh] bg-transparent border-none p-0 text-xl font-serif text-ink leading-relaxed focus:ring-0 resize-none" value={entry.reflections.longForm} onChange={(e) => save((p: DailyEntry) => ({...p, reflections: {...p.reflections, longForm: e.target.value}}))} placeholder="Journal your thoughts..." />
      </Card>
    </>
);

const MemoriesContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <>
      <Card title="The Day's Texture">
         <TextInput label="Happy Moments" value={entry.memory.happyMoments} onChange={(v) => save((p: DailyEntry) => ({...p, memory: {...p.memory, happyMoments: v}}))} rows={2} />
      </Card>
      <Card title="Social Log">
         <TextInput label="People Met" value={entry.memory.peopleMet} onChange={(v) => save((p: DailyEntry) => ({...p, memory: {...p.memory, peopleMet: v}}))} />
      </Card>
    </>
);

const FutureContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <>
      <Card title="Gratitude">
        <TextInput value={entry.future.gratitude} onChange={(v) => save((p: DailyEntry) => ({...p, future: {...p.future, gratitude: v}}))} rows={3} />
      </Card>
      <Card title="Vision">
        <TextInput label="Looking Forward" value={entry.future.lookingForward} onChange={(v) => save((p: DailyEntry) => ({...p, future: {...p.future, lookingForward: v}}))} rows={3} />
      </Card>
    </>
);

export const StatePage = () => <PageWrapper Component={StateContent} title="Vital Signs" subtitle="Daily State" />;
export const EffortPage = () => <PageWrapper Component={EffortContent} title="Energy Allocation" subtitle="Effort & Recovery" />;
export const AchievementsPage = () => <PageWrapper Component={AchievementsContent} title="Daily Progress" subtitle="Wins & Lessons" />;
export const ReflectionsPage = () => <PageWrapper Component={ReflectionsContent} title="Introspection" subtitle="Daily Reflections" />;
export const MemoriesPage = () => <PageWrapper Component={MemoriesContent} title="Archive" subtitle="Preserving Moments" />;
export const FuturePage = () => <PageWrapper Component={FutureContent} title="Orientation" subtitle="Gratitude & Future" />;
