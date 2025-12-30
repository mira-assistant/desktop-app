'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { authApi } from '@/lib/api/auth';
import { User, AuthTokens, LoginCredentials, RegisterData } from '@/types/auth.types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setTokensAndUser: (newTokens: AuthTokens) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
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

        // If 401 and we haven't retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry && tokens?.refreshToken) {
          originalRequest._retry = true;

          try {
            // Use authApi to refresh
            const refreshResponse = await authApi.refresh(tokens.refreshToken);

            const newTokens: AuthTokens = {
              accessToken: refreshResponse.access_token,
              refreshToken: refreshResponse.refresh_token || tokens.refreshToken,
            };

            // Store new tokens in Electron keychain
            if (window.electronAPI) {
              await window.electronAPI.storeTokens(newTokens.accessToken, newTokens.refreshToken);
            }

            setTokens(newTokens);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
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
            // You could add a /auth/me endpoint and call it here
            // const userData = await authApi.me();
            // setUser(userData);
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

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      // Use authApi.login
      const response = await authApi.login(credentials);

      const newTokens: AuthTokens = {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      };

      // Store tokens in Electron keychain
      if (window.electronAPI) {
        const result = await window.electronAPI.storeTokens(
          newTokens.accessToken,
          newTokens.refreshToken
        );
        if (!result.success) {
          throw new Error('Failed to securely store tokens');
        }
      }

      setTokens(newTokens);

      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Login failed');
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      // Use authApi.register
      const response = await authApi.register(data);

      const newTokens: AuthTokens = {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      };

      // Store tokens in Electron keychain
      if (window.electronAPI) {
        const result = await window.electronAPI.storeTokens(
          newTokens.accessToken,
          newTokens.refreshToken
        );
        if (!result.success) {
          throw new Error('Failed to securely store tokens');
        }
      }

      setTokens(newTokens);

      router.push('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Registration failed');
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      // Clear tokens from Electron keychain
      if (window.electronAPI) {
        await window.electronAPI.clearTokens();
      }

      setTokens(null);

      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  const setTokensAndUser = useCallback((newTokens: AuthTokens) => {
    setTokens(newTokens);
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!tokens,
        isLoading,
        login,
        register,
        logout,
        setTokensAndUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}