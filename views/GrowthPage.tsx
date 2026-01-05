
import React, { useState, useEffect } from 'react';
import { TreeOfLife } from '../components/TreeOfLife';
import { StorageService } from '../services/storage';
import { useAuth } from '../services/authContext';
import { PageContainer, SectionHeader } from '../components/ui/Controls';
import { Loader2 } from 'lucide-react';

export const GrowthPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    const load = async () => {
      const data = StorageService.loadLocal();
      const entries = Object.values(data.entries);
      const moodSum = entries.reduce((acc, val) => acc + (val.state?.mood || 5), 0);
      setStats({
          count: entries.length,
          activity: entries.length > 0 ? 1 : 0,
          avgMood: entries.length ? moodSum / entries.length : 5,
          totalCreative: entries.reduce((acc, val) => acc + (val.effort?.creativeHours || 0), 0),
          totalStress: entries.reduce((acc, val) => acc + (val.state?.stress || 0), 0),
          checklistComplete: entries.reduce((acc, val) => acc + (val.checklist ? Object.values(val.checklist).filter(Boolean).length : 0), 0)
      });
    };
    load();
  }, [user, authLoading]);

  if (!stats) return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <Loader2 className="animate-spin text-stone-200" size={32} />
    </div>
  );

  return (
    <PageContainer>
      <SectionHeader title="The Arbor" subtitle="Visualization of your life's expansion" />
      
      <div className="relative w-full aspect-square md:aspect-video rounded-[3rem] bg-stone-50/50 border border-stone-100 overflow-hidden mb-10 shadow-inner">
        <TreeOfLife 
           entryCount={stats.count} 
           activityLevel={stats.activity}
           stats={stats}
        />
        
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
           <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-soft">
              <div className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-2">Structure Height</div>
              <div className="font-serif text-3xl font-bold text-ink">{stats.count} Nodes</div>
           </div>
           
           <div className="text-right bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-soft">
              <div className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-2">Vibrancy</div>
              <div className="font-serif text-3xl font-bold text-ink">{(stats.avgMood * 10).toFixed(0)}%</div>
           </div>
        </div>
      </div>
      
      <p className="font-serif text-lg text-stone-400 italic text-center max-w-2xl mx-auto leading-relaxed">
        This tree reflects the cumulative weight of your entries. Every ritual completed strengthens the trunk; every creative hour extends a branch; every focused thought adds depth to the leaves.
      </p>
    </PageContainer>
  );
};
