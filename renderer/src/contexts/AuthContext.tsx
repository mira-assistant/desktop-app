'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { User, AuthTokens, LoginCredentials, RegisterData } from '@/types/auth.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Setup axios interceptors
  useEffect(() => {
    const requestIntercept = api.interceptors.request.use(
      (config) => {
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && tokens?.refreshToken) {
          originalRequest._retry = true;

          try {
            const { data } = await api.post('/auth/refresh', {
              refresh_token: tokens.refreshToken,
            });

            const newTokens: AuthTokens = {
              accessToken: data.access_token,
              refreshToken: data.refresh_token || tokens.refreshToken,
            };

            // Store new tokens in Electron
            if (window.electronAPI) {
              await window.electronAPI.storeTokens(newTokens.accessToken, newTokens.refreshToken);
            }

            setTokens(newTokens);
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

            return api(originalRequest);
          } catch (refreshError) {
            await logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, [tokens]);

  // Initialize auth state on mount - load tokens from Electron
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.getTokens();

          if (result.success && result.tokens?.accessToken && result.tokens?.refreshToken) {
            setTokens({
              accessToken: result.tokens.accessToken,
              refreshToken: result.tokens.refreshToken,
            });

            // TODO: Optionally fetch user data from API
            // const { data } = await api.get('/auth/me');
            // setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Handle app closing - clear tokens if needed
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onAppClosing(() => {
        // Optionally clear tokens on app close
        // window.electronAPI.clearTokens();
      });
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);

      const newTokens: AuthTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      };

      // Store tokens in Electron keychain
      if (window.electronAPI) {
        const result = await window.electronAPI.storeTokens(newTokens.accessToken, newTokens.refreshToken);
        if (!result.success) {
          throw new Error('Failed to securely store tokens');
        }
      }

      setTokens(newTokens);
      setUser(data.user);

      router.push('/');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register', data);

      const newTokens: AuthTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
      };

      // Store tokens in Electron keychain
      if (window.electronAPI) {
        const result = await window.electronAPI.storeTokens(newTokens.accessToken, newTokens.refreshToken);
        if (!result.success) {
          throw new Error('Failed to securely store tokens');
        }
      }

      setTokens(newTokens);
      setUser(response.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  }, [router]);

  const logout = useCallback(async () => {
    // Clear tokens from Electron keychain
    if (window.electronAPI) {
      await window.electronAPI.clearTokens();
    }

    setTokens(null);
    setUser(null);
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!tokens,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}