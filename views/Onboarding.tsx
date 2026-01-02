
import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { ArrowRight, ShieldCheck, TreePine, AlertCircle } from 'lucide-react';

export const Onboarding = () => {
  const { signInGoogle, signInEmail, signUpEmail } = useAuth();
  const [view, setView] = useState<'welcome' | 'auth'>('welcome');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getFriendlyErrorMessage = (err: any) => {
    const code = err.code || '';
    if (code === 'auth/wrong-password') return 'Incorrect password.';
    if (code === 'auth/user-not-found') return 'Account not found.';
    if (code === 'auth/invalid-credential') return 'Incorrect password.';
    if (code === 'auth/email-already-in-use') return 'Email is already registered.';
    if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
    if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.';
    if (code === 'auth/network-request-failed') return 'Connection error. Check your vault access.';
    return 'Identity verification failed. Please try again.';
  };

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
      setError(getFriendlyErrorMessage(err));
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
          "A private operating system for your life's growth and reflection."
        </p>
        
        <div className="space-y-6 w-full max-w-xs">
          <button 
            onClick={() => setView('auth')}
            className="w-full py-4 bg-ink text-paper rounded-full font-sans font-bold uppercase tracking-widest text-xs hover:bg-organic-800 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
          >
            Access Vault <ArrowRight size={14} />
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
        <h2 className="font-serif text-3xl font-bold text-ink mb-2">Vault Identity</h2>
        <p className="text-gray-400 font-sans text-sm mb-8 uppercase tracking-widest">Confirm credentials</p>

        <button 
          onClick={() => signInGoogle()}
          className="w-full py-4 bg-white border border-stone-200 text-ink rounded-2xl font-sans font-bold uppercase tracking-widest text-xs hover:bg-stone-50 transition-all flex items-center justify-center gap-3 mb-6 shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
          <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest text-stone-300"><span className="bg-paper px-4">Secure Email</span></div>
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
          
          {error && (
            <div className="flex items-start gap-2 bg-red-50 p-3 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-700 text-[11px] font-bold uppercase tracking-wide leading-tight">{error}</p>
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full py-4 bg-organic-700 text-white rounded-2xl font-sans font-bold uppercase tracking-widest text-xs hover:bg-organic-800 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              authMode === 'signup' ? 'Create Vault' : 'Open Vault'
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-xs font-bold uppercase tracking-widest text-gray-400">
          {authMode === 'signup' ? 'Have a vault?' : 'Need a vault?'} 
          <button 
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="ml-2 text-ink hover:text-organic-600 underline"
          >
            {authMode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>

        <button 
          onClick={() => setView('welcome')}
          className="w-full mt-12 text-gray-300 hover:text-gray-500 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
