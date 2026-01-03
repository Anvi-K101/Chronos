import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { StorageService } from '../services/storage';
import { PageContainer, SectionHeader, Card } from '../components/ui/Controls';
import { 
  User, ShieldCheck, Cloud, HardDrive, 
  LogOut, Download, AlertCircle, Calendar 
} from 'lucide-react';

export const Accounts = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalEntries: 0 });
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'offline'>('synced');

  useEffect(() => {
    const data = StorageService.loadLocal();
    setStats({ totalEntries: Object.keys(data.entries).length });
    
    // Simulate sync check
    if (!navigator.onLine) setSyncStatus('offline');
  }, []);

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