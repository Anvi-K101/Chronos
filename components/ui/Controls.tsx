import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Check, Cloud, RefreshCw } from 'lucide-react';

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`min-h-screen pb-32 pt-24 px-6 md:px-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}>
    {children}
  </div>
);

export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-10">
    <h1 className="font-serif text-3xl md:text-4xl text-ink font-bold mb-2 tracking-tight">{title}</h1>
    {subtitle && <p className="font-sans text-sm font-bold text-organic-400 uppercase tracking-widest">{subtitle}</p>}
  </div>
);

export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  title?: string;
  action?: React.ReactNode;
}> = ({ children, className = '', title, action }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-soft border border-organic-100/50 mb-6 transition-all duration-300 hover:shadow-float ${className}`}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-5">
        {title && <h3 className="font-serif text-lg font-bold text-ink/90">{title}</h3>}
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
  const [hovered, setHovered] = useState<number | null>(null);
  const segments = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="mb-8 last:mb-0">
      {label && (
        <div className="flex justify-between mb-3 items-center">
          <label className="font-serif text-ink/70 text-sm font-bold uppercase tracking-wider">{label}</label>
          <span className="font-mono text-lg font-bold text-organic-700 bg-organic-50 px-3 py-1 rounded-lg border border-organic-100">
            {value || '-'}
          </span>
        </div>
      )}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
        {segments.map((num) => {
          const isActive = value !== null && num <= value;
          const isCurrent = value === num;
          return (
            <button
              key={num}
              type="button"
              onMouseEnter={() => setHovered(num)}
              onMouseLeave={() => setHovered(null)}
              onClick={(e) => { e.preventDefault(); onChange(num); }}
              className={`
                h-12 rounded-xl font-mono font-bold transition-all duration-150 border-2
                ${isActive 
                  ? 'bg-organic-600 border-organic-600 text-white shadow-md' 
                  : 'bg-stone-50 border-stone-100 text-stone-400 hover:border-organic-300'
                }
                ${isCurrent ? 'scale-105 ring-2 ring-organic-200' : 'scale-100'}
                active:scale-90
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
    { label: "Despair", val: 1, color: "bg-stone-800" },
    { label: "Heavy", val: 3, color: "bg-stone-500" },
    { label: "Neutral", val: 5, color: "bg-organic-400" },
    { label: "Light", val: 8, color: "bg-organic-600" },
    { label: "Ecstatic", val: 10, color: "bg-yellow-500" }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 w-full">
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
            onClick={(e) => { e.preventDefault(); onChange(level.val); }}
            className={`
              flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all
              ${isSelected 
                ? `border-ink ${level.color} text-white shadow-lg -translate-y-1` 
                : 'border-stone-100 bg-white text-stone-500 hover:bg-stone-50'
              }
            `}
          >
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-70 mb-1">{level.val}</span>
            <span className="font-serif font-black text-sm uppercase">{level.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const Counter: React.FC<{ value: number; onChange: (val: number) => void; label: string }> = ({ value, onChange, label }) => (
  <div className="flex items-center justify-between py-3 border-b border-dashed border-organic-100 last:border-0">
    <span className="font-serif text-ink text-lg">{label}</span>
    <div className="flex items-center gap-4 bg-organic-50 rounded-full p-1 border border-organic-100/50">
      <button type="button" onClick={(e) => { e.preventDefault(); onChange(Math.max(0, value - 1)); }} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-500 active:scale-90 transition-all"><Minus size={16} /></button>
      <span className="w-8 text-center font-bold text-ink text-lg">{value}</span>
      <button type="button" onClick={(e) => { e.preventDefault(); onChange(value + 1); }} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-organic-600 active:scale-90 transition-all"><Plus size={16} /></button>
    </div>
  </div>
);

export const TextInput: React.FC<{ label?: string; value: string; onChange: (val: string) => void; placeholder?: string; rows?: number; className?: string }> = ({ label, value, onChange, placeholder, rows = 1, className }) => (
  <div className={`mb-4 ${className}`}>
    {label && <label className="block font-sans text-xs font-bold text-organic-400 uppercase tracking-widest mb-2">{label}</label>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-stone-50/50 border-b-2 border-stone-100 focus:border-organic-400 py-3 px-2 font-serif text-lg text-ink focus:outline-none focus:bg-white transition-all resize-none rounded-t-lg"
    />
  </div>
);

export const CheckItem: React.FC<{ label: string; checked: boolean; onToggle: () => void }> = ({ label, checked, onToggle }) => (
  <button type="button" onClick={(e) => { e.preventDefault(); onToggle(); }} className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${checked ? 'bg-organic-50 border-organic-200' : 'bg-white border-gray-100 hover:bg-stone-50'}`}>
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'bg-organic-600 border-organic-600' : 'border-gray-300'}`}>
      {checked && <Check size={14} strokeWidth={4} className="text-white" />}
    </div>
    <span className={`font-serif text-lg ${checked ? 'text-organic-800 line-through' : 'text-ink'}`}>{label}</span>
  </button>
);

export const SaveIndicator: React.FC<{ status: 'saved' | 'saving' | 'idle' | 'local' }> = ({ status }) => {
  if (status === 'idle') return null;
  
  const isSaving = status === 'saving';
  const label = isSaving ? 'Syncing Vault...' : 'Cloud Secured';

  return (
    <div className="fixed top-6 right-6 z-[60] pointer-events-none animate-in fade-in slide-in-from-top-2">
      <div className={`
        bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-float border flex items-center gap-3 transition-colors
        ${isSaving ? 'border-orange-100' : 'border-organic-100'}
      `}>
         {isSaving ? <RefreshCw size={14} className="text-orange-500 animate-spin" /> : <Cloud size={14} className="text-organic-600" />}
         <span className={`text-[10px] font-bold uppercase tracking-widest ${isSaving ? 'text-orange-600' : 'text-organic-600'}`}>
          {label}
         </span>
      </div>
    </div>
  );
};

export const Stepper: React.FC<{ value: number; onChange: (val: number) => void; step?: number; min?: number; max?: number; unit?: string }> = ({ value, onChange, step = 1, min = 0, max = 100, unit = '' }) => (
  <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-1 border border-organic-100/50">
     <button type="button" onClick={(e) => { e.preventDefault(); onChange(Math.max(min, value - step)); }} className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-stone-500 active:scale-95 transition-all"><Minus size={14} /></button>
     <span className="font-mono text-sm font-bold min-w-[4ch] text-center text-ink">{value}{unit}</span>
     <button type="button" onClick={(e) => { e.preventDefault(); onChange(Math.min(max, value + step)); }} className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-organic-600 active:scale-95 transition-all"><Plus size={14} /></button>
  </div>
);

export const ChipGroup: React.FC<{ options: string[]; selected: string[]; onChange: (val: string[]) => void; single?: boolean }> = ({ options, selected, onChange, single }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => {
      const isSelected = selected.includes(opt);
      return (
        <button
          key={opt}
          type="button"
          onClick={(e) => { e.preventDefault(); single ? (!isSelected && onChange([opt])) : (onChange(isSelected ? selected.filter(s => s !== opt) : [...selected, opt])); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isSelected ? 'bg-organic-700 text-white shadow-lg' : 'bg-white border border-organic-100 text-gray-500'}`}
        >
          {opt}
        </button>
      )
    })}
  </div>
);

export const MinimalInput: React.FC<{ value: string; onChange: (val: string) => void; placeholder?: string; className?: string; multiline?: boolean }> = ({ value, onChange, placeholder, className = '', multiline }) => (
  React.createElement(multiline ? 'textarea' : 'input', {
    value,
    onChange: (e: any) => onChange(e.target.value),
    placeholder,
    className: `w-full bg-transparent border-b border-transparent focus:border-organic-400 focus:outline-none transition-colors placeholder-gray-300 font-serif ${className}`,
    rows: multiline ? 3 : undefined
  })
);