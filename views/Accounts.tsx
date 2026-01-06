
import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { StorageService } from '../services/storage';
import { PageContainer, SectionHeader, Card } from '../components/ui/Controls';
import { Link } from 'react-router-dom';
import { 
  User, ShieldCheck, LogOut, Download, AlertCircle, Share2, Calendar, Info
} from 'lucide-react';

export const Accounts = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalEntries: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const data = StorageService.loadLocal();
    setStats({ totalEntries: Object.keys(data.entries).length });
  }, []);

  const handleFullTransfer = async () => {
    const entry = await StorageService.getEntry(selectedDate, user?.uid || '');
    if (!entry) {
        alert("No node found for this date.");
        return;
    }

    const dateStr = new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    
    const text = `Chronos Record: ${dateStr}\n\n` +
                 `[STATE]\nMood: ${entry.state.mood || 'N/A'}\nStress: ${entry.state.stress || 'N/A'}\nClarity: ${entry.state.mentalClarity || 'N/A'}\n\n` +
                 `[OUTPUT]\nCreative: ${entry.effort.creativeHours}h\nWork: ${entry.effort.workHours}h\n\n` +
                 `[ACHIEVEMENT]\nWin: ${entry.achievements.dailyWins || 'N/A'}\n\n` +
                 `[REFLECTION]\n${entry.reflections.longForm || 'N/A'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vault Node: ${selectedDate}`,
          text: text,
        });
      } catch (err) {
        console.warn("Transfer failed", err);
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Node copied to clipboard.");
    }
  };

  if (!user) return null;

  return (
    <PageContainer>
      <SectionHeader title="Identity" subtitle="Vault Ownership" />

      <Card className="flex items-center gap-6 py-6 mb-8">
        <div className="w-16 h-16 rounded-[2rem] bg-stone-100 flex items-center justify-center text-stone-400 shadow-inner overflow-hidden border border-white">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={28} />
          )}
        </div>
        <div className="flex-grow">
          <h2 className="font-serif text-2xl font-bold text-ink leading-tight tracking-tight">{user.displayName || 'Vault Owner'}</h2>
          <p className="text-stone-400 text-[10px] font-sans uppercase tracking-[0.3em] flex items-center gap-2.5 mt-2">
            <ShieldCheck size={12} className="text-organic-600" />
            Verified Instance
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card title="System Transfer">
           <div className="space-y-5">
              <p className="text-[11px] text-stone-400 leading-relaxed font-serif italic">
                Export an entire daily chronicle into your mobile system (Apple Journal).
              </p>
              <div className="flex gap-3">
                 <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-grow bg-white/40 border border-stone-100 rounded-2xl px-4 py-2.5 text-xs font-mono text-ink focus:outline-none focus:bg-white transition-all"
                 />
                 <button 
                    type="button" 
                    onClick={(e) => { e.preventDefault(); handleFullTransfer(); }}
                    className="p-3 bg-ink text-white rounded-2xl hover:bg-stone-800 active:scale-90 transition-all shadow-md"
                 >
                    <Share2 size={18} />
                 </button>
              </div>
           </div>
        </Card>

        <Card title="Archive Info">
           <div className="space-y-4 py-2">
              <div className="flex justify-between items-center text-xs font-serif">
                <span className="text-stone-400">Total Nodes</span>
                <span className="font-bold text-ink bg-stone-50 px-3 py-1 rounded-lg">{stats.totalEntries}</span>
              </div>
              <Link 
                to="/about"
                className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-organic-600 hover:text-organic-800 transition-colors pt-4 border-t border-stone-100/50"
              >
                <span>The Concept</span>
                <Info size={14} />
              </Link>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-20">
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); StorageService.exportData(); }}
          className="py-4 bg-white/40 backdrop-blur-md border border-stone-100 text-stone-500 rounded-[1.5rem] font-sans font-bold uppercase tracking-widest text-[10px] hover:bg-white hover:text-ink transition-all flex items-center justify-center gap-3 outline-none"
        >
          <Download size={16} /> JSON Backup
        </button>

        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); logout(); }}
          className="py-4 bg-stone-100 text-stone-400 rounded-[1.5rem] font-sans font-bold uppercase tracking-widest text-[10px] hover:bg-stone-200 hover:text-ink transition-all flex items-center justify-center gap-3 outline-none"
        >
          <LogOut size={16} /> Close Vault
        </button>
      </div>

      <div className="text-center space-y-4 pb-20">
         <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/30 backdrop-blur-xl rounded-full border border-stone-100/50 shadow-soft">
            <AlertCircle size={14} className="text-stone-300" />
            <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-stone-400">Chronos System 1.0.6 — AES Isolated</span>
         </div>
         <p className="text-[11px] font-black uppercase tracking-[0.5em] text-stone-300/60 animate-in fade-in duration-1000 delay-500">
           Made by Anvi Karanjkar
         </p>
      </div>
    </PageContainer>
  );
};
