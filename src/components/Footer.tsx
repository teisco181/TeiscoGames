import React from 'react';
import { Gamepad2, ShieldCheck, Heart, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 font-['Outfit',sans-serif]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white tracking-wider font-['Chakra_Petch',sans-serif]">
              TEISCO<span className="text-purple-400">GAMES</span>
            </span>
            <p className="text-xs text-slate-500">
              Web Game Platform &amp; Centraal Account Netwerk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Firebase Auth &amp; Firestore
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Github className="w-4 h-4 text-cyan-400" />
            GitHub Pages Games
          </span>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1">
          <span>Gebouwd voor</span>
          <span className="font-semibold text-slate-300">TeiscoGames</span>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 mx-0.5" />
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};
