
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TreeOfLife } from '../components/TreeOfLife';
import { StorageService } from '../services/storage';
import { useAuth } from '../services/authContext';
import { ArrowRight, LogOut, CheckCircle2 } from 'lucide-react';

export const Home = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({ 
      count: 0, 
      activity: 0, 
      avgMood: 5, 
      totalCreative: 0, 
      totalStress: 0, 
      totalClarity: 0,
      checklistComplete: 0
  });
  const [todayCompleted, setTodayCompleted] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    const refreshData = async () => {
        const data = StorageService.loadLocal();
        const entries = Object.values(data.entries);
        
        const moodSum = entries.reduce((acc, val) => acc + (val.state?.mood || 5), 0);
        const creativeSum = entries.reduce((acc, val) => acc + (val.effort?.creativeHours || 0), 0);
        const stressSum = entries.reduce((acc, val) => acc + (val.state?.stress || 0), 0);
        const claritySum = entries.reduce((acc, val) => acc + (val.state?.mentalClarity || 0), 0);
        
        const checklistSum = entries.reduce((acc, val) => {
            if (!val.checklist) return acc;
            return acc + Object.values(val.checklist).filter(Boolean).length;
        }, 0);

        setStats({
          count: entries.length,
          activity: entries.length > 0 ? 1 : 0,
          avgMood: entries.length ? moodSum / entries.length : 5,
          totalCreative: creativeSum,
          totalStress: stressSum,
          totalClarity: claritySum,
          checklistComplete: checklistSum
        });

        // Today's specific checklist progress
        const todayStr = new Date().toISOString().split('T')[0];
        const todayEntry = await StorageService.getEntry(todayStr, user?.uid);
        if (todayEntry && todayEntry.checklist) {
            setTodayCompleted(Object.values(todayEntry.checklist).filter(Boolean).length);
        }
        
        const config = await StorageService.getChecklistConfig(user?.uid);
        setTodayTotal(config.filter(c => c.enabled).length);
    };

    refreshData();
  }, [user, authLoading]);

  return (
    <div className="relative h-screen w-full bg-paper overflow-hidden flex flex-col items-center justify-center">
      
      {/* Logout Button */}
      {user && (
         <button 
           type="button"
           onClick={() => logout()}
           className="absolute top-6 right-6 z-50 bg-white/50 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-ink hover:bg-white transition-all shadow-sm"
         >
           <LogOut size={12} /> Sign Out
         </button>
      )}

      {/* Visual Layer */}
      <TreeOfLife 
         entryCount={stats.count} 
         activityLevel={stats.activity}
         stats={stats}
      />
      
      {/* Content Layer */}
      <div className="relative z-10 text-center space-y-8 p-8 max-w-lg animate-in fade-in duration-1000 slide-in-from-bottom-8">
         <div>
            <h2 className="font-sans text-xs font-bold text-organic-600 uppercase tracking-[0.3em] mb-6">Chronos 2026</h2>
            <h1 className="font-serif text-5xl md:text-6xl text-ink font-bold tracking-tighter mb-6 leading-tight drop-shadow-sm">
              {stats.count === 0 ? "The Seed." : "The Tree."}
            </h1>
            <p className="font-serif text-lg md:text-xl text-gray-500 italic">
               "{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}"
            </p>
         </div>
        
        {/* Checklist Summary */}
        {todayTotal > 0 && (
            <div className="flex justify-center">
                <Link to="/checklist" className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-5 py-2 rounded-full border border-organic-100 shadow-sm hover:bg-white hover:scale-105 transition-all group">
                    <div className="relative">
                        <CheckCircle2 size={20} className={todayCompleted === todayTotal ? "text-organic-600" : "text-gray-400"} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-ink">
                        Daily Habits: {todayCompleted}/{todayTotal}
                    </span>
                </Link>
            </div>
        )}

         <div className="pt-8">
           <Link to="/log/state" className="group inline-flex items-center gap-3 px-8 py-4 bg-ink text-paper rounded-full font-sans font-bold uppercase tracking-widest text-xs hover:bg-organic-800 transition-all shadow-xl hover:shadow-2xl hover:scale-105">
             Update Record <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
           </Link>
         </div>
      </div>
    </div>
  );
};
