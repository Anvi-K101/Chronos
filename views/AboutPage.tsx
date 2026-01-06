
import React from 'react';
import { PageContainer, SectionHeader, Card } from '../components/ui/Controls';
import { TreePine, Calendar, ShieldCheck, Zap, Heart, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <PageContainer>
      <SectionHeader title="Philosophy" subtitle="The Architecture of Time" />
      
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <Card className="bg-organic-50/50 border-organic-100">
          <p className="font-serif text-xl md:text-2xl text-ink leading-relaxed italic text-balance mb-6">
            "Chronos is not just a tracker; it is a mirror for your evolving self. By recording daily nodes, you build a living archive that maps the expansion of your internal world over the course of the year."
          </p>
          <div className="flex items-center gap-3 text-organic-600">
            <TreePine size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Rooted in Growth</span>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="The Daily Node">
            <p className="font-serif text-sm text-stone-500 leading-relaxed mb-4">
              Each day is a single data point—a node. By capturing Vitality, Energy, and Solitude, you create a high-resolution snapshot of your existence.
            </p>
            <div className="flex items-center gap-2 opacity-30">
              <Calendar size={14} />
              <span className="text-[9px] font-bold uppercase tracking-widest">365 Potential Branches</span>
            </div>
          </Card>

          <Card title="Symbolic Growth">
            <p className="font-serif text-sm text-stone-500 leading-relaxed mb-4">
              Your data feeds the Tree of Life. As you record more, the Arbor grows more intricate. Your consistency is visualized as biological expansion.
            </p>
            <div className="flex items-center gap-2 opacity-30">
              <Zap size={14} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Dynamic Visualization</span>
            </div>
          </Card>
        </div>

        <Card title="Privacy & Isolation">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-grow">
              <p className="font-serif text-sm text-stone-500 leading-relaxed mb-6">
                In an era of surveillance, Chronos is an island. Your data is yours. It is stored in a private vault, isolated from external metrics and social pressures. This is a space for honest, unfiltered reflection.
              </p>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full text-stone-400">
                    <ShieldCheck size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">AES Encryption</span>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full text-stone-400">
                    <Heart size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Zero Tracking</span>
                 </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center py-10">
           <Link to="/" className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300 hover:text-ink transition-all">
             Return to Core
           </Link>
        </div>
      </div>
    </PageContainer>
  );
};
