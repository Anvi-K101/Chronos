import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { StorageService } from '../services/storage';
import { PageContainer, SectionHeader, Card } from '../components/ui/Controls';
import { 
  User, ShieldCheck, Cloud, HardDrive, 
  LogOut, Download, AlertCircle, Calendar, CheckCircle 
} from 'lucide-react';

export const Accounts = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalEntries: 0 });
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'offline'>('synced');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionVerified, setConnectionVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const data = StorageService.loadLocal();
    setStats({ totalEntries: Object.keys(data.entries).length });
    
    if (!navigator.onLine) setSyncStatus('offline');
  }, []);

  const testFirebaseConnection = async () => {
    setTestingConnection(true);
    setConnectionVerified(null);
    
    try {
      const isConnected = await StorageService.verifyCloudSync(user?.uid);
      setConnectionVerified(isConnected);
      
      if (isConnected) {
        alert('✅ SUCCESS! Your data is being saved to Firebase cloud and will persist long-term.');
      } else {
        alert('❌ Connection failed. Check the browser console (F12) for details.');
      }
    } catch (error) {
      setConnectionVerified(false);
      alert('❌ Error testing connection. Check console for details.');
    } finally {
      setTestingConnection(false);
    }
  };

  if (!user) return null;

  return (
    <PageContainer>
      <SectionHeader title="Account" subtitle="Identity & Archive" />

      {/* Profile Card */}
      <Card className="flex items-center gap-6 py-8">
        <div className="w-20 h-20 rounded-3xl bg-organic-100 flex items-center justify-center text-organic-700 shadow-sm border-2 border-white overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={36} />
          )}
        </div>
        <div className="flex-grow">
          <h2 className="font-serif text-2xl font-bold text-ink">{user.displayName || 'Chronos User'}</h2>
          <p className="text-gray-400 text-sm font-sans uppercase tracking-widest flex items-center gap-2 mt-1">
            <ShieldCheck size={14} className="text-organic-600" />
            Authenticated via {user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email'}
          </p>
          <p className="text-[11px] text-gray-300 font-mono mt-1">{user.email}</p>
        </div>
      </Card>

      {/* Connection Test Card */}
      <Card title="Cloud Connection Test" className="bg-blue-50/30 border-blue-100">
        <p className="text-sm text-gray-600 mb-4 font-serif">
          Click below to verify your data is being saved to Firebase cloud storage (not just locally).
        </p>
        
        <button 
          type="button"
          onClick={testFirebaseConnection}
          disabled={testingConnection}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-sans font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
        >
          {testingConnection ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <Cloud size={16} /> Test Firebase Connection
            </>
          )}
        </button>

        {connectionVerified !== null && (
          <div className={`mt-4 p-4 rounded-xl border-2 flex items-center gap-3 ${
            connectionVerified 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            {connectionVerified ? (
              <>
                <CheckCircle size={20} className="text-green-600 shrink-0" />
                <div>
                  <p className="font-bold text-green-800 text-sm">Connected Successfully!</p>
                  <p className="text-xs text-green-700">Your data is being saved to Firebase cloud.</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle size={20} className="text-red-600 shrink-0" />
                <div>
                  <p className="font-bold text-red-800 text-sm">Connection Failed</p>
                  <p className="text-xs text-red-700">Check browser console (F12) for error details.</p>
                </div>
              </>
            )}
          </div>
        )}
      </Card>

      {/* Data Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card title="Vault Status">
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-500 font-sans">
                  <Cloud size={16} className="text-organic-500" /> Cloud Sync
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-organic-600 bg-organic-50 px-3 py-1 rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-500 font-sans">
                  <HardDrive size={16} className="text-stone-400" /> Local Cache
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Encrypted</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <span className="text-sm font-serif text-ink">Total Records</span>
                <span className="font-bold text-ink">{stats.totalEntries}</span>
              </div>
           </div>
        </Card>

        <Card title="Archive Info">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <span className="flex items-center gap-2 text-sm text-gray-500 font-sans">
                 <Calendar size={16} className="text-organic-400" /> Current Year
               </span>
               <span className="font-serif font-bold text-ink">2026</span>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-400 italic font-serif">
              "Your archive is end-to-end isolated. Only you possess the keys to decrypt and view your personal history."
            </p>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <button 
          type="button"
          onClick={() => StorageService.exportData()}
          className="w-full py-4 bg-white border border-stone-200 text-ink rounded-2xl font-sans font-bold uppercase tracking-widest text-xs hover:bg-stone-50 transition-all flex items-center justify-center gap-3 shadow-sm"
        >
          <Download size={16} /> Export JSON Backup
        </button>

        <button 
          type="button"
          onClick={() => logout()}
          className="w-full py-4 bg-ink text-paper rounded-2xl font-sans font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-xl"
        >
          <LogOut size={16} /> Secure Sign Out
        </button>
      </div>

      <div className="mt-12 text-center">
         <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-50 rounded-full border border-stone-100">
            <AlertCircle size={14} className="text-gray-300" />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">Vault Version 1.0.4 - Secure</span>
         </div>
      </div>
    </PageContainer>
  );
};
