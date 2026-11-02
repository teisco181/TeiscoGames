import React, { useState } from 'react';
import { X, User, Mail, Shield, Calendar, LogOut, Check, Edit3, KeyRound, Clock, Trophy } from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';
import { GameItem } from '../types';
import { formatPlaytime } from '../utils/timeFormatters';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playtimes?: Record<string, number>;
  games?: GameItem[];
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  playtimes = {},
  games = [],
}) => {
  const { user, userProfile, isAdmin, updateDisplayName, logout } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userProfile?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await updateDisplayName(newName.trim());
      setIsEditingName(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Vandaag';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Vandaag';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-['Outfit',sans-serif]">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Header decoration */}
        <div className="h-24 bg-gradient-to-r from-cyan-600/30 via-purple-600/30 to-pink-600/30 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar badge floating */}
        <div className="px-6 relative -mt-12 flex items-end justify-between mb-4">
          <div className="relative">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={userProfile?.displayName || 'Avatar'}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-900 shadow-xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-600 to-purple-700 flex items-center justify-center text-2xl font-black text-white ring-4 ring-slate-900 shadow-xl font-['Chakra_Petch',sans-serif]">
                {userProfile?.displayName?.charAt(0).toUpperCase() || 'G'}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 p-1 rounded-lg ${
                isAdmin ? 'bg-purple-600 text-white' : 'bg-cyan-500 text-slate-950'
              } shadow-md`}
              title={isAdmin ? 'Beheerder' : 'Speler'}
            >
              <Shield className="w-3.5 h-3.5" />
            </span>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isAdmin
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            }`}
          >
            {isAdmin ? '🛡️ Beheerder (Admin)' : '🎮 Gamer (User)'}
          </span>
        </div>

        {/* Profile Content */}
        <div className="p-6 pt-2 space-y-5">
          {/* Display Name Edit */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Spelersnaam
              </label>
              {!isEditingName && (
                <button
                  onClick={() => {
                    setNewName(userProfile?.displayName || '');
                    setIsEditingName(true);
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  Wijzigen
                </button>
              )}
            </div>

            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-cyan-500 rounded-lg text-sm text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  Opslaan
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs"
                >
                  Annuleren
                </button>
              </form>
            ) : (
              <h2 className="text-xl font-bold text-white font-['Chakra_Petch',sans-serif]">
                {userProfile?.displayName || 'Geen naam ingesteld'}
              </h2>
            )}

            {success && (
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" /> Naam succesvol bijgewerkt
              </p>
            )}
          </div>

          {/* Account Details Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                E-mailadres
              </span>
              <span className="text-slate-200 font-mono text-[11px] truncate max-w-[200px]">
                {user?.email || 'Niet beschikbaar'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Lid sinds
              </span>
              <span className="text-slate-200 text-[11px]">
                {formatDate(userProfile?.createdAt)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                Authenticatie methode
              </span>
              <span className="text-slate-200 text-[11px] capitalize">
                {user?.providerData[0]?.providerId === 'google.com' ? 'Google Account' : 'E-mail / Wachtwoord'}
              </span>
            </div>
          </div>

          {/* Playtime Gaming Statistics Box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950/90 to-purple-950/30 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-['Chakra_Petch',sans-serif]">
                  Gaming Speeltijd Statistieken
                </span>
              </div>
              <span className="text-xs font-bold text-cyan-300 font-mono">
                {formatPlaytime(
                  Object.values(playtimes).reduce((acc, curr) => acc + (Number(curr) || 0), 0)
                )}
              </span>
            </div>

            {/* List of played games */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {Object.keys(playtimes).length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">
                  Nog geen games gespeeld. Open een game om de timer te starten!
                </p>
              ) : (
                Object.entries(playtimes)
                  .sort(([, a], [, b]) => b - a)
                  .map(([gameId, secs]) => {
                    const gameObj = games.find((g) => g.id === gameId);
                    const title = gameObj ? gameObj.title : gameId;
                    return (
                      <div
                        key={gameId}
                        className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800"
                      >
                        <span className="text-slate-300 truncate max-w-[170px] font-medium">
                          {title}
                        </span>
                        <span className="text-purple-300 font-mono font-semibold">
                          {formatPlaytime(secs)}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-red-900/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Uitloggen uit TeiscoGames</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
