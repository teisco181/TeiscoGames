import React, { useState } from 'react';
import {
  Shield,
  Gamepad2,
  Bell,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Database,
  Layers,
  X
} from 'lucide-react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth } from '../firebase/AuthContext';
import { GameItem, AnnouncementItem } from '../types';
import { SEED_GAMES, SEED_ANNOUNCEMENTS } from '../data/seedData';

interface AdminPanelProps {
  games: GameItem[];
  announcements: AnnouncementItem[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ games, announcements }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'games' | 'announcements' | 'seed'>('games');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Game Form State
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [gameTitle, setGameTitle] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  const [gameImageUrl, setGameImageUrl] = useState('');
  const [gameUrl, setGameUrl] = useState('');
  const [gameCategory, setGameCategory] = useState('Arcade');
  const [gameFeatured, setGameFeatured] = useState(false);

  // Announcement Form State
  const [editingAnnounceId, setEditingAnnounceId] = useState<string | null>(null);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announceCategory, setAnnounceCategory] = useState('Nieuws');
  const [announcePinned, setAnnouncePinned] = useState(false);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const resetGameForm = () => {
    setEditingGameId(null);
    setGameTitle('');
    setGameDescription('');
    setGameImageUrl('');
    setGameUrl('');
    setGameCategory('Arcade');
    setGameFeatured(false);
  };

  const resetAnnounceForm = () => {
    setEditingAnnounceId(null);
    setAnnounceTitle('');
    setAnnounceContent('');
    setAnnounceCategory('Nieuws');
    setAnnouncePinned(false);
  };

  // Preset filler for quick GitHub Pages games
  const applyGamePreset = (preset: typeof SEED_GAMES[0]) => {
    setGameTitle(preset.title);
    setGameDescription(preset.description);
    setGameImageUrl(preset.imageUrl);
    setGameUrl(preset.gameUrl);
    setGameCategory(preset.category || 'Arcade');
    setGameFeatured(preset.featured || false);
  };

  // Save / Update Game
  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!gameTitle.trim() || !gameDescription.trim() || !gameImageUrl.trim() || !gameUrl.trim()) {
      showNotification('Vul alle verplichte velden in voor de game.', true);
      return;
    }

    setLoading(true);
    try {
      if (editingGameId) {
        // Update existing
        const gameRef = doc(db, 'games', editingGameId);
        await updateDoc(gameRef, {
          title: gameTitle.trim(),
          description: gameDescription.trim(),
          imageUrl: gameImageUrl.trim(),
          gameUrl: gameUrl.trim(),
          category: gameCategory,
          featured: gameFeatured,
          updatedAt: serverTimestamp(),
        });
        showNotification('Game succesvol bijgewerkt!');
      } else {
        // Create new
        const newId = 'game_' + Date.now();
        const gameRef = doc(db, 'games', newId);
        await setDoc(gameRef, {
          id: newId,
          title: gameTitle.trim(),
          description: gameDescription.trim(),
          imageUrl: gameImageUrl.trim(),
          gameUrl: gameUrl.trim(),
          category: gameCategory,
          featured: gameFeatured,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        });
        showNotification(`Game "${gameTitle}" succesvol toegevoegd aan het netwerk!`);
      }
      resetGameForm();
    } catch (err: any) {
      showNotification('Fout bij opslaan game: ' + (err.message || 'Onbekende fout'), true);
      handleFirestoreError(err, editingGameId ? OperationType.UPDATE : OperationType.CREATE, 'games');
    } finally {
      setLoading(false);
    }
  };

  // Edit Game populate
  const startEditGame = (game: GameItem) => {
    setEditingGameId(game.id);
    setGameTitle(game.title);
    setGameDescription(game.description);
    setGameImageUrl(game.imageUrl);
    setGameUrl(game.gameUrl);
    setGameCategory(game.category || 'Arcade');
    setGameFeatured(Boolean(game.featured));
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Delete Game
  const handleDeleteGame = async (id: string, title: string) => {
    if (!window.confirm(`Weet je zeker dat je de game "${title}" wilt verwijderen?`)) {
      return;
    }
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'games', id));
      showNotification(`Game "${title}" is verwijderd.`);
    } catch (err) {
      showNotification('Fout bij verwijderen game.', true);
      handleFirestoreError(err, OperationType.DELETE, `games/${id}`);
    } finally {
      setLoading(false);
    }
  };

  // Save / Update Announcement
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!announceTitle.trim() || !announceContent.trim()) {
      showNotification('Vul een titel en bericht in voor de mededeling.', true);
      return;
    }

    setLoading(true);
    try {
      if (editingAnnounceId) {
        // Update
        const annRef = doc(db, 'announcements', editingAnnounceId);
        await updateDoc(annRef, {
          title: announceTitle.trim(),
          content: announceContent.trim(),
          category: announceCategory,
          isPinned: announcePinned,
          updatedAt: serverTimestamp(),
        });
        showNotification('Mededeling succesvol bijgewerkt!');
      } else {
        // Create
        const newId = 'ann_' + Date.now();
        const annRef = doc(db, 'announcements', newId);
        await setDoc(annRef, {
          id: newId,
          title: announceTitle.trim(),
          content: announceContent.trim(),
          category: announceCategory,
          isPinned: announcePinned,
          authorName: user.displayName || 'Beheerder',
          authorEmail: user.email || '',
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        });
        showNotification('Nieuwe mededeling geplaatst op het netwerk!');
      }
      resetAnnounceForm();
    } catch (err: any) {
      showNotification('Fout bij opslaan mededeling: ' + (err.message || 'Onbekende fout'), true);
      handleFirestoreError(err, editingAnnounceId ? OperationType.UPDATE : OperationType.CREATE, 'announcements');
    } finally {
      setLoading(false);
    }
  };

  const startEditAnnounce = (ann: AnnouncementItem) => {
    setEditingAnnounceId(ann.id);
    setAnnounceTitle(ann.title);
    setAnnounceContent(ann.content);
    setAnnounceCategory(ann.category || 'Nieuws');
    setAnnouncePinned(Boolean(ann.isPinned));
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteAnnounce = async (id: string, title: string) => {
    if (!window.confirm(`Weet je zeker dat je mededeling "${title}" wilt verwijderen?`)) {
      return;
    }
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'announcements', id));
      showNotification(`Mededeling verwijderd.`);
    } catch (err) {
      showNotification('Fout bij verwijderen mededeling.', true);
      handleFirestoreError(err, OperationType.DELETE, `announcements/${id}`);
    } finally {
      setLoading(false);
    }
  };

  // Seed demo content (games and announcements) with 1 click
  const handleSeedDatabase = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let gamesAdded = 0;
      let annAdded = 0;

      // Seed games
      for (let i = 0; i < SEED_GAMES.length; i++) {
        const item = SEED_GAMES[i];
        const gameId = `seed_game_${i + 1}_${Date.now()}`;
        await setDoc(doc(db, 'games', gameId), {
          id: gameId,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          gameUrl: item.gameUrl,
          category: item.category,
          featured: item.featured,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        });
        gamesAdded++;
      }

      // Seed announcements
      for (let i = 0; i < SEED_ANNOUNCEMENTS.length; i++) {
        const item = SEED_ANNOUNCEMENTS[i];
        const annId = `seed_ann_${i + 1}_${Date.now()}`;
        await setDoc(doc(db, 'announcements', annId), {
          id: annId,
          title: item.title,
          content: item.content,
          category: item.category,
          isPinned: item.isPinned,
          authorName: user.displayName || 'Beheerder',
          authorEmail: user.email || '',
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        });
        annAdded++;
      }

      showNotification(`Succesvol ${gamesAdded} games en ${annAdded} mededelingen geïmporteerd in Firestore!`);
    } catch (err: any) {
      showNotification('Fout bij importeren demo data: ' + err.message, true);
      handleFirestoreError(err, OperationType.CREATE, 'games');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Admin Panel Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-slate-950 border border-purple-500/40 shadow-xl shadow-purple-950/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/50 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch',sans-serif] tracking-wider">
                  BEHEERDERSDASHBOARD <span className="text-purple-400">ADMIN PANEL</span>
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Volledige Toegang
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Beheer games, websites op GitHub Pages en officiële mededelingen voor het TeiscoGames netwerk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ingelogd als: <strong className="text-white">{user?.email}</strong></span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Admin Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('games')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'games'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Websites & Games ({games.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'announcements'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Mededelingen ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('seed')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'seed'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Starter Games Importer</span>
        </button>
      </div>

      {/* TAB 1: GAMES MANAGEMENT */}
      {activeTab === 'games' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add / Edit Game Form */}
          <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">
                  {editingGameId ? 'Game Bewerken' : 'Nieuwe Game Toevoegen'}
                </h3>
              </div>
              {editingGameId && (
                <button
                  onClick={resetGameForm}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Annuleren
                </button>
              )}
            </div>

            {/* Quick Presets for Admin Convenience */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                Snel voorbeeld invullen (GitHub Pages games):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SEED_GAMES.slice(0, 4).map((p) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => applyGamePreset(p)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                  >
                    + {p.title}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveGame} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Titel van de Game / Website *
                </label>
                <input
                  type="text"
                  required
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  placeholder="Bijv. 2048 Web Puzzle"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Beschrijving *
                </label>
                <textarea
                  required
                  rows={3}
                  value={gameDescription}
                  onChange={(e) => setGameDescription(e.target.value)}
                  placeholder="Korte uitleg over de gameplay, doel en besturing..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Afbeelding URL (Cover / Thumbnail) *
                </label>
                <input
                  type="url"
                  required
                  value={gameImageUrl}
                  onChange={(e) => setGameImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... of directe afbeeldingslink"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Link naar website / game op GitHub Pages *
                </label>
                <input
                  type="url"
                  required
                  value={gameUrl}
                  onChange={(e) => setGameUrl(e.target.value)}
                  placeholder="https://username.github.io/mijn-game/ of https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categorie
                  </label>
                  <select
                    value={gameCategory}
                    onChange={(e) => setGameCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Arcade">Arcade</option>
                    <option value="Puzzel">Puzzel</option>
                    <option value="Casual">Casual</option>
                    <option value="Retro">Retro</option>
                    <option value="Actie">Actie</option>
                    <option value="Multiplayer">Multiplayer</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={gameFeatured}
                      onChange={(e) => setGameFeatured(e.target.checked)}
                      className="rounded border-slate-800 text-cyan-500 focus:ring-cyan-500 w-4 h-4 bg-slate-950"
                    />
                    <span>Uitlichten op homepage</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{editingGameId ? 'Wijzigingen Opslaan' : 'Toevoegen aan TeiscoGames'}</span>
              </button>
            </form>
          </div>

          {/* Existing Games List */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-white pb-3 border-b border-slate-800 flex items-center justify-between">
              <span>Huidige Games in Netwerk ({games.length})</span>
              <span className="text-xs text-slate-400 font-normal">Opgeslagen in Firestore collectie `games`</span>
            </h3>

            {games.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <Gamepad2 className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-sm">Er zijn nog geen games toegevoegd.</p>
                <p className="text-xs">Gebruik het formulier links of de "Starter Games Importer" tab.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                  >
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-16 h-12 rounded-lg object-cover border border-slate-800 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white truncate">{game.title}</h4>
                        {game.featured && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                            Uitgelicht
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{game.description}</p>
                      <a
                        href={game.gameUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mt-0.5 truncate"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{game.gameUrl}</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => startEditGame(game)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Bewerken"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game.id, game.title)}
                        className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-900/40 transition-colors"
                        title="Verwijderen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ANNOUNCEMENTS MANAGEMENT */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Post Announcement Form */}
          <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-white">
                  {editingAnnounceId ? 'Mededeling Bewerken' : 'Nieuwe Mededeling Plaatsen'}
                </h3>
              </div>
              {editingAnnounceId && (
                <button
                  onClick={resetAnnounceForm}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Annuleren
                </button>
              )}
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kop / Titel *
                </label>
                <input
                  type="text"
                  required
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  placeholder="Bijv. Belangrijke server update & nieuwe games!"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Berichtinhoud *
                </label>
                <textarea
                  required
                  rows={5}
                  value={announceContent}
                  onChange={(e) => setAnnounceContent(e.target.value)}
                  placeholder="Typ hier het volledige bericht voor alle spelers..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Label Categorie
                  </label>
                  <select
                    value={announceCategory}
                    onChange={(e) => setAnnounceCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Nieuws">Nieuws</option>
                    <option value="Update">Update</option>
                    <option value="Event">Event</option>
                    <option value="Onderhoud">Onderhoud</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={announcePinned}
                      onChange={(e) => setAnnouncePinned(e.target.checked)}
                      className="rounded border-slate-800 text-purple-500 focus:ring-purple-500 w-4 h-4 bg-slate-950"
                    />
                    <span>Vastzetten bovenaan (Pinned)</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/25 disabled:opacity-50"
              >
                <Bell className="w-4 h-4" />
                <span>{editingAnnounceId ? 'Wijzigingen Opslaan' : 'Mededeling Publiceren'}</span>
              </button>
            </form>
          </div>

          {/* Existing Announcements List */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-white pb-3 border-b border-slate-800 flex items-center justify-between">
              <span>Gepubliceerde Mededelingen ({announcements.length})</span>
              <span className="text-xs text-slate-400 font-normal">Firestore collectie `announcements`</span>
            </h3>

            {announcements.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <Bell className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-sm">Er zijn momenteel geen mededelingen geplaatst.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {ann.isPinned && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                            Vastgezet
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300">
                          {ann.category || 'Nieuws'}
                        </span>
                        <h4 className="font-bold text-sm text-white">{ann.title}</h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => startEditAnnounce(ann)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Bewerken"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnnounce(ann.id, ann.title)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-900/40 transition-colors"
                          title="Verwijderen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">{ann.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STARTER SEED IMPORTER */}
      {activeTab === 'seed' && (
        <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-cyan-950/50 border border-cyan-800/50 text-cyan-400">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Chakra_Petch',sans-serif]">
                Starter Games & Mededelingen Importer
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Wil je TeiscoGames direct vullen met werkende open-source web games die gehost worden op GitHub Pages (zoals 2048, Hextris, Clumsy Bird, Tower Game en Pacman) en officiële welkomstberichten? Klik op de onderstaande knop om deze direct naar Firestore te schrijven.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {SEED_GAMES.map((g) => (
              <div key={g.title} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <img src={g.imageUrl} alt={g.title} className="w-12 h-10 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{g.title}</p>
                  <p className="text-[10px] text-cyan-400 truncate">{g.category}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Huidige status: <strong className="text-white">{games.length} games</strong> en <strong className="text-white">{announcements.length} mededelingen</strong> actief in database.
            </div>

            <button
              onClick={handleSeedDatabase}
              disabled={loading}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>{loading ? 'Bezig met importeren...' : 'Importeer Starter Games & Berichten Nu'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
