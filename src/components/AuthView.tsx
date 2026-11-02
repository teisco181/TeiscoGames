import React, { useState } from 'react';
import { Gamepad2, Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';

export const AuthView: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, error, clearError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalMessage(null);

    if (!email || !password) {
      setLocalMessage('Vul alle verplichte velden in.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setLocalMessage('Het wachtwoord moet minimaal 6 tekens lang zijn.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, displayName);
      }
    } catch {
      // Handled by AuthContext error state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    setLocalMessage(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-['Outfit',sans-serif]">
      {/* Background neon visual ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-purple-950/60 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.25)] mb-4">
          <Gamepad2 className="w-8 h-8 text-cyan-400 animate-pulse" />
          <span className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300 font-['Chakra_Petch',sans-serif]">
            TEISCO<span className="text-purple-400">GAMES</span>
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
          {mode === 'login' ? 'Inloggen op het Gaming Netwerk' : 'Nieuw Gamer Account Aanmaken'}
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
          Centraal account voor games, realtime aankondigingen en admin beheer
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative z-10">
        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800/80 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              clearError();
              setLocalMessage(null);
            }}
            className={`py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inloggen
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              clearError();
              setLocalMessage(null);
            }}
            className={`py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === 'register'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Registreren
          </button>
        </div>

        {/* Error notification */}
        {(error || localMessage) && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Fout bij authenticatie</p>
              <p>{error || localMessage}</p>
            </div>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-white font-medium text-sm transition-all duration-200 shadow-md group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>
            {mode === 'login' ? 'Inloggen met Google' : 'Registreren met Google'}
          </span>
        </button>

        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-slate-800"></div>
          <span className="px-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">
            of met e-mail
          </span>
          <div className="flex-1 border-t border-slate-800"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Spelersnaam / Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Bijv. CyberGamer99"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-mailadres
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jouw.email@domein.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Wachtwoord
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                title={showPassword ? 'Verberg' : 'Toon'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'login'
                ? 'bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/25'
                : 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/25'
            }`}
          >
            <span>{isSubmitting ? 'Bezig met verwerken...' : mode === 'login' ? 'Direct Inloggen' : 'Account Creëren'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo / Admin Help Note */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/30 text-[11px] text-cyan-200">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-cyan-300">Beheerderstoegang:</span>
              <p className="text-cyan-200/80 mt-0.5">
                Het account met e-mail <code className="bg-black/40 px-1 py-0.5 rounded text-cyan-300 font-mono">teisco181@gmail.com</code> heeft automatisch de rol <span className="font-bold text-purple-300">admin</span>. Andere accounts starten met de rol <span className="font-bold text-slate-300">user</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature highlights below auth card */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 relative z-10">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Webgames via GitHub Pages
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          Beveiligd met Firebase Auth & Firestore
        </span>
      </div>
    </div>
  );
};
