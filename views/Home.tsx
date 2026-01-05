import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TreeOfLife } from '../components/TreeOfLife';
import { WisdomPanel } from '../components/WisdomPanel';
import { StorageService } from '../services/storage';
import { useAuth } from '../services/authContext';
import { ArrowRight, LogOut, CheckCircle2, Trees, ShieldCheck } from 'lucide-react';
import { getLocalISODate } from '../constants';

export const Home = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
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
    if (authLoading || !user) return;
    const refreshData = async () => {
        const data = StorageService.loadLocal();
        const entries = Object.values(data.entries);
        const moodSum = entries.reduce((acc, val) => acc + (val.state?.mood || 5), 0);
        const creativeSum = entries.reduce((acc, val) => acc + (val.effort?.creativeHours || 0), 0);
        const stressSum = entries.reduce((acc, val) => acc + (val.state?.stress || 0), 0);
        setStats({
          count: entries.length,
          activity: entries.length > 0 ? 1 : 0,
          avgMood: entries.length ? moodSum / entries.length : 5,
          totalCreative: creativeSum,
          totalStress: stressSum,
          totalClarity: entries.reduce((acc, val) => acc + (val.state?.mentalClarity || 0), 0),
          checklistComplete: entries.reduce((acc, val) => acc + (val.checklist ? Object.values(val.checklist).filter(Boolean).length : 0), 0)
        });
        const todayStr = getLocalISODate();
        const [todayEntry, config] = await Promise.all([
          StorageService.getEntry(todayStr, user.uid),
          StorageService.getChecklistConfig(user.uid)
        ]);
        if (todayEntry && todayEntry.checklist) {
            setTodayCompleted(Object.values(todayEntry.checklist).filter(Boolean).length);
        }
        setTodayTotal(config.filter(c => c.enabled).length);
    };
    refreshData();
  }, [user, authLoading]);

  const handleNavigate = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(path);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    logout();
  };

  return (
    <div className="relative h-screen w-full bg-paper overflow-hidden flex flex-col items-center justify-center no-tap-highlight">
      
      {/* Visual Ambiance */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-stone-100 rounded-full blur-[120px] pointer-events-none opacity-40" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-organic-50 rounded-full blur-[120px] pointer-events-none opacity-30" />

      {/* Top Controls */}
      <nav className="absolute top-8 left-8 right-8 z-50 flex justify-end items-center pointer-events-none">
         {user && (
            <button 
              type="button"
              onClick={handleLogout}
              className="pointer-events-auto bg-white/40 backdrop-blur-xl px-5 py-2 rounded-full flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-stone-400 hover:text-ink transition-all border border-stone-100/30 outline-none"
              aria-label="Exit Vault"
            >
              <LogOut size={12} strokeWidth={3} /> Exit Vault
            </button>
         )}
      </nav>

      {/* Background Visualization */}
      <div className="absolute inset-0 z-0 animate-in fade-in duration-[3000ms] pointer-events-none">
        <TreeOfLife 
           entryCount={stats.count} 
           activityLevel={stats.activity}
           stats={stats}
        />
      </div>
      
      {/* Content */}
      <section className="relative z-10 text-center space-y-8 p-12 max-w-2xl bg-white/5 backdrop-blur-[2px] rounded-[4rem] animate-in zoom-in-95 duration-1000">
         <header>
            <h1 className="font-serif text-6xl md:text-7xl text-ink font-bold tracking-tighter mb-4 leading-tight">
              {stats.count === 0 ? "Void." : "Chronos."}
            </h1>
            <p className="font-sans text-[10px] font-black text-stone-300 uppercase tracking-[0.4em] mb-4">Your Private Life Archive</p>
            <div className="flex items-center justify-center gap-3 opacity-30">
                <p className="font-serif text-base text-stone-600 italic tracking-wide">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>
         </header>
        
        <WisdomPanel stats={stats} />

        <div className="flex flex-col items-center gap-4 pt-6">
            <button 
              type="button"
              onClick={(e) => handleNavigate('/growth', e)} 
              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-ink/40 hover:text-ink transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-organic-500 rounded-lg p-2"
              aria-label="View your Growth Arbor"
            >
              <Trees size={16} className="group-hover:scale-110 transition-transform" />
              Explore Growth Arbor
            </button>

            {todayTotal > 0 && (
                <button 
                  type="button"
                  onClick={(e) => handleNavigate('/checklist', e)} 
                  className="flex items-center gap-4 bg-white/60 backdrop-blur-md px-8 py-3 rounded-full border border-white/50 shadow-soft hover:shadow-float hover:-translate-y-1 active:scale-95 transition-all outline-none"
                  aria-label={`Ritual progress: ${todayCompleted} of ${todayTotal}`}
                >
                    <CheckCircle2 size={18} className={todayCompleted === todayTotal ? "text-ink" : "text-stone-300"} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-ink/70">
                        Rituals: {todayCompleted}/{todayTotal}
                    </span>
                </button>
            )}

           <button 
             type="button"
             onClick={(e) => handleNavigate('/log/state', e)} 
             className="group relative inline-flex items-center gap-5 px-12 py-5 bg-ink text-paper rounded-full font-sans font-black uppercase tracking-[0.4em] text-[11px] hover:bg-stone-800 transition-all shadow-2xl hover:-translate-y-1 active:scale-95 outline-none"
             aria-label="Record today's node"
           >
             <span>Record Node</span>
             <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
           </button>

           <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-stone-200 mt-4">
             <ShieldCheck size={10} />
             Isolated Session
           </div>
        </div>
      </section>
    </div>
  );
};