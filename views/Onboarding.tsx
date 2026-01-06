
import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { ArrowRight, ShieldCheck, TreePine, AlertCircle, MousePointer2, Layers, CheckCircle2, Loader2, Info } from 'lucide-react';

export const Onboarding = () => {
  const { signInGoogle, signInEmail, signUpEmail } = useAuth();
  const [view, setView] = useState<'welcome' | 'auth' | 'tutorial' | 'about'>('welcome');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (authMode === 'login') {
        await signInEmail(email, password);
      } else {
        await signUpEmail(email, password);
        setView('tutorial');
      }
    } catch (err: any) {
      setError(err.message || 'Identity verification failed.');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'welcome') {
    return (
      <div className="fixed inset-0 z-[100] bg-paper flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000 overflow-y-auto">
        <div className="w-20 h-20 bg-ink text-white rounded-[2rem] flex items-center justify-center mb-10 shadow-float shrink-0">
          <TreePine size={40} />
        </div>
        <h1 className="font-serif text-5xl md:text-7xl text-ink font-bold tracking-tighter mb-4">Chronos</h1>
        <p className="font-serif text-xl text-stone-400 italic max-w-md mb-8">
          "A silent archive for your life's expansion."
        </p>

        <div className="max-w-sm mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
           <p className="font-sans text-[11px] leading-relaxed text-stone-500 uppercase tracking-[0.1em] font-medium text-balance">
             Chronos is a personal operating system designed to map your progress throughout the year. 
             By recording daily nodes, you gradually build a visual and data-driven history of your 
             mental state, achievements, and evolution.
           </p>
        </div>
        
        <div className="space-y-4 w-full max-w-xs shrink-0">
          <button 
            type="button"
            onClick={() => setView('auth')}
            className="w-full py-5 bg-ink text-paper rounded-full font-sans font-black uppercase tracking-[0.4em] text-[10px] hover:bg-stone-800 transition-all shadow-xl flex items-center justify-center gap-3"
          >
            Access Vault <ArrowRight size={14} />
          </button>
          
          <button 
            type="button"
            onClick={() => setView('about')}
            className="w-full py-4 bg-white border border-stone-100 text-stone-400 rounded-full font-sans font-black uppercase tracking-[0.3em] text-[9px] hover:text-ink transition-all flex items-center justify-center gap-2"
          >
            <Info size={12} /> The Concept
          </button>

          <div className="flex items-center justify-center gap-2 text-stone-300 pt-4">
            <ShieldCheck size={14} />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">End-to-End Privacy</span>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'about') {
    return (
      <div className="fixed inset-0 z-[120] bg-paper flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="max-w-md text-center">
          <h2 className="font-serif text-4xl font-bold text-ink mb-6">The Concept</h2>
          <div className="space-y-6 text-left">
            <div className="p-6 bg-white rounded-3xl border border-stone-100 shadow-soft">
              <h4 className="font-serif text-lg font-bold text-ink mb-2">Daily Persistence</h4>
              <p className="font-serif text-sm text-stone-500 leading-relaxed italic">
                Chronos invites you to spend five minutes each day reflecting on your biological and mental state. These nodes aggregate into a deep history of your growth.
              </p>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-stone-100 shadow-soft">
              <h4 className="font-serif text-lg font-bold text-ink mb-2">Long-Term Vision</h4>
              <p className="font-serif text-sm text-stone-500 leading-relaxed italic">
                Observe patterns that only become visible over months. The "Arbor" visualizes your consistency, showing you exactly where you've invested your energy.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setView('welcome')}
            className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-stone-300 hover:text-ink transition-colors"
          >
            Back to Entry
          </button>
        </div>
      </div>
    );
  }

  if (view === 'tutorial') {
    const steps = [
      {
        title: "The Heart",
        text: "The center button at the bottom is your gateway. Click it once to open the main navigation menu and explore different facets of your archive.",
        icon: <MousePointer2 size={32} className="text-ink" />
      },
      {
        title: "Daily Nodes",
        text: "Capture your 'Nodes' daily. Each category, like Vitality or Solitude, stores a unique dimension of your growth.",
        icon: <Layers size={32} className="text-ink" />
      },
      {
        title: "The Arbor",
        text: "Watch your symbolic Tree of Life grow in real-time. The more you record, the more intricate its branches become.",
        icon: <TreePine size={32} className="text-ink" />
      },
      {
        title: "Rituals",
        text: "Define your disciplines. You can set individual notification times for each ritual to stay aligned with your path.",
        icon: <CheckCircle2 size={32} className="text-ink" />
      }
    ];

    const current = steps[tutorialStep];

    return (
      <div className="fixed inset-0 z-[110] bg-paper flex flex-col items-center justify-center p-10 animate-in fade-in duration-500">
         <div className="w-20 h-20 bg-stone-50 rounded-[2rem] flex items-center justify-center mb-10 border border-stone-100">
            {current.icon}
         </div>
         <h2 className="font-serif text-4xl font-bold text-ink mb-4">{current.title}</h2>
         <p className="font-serif text-lg text-stone-400 text-center max-w-sm leading-relaxed mb-12 italic">
           "{current.text}"
         </p>
         
         <div className="flex gap-2 mb-12">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === tutorialStep ? 'w-8 bg-ink' : 'w-2 bg-stone-100'}`} />
            ))}
         </div>

         <button 
           type="button"
           onClick={() => {
             if (tutorialStep < steps.length - 1) {
               setTutorialStep(tutorialStep + 1);
             } else {
               window.location.reload(); 
             }
           }}
           className="px-10 py-5 bg-ink text-paper rounded-full font-sans font-black uppercase tracking-[0.4em] text-[11px] shadow-xl active:scale-95 transition-all outline-none"
         >
           {tutorialStep === steps.length - 1 ? "Enter Vault" : "Continue"}
         </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-paper flex flex-col items-center justify-center p-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="w-full max-w-sm">
        <h2 className="font-serif text-4xl font-bold text-ink mb-2">Identity</h2>
        <p className="text-stone-300 font-sans text-xs mb-10 uppercase tracking-[0.3em]">Confirm Vault Access</p>

        <button 
          type="button"
          onClick={() => signInGoogle()}
          className="w-full py-4 bg-white border border-stone-100 text-ink rounded-[1.5rem] font-sans font-black uppercase tracking-[0.2em] text-[10px] hover:bg-stone-50 transition-all flex items-center justify-center gap-3 mb-8 shadow-soft outline-none"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
          Authenticate with Google
        </button>

        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="email" placeholder="Email" 
            className="w-full p-4 bg-stone-50/50 border border-stone-100 rounded-[1.5rem] font-serif text-ink focus:outline-none focus:bg-white transition-all"
            value={email} onChange={e => setEmail(e.target.value)} required
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full p-4 bg-stone-50/50 border border-stone-100 rounded-[1.5rem] font-serif text-ink focus:outline-none focus:bg-white transition-all"
            value={password} onChange={e => setPassword(e.target.value)} required
          />
          
          {error && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <p className="text-red-700 text-[10px] font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full py-5 bg-ink text-white rounded-[1.5rem] font-sans font-black uppercase tracking-[0.4em] text-[10px] hover:bg-stone-800 transition-all shadow-lg flex items-center justify-center outline-none"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (authMode === 'signup' ? 'Initiate New Archive' : 'Reopen Vault')}
          </button>
        </form>

        <div className="flex flex-col gap-4 mt-8">
          <button 
            type="button"
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 hover:text-ink transition-colors outline-none"
          >
            {authMode === 'signup' ? 'Already Have A Vault?' : 'Need A New Private Vault?'}
          </button>
          
          <button 
            type="button"
            onClick={() => setView('welcome')}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-200 hover:text-stone-400 transition-colors outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
