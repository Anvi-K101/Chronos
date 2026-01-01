import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Activity, Clock, Trophy, Feather, Camera, Sun, 
  Disc, BarChart2, X, Menu 
} from 'lucide-react';

const CATEGORIES = [
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
            mb-6 bg-ink text-paper rounded-2xl shadow-float p-4
            flex flex-col gap-4 min-w-[300px] pointer-events-auto
            origin-bottom transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-12 pointer-events-none'}
          `}
        >
          {/* Main Rows */}
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
             <NavLink to="/" className="flex flex-col items-center gap-1 group">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Disc size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Home</span>
             </NavLink>
             <NavLink to="/analytics" className="flex flex-col items-center gap-1 group">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <BarChart2 size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Data</span>
             </NavLink>
          </div>

          <div className="grid grid-cols-3 gap-y-4 gap-x-2">
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
                <span className="text-[10px] font-bold uppercase tracking-wide">{cat.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* The Dot / Trigger Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`
            pointer-events-auto w-14 h-14 rounded-full shadow-2xl flex items-center justify-center
            transition-all duration-300 z-50
            ${isOpen ? 'bg-white text-ink rotate-90 scale-90' : 'bg-ink text-white hover:scale-105 active:scale-95'}
          `}
        >
          {isOpen ? <X size={24} /> : <div className="w-2 h-2 bg-white rounded-full" />} 
        </button>
      </div>
    </>
  );
};