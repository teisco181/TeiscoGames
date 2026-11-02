/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase/config';
import { AuthProvider, useAuth } from './firebase/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthView } from './components/AuthView';
import { GamesGrid } from './components/GamesGrid';
import { AnnouncementsSection } from './components/AnnouncementsSection';
import { AdminPanel } from './components/AdminPanel';
import { ProfileModal } from './components/ProfileModal';
import { Footer } from './components/Footer';
import { GameItem, AnnouncementItem } from './types';
import { Gamepad2, Sparkles, Bell, Shield, Flame, Play, Trophy, Clock, Timer } from 'lucide-react';
import { formatPlaytime } from './utils/timeFormatters';

function Dashboard() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'games' | 'announcements' | 'admin'>('games');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [games, setGames] = useState<GameItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [playtimes, setPlaytimes] = useState<Record<string, number>>({});
  const [dataLoading, setDataLoading] = useState(true);

  // Firestore Listeners (only attach once user is authenticated as per Skill guidelines)
  useEffect(() => {
    if (!user) {
      setGames([]);
      setAnnouncements([]);
      setPlaytimes({});
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    // Games listener
    const gamesPath = 'games';
    const gamesQuery = query(collection(db, gamesPath));
    const unsubscribeGames = onSnapshot(
      gamesQuery,
      (snapshot) => {
        const items: GameItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as GameItem);
        });
        setGames(items);
        setDataLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, gamesPath);
      }
    );

    // Announcements listener
    const announcementsPath = 'announcements';
    const announcementsQuery = query(collection(db, announcementsPath));
    const unsubscribeAnnouncements = onSnapshot(
      announcementsQuery,
      (snapshot) => {
        const items: AnnouncementItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as AnnouncementItem);
        });
        // Sort with pinned first, then by createdAt desc
        items.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return 0;
        });
        setAnnouncements(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, announcementsPath);
      }
    );

    // Playtimes listener for current user
    const playtimesPath = `users/${user.uid}/playtimes`;
    const unsubscribePlaytimes = onSnapshot(
      collection(db, 'users', user.uid, 'playtimes'),
      (snapshot) => {
        const map: Record<string, number> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          map[docSnap.id] = Number(data.totalSeconds) || 0;
        });
        setPlaytimes(map);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, playtimesPath);
      }
    );

    return () => {
      unsubscribeGames();
      unsubscribeAnnouncements();
      unsubscribePlaytimes();
    };
  }, [user]);

  // Loading screen during initial auth resolve
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="relative">
          <Gamepad2 className="w-12 h-12 text-cyan-400 animate-bounce" />
          <div className="w-12 h-2 rounded-full bg-cyan-500/30 blur-sm mx-auto mt-2" />
        </div>
        <p className="mt-4 font-bold text-sm tracking-wider text-cyan-300 uppercase font-['Chakra_Petch',sans-serif]">
          TeiscoGames Netwerk laden...
        </p>
      </div>
    );
  }

  // Not authenticated: Show full authentication portal
  if (!user) {
    return <AuthView />;
  }

  // Featured game for the hero banner if available
  const featuredGame = games.find((g) => g.featured) || games[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Outfit',sans-serif] selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        announcementCount={announcements.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Dynamic Gaming Hero Banner (Shown on Games tab) */}
        {activeTab === 'games' && (
          <div className="relative rounded-3xl overflow-hidden border border-cyan-500/25 bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/40 p-6 sm:p-10 shadow-2xl shadow-black/80">
            {/* Ambient background glows */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Het Officiële TeiscoGames Netwerk</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none font-['Chakra_Petch',sans-serif]">
                  SPEEL DE BESTE <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">
                    WEB &amp; GITHUB PAGES
                  </span>{' '}
                  GAMES
                </h1>

                <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                  Direct speelbaar in je browser zonder installatie. Ontdek klassiekers, hectische arcadegames, puzzels en community creaties.
                </p>

                {/* Quick stats pills */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-slate-300">
                      <strong>{games.length}</strong> Games Beschikbaar
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-300">
                      Jouw Speeltijd: <strong className="text-cyan-300">{formatPlaytime(Object.values(playtimes).reduce((a, b) => a + (Number(b) || 0), 0))}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                    <Bell className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300">
                      <strong>{announcements.length}</strong> Netwerk Updates
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/50 text-purple-300 text-xs font-semibold transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin Tools</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Featured Highlight Card */}
              {featuredGame && (
                <div className="lg:col-span-5">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 shadow-xl group">
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                      <img
                        src={featuredGame.imageUrl}
                        alt={featuredGame.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 shadow-md">
                        Spotlight Game
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-base truncate font-['Chakra_Petch',sans-serif]">
                          {featuredGame.title}
                        </h3>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {featuredGame.description}
                        </p>
                      </div>
                      <a
                        href={featuredGame.gameUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/30 flex items-center gap-1 text-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Tab Contents */}
        {activeTab === 'games' && (
          <GamesGrid
            games={games}
            playtimes={playtimes}
            onNavigateToAdmin={() => setActiveTab('admin')}
          />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsSection
            announcements={announcements}
            onNavigateToAdmin={() => setActiveTab('admin')}
          />
        )}

        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminPanel games={games} announcements={announcements} />
          ) : (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
              <Shield className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-white">Toegang Beperkt</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Het Admin Panel is uitsluitend toegankelijk voor beheerders van TeiscoGames.
              </p>
              <button
                onClick={() => setActiveTab('games')}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Terug naar Games
              </button>
            </div>
          )
        )}
      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        playtimes={playtimes}
        games={games}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
