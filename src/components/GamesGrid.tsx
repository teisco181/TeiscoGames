import React, { useState, useMemo } from 'react';
import { Search, Gamepad2, Play, Sparkles, Filter, ExternalLink, PlusCircle, Compass } from 'lucide-react';
import { GameItem } from '../types';
import { useAuth } from '../firebase/AuthContext';
import { GameModal } from './GameModal';

import { Clock } from 'lucide-react';
import { formatPlaytime } from '../utils/timeFormatters';

interface GamesGridProps {
  games: GameItem[];
  playtimes?: Record<string, number>;
  onNavigateToAdmin?: () => void;
}

export const GamesGrid: React.FC<GamesGridProps> = ({ games, playtimes = {}, onNavigateToAdmin }) => {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'title'>('featured');
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);

  // Extract unique categories from actual games + default options
  const categories = useMemo(() => {
    const set = new Set<string>(['Alle']);
    games.forEach((g) => {
      if (g.category) set.add(g.category);
    });
    return Array.from(set);
  }, [games]);

  const filteredGames = useMemo(() => {
    return games
      .filter((game) => {
        const matchesSearch =
          game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          game.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === 'Alle' || game.category?.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        // newest
        return 0;
      });
  }, [games, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Row */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek games op titel of trefwoord..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-xs text-slate-500 hover:text-slate-300"
            >
              Wissen
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Sorteer:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 px-3 py-2.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="featured">Uitgelicht eerst</option>
            <option value="newest">Meest recent</option>
            <option value="title">Titel (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Game Cards */}
      {filteredGames.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-800/40 text-cyan-400 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Chakra_Petch',sans-serif]">
              Geen games gevonden
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {searchQuery
                ? `Er zijn geen resultaten die overeenkomen met "${searchQuery}".`
                : 'Er zijn momenteel nog geen games toegevoegd aan deze categorie.'}
            </p>
          </div>

          {isAdmin && onNavigateToAdmin && (
            <button
              onClick={onNavigateToAdmin}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ga naar Admin Panel om games toe te voegen</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="group bg-slate-900/90 rounded-2xl border border-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:-translate-y-1"
            >
              {/* Thumbnail Container */}
              <div
                className="relative aspect-video overflow-hidden cursor-pointer"
                onClick={() => setActiveGame(game)}
              >
                <img
                  src={game.imageUrl}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  {game.category ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                      {game.category}
                    </span>
                  ) : <div />}

                  {game.featured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Uitgelicht
                    </span>
                  )}
                </div>

                {/* Center Play Overlay Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-950/40">
                  <div className="w-12 h-12 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/50 transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Game Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3
                    onClick={() => setActiveGame(game)}
                    className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer font-['Chakra_Petch',sans-serif] leading-tight"
                  >
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>

                  {/* Playtime indicator */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Speeltijd:</span>
                      <strong className="text-cyan-300">
                        {playtimes[game.id] ? formatPlaytime(playtimes[game.id]) : '0s'}
                      </strong>
                    </span>
                    {playtimes[game.id] ? (
                      <span className="text-[10px] text-purple-400 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-800/40">
                        Gespeeld
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">
                        Nieuw
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveGame(game)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500 hover:to-blue-500 text-cyan-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-cyan-500/40 hover:border-transparent transition-all shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Speel Nu</span>
                  </button>

                  <a
                    href={game.gameUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                    title="Open GitHub Pages link in nieuw tabblad"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Game Modal */}
      <GameModal game={activeGame} onClose={() => setActiveGame(null)} />
    </div>
  );
};
