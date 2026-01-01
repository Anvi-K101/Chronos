import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TreeOfLife } from '../components/TreeOfLife';
import { StorageService } from '../services/storage';
import { useAuth } from '../services/authContext';
import { ArrowRight, LogIn } from 'lucide-react';

export const Home = () => {
  const { user, signInGoogle, isOfflineMode } = useAuth();
  const [stats, setStats] = useState({ count: 0, activity: 0, avgMood: 5, totalCreative: 0, totalStress: 0, totalClarity: 0 });

  useEffect(() => {
    // Load local stats for immediate visualization (even if logged in, start with cache)
    const data = StorageService.loadLocal();
    const entries = Object.values(data.entries);
    
    // Simple calculations for Tree generation
    const moodSum = entries.reduce((acc, val) => acc + (val.state.mood || 5), 0);
    const creativeSum = entries.reduce((acc, val) => acc + (val.effort.creativeHours || 0), 0);
    const stressSum = entries.reduce((acc, val) => acc + (val.state.stress || 0), 0);
    const claritySum = entries.reduce((acc, val) => acc + (val.state.mentalClarity || 0), 0);

    setStats({
      count: entries.length,
      activity: entries.length > 0 ? 1 : 0,
      avgMood: entries.length ? moodSum / entries.length : 5,
      totalCreative: creativeSum,
      totalStress: stressSum,
      totalClarity: claritySum
    });
  }, [user]);

  return (
    <div className="relative h-screen w-full bg-paper overflow-hidden flex flex-col items-center justify-center">
      
      {/* Auth Button (Top Right) */}
      {!user && !isOfflineMode && (
         <button 
           onClick={signInGoogle}
           className="absolute top-6 right-6 z-50 bg-white/50 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink hover:bg-white transition-all shadow-sm"
         >
           <LogIn size={14} /> Sync
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
            <h1 className="font-serif text-5xl md:text-6xl text-ink font-bold tracking-tighter mb-6 leading-tight">
              {stats.count === 0 ? "The Seed." : "The Tree."}
            </h1>
            <p className="font-serif text-lg md:text-xl text-gray-500 italic">
               "{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}"
            </p>
         </div>

         <div className="pt-12">
           <Link to="/log/state" className="group inline-flex items-center gap-3 px-8 py-4 bg-ink text-paper rounded-full font-sans font-bold uppercase tracking-widest text-xs hover:bg-organic-900 transition-all shadow-xl hover:scale-105">
             Update Record <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
           </Link>
         </div>
      </div>
    </div>
  );
};