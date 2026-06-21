import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Shield, Lock, User, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (localStorage.getItem('isAdmin') === 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both administrative credentials.');
      return;
    }

    setLoading(true);
    const loginToast = toast.loading('Verifying security keys...');

    try {
      // Direct local credentials check as specified by simple authentication rules
      // Combined with an optional endpoint trigger for synchronicity with Apps Script database
      const isLocalAuth = username.trim() === 'banishwor' && password === 'B@nishwor1';
      
      let isRemoteAuth = false;
      try {
        const response = await apiService.login(username.trim(), password);
        if (response && response.success) {
          isRemoteAuth = true;
        }
      } catch (err) {
        console.warn('API authentication skipped or failed:', err);
      }

      if (isLocalAuth || isRemoteAuth) {
        localStorage.setItem('isAdmin', 'true');
        toast.success(`Welcome back, Administrator ${username}!`, { id: loginToast });
        navigate('/admin');
      } else {
        throw new Error('Invalid administrative username or verification password.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Verification failed. Please check credentials.', { id: loginToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-page-wrapper" className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gray-50/50 dark:bg-zinc-950 px-4 transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <div id="login-card" className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 p-8 rounded-3xl shadow-xl space-y-6 relative z-10">
        
        {/* Card Header logo description */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 rounded-2xl flex items-center justify-center shadow-inner">
            <Shield id="admin-shield" className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
            Administrative Core Sign-In
          </h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed max-w-xs mx-auto">
            Authorized genealogy managers can sign in here to manage members, upload pictures, and synchronize database branches.
          </p>
        </div>

        {/* Credentials Form Box */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label htmlFor="login-username" className="text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">
              Admin Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/80 rounded-xl text-xs font-semibold placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-sans"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">
              Authorization Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password key"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/80 rounded-xl text-xs font-semibold placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-sans"
              />
            </div>
          </div>

          {/* Action button */}
          <button
            id="btn-login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs transition-all tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Credentials Key...
              </>
            ) : (
              'Verify & Access admin panel'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
