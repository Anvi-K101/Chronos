import React from 'react';
import { Plus, Minus, Check, Cloud, RefreshCw, AlertCircle, HardDrive, Sparkles } from 'lucide-react';

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`min-h-screen pb-40 pt-10 md:pt-16 px-6 md:px-12 lg:px-20 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out ${className}`}>
    {children}
  </div>
);

export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <header className="mb-10 md:mb-14 text-left">
    <h1 className="font-serif text-3xl md:text-4xl text-ink font-bold mb-2 tracking-tight">
      {title}
    </h1>
    {subtitle && (
      <p className="font-sans text-[10px] font-black text-stone-400 uppercase tracking-[0.4em] opacity-80">
        {subtitle}
      </p>
    )}
  </header>
);

export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  title?: string;
  action?: React.ReactNode;
}> = ({ children, className = '', title, action }) => (
  <div className={`
    bg-white/60 backdrop-blur-lg rounded-[2rem] p-6 md:p-8 shadow-soft border border-stone-100/40 mb-6
    transition-all duration-500 hover:shadow-md hover:bg-white/80 group relative
    ${className}
  `}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-6">
        {title && <h4 className="font-serif text-lg md:text-xl font-bold text-ink/50 group-hover:text-ink/80 transition-colors tracking-tight">{title}</h4>}
        {action}
      </div>
    )}
    {children}
  </div>
);

export const RatingScale: React.FC<{ 
  value: number | null; 
  onChange: (val: number) => void; 
  label?: string;
  max?: number;
}> = ({ value, onChange, label, max = 10 }) => {
  const segments = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="mb-8 last:mb-0">
      {label && (
        <div className="flex justify-between mb-3 items-center">
          <label className="font-serif text-ink/40 text-[10px] font-bold uppercase tracking-widest">{label}</label>
          <span className="font-mono text-xs font-black text-organic-700 bg-white/80 px-2.5 py-1 rounded-lg border border-stone-100 shadow-sm" aria-live="polite">
            {value || '—'}
          </span>
        </div>
      )}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2" role="group" aria-label={label || "Rating scale"}>
        {segments.map((num) => {
          const isActive = value !== null && num <= value;
          const isCurrent = value === num;
          return (
            <button
              key={num}
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(num); }}
              aria-pressed={isCurrent}
              className={`
                h-10 rounded-xl font-mono text-[11px] font-bold transition-all duration-300 border
                ${isActive 
                  ? 'bg-ink border-ink text-white shadow-sm' 
                  : 'bg-white/40 border-stone-100 text-stone-300 hover:border-stone-300'
                }
                ${isCurrent ? 'scale-105 z-10 shadow-lg' : 'scale-100'}
                active:scale-95 cursor-pointer outline-none
              `}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const MoodLevelSelector: React.FC<{ value: number | null, onChange: (val: number) => void }> = ({ value, onChange }) => {
  const levels = [
    { label: "Depth", val: 1, color: "bg-stone-800" },
    { label: "Quiet", val: 3, color: "bg-stone-500" },
    { label: "Center", val: 5, color: "bg-stone-400" },
    { label: "Bright", val: 8, color: "bg-organic-600" },
    { label: "Radiant", val: 10, color: "bg-ink" }
  ];

  return (
    <div className="grid grid-cols-5 gap-2 w-full" role="group" aria-label="Mood level selector">
      {levels.map((level) => {
        const isSelected = value !== null && (
          level.val === 1 ? value <= 2 :
          level.val === 3 ? (value > 2 && value <= 4) :
          level.val === 5 ? (value > 4 && value <= 6) :
          level.val === 8 ? (value > 6 && value <= 8) :
          value > 8
        );
        
        return (
          <button
            key={level.label}
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(level.val); }}
            aria-pressed={isSelected}
            className={`
              flex flex-col items-center justify-center py-4 rounded-2xl border transition-all duration-500 active:scale-95 cursor-pointer outline-none
              ${isSelected 
                ? `border-ink ${level.color} text-white shadow-lg -translate-y-1` 
                : 'border-stone-100 bg-white/40 text-stone-300 hover:bg-white/60'
              }
            `}
          >
            <span className="text-[7px] uppercase font-bold tracking-widest opacity-40 mb-1" aria-hidden="true">{level.val}</span>
            <span className="font-serif font-bold text-[10px] uppercase tracking-tight">{level.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const Counter: React.FC<{ value: number; onChange: (val: number) => void; label: string }> = ({ value, onChange, label }) => (
  <div className="flex items-center justify-between py-4 border-b border-dashed border-stone-100 last:border-0 group">
    <span className="font-serif text-ink/70 text-base group-hover:text-ink transition-colors duration-300">{label}</span>
    <div className="flex items-center gap-2 bg-stone-50/50 rounded-full p-1 border border-stone-100">
      <button 
        type="button" 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(Math.max(0, value - 1)); }} 
        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-300 hover:text-ink active:scale-75 transition-all outline-none"
        aria-label={`Decrease ${label}`}
      >
        <Minus size={14} />
      </button>
      <span className="w-6 text-center font-black text-ink text-sm tabular-nums" aria-live="polite">{value}</span>
      <button 
        type="button" 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(value + 1); }} 
        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-300 hover:text-ink active:scale-75 transition-all outline-none"
        aria-label={`Increase ${label}`}
      >
        <Plus size={14} />
      </button>
    </div>
  </div>
);

export const Stepper: React.FC<{ 
  value: number; 
  onChange: (val: number) => void; 
  step?: number; 
  max?: number; 
  unit?: string 
}> = ({ value, onChange, step = 1, max, unit }) => (
  <div className="flex items-center gap-2 bg-white/40 rounded-xl p-0.5 border border-stone-100">
    <button 
      type="button" 
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(Math.max(0, value - step)); }} 
      className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-stone-200 hover:text-ink active:scale-75 transition-all outline-none"
      aria-label="Decrease value"
    >
      <Minus size={12} />
    </button>
    <div className="flex items-baseline gap-1 min-w-[2.2rem] justify-center">
      <span className="font-mono font-bold text-ink text-sm tabular-nums" aria-live="polite">{value}</span>
      {unit && <span className="text-[8px] font-black uppercase text-stone-300">{unit}</span>}
    </div>
    <button 
      type="button" 
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(max !== undefined ? Math.min(max, value + step) : value + step); }} 
      className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-stone-200 hover:text-ink active:scale-75 transition-all outline-none"
      aria-label="Increase value"
    >
      <Plus size={12} />
    </button>
  </div>
);

export const ChipGroup: React.FC<{ 
  options: string[]; 
  selected: string[]; 
  onChange: (vals: string[]) => void; 
  single?: boolean 
}> = ({ options, selected, onChange, single }) => (
  <div className="flex flex-wrap gap-2" role="group">
    {options.map(opt => {
      const isSelected = selected.includes(opt);
      return (
        <button
          key={opt}
          type="button"
          aria-pressed={isSelected}
          onClick={(e) => {
            e.preventDefault(); e.stopPropagation();
            if (single) {
              onChange([opt]);
            } else {
              onChange(isSelected ? selected.filter(s => s !== opt) : [...selected, opt]);
            }
          }}
          className={`
            px-4 py-2 rounded-xl text-[10px] font-bold transition-all duration-300 border
            ${isSelected 
              ? 'bg-ink border-ink text-white shadow-md' 
              : 'bg-white/50 border-stone-100 text-stone-400 hover:border-stone-300 hover:text-ink'
            }
            outline-none
          `}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

export const TextInput: React.FC<{ 
  label?: string; 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string; 
  prompt?: string;
  rows?: number; 
  className?: string 
}> = ({ label, value, onChange, placeholder, prompt, rows = 1, className }) => {
  const id = React.useId();
  return (
    <div className={`mb-8 ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-2 px-1">
          <label htmlFor={id} className="block font-sans text-[9px] font-black text-stone-300 uppercase tracking-[0.3em]">{label}</label>
          {prompt && !value && (
            <div className="flex items-center gap-1.5 text-[9px] text-stone-200 italic">
              <Sparkles size={10} />
              <span>{prompt}</span>
            </div>
          )}
        </div>
      )}
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "..."}
        rows={rows}
        onClick={(e) => { e.stopPropagation(); }}
        className="
          w-full bg-transparent border-b border-stone-100 focus:border-ink/20 py-3 px-1
          font-serif text-lg text-ink focus:outline-none transition-all 
          resize-none rounded-none placeholder-stone-200 selection:bg-stone-100
        "
      />
    </div>
  );
};

export const MinimalInput: React.FC<{ 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string; 
  className?: string;
  multiline?: boolean;
}> = ({ value, onChange, placeholder, className, multiline }) => {
  const common = `w-full bg-transparent border-none focus:ring-0 p-0 placeholder-stone-200 transition-all focus:outline-none text-base ${className}`;
  return multiline ? (
    <textarea 
      aria-label={placeholder || "Text input"}
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder} 
      rows={2} 
      className={common}
      onClick={(e) => e.stopPropagation()} 
    />
  ) : (
    <input 
      aria-label={placeholder || "Text input"}
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder} 
      className={common}
      onClick={(e) => e.stopPropagation()} 
    />
  );
};

export const CheckItem: React.FC<{ label: string; checked: boolean; onToggle: () => void }> = ({ label, checked, onToggle }) => (
  <button 
    type="button" 
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }} 
    aria-pressed={checked}
    className={`
      w-full flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all duration-500 text-left active:scale-[0.98] cursor-pointer outline-none
      ${checked 
        ? 'bg-stone-50/50 border-stone-100 opacity-60' 
        : 'bg-white border-stone-100 hover:border-stone-200 shadow-soft'
      }
    `}
  >
    <div className={`
      w-7 h-7 rounded-xl border flex items-center justify-center transition-all duration-500
      ${checked ? 'bg-ink border-ink scale-110 rotate-[360deg]' : 'border-stone-200 bg-white shadow-inner'}
    `}>
      {checked && <Check size={16} strokeWidth={4} className="text-white" />}
    </div>
    <span className={`
      font-serif text-lg md:text-xl font-bold transition-all duration-500
      ${checked ? 'text-stone-300 line-through' : 'text-ink'}
    `}>
      {label}
    </span>
  </button>
);

export const SaveIndicator: React.FC<{ status: 'saved' | 'saving' | 'idle' | 'local' | 'error' }> = ({ status }) => {
  if (status === 'idle') return null;
  const config = {
    saving: { label: 'Locking...', icon: <RefreshCw size={10} className="animate-spin" />, color: 'bg-paper/80 text-stone-400 border-stone-100' },
    saved: { label: 'Secured', icon: <Check size={10} />, color: 'bg-white/90 text-organic-600 border-organic-100' },
    local: { label: 'Isolated', icon: <HardDrive size={10} />, color: 'bg-white/80 text-stone-400 border-stone-100' },
    error: { label: 'Retry', icon: <AlertCircle size={10} />, color: 'bg-red-50 text-red-600 border-red-100' }
  };
  const current = config[status as keyof typeof config] || config.local;
  return (
    <div className="fixed top-6 right-6 z-[100] pointer-events-none" aria-live="assertive">
      <div className={`px-4 py-2 rounded-full shadow-lg border backdrop-blur-xl flex items-center gap-2.5 ${current.color} animate-in fade-in slide-in-from-top-2 duration-500`}>
         <div className="opacity-60">{current.icon}</div>
         <span className="text-[9px] font-black uppercase tracking-[0.2em]">{current.label}</span>
      </div>
    </div>
  );
};