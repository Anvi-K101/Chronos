import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Quote } from 'lucide-react';

interface WisdomPanelProps {
  stats: {
    avgMood: number;
    totalStress: number;
    count: number;
  };
}

export const WisdomPanel: React.FC<WisdomPanelProps> = ({ stats }) => {
  const [reflection, setReflection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (stats.count === 0) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are Chronos, a stoic and poetic personal life operating system. 
      Based on these user stats for their life archive:
      - Total entries: ${stats.count}
      - Average mood (1-10): ${stats.avgMood.toFixed(1)}
      - Total accumulated stress: ${stats.totalStress}
      
      Provide a single-sentence reflection (under 20 words) that is profound, encouraging, and uses tree/growth metaphors. 
      Do not use emojis.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setReflection(response.text?.trim() || "The roots grow deep in the silence of recording.");
    } catch (e) {
      console.error("AI Insight failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stats.count > 0 && !reflection) {
      generateInsight();
    }
  }, [stats.count]);

  if (stats.count === 0 || (!reflection && !loading)) return null;

  return (
    <div className="mt-8 bg-white/40 backdrop-blur-md border border-organic-100/50 p-6 rounded-3xl shadow-soft max-w-sm mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex justify-center mb-3">
        <div className="p-2 bg-organic-50 rounded-full text-organic-400">
          <Quote size={14} />
        </div>
      </div>
      {loading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-1 h-1 bg-organic-300 rounded-full animate-ping" />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-organic-300">Consulting Archive</span>
        </div>
      ) : (
        <p className="font-serif text-sm text-ink italic leading-relaxed text-center text-balance">
          "{reflection}"
        </p>
      )}
      <div className="mt-4 flex justify-center">
        <button 
          type="button"
          onClick={(e) => generateInsight(e)}
          className="text-[9px] font-bold uppercase tracking-[0.2em] text-organic-400 hover:text-organic-600 transition-colors flex items-center gap-1 outline-none"
        >
          <Sparkles size={10} /> Refresh Insight
        </button>
      </div>
    </div>
  );
};