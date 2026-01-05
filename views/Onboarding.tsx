import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { ArrowRight, ShieldCheck, TreePine, AlertCircle, MousePointer2, Layers, CheckCircle2, Loader2 } from 'lucide-react';

interface OnboardingProps {
  forcedView?: 'welcome' | 'auth' | 'tutorial';
  onTutorialEnd: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ forcedView, onTutorialEnd }) => {
  const { signInGoogle, signInEmail, signUpEmail } = useAuth();
  const [view, setView] = useState<'welcome' | 'auth' | 'tutorial'>(forcedView || 'welcome');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (forcedView) setView(forcedView);
  }, [forcedView]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await signInGoogle();
    } catch (err: any) {
      setError(err.message || 'Google Auth failed.');
    }
  };

  if (view === 'welcome') {
    return (
      <div className="fixed inset-0 z-[100] bg-paper flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
        <div className="w-20 h-20 bg-ink text-white rounded-[2rem] flex items-center justify-center mb-10 shadow-float">
          <TreePine size={40} />
        </div>
        <h1 className="font-serif text-5xl md:text-7xl text-ink font-bold tracking-tighter mb-6">Chronos</h1>
        <p className="font-serif text-xl text-stone-400 italic max-w-md mb-12">
          "A silent archive for your life's expansion."
        </p>
        
        <div className="space-y-6 w-full max-w-xs">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setView('auth'); }}
            className="w-full py-5 bg-ink text-paper rounded-full font-sans font-black uppercase tracking-[0.4em] text-[10px] hover:bg-stone-800 transition-all shadow-xl flex items-center justify-center gap-3 outline-none"
          >
            Access Vault <ArrowRight size={14} />
          </button>
          <div className="flex items-center justify-center gap-2 text-stone-300">
            <ShieldCheck size={14} />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">End-to-End Privacy</span>
          </div>
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
         <p className="font-serif text-lg text-stone-400 text-center max-w-sm leading-relaxed mb-12 italic text-balance">
           "{current.text}"
         </p>
         
         <div className="flex gap-2 mb-12">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === tutorialStep ? 'w-8 bg-ink' : 'w-2 bg-stone-100'}`} />
            ))}
         </div>

         <button 
           type="button"
           onClick={(e) => {
             e.stopPropagation();
             if (tutorialStep < steps.length - 1) {
               setTutorialStep(tutorialStep + 1);
             } else {
               onTutorialEnd();
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
          onClick={handleGoogleSignIn}
          className="w-full py-4 bg-white border border-stone-100 text-ink rounded-[1.5rem] font-sans font-black uppercase tracking-[0.2em] text-[10px] hover:bg-stone-50 transition-all flex items-center justify-center gap-3 mb-8 shadow-soft outline-none active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
          Authenticate with Google
        </button>

        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="email" placeholder="Email" 
            onClick={(e) => e.stopPropagation()}
            className="w-full p-4 bg-stone-50/50 border border-stone-100 rounded-[1.5rem] font-serif text-ink focus:outline-none focus:bg-white transition-all"
            value={email} onChange={e => setEmail(e.target.value)} required
          />
          <input 
            type="password" placeholder="Password" 
            onClick={(e) => e.stopPropagation()}
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
            className="w-full py-5 bg-ink text-white rounded-[1.5rem] font-sans font-black uppercase tracking-[0.4em] text-[10px] hover:bg-stone-800 transition-all shadow-lg flex items-center justify-center outline-none active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (authMode === 'signup' ? 'Initiate New Archive' : 'Reopen Vault')}
          </button>
        </form>

        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); setAuthMode(authMode === 'login' ? 'signup' : 'login'); }}
          className="w-full mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 hover:text-ink transition-colors outline-none"
        >
          {authMode === 'signup' ? 'Already Have A Vault?' : 'Need A New Private Vault?'}
        </button>
      </div>
    </div>
  );
};