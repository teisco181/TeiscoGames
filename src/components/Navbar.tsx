import React from 'react';
import { Gamepad2, Shield, User as UserIcon, LogOut, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';

interface NavbarProps {
  activeTab: 'games' | 'announcements' | 'admin';
  setActiveTab: (tab: 'games' | 'announcements' | 'admin') => void;
  onOpenProfile: () => void;
  announcementCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  announcementCount,
}) => {
  const { userProfile, user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/20 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <div
            onClick={() => setActiveTab('games')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/20 border border-cyan-500/40 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300">
              <Gamepad2 className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 font-['Chakra_Petch',sans-serif]">
                  TEISCO<span className="text-purple-400">GAMES</span>
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  NETWORK
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
                Centraal Web Game Portaal
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('games')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'games'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Games</span>
            </button>

            <button
              onClick={() => setActiveTab('announcements')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                activeTab === 'announcements'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Mededelingen</span>
              {announcementCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                  {announcementCount}
                </span>
              )}
            </button>

            {/* Admin Panel Button (Exclusive for Admins) */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-200 border border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                    : 'bg-purple-950/40 text-purple-300 hover:text-white hover:bg-purple-900/50 border border-purple-800/40'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Admin Panel</span>
                <span className="hidden md:inline-flex items-center text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-400/30">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5 text-yellow-300" />
                  Beheer
                </span>
              </button>
            )}
          </nav>

          {/* User profile & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/60 hover:border-cyan-500/50 transition-all duration-200 group text-left"
              title="Bekijk profiel"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={userProfile?.displayName || 'Avatar'}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-cyan-500/40 group-hover:ring-cyan-400"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-indigo-700 flex items-center justify-center font-bold text-xs text-white ring-2 ring-cyan-500/30">
                  {userProfile?.displayName?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
                </div>
              )}

              <div className="hidden lg:block">
                <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors max-w-[120px] truncate">
                  {userProfile?.displayName || 'Gamer'}
                </p>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                      isAdmin
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {isAdmin ? 'Admin' : 'Speler'}
                  </span>
                </div>
              </div>
            </button>

            <button
              onClick={() => logout()}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-200 border border-red-900/40 transition-colors text-xs font-medium flex items-center gap-1.5"
              title="Uitloggen"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Uitloggen</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
