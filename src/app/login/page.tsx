'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginAction } from '@/actions/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await loginAction({ username, password });

      if (res.success) {
        if (res.role === 'SALES') {
          router.push('/admin/leads');
        } else {
          router.push('/admin');
        }
        router.refresh();
      } else {
        setError(res.error || 'Невірні дані');
      }
    } catch (err) {
      setError('Сталася помилка. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#C4A47C]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#C4A47C]/5 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C4A47C]/20 to-black border border-[#C4A47C]/30 mb-6"
          >
            <Lock className="text-[#C4A47C]" size={28} />
          </motion.div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Admin Portal</h1>
          <p className="text-white/40 mt-2 text-xs uppercase tracking-widest font-bold">Введіть дані для доступу</p>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Subtle line effect */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C4A47C]/50 to-transparent opacity-50" />

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-bold text-white/50 ml-1">Логін</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#C4A47C] text-white/20">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-white/[0.02] border border-white/10 rounded-2xl focus:ring-1 focus:ring-[#C4A47C]/30 focus:border-[#C4A47C] transition-all outline-none text-sm"
                  placeholder="Ваш логін"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-bold text-white/50 ml-1">Пароль</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#C4A47C] text-white/20">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-4 bg-white/[0.02] border border-white/10 rounded-2xl focus:ring-1 focus:ring-[#C4A47C]/30 focus:border-[#C4A47C] transition-all outline-none text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#C4A47C] to-[#a6865b] hover:from-[#d9b78c] hover:to-[#C4A47C] text-black font-bold uppercase tracking-widest text-xs rounded-2xl transition-all shadow-[0_10px_20px_-10px_rgba(196,164,124,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin text-black" size={16} /> : 'Увійти в систему'}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-white/20 text-[10px] uppercase tracking-widest font-bold">
          &copy; 2026 Victoria MC. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
