'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api/auth';

export default function LoginOverlay() {
  const { login, register, setTokensAndUser } = useAuth();
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
      // Open OAuth window in main process
      const result = await window.electronAPI.loginWithGoogle();

      if (!result.success || !result.data) {
        throw new Error('Google OAuth failed');
      }

      const { code, state } = result.data;

      // Exchange code for tokens
      const response = await authApi.googleCallback(code, state);

      // Store tokens
      if (window.electronAPI) {
        await window.electronAPI.storeTokens(response.access_token, response.refresh_token);
      }

      // Update auth context
      setTokensAndUser(
        { accessToken: response.access_token, refreshToken: response.refresh_token }
      );

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
      // Open OAuth window in main process
      const result = await window.electronAPI.loginWithGitHub();

      if (!result.success || !result.code) {
        throw new Error('GitHub OAuth failed');
      }

      // Exchange code for tokens
      const response = await authApi.gitHubExchange(result.code);

      // Store tokens
      if (window.electronAPI) {
        await window.electronAPI.storeTokens(response.access_token, response.refresh_token);
      }

      // Update auth context
      setTokensAndUser(
        { accessToken: response.access_token, refreshToken: response.refresh_token }
      );

    } catch (err: any) {
      setError(err.message || 'GitHub login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md">
      {/* Frosted Glass Container */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-10 w-full max-w-md border border-white/20">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <i className="fas fa-microphone-alt text-4xl text-[#667eea]" />
            <h1 className="text-4xl font-bold text-[#667eea]">Mira</h1>
          </div>
          <p className="text-sm text-gray-600">AI Voice Assistant</p>
        </div>

        {/* Login Form */}
        {isLoginMode ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#667eea] transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#667eea] transition-colors disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#667eea] transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#667eea] transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#667eea] transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#667eea] transition-colors disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-200">
            {error}
          </div>
        )}

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {isLoginMode ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError('');
            }}
            disabled={loading}
            className="ml-2 text-[#667eea] font-medium hover:underline disabled:opacity-50"
          >
            {isLoginMode ? 'Sign up' : 'Sign in'}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/90 text-gray-500">or continue with</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <i className="fab fa-google text-red-500" />
            {loading ? 'Connecting...' : 'Google'}
          </button>

          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="w-full py-3 bg-[#24292e] text-white rounded-lg font-medium hover:bg-[#1a1e22] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <i className="fab fa-github" />
            {loading ? 'Connecting...' : 'GitHub'}
          </button>
        </div>
      </div>
    </div>
  );
}