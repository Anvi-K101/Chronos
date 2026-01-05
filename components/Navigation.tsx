import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, Clock, Trophy, Feather, Camera, Sun, 
  Disc, X, ListChecks, UserCircle, Trees
} from 'lucide-react';

const CATEGORIES = [
  { id: 'checklist', path: '/checklist', icon: ListChecks, label: 'Ritual' },
  { id: 'state', path: '/log/state', icon: Activity, label: 'Vitality' },
  { id: 'effort', path: '/log/effort', icon: Clock, label: 'Energy' },
  { id: 'achievements', path: '/log/achievements', icon: Trophy, label: 'Wins' },
  { id: 'reflections', path: '/log/reflections', icon: Feather, label: 'Solitude' },
  { id: 'memories', path: '/log/memories', icon: Camera, label: 'Archive' },
  { id: 'future', path: '/log/future', icon: Sun, label: 'Vision' },
  { id: 'growth', path: '/growth', icon: Trees, label: 'The Arbor' },
];

export const BottomNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleNavClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(path);
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-ink/20 backdrop-blur-[4px] z-[80] transition-all duration-700 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <div className={`fixed inset-0 z-[90] flex items-center justify-center pointer-events-none transition-all duration-500 ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
        <nav 
          className="bg-white/80 backdrop-blur-3xl rounded-[3rem] shadow-float p-8 flex flex-col gap-8 max-w-[90vw] md:min-w-[400px] pointer-events-auto border border-white/40"
        >
          <div className="flex justify-around items-center border-b border-stone-100 pb-8">
             <button 
               type="button"
               onClick={(e) => handleNavClick('/', e)} 
               className="flex flex-col items-center gap-2 group outline-none"
             >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border transition-all ${location.pathname === '/' ? 'bg-ink text-white border-ink' : 'bg-white border-stone-100 text-ink group-hover:bg-stone-50'}`}>
                  <Disc size={24} />
                </div>
                <span className="text-[11px] uppercase font-black tracking-[0.2em] text-ink">Core</span>
             </button>
             <button 
               type="button"
               onClick={(e) => handleNavClick('/archive', e)} 
               className="flex flex-col items-center gap-2 group outline-none"
             >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border transition-all ${location.pathname === '/archive' ? 'bg-ink text-white border-ink' : 'bg-white border-stone-100 text-ink group-hover:bg-stone-50'}`}>
                  <Clock size={24} />
                </div>
                <span className="text-[11px] uppercase font-black tracking-[0.2em] text-ink">History</span>
             </button>
             <button 
               type="button"
               onClick={(e) => handleNavClick('/accounts', e)} 
               className="flex flex-col items-center gap-2 group outline-none"
             >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border transition-all ${location.pathname === '/accounts' ? 'bg-ink text-white border-ink' : 'bg-white border-stone-100 text-ink group-hover:bg-stone-50'}`}>
                  <UserCircle size={24} />
                </div>
                <span className="text-[11px] uppercase font-black tracking-[0.2em] text-ink">ID</span>
             </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const isActive = location.pathname === cat.path;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={(e) => handleNavClick(cat.path, e)}
                  className={`
                    flex flex-col items-center gap-3 p-3 rounded-2xl transition-all duration-300 outline-none
                    ${isActive 
                      ? 'bg-ink text-white shadow-lg' 
                      : 'text-ink/60 hover:text-ink hover:bg-white/50'
                    }
                  `}
                >
                  <cat.icon size={20} strokeWidth={isActive ? 3 : 2} />
                  <span className={`text-[10px] font-black uppercase tracking-wider text-center leading-tight ${isActive ? 'text-white' : 'text-ink'}`}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      <div className="fixed bottom-10 left-0 right-0 z-[100] flex justify-center pointer-events-none">
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
          className={`
            pointer-events-auto w-16 h-16 rounded-full shadow-float flex items-center justify-center
            transition-all duration-500 z-[100] cursor-pointer outline-none border border-white/30
            ${isOpen ? 'bg-white text-ink rotate-45' : 'bg-ink text-white hover:scale-105 active:scale-90'}
          `}
        >
          {isOpen ? <X size={28} /> : (
            <div className="relative flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
              <div className="absolute w-8 h-8 border border-white/10 rounded-full animate-ping duration-[4000ms]" />
            </div>
          )} 
        </button>
      </div>
    </>
  );
};