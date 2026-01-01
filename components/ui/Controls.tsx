import React from 'react';
import { Plus, Minus, Check, ChevronRight } from 'lucide-react';

// --- Containers ---

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`min-h-screen pb-32 pt-24 px-6 md:px-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}>
    {children}
  </div>
);

export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-10">
    <h1 className="font-serif text-3xl md:text-4xl text-ink font-bold mb-2 tracking-tight">{title}</h1>
    {subtitle && <p className="font-sans text-sm font-bold text-gray-400 uppercase tracking-widest">{subtitle}</p>}
  </div>
);

export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  title?: string;
  action?: React.ReactNode;
}> = ({ children, className = '', title, action }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 mb-6 transition-shadow hover:shadow-soft ${className}`}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-4">
        {title && <h3 className="font-serif text-lg font-bold text-gray-800">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

export const Tile = Card;

// --- Inputs ---

interface MoodPickerProps {
  value: number | null;
  onChange: (val: number) => void;
}

export const MoodPicker: React.FC<MoodPickerProps> = ({ value, onChange }) => {
  const safeValue = value || 5;
  const getGradientColor = (val: number) => {
    if (val <= 3) return '#57534e'; 
    if (val <= 7) return '#65a30d'; 
    return '#ea580c'; 
  };

  return (
    <div className="w-full py-4">
      <div className="relative h-16 w-full rounded-2xl bg-gradient-to-r from-stone-400 via-organic-400 to-orange-300 shadow-inner overflow-hidden">
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
        <input
          type="range"
          min="1"
          max="10"
          value={safeValue}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
        <div 
          className="absolute top-0 bottom-0 w-16 bg-white shadow-xl border-x border-white/50 flex items-center justify-center transition-all duration-75 pointer-events-none z-10"
          style={{ left: `calc(${((safeValue - 1) / 9) * 100}% - ${((safeValue - 1) / 9) * 64}px)` }} 
        >
           <span className="font-serif font-bold text-2xl" style={{ color: getGradientColor(safeValue) }}>{safeValue}</span>
        </div>
      </div>
      <div className="flex justify-between mt-3 px-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">
        <span>Despair</span>
        <span>Neutral</span>
        <span>Ecstatic</span>
      </div>
    </div>
  );
};

interface CounterProps {
  value: number;
  onChange: (val: number) => void;
  label: string;
}

export const Counter: React.FC<CounterProps> = ({ value, onChange, label }) => (
  <div className="flex items-center justify-between py-2">
    <span className="font-serif text-ink text-lg">{label}</span>
    <div className="flex items-center gap-4 bg-stone-50 rounded-full p-1 border border-stone-100">
      <button 
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-500 hover:text-ink active:scale-95 transition-all"
      >
        <Minus size={16} />
      </button>
      <span className="w-6 text-center font-bold text-ink">{value}</span>
      <button 
        onClick={() => onChange(value + 1)}
        className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-organic-600 hover:text-organic-800 active:scale-95 transition-all"
      >
        <Plus size={16} />
      </button>
    </div>
  </div>
);

export const SliderInput: React.FC<{
  label: string;
  value: number | null;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}> = ({ label, value, onChange, min = 1, max = 10 }) => (
  <div className="mb-6">
    <div className="flex justify-between mb-2">
      <label className="font-serif text-gray-700">{label}</label>
      <span className="font-bold text-organic-600 text-sm">{value || '-'}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value || Math.ceil((max-min)/2)} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-organic-600"
    />
  </div>
);

export const TextInput: React.FC<{
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}> = ({ label, value, onChange, placeholder, rows = 1, className }) => (
  <div className={`mb-4 ${className}`}>
    {label && <label className="block font-sans text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</label>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-transparent border-b border-gray-200 py-2 font-serif text-lg text-ink placeholder-gray-300 focus:outline-none focus:border-organic-400 transition-colors resize-none"
      style={{ minHeight: `${rows * 1.5}em` }}
    />
  </div>
);

export const CheckItem: React.FC<{
  label: string;
  checked: boolean;
  onToggle: () => void;
}> = ({ label, checked, onToggle }) => (
  <button 
    onClick={onToggle}
    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left group
      ${checked ? 'bg-organic-50 border-organic-200' : 'bg-white border-gray-100 hover:border-gray-200'}
    `}
  >
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
      ${checked ? 'bg-organic-500 border-organic-500 text-white' : 'border-gray-300 text-transparent'}
    `}>
      <Check size={14} strokeWidth={3} />
    </div>
    <span className={`font-serif text-lg ${checked ? 'text-organic-900 line-through decoration-organic-300' : 'text-ink'}`}>
      {label}
    </span>
  </button>
);

export const SaveIndicator: React.FC<{ status: 'saved' | 'saving' | 'idle' }> = ({ status }) => {
  if (status === 'idle') return null;
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none animate-in fade-in slide-in-from-top-2">
      <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-organic-100 flex items-center gap-2">
         <div className={`w-2 h-2 rounded-full ${status === 'saving' ? 'bg-orange-400 animate-pulse' : 'bg-green-500'}`} />
         <span className={`text-xs font-bold uppercase tracking-widest ${status === 'saving' ? 'text-gray-500' : 'text-green-700'}`}>
            {status === 'saving' ? 'Syncing...' : 'Saved'}
         </span>
      </div>
    </div>
  );
};

export const Stepper: React.FC<{
  value: number;
  onChange: (val: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
}> = ({ value, onChange, step = 1, min = 0, max = 100, unit = '' }) => (
  <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-1 border border-stone-100">
     <button 
       onClick={() => onChange(Math.max(min, value - step))} 
       className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-stone-500 hover:text-ink hover:scale-105 transition-all"
     >
       <Minus size={14} />
     </button>
     <span className="font-mono text-sm font-bold min-w-[3ch] text-center text-gray-700">{value}{unit}</span>
     <button 
       onClick={() => onChange(Math.min(max, value + step))} 
       className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-organic-600 hover:text-organic-800 hover:scale-105 transition-all"
     >
       <Plus size={14} />
     </button>
  </div>
);

export const ChipGroup: React.FC<{
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  single?: boolean;
}> = ({ options, selected, onChange, single }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => {
      const isSelected = selected.includes(opt);
      return (
        <button
          key={opt}
          onClick={() => {
            if (single) {
               if (!isSelected) onChange([opt]);
            } else {
               onChange(isSelected ? selected.filter(s => s !== opt) : [...selected, opt]);
            }
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
            isSelected 
              ? 'bg-organic-600 text-white shadow-md shadow-organic-200' 
              : 'bg-stone-50 text-gray-500 hover:bg-stone-100 border border-transparent hover:border-stone-200'
          }`}
        >
          {opt}
        </button>
      )
    })}
  </div>
);

export const MinimalInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}> = ({ value, onChange, placeholder, className = '', multiline }) => {
  const Component = multiline ? 'textarea' : 'input';
  return React.createElement(Component, {
    value,
    onChange: (e: any) => onChange(e.target.value),
    placeholder,
    className: `w-full bg-transparent border-b border-transparent hover:border-gray-100 focus:border-organic-300 focus:outline-none transition-colors placeholder-gray-300 font-serif ${className}`,
    rows: multiline ? 3 : undefined
  });
};