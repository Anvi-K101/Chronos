import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './views/Home';
import { BottomNav } from './components/Navigation';
import { Analytics } from './views/Analytics';
import { ChecklistPage } from './views/ChecklistPage';
import { AuthProvider, useAuth } from './services/authContext';
import { Onboarding } from './views/Onboarding';
import { Accounts } from './views/Accounts';
import { 
  StatePage, EffortPage, AchievementsPage, 
  ReflectionsPage, MemoriesPage, FuturePage 
} from './views/CategoryPages';
import { StorageService } from './services/storage';
import { Loader2 } from 'lucide-react';

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

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-organic-400 gap-4">
      <Loader2 size={32} className="animate-spin" />
      <span className="text-xs font-bold uppercase tracking-widest">Opening Timeline</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper pb-32 pt-24 px-6 max-w-3xl mx-auto">
      <h1 className="font-serif text-3xl text-ink font-bold mb-8">Timeline 2026</h1>
      <div className="space-y-8 border-l border-gray-200 ml-3 pl-8 pb-12">
        {entries.map((entry) => (
          <div key={entry.id} className="relative group">
             <div className="absolute -left-[37px] top-2 w-3 h-3 rounded-full bg-white border-2 border-gray-300 group-hover:border-organic-500 transition-colors" />
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-baseline mb-2">
                   <h3 className="font-serif text-xl font-bold text-ink">
                      {new Date(entry.id + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                   </h3>
                   {entry.state.mood && <span className="font-sans text-xs font-bold text-gray-400">Mood: {entry.state.mood}</span>}
                </div>
                {entry.achievements.dailyWins && <p className="font-serif text-gray-600 italic mb-3">"{entry.achievements.dailyWins}"</p>}
                <div className="flex flex-wrap gap-2">
                   {entry.state.descriptors?.map((d: string) => (
                     <span key={d} className="text-[10px] uppercase font-bold text-stone-500 bg-stone-50 px-2 py-1 rounded">{d}</span>
                   ))}
                </div>
             </div>
          </div>
        ))}
        {entries.length === 0 && <p className="text-gray-400 italic">No history yet.</p>}
      </div>
    </div>
  );
};

const ProtectedContent = () => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center gap-4 text-organic-400">
      <Loader2 size={32} className="animate-spin" />
      <span className="text-xs font-bold uppercase tracking-widest">Waking Up...</span>
    </div>
  );

  if (!user) return <Onboarding />;

  return (
    <div className="bg-paper min-h-screen font-sans selection:bg-organic-200 selection:text-organic-900">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/checklist" element={<ChecklistPage />} />
        <Route path="/accounts" element={<Accounts />} />
        
        {/* Logging Categories */}
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