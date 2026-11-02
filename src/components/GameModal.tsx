import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Maximize2,
  Minimize2,
  Play,
  Info,
  Sparkles,
  RefreshCw,
  Clock,
  Timer,
  CheckCircle2,
} from 'lucide-react';
import { GameItem } from '../types';
import { usePlaytimeTracker } from '../hooks/usePlaytimeTracker';
import { formatClockTimer, formatPlaytime } from '../utils/timeFormatters';

interface GameModalProps {
  game: GameItem | null;
  onClose: () => void;
}

export const GameModal: React.FC<GameModalProps> = ({ game, onClose }) => {
  const [isPlayingInModal, setIsPlayingInModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Interval timer tracking how long the game page is open
  const { sessionSeconds, totalSeconds, isSyncing, forceSync } = usePlaytimeTracker(
    game,
    Boolean(game)
  );

  if (!game) return null;

  const handleClose = () => {
    forceSync();
    setIsPlayingInModal(false);
    setIsFullscreen(false);
    onClose();
  };

  const handleLaunchExternal = () => {
    window.open(game.gameUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 rounded-none border-none'
            : isPlayingInModal
            ? 'max-w-5xl h-[90vh]'
            : 'max-w-2xl'
        }`}
      >
        {/* Modal Top Header */}
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950 border-b border-slate-800 gap-2">
          {/* Game Title & Category */}
          <div className="flex items-center gap-2.5 truncate mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="font-bold text-white text-base sm:text-lg truncate font-['Chakra_Petch',sans-serif]">
              {game.title}
            </h3>
            {game.category && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                {game.category}
              </span>
            )}
          </div>

          {/* Live Playtime Interval Timer Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs shadow-inner">
            <Timer className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-slate-400 hidden sm:inline">Sessie:</span>
              <span className="text-cyan-300 font-bold">{formatClockTimer(sessionSeconds)}</span>
              <span className="text-slate-600">|</span>
              <Clock className="w-3 h-3 text-purple-400 ml-0.5" />
              <span className="text-slate-400 hidden sm:inline">Totaal:</span>
              <span className="text-purple-300 font-semibold">{formatPlaytime(totalSeconds)}</span>
            </div>
            {isSyncing ? (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" title="Opslaan naar Firestore..." />
            ) : (
              <span title="Gesynchroniseerd met Firestore" className="flex items-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              </span>
            )}
          </div>

          {/* Actions & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isPlayingInModal && (
              <>
                <button
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Herlaad game"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title={isFullscreen ? 'Venster verkleinen' : 'Volledig scherm'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </>
            )}

            <button
              onClick={handleLaunchExternal}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Open direct in nieuw tabblad"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Nieuw Tabblad</span>
            </button>

            <button
              onClick={handleClose}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-red-950/80 hover:text-red-300 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {isPlayingInModal ? (
          <div className="flex-1 bg-black relative flex flex-col">
            <iframe
              key={iframeKey}
              src={game.gameUrl}
              title={game.title}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        ) : (
          <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
            {/* Banner preview */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 group">
              <img
                src={game.imageUrl}
                alt={game.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex items-end p-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {game.featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        Uitgelicht
                      </span>
                    )}
                    <span className="text-xs text-slate-300 font-mono">
                      Hosted on GitHub Pages / Web
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch',sans-serif]">
                    {game.title}
                  </h2>
                </div>
              </div>
            </div>

            {/* Speeltijd Status Card */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Live Speeltijd Registratie
                  </h4>
                  <p className="text-xs text-slate-400">
                    De actieve interval timer slaat je speeltijd automatisch op in Firestore.
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
                <span className="text-[11px] text-slate-400 block">Jouw totale speeltijd</span>
                <span className="text-base font-bold text-cyan-300 font-['Chakra_Petch',sans-serif]">
                  {formatPlaytime(totalSeconds)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Over deze game / website
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {game.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsPlayingInModal(true)}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Speel in Portaal (In-App)</span>
              </button>

              <button
                onClick={handleLaunchExternal}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all"
              >
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                <span>Open Externe Pagina</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
