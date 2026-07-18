import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LockKeyhole, 
  User, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Building, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { User as UserType } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: UserType) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      setError('Please fill in all security fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usernameOrEmail, password })
      });

      if (res.ok) {
        const data = await res.json();
        onLoginSuccess(data.user);
      } else {
        const data = await res.json();
        setError(data.error || 'Access Denied. Please verify credentials.');
      }
    } catch (err) {
      console.error('Login system fault:', err);
      setError('Monolith security gateway timeout. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {/* Enterprise Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-4 shadow-inner">
            <Building className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            AETHERIS MONOLITH
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-semibold tracking-wider uppercase">
            Unified Core ERP Systems Gateway
          </p>
        </div>

        {/* Primary Auth Container */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Gateway SSL Active
          </div>

          <h2 className="text-lg font-bold text-white mb-1">Sign In</h2>
          <p className="text-xs text-slate-400 mb-6">Access secure operations & financial ledgers.</p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl mb-5 flex items-start gap-2.5 text-xs text-red-300 leading-relaxed"
            >
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Security Challenge Failed</p>
                <p className="text-[11px] opacity-90 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username/Email Input */}
            <div>
              <label htmlFor="usernameOrEmail" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Username or Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4.5 h-4.5" />
                </div>
                <input
                  id="usernameOrEmail"
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="e.g. pendragon or admin@enterprise.com"
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-hidden transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Password Credential
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <LockKeyhole className="w-4.5 h-4.5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-slate-500 outline-hidden transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-indigo-500/25 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate Session
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Corporate compliance notes */}
        <div className="text-center text-[10px] text-slate-500 space-y-1 mt-6">
          <p>© 2026 Aetheris Monolith Ltd. All rights reserved.</p>
          <p>Authorized access only. Audit logs continuously compiled & processed under SEC rules.</p>
        </div>
      </motion.div>
    </div>
  );
}
