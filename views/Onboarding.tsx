
import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { LogIn, Mail, ArrowRight, ShieldCheck, TreePine } from 'lucide-react';

export const Onboarding = () => {
  const { signInGoogle, signInEmail, signUpEmail } = useAuth();
  const [view, setView] = useState<'welcome' | 'auth'>('welcome');
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
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'welcome') {
    return (
      <div className="fixed inset-0 z-[100] bg-paper flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
        <div className="w-16 h-16 bg-organic-100 rounded-3xl flex items-center justify-center mb-10 shadow-soft text-organic-700">
          <TreePine size={32} />
        </div>
        <h1 className="font-serif text-5xl md:text-6xl text-ink font-bold tracking-tight mb-6">Chronos 2026</h1>
        <p className="font-serif text-xl text-gray-500 italic max-w-md mb-12">
          "A private operating system for your life's growth, reflection, and quiet progress."
        </p>
        
        <div className="space-y-6 w-full max-w-xs">
          <button 
            onClick={() => setView('auth')}
            className="w-full py-4 bg-ink text-paper rounded-full font-sans font-bold uppercase tracking-widest text-xs hover:bg-organic-800 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
          >
            Begin Your Archive <ArrowRight size={14} />
          </button>
          <div className="flex items-center justify-center gap-2 text-organic-400">
            <ShieldCheck size={14} />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">End-to-End Privacy</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-paper flex flex-col items-center justify-center p-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="w-full max-w-sm">
        <h2 className="font-serif text-3xl font-bold text-ink mb-2">Create Identity</h2>
        <p className="text-gray-400 font-sans text-sm mb-8 uppercase tracking-widest">Connect your vault</p>

        <button 
          onClick={() => signInGoogle()}
          className="w-full py-4 bg-white border border-stone-200 text-ink rounded-2xl font-sans font-bold uppercase tracking-widest text-xs hover:bg-stone-50 transition-all flex items-center justify-center gap-3 mb-6 shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
          <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest text-stone-300"><span className="bg-paper px-4">Or use email</span></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="email" placeholder="Email Address" 
            className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-serif text-ink focus:outline-none focus:border-organic-400 transition-all"
            value={email} onChange={e => setEmail(e.target.value)} required
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-serif text-ink focus:outline-none focus:border-organic-400 transition-all"
            value={password} onChange={e => setPassword(e.target.value)} required
          />
          
          {error && <p className="text-red-500 text-xs font-bold uppercase tracking-wide px-2">{error}</p>}

          <button 
            type="submit" disabled={loading}
            className="w-full py-4 bg-organic-700 text-white rounded-2xl font-sans font-bold uppercase tracking-widest text-xs hover:bg-organic-800 transition-all shadow-lg flex items-center justify-center gap-3"
          >
            {loading ? 'Processing...' : authMode === 'signup' ? 'Create Account' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-8 text-xs font-bold uppercase tracking-widest text-gray-400">
          {authMode === 'signup' ? 'Already have an account?' : 'Need a new vault?'} 
          <button 
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="ml-2 text-ink hover:text-organic-600 underline"
          >
            {authMode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>

        <button 
          onClick={() => setView('welcome')}
          className="w-full mt-12 text-gray-300 hover:text-gray-500 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
};
