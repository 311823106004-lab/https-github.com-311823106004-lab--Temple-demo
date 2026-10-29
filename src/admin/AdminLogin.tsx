import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Flame, ArrowLeft, KeyRound } from 'lucide-react';
import { loginAdmin } from '../services/api';
import { AdminUser } from '../types';

interface AdminLoginProps {
  onSuccess: (admin: AdminUser) => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToSite }) => {
  const [email, setEmail] = useState('admin@sriamman.org');
  const [password, setPassword] = useState('Amman@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginAdmin(email, password);
      onSuccess(data.admin);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@sriamman.org');
    setPassword('Amman@2026');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background sacred ambient glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-indigo-900/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top back button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Temple Website</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-800 to-amber-600 border-2 border-amber-400 shadow-xl shadow-purple-950/50">
            <Flame className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-white tracking-wide">
              Temple Admin Portal
            </h2>
            <p className="text-xs text-amber-300 mt-1 font-medium">
              Sri Amman Temple • Administrative Management
            </p>
          </div>
        </div>

        <div className="mt-8 bg-slate-900 border border-purple-500/30 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-700/60 text-xs text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Email ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:bg-slate-800 transition-colors"
                  placeholder="admin@sriamman.org"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:bg-slate-800 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure Admin Login</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Quick-Fill Helper */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-2">
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Credentials: <strong>admin@sriamman.org</strong> / <strong>Amman@2026</strong></span>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline"
            >
              Autofill Demo Admin Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
