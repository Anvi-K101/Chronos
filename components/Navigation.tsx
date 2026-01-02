import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Activity, Clock, Trophy, Feather, Camera, Sun, 
  Disc, BarChart2, X, Menu, ListChecks, UserCircle 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'checklist', path: '/checklist', icon: ListChecks, label: 'Habits' },
  { id: 'state', path: '/log/state', icon: Activity, label: 'State' },
  { id: 'effort', path: '/log/effort', icon: Clock, label: 'Effort' },
  { id: 'achievements', path: '/log/achievements', icon: Trophy, label: 'Wins' },
  { id: 'reflections', path: '/log/reflections', icon: Feather, label: 'Think' },
  { id: 'memories', path: '/log/memories', icon: Camera, label: 'Memory' },
  { id: 'future', path: '/log/future', icon: Sun, label: 'Future' },
];

export const BottomNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      {/* Dimmed Background Overlay */}
      <div 
        className={`fixed inset-0 bg-paper/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed bottom-8 left-0 right-0 z-50 flex flex-col items-center justify-end pointer-events-none">
        
        {/* Expanded Menu */}
        <nav 
          className={`
            mb-6 bg-ink text-paper rounded-3xl shadow-float p-5
            flex flex-col gap-6 min-w-[340px] pointer-events-auto
            origin-bottom transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-12 pointer-events-none'}
          `}
        >
          {/* Main Rows */}
          <div className="flex justify-around items-center border-b border-white/10 pb-5">
             <NavLink to="/" className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Disc size={22} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">Archive</span>
             </NavLink>
             <NavLink to="/analytics" className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <BarChart2 size={22} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">Patterns</span>
             </NavLink>
             <NavLink to="/accounts" className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <UserCircle size={22} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">Identity</span>
             </NavLink>
          </div>

          <div className="grid grid-cols-4 gap-y-5 gap-x-2">
            {CATEGORIES.map(cat => (
              <NavLink
                key={cat.id}
                to={cat.path}
                className={({ isActive }) => `
                  flex flex-col items-center gap-2 p-2 rounded-xl transition-all
                  ${isActive ? 'bg-organic-600/20 text-organic-300' : 'hover:bg-white/5 text-gray-400'}
                `}
              >
                <cat.icon size={20} strokeWidth={1.5} />
                <span className="text-[9px] font-bold uppercase tracking-wider">{cat.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* The Trigger Button */}
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            pointer-events-auto w-16 h-16 rounded-full shadow-2xl flex items-center justify-center
            transition-all duration-300 z-50
            ${isOpen ? 'bg-white text-ink rotate-90 scale-90' : 'bg-ink text-white hover:scale-105 active:scale-95'}
          `}
        >
          {isOpen ? <X size={28} /> : <div className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />} 
        </button>
      </div>
    </>
  );
};