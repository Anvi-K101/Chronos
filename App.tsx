
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './views/Home';
import { BottomNav } from './components/Navigation';
import { Analytics } from './views/Analytics';
import { ChecklistPage } from './views/ChecklistPage';
import { AuthProvider, useAuth } from './services/authContext';
import { Onboarding } from './views/Onboarding';
import { Accounts } from './views/Accounts';
import { AboutPage } from './views/AboutPage';
import { GrowthPage } from './views/GrowthPage';
import { 
  StatePage, EffortPage, AchievementsPage, 
  ReflectionsPage, MemoriesPage, FuturePage 
} from './views/CategoryPages';
import { StorageService } from './services/storage';
import { Loader2, Share2, Calendar as CalIcon } from 'lucide-react';

const Archive = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    StorageService.getAllEntries(user.uid).then(all => {
      if (mounted) {
        setEntries(all);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [user]);

  const handleShare = async (entry: any) => {
    const dateStr = new Date(entry.id + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const text = `Chronos Archive: ${dateStr}\n\n` +
                 `Mood: ${entry.state.mood || 'N/A'}\n` +
                 `Daily Win: ${entry.achievements.dailyWins || 'None'}\n\n` +
                 `Reflection:\n${entry.reflections.longForm || 'No journal recorded.'}\n\n` +
                 `Gratitude:\n${entry.future.gratitude || 'N/A'}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vault Reflection: ${entry.id}`,
          text: text,
        });
      } catch (err) {
        console.warn("Sharing failed", err);
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Node content copied to clipboard.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-organic-400 gap-4">
      <Loader2 size={24} className="animate-spin opacity-30" />
      <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Opening History</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper pb-48 pt-16 px-6 md:px-10 max-w-4xl mx-auto">
      <div className="mb-14 flex items-center gap-4 animate-in slide-in-from-left-6 duration-700">
        <CalIcon size={24} className="text-organic-600 opacity-40" />
        <h1 className="font-serif text-3xl text-ink font-bold tracking-tight">Archives</h1>
      </div>
      <div className="space-y-8 border-l-2 border-stone-100/50 ml-3 pl-8 pb-20">
        {entries.map((entry, idx) => (
          <div key={entry.id} className="relative group animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
             <div className="absolute -left-[41px] top-5 w-2.5 h-2.5 rounded-full bg-stone-200 group-hover:bg-organic-500 transition-all ring-4 ring-paper" />
             <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-stone-100 shadow-soft transition-all hover:shadow-md active:scale-[0.99] group cursor-default">
                <div className="flex justify-between items-start mb-6">
                   <div>
                     <h3 className="font-serif text-xl font-bold text-ink tracking-tight">
                        {new Date(entry.id + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                     </h3>
                     <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-300 mt-1">{new Date(entry.id + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long' })}</p>
                   </div>
                   <button 
                     type="button"
                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(entry); }}
                     className="p-3.5 bg-stone-50 rounded-2xl text-stone-400 hover:text-organic-600 hover:bg-organic-50 active:scale-90 transition-all outline-none border border-transparent hover:border-organic-100/50"
                     title="Send to Journal"
                   >
                     <Share2 size={18} />
                   </button>
                </div>
                {entry.achievements.dailyWins && (
                  <p className="font-serif text-base text-gray-500 italic mb-6 leading-relaxed border-l-2 border-stone-50 pl-5 opacity-80">
                    "{entry.achievements.dailyWins}"
                  </p>
                )}
                <div className="flex flex-wrap gap-2.5">
                   {entry.state.mood && (
                     <span className="text-[9px] font-black uppercase tracking-widest text-organic-700 bg-organic-50 px-3 py-1.5 rounded-xl border border-organic-100/30">
                       Mood: {entry.state.mood}
                     </span>
                   )}
                   {entry.state.descriptors?.slice(0, 3).map((d: string) => (
                     <span key={d} className="text-[9px] uppercase font-bold text-stone-400 bg-stone-50/50 px-3 py-1.5 rounded-xl border border-stone-100/50">
                       {d}
                     </span>
                   ))}
                </div>
             </div>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-stone-300 italic font-serif text-lg py-20 px-4 animate-in fade-in duration-1000">
            The archive is currently a silent void, waiting for its first seed.
          </p>
        )}
      </div>
    </div>
  );
};

const ProtectedContent = () => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center gap-4 text-organic-400">
      <Loader2 size={28} className="animate-spin opacity-20" />
      <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Awakening Vault</span>
    </div>
  );
  if (!user) return <Onboarding />;
  return (
    <div className="bg-paper min-h-screen font-sans selection:bg-organic-100 selection:text-organic-900 no-tap-highlight">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/checklist" element={<ChecklistPage />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/growth" element={<GrowthPage />} />
        <Route path="/log/state" element={<StatePage />} />
        <Route path="/log/effort" element={<EffortPage />} />
        <Route path="/log/achievements" element={<AchievementsPage />} />
        <Route path="/log/reflections" element={<ReflectionsPage />} />
        <Route path="/log/memories" element={<MemoriesPage />} />
        <Route path="/log/future" element={<FuturePage />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProtectedContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
