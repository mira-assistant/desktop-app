import { useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api/auth';

const glassInput =
  'w-full rounded-xl border border-white/15 bg-black/25 px-3.5 py-2.5 text-sm text-white shadow-inner shadow-black/20 placeholder:text-white/40 backdrop-blur-sm transition-[border-color,background-color,box-shadow,opacity] duration-200 focus:border-[#00ff88]/50 focus:bg-black/35 focus:outline-none focus:ring-2 focus:ring-[#00ff88]/25 disabled:cursor-not-allowed disabled:opacity-40';

export default function LoginOverlay() {
  const { login, register, saveTokens } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /** Pixel height of forms + error block so the card can resize smoothly (layout prop is unreliable with AnimatePresence "wait"). */
  const authBlockRef = useRef<HTMLDivElement>(null);
  const [authBlockHeightPx, setAuthBlockHeightPx] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = authBlockRef.current;
    if (!el) return;

    const measure = () => {
      setAuthBlockHeightPx(el.scrollHeight);
    };

    measure();
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isLoginMode, error, loading]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login({ email, password });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google login failed');
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'GitHub login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-4 py-8">
      {/* Backdrop: depth + accent wash + glass blur */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-[#071218] to-[#041510]" aria-hidden />
      <div
        className="absolute inset-0 opacity-90 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(0,255,136,0.22),transparent_55%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_100%_20%,rgba(0,204,106,0.14),transparent_45%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(128,255,219,0.08),transparent_40%)]"
        aria-hidden
      />
      <div className="absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-[#00ff88]/12 blur-[100px]" aria-hidden />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#00cc6a]/10 blur-[110px]" aria-hidden />
      <div className="absolute inset-0 backdrop-blur-xl" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative w-full max-w-[420px] rounded-2xl border border-white/20 bg-white/8 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.06)_inset] ring-1 ring-[#00ff88]/10 backdrop-blur-2xl"
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-b from-white/12 to-transparent opacity-60"
          aria-hidden
        />

        <div className="relative mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#00ff88]/35 bg-linear-to-br from-[#00ff88]/25 to-[#00cc6a]/10 shadow-[0_0_32px_rgba(0,255,136,0.2)] backdrop-blur-md">
            <i className="fas fa-microphone-alt text-2xl text-[#b8ffe0]" aria-hidden />
          </div>
          <h1 className="bg-linear-to-r from-white via-[#e8fff4] to-[#7dffb8] bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
            Welcome to Mira
          </h1>
          <p className="mt-2 text-sm text-white/55">Sign in to your intelligent voice workspace</p>
        </div>

        <div className="relative">
          <div
            className="overflow-hidden"
            style={{
              height: authBlockHeightPx === null ? undefined : authBlockHeightPx,
              transitionProperty:
                prefersReducedMotion || authBlockHeightPx === null ? 'none' : 'height',
              transitionDuration: prefersReducedMotion ? '0.01ms' : '0.42s',
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div ref={authBlockRef}>
              <AnimatePresence mode="popLayout" initial={false}>
            {isLoginMode ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium text-[#9fe8c9]/90">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    required
                    disabled={loading}
                    className={glassInput}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium text-[#9fe8c9]/90">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    required
                    disabled={loading}
                    className={glassInput}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-linear-to-r from-[#00e070] to-[#00b359] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(0,255,136,0.25)] transition-[filter,box-shadow,opacity] hover:brightness-110 hover:shadow-[0_0_32px_rgba(0,255,136,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-circle-notch fa-spin" aria-hidden />
                      Signing in…
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="register-email" className="mb-1.5 block text-xs font-medium text-[#9fe8c9]/90">
                    Email
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    required
                    disabled={loading}
                    className={glassInput}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="register-password" className="mb-1.5 block text-xs font-medium text-[#9fe8c9]/90">
                    Password
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    name="password"
                    required
                    disabled={loading}
                    className={glassInput}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label
                    htmlFor="register-confirm"
                    className="mb-1.5 block text-xs font-medium text-[#9fe8c9]/90"
                  >
                    Confirm password
                  </label>
                  <input
                    id="register-confirm"
                    type="password"
                    name="confirmPassword"
                    required
                    disabled={loading}
                    className={glassInput}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-linear-to-r from-[#00e070] to-[#00b359] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(0,255,136,0.25)] transition-[filter,box-shadow,opacity] hover:brightness-110 hover:shadow-[0_0_32px_rgba(0,255,136,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-circle-notch fa-spin" aria-hidden />
                      Creating account…
                    </span>
                  ) : (
                    'Create account'
                  )}
                </button>
              </motion.form>
            )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {error ? (
                  <motion.div
                    key="auth-error"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-2 rounded-xl border border-red-400/35 bg-red-500/15 px-3 py-2.5 text-sm text-red-100 backdrop-blur-sm">
                      <i className="fas fa-exclamation-circle mt-0.5 shrink-0 text-red-300" aria-hidden />
                      <span>{error}</span>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-white/50">
            {isLoginMode ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
              }}
              disabled={loading}
              className="font-semibold text-[#7dffb8] transition-colors hover:text-[#a8ffcc] disabled:opacity-50"
            >
              {isLoginMode ? 'Create one' : 'Sign in instead'}
            </button>
          </p>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 font-medium text-white/45 backdrop-blur-md">
                Or continue with
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white/90 shadow-sm backdrop-blur-md transition-[background-color,border-color,box-shadow] hover:border-white/25 hover:bg-white/15 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
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
              {loading ? 'Connecting…' : 'Google'}
            </button>

            <button
              type="button"
              onClick={handleGitHubLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/35 px-4 py-2.5 text-sm font-medium text-white/95 backdrop-blur-md transition-[background-color,border-color,box-shadow] hover:border-white/20 hover:bg-black/45 hover:shadow-[0_0_24px_rgba(0,255,136,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <i className="fab fa-github text-lg" aria-hidden />
              {loading ? 'Connecting…' : 'GitHub'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
