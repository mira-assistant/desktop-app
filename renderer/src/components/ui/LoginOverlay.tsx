'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api/auth';

export default function LoginOverlay() {
  const { login, register, saveTokens } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await register({ email, password });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!window.electronAPI) {
      setError('OAuth not available in browser mode');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await window.electronAPI.loginWithGoogle();

      if (!result.success || !result.data) {
        throw new Error('Google OAuth failed');
      }

      const { code, state } = result.data;
      const response = await authApi.googleCallback(code, state);

      if (window.electronAPI) {
        await window.electronAPI.storeTokens(response.access_token, response.refresh_token);
      }

      saveTokens({ accessToken: response.access_token, refreshToken: response.refresh_token });
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    if (!window.electronAPI) {
      setError('OAuth not available in browser mode');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await window.electronAPI.loginWithGitHub();

      if (!result.success || !result.code) {
        throw new Error('GitHub OAuth failed');
      }

      const response = await authApi.gitHubExchange(result.code);

      if (window.electronAPI) {
        await window.electronAPI.storeTokens(response.access_token, response.refresh_token);
      }

      saveTokens({ accessToken: response.access_token, refreshToken: response.refresh_token });
    } catch (err: any) {
      setError(err.message || 'GitHub login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#00ff88]/10 via-[#00cc6a]/5 to-[#80ffdb]/10 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_70px_rgba(0,255,136,0.15)] p-8 w-full max-w-md border border-[#80ffdb]/20"
      >
        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#00ff88] to-[#00cc6a] rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-[#80ffdb] to-[#00ff88] rounded-full blur-3xl opacity-20" />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8 relative z-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00ff88] to-[#00cc6a] rounded-2xl mb-4 shadow-lg shadow-[#00ff88]/30">
            <i className="fas fa-microphone-alt text-2xl text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00cc6a] to-[#00ff88] bg-clip-text text-transparent">
            Welcome to Mira
          </h1>
          <p className="text-sm text-[#6b7280] mt-2">Your intelligent voice assistant</p>
        </motion.div>

        {/* Forms */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {isLoginMode ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="block mb-2 text-sm font-semibold text-[#1f2937]">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-[#1f2937]">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00ff88]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-circle-notch fa-spin" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div>
                  <label className="block mb-2 text-sm font-semibold text-[#1f2937]">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-[#1f2937]">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-[#1f2937]">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00ff88]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-circle-notch fa-spin" />
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200 flex items-center gap-2">
                  <i className="fas fa-exclamation-circle" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center text-sm text-[#6b7280]">
            {isLoginMode ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
              }}
              disabled={loading}
              className="ml-2 text-[#00cc6a] font-semibold hover:text-[#00ff88] transition-colors disabled:opacity-50"
            >
              {isLoginMode ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e7eb]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white/95 text-[#9ca3af] font-medium">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <motion.button
              onClick={handleGoogleLogin}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 bg-white border border-[#e5e7eb] rounded-xl font-medium text-[#1f2937] hover:bg-[#f9fafb] hover:border-[#d1d5db] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? 'Connecting...' : 'Continue with Google'}
            </motion.button>

            <motion.button
              onClick={handleGitHubLogin}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 bg-[#24292e] text-white rounded-xl font-medium hover:bg-[#1a1e22] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
            >
              <i className="fab fa-github text-lg" />
              {loading ? 'Connecting...' : 'Continue with GitHub'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}