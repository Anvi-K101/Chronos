
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Check, ChevronRight } from 'lucide-react';

// --- Containers ---

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`min-h-screen pb-32 pt-24 px-6 md:px-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}>
    {children}
  </div>
);

export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-10">
    <h1 className="font-serif text-3xl md:text-4xl text-ink font-bold mb-2 tracking-tight drop-shadow-sm">{title}</h1>
    {subtitle && <p className="font-sans text-sm font-bold text-organic-400 uppercase tracking-widest">{subtitle}</p>}
  </div>
);

export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  title?: string;
  action?: React.ReactNode;
}> = ({ children, className = '', title, action }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-soft border border-organic-100/50 mb-6 transition-all duration-300 hover:shadow-float hover:border-organic-200/60 ${className}`}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-5">
        {title && <h3 className="font-serif text-lg font-bold text-ink/90">{title}</h3>}
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

/**
 * MoodPicker: Fixes the 'jumping/locking' bug by decoupling local interaction state
 * from global persistence. Persistence only triggers on 'change' (release).
 */
export const MoodPicker: React.FC<MoodPickerProps> = ({ value, onChange }) => {
  const [internalValue, setInternalValue] = useState(value || 5);
  const isInteracting = useRef(false);

  // Sync internal state only when props change and user isn't actively dragging
  useEffect(() => {
    if (value !== null && !isInteracting.current) {
      setInternalValue(value);
    }
  }, [value]);

  const getGradientColor = (val: number) => {
    if (val <= 3) return '#57534e'; 
    if (val <= 7) return '#65a30d'; 
    return '#ea580c'; 
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    isInteracting.current = true;
    setInternalValue(parseInt(e.target.value));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.target.value);
    isInteracting.current = false;
    onChange(newVal);
  };

  return (
    <div className="w-full py-4">
      <div className="relative h-20 w-full rounded-2xl bg-stone-100 border-4 border-white shadow-soft overflow-hidden">
        {/* Visual Progress Background */}
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-stone-400 via-organic-400 to-orange-400 opacity-20 transition-all duration-300 ease-out"
          style={{ width: `${((internalValue - 1) / 9) * 100}%` }}
        />
        
        {/* Native Input: High resolution touch targets */}
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={internalValue}
          onInput={handleInput}
          onChange={handleChange}
          onBlur={() => { isInteracting.current = false; }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 touch-none m-0 p-0"
          style={{ touchAction: 'none' }}
        />
        
        {/* Centered Large Display */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="flex flex-col items-center">
             <span className="font-serif font-black text-5xl leading-none transition-colors duration-300" style={{ color: getGradientColor(internalValue) }}>
               {internalValue}
             </span>
             <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 -mt-1">
               Intensity
             </span>
          </div>
        </div>

        {/* Dynamic Handle Visual */}
        <div 
          className="absolute top-1 bottom-1 w-2 bg-ink/10 rounded-full transition-all duration-75 pointer-events-none"
          style={{ left: `calc(${((internalValue - 1) / 9) * 100}% - 4px)` }}
        />
      </div>
      <div className="flex justify-between mt-3 px-2 text-[10px] font-bold text-organic-400 uppercase tracking-widest font-sans">
        <span>Despair</span>
        <span>Neutral</span>
        <span>Ecstatic</span>
      </div>
    </div>
  );
};

export const SliderInput: React.FC<{
  label: string;
  value: number | null;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}> = ({ label, value, onChange, min = 1, max = 10 }) => {
  const [internalValue, setInternalValue] = useState(value || Math.ceil((max - min) / 2));
  const isInteracting = useRef(false);

  useEffect(() => {
    if (value !== null && !isInteracting.current) {
      setInternalValue(value);
    }
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    isInteracting.current = true;
    setInternalValue(parseInt(e.target.value));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.target.value);
    isInteracting.current = false;
    onChange(newVal);
  };

  return (
    <div className="mb-8 last:mb-0">
      <div className="flex justify-between mb-3 items-baseline">
        <label className="font-serif text-ink/80 text-lg font-semibold">{label}</label>
        <span className="font-bold text-organic-700 bg-organic-50 px-4 py-1.5 rounded-full text-sm border border-organic-100 shadow-sm transition-all">
          {internalValue}
        </span>
      </div>
      <div className="relative h-10 flex items-center">
        {/* Track */}
        <div className="absolute w-full h-3 bg-stone-100 rounded-full border border-stone-200 shadow-inner overflow-hidden">
           <div 
              className="h-full bg-organic-500 transition-all duration-300 ease-out" 
              style={{ width: `${((internalValue - min) / (max - min)) * 100}%` }} 
           />
        </div>
        
        {/* Native range input for interaction (invisible) */}
        <input 
          type="range" 
          min={min} 
          max={max} 
          value={internalValue} 
          onInput={handleInput}
          onChange={handleChange}
          onBlur={() => { isInteracting.current = false; }}
          className="relative w-full h-12 opacity-0 cursor-pointer z-10 touch-none"
          style={{ touchAction: 'none' }}
        />
        
        {/* Visual Handle */}
        <div 
           className="absolute h-8 w-8 bg-white border-2 border-organic-600 rounded-full shadow-md pointer-events-none transition-all duration-75"
           style={{ left: `calc(${((internalValue - min) / (max - min)) * 100}% - 16px)` }}
        />
      </div>
    </div>
  );
};

export const Counter: React.FC<{
  value: number;
  onChange: (val: number) => void;
  label: string;
}> = ({ value, onChange, label }) => (
  <div className="flex items-center justify-between py-3 border-b border-dashed border-organic-100 last:border-0">
    <span className="font-serif text-ink text-lg">{label}</span>
    <div className="flex items-center gap-4 bg-organic-50 rounded-full p-1 border border-organic-100/50">
      <button 
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-500 hover:text-ink active:scale-90 transition-all"
      >
        <Minus size={16} strokeWidth={3} />
      </button>
      <span className="w-8 text-center font-bold text-ink text-lg">{value}</span>
      <button 
        onClick={() => onChange(value + 1)}
        className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-organic-600 hover:text-organic-800 active:scale-90 transition-all"
      >
        <Plus size={16} strokeWidth={3} />
      </button>
    </div>
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
    {label && <label className="block font-sans text-xs font-bold text-organic-400 uppercase tracking-widest mb-2">{label}</label>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-stone-50/50 border-b-2 border-stone-100 focus:border-organic-400 py-3 px-2 font-serif text-lg text-ink placeholder-gray-300 focus:outline-none focus:bg-white transition-all resize-none rounded-t-lg"
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
    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left group
      ${checked ? 'bg-organic-50 border-organic-200 shadow-inner' : 'bg-white border-gray-100 hover:border-organic-200 hover:bg-stone-50 hover:shadow-soft'}
    `}
  >
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
      ${checked ? 'bg-organic-600 border-organic-600 scale-110' : 'border-gray-300 group-hover:border-organic-400'}
    `}>
      <Check size={14} strokeWidth={4} className={`text-white transition-transform duration-300 ${checked ? 'scale-100' : 'scale-0'}`} />
    </div>
    <span className={`font-serif text-lg transition-colors duration-300 ${checked ? 'text-organic-800 line-through decoration-organic-300/50' : 'text-ink'}`}>
      {label}
    </span>
  </button>
);

export const SaveIndicator: React.FC<{ status: 'saved' | 'saving' | 'idle' }> = ({ status }) => {
  if (status === 'idle') return null;
  return (
    <div className="fixed top-6 right-6 z-[60] pointer-events-none animate-in fade-in slide-in-from-top-2">
      <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-float border border-organic-100 flex items-center gap-3">
         <div className={`w-2 h-2 rounded-full ${status === 'saving' ? 'bg-orange-400 animate-pulse' : 'bg-organic-600'}`} />
         <span className={`text-xs font-bold uppercase tracking-widest ${status === 'saving' ? 'text-gray-500' : 'text-organic-800'}`}>
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
  <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-1 border border-organic-100/50">
     <button 
       onClick={() => onChange(Math.max(min, value - step))} 
       className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-stone-500 hover:text-ink hover:scale-105 active:scale-95 transition-all"
     >
       <Minus size={14} />
     </button>
     <span className="font-mono text-sm font-bold min-w-[4ch] text-center text-ink">{value}{unit}</span>
     <button 
       onClick={() => onChange(Math.min(max, value + step))} 
       className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-organic-600 hover:text-organic-800 hover:scale-105 active:scale-95 transition-all"
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
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            isSelected 
              ? 'bg-organic-700 text-white shadow-lg shadow-organic-200 transform scale-105' 
              : 'bg-white border border-organic-100 text-gray-500 hover:bg-organic-50 hover:text-organic-700'
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
    className: `w-full bg-transparent border-b border-transparent hover:border-organic-100 focus:border-organic-400 focus:outline-none transition-colors placeholder-gray-300 font-serif ${className}`,
    rows: multiline ? 3 : undefined
  });
};
