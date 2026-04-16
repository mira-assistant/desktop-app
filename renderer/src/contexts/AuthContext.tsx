
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@shared/api/client';
import { authApi } from '@/lib/api/auth';
import { AuthTokens, LoginCredentials, RegisterData } from '@/types/auth.types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  saveTokens: (newTokens: AuthTokens) => void;
  /** Current access token for WebSocket auth (prefers React state, then Electron keychain). */
  getAccessToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const tokensRef = useRef<AuthTokens | null>(null);
  tokensRef.current = tokens;

  // Setup axios interceptors once; read tokens from tokensRef so Authorization is never stale.
  useEffect(() => {
    const requestIntercept = api.interceptors.request.use(
      (config) => {
        const t = tokensRef.current;
        if (t?.accessToken) {
          config.headers.Authorization = `Bearer ${t.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const t = tokensRef.current;

        // If 401 and we haven't retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry && t?.refreshToken) {
          originalRequest._retry = true;

          try {
            // Use authApi to refresh
            const refreshResponse = await authApi.refresh(t.refreshToken);

            const newTokens: AuthTokens = {
              accessToken: refreshResponse.access_token,
              refreshToken: refreshResponse.refresh_token || t.refreshToken,
            };

            // Store new tokens in Electron keychain
            if (window.electronAPI) {
              await window.electronAPI.storeTokens(newTokens.accessToken, newTokens.refreshToken);
            }

            setTokens(newTokens);
            setIsAuthenticated(true);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return api(originalRequest);
          } catch (_refreshError) {
            // Refresh failed, clear everything
            console.error('Token refresh failed, logging out');

            // Clear tokens from keychain
            if (window.electronAPI) {
              await window.electronAPI.clearTokens();
            }

            // Clear state
            setTokens(null);
            setIsAuthenticated(false);

            return Promise.reject(_refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, []);

  // Initialize auth state on mount - verify tokens with refresh
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.getTokens();

          if (result.success && result.tokens?.accessToken && result.tokens?.refreshToken) {
            try {
              // Verify tokens by attempting refresh
              const refreshResponse = await authApi.refresh(result.tokens.refreshToken);

              const newTokens: AuthTokens = {
                accessToken: refreshResponse.access_token,
                refreshToken: refreshResponse.refresh_token || result.tokens.refreshToken,
              };

              // Store refreshed tokens
              await window.electronAPI.storeTokens(newTokens.accessToken, newTokens.refreshToken);

              // Set authenticated state
              setTokens(newTokens);
              setIsAuthenticated(true);

              console.log('Authentication verified');
            } catch (_refreshError) {
              // Tokens are invalid, clear them
              console.error('Token verification failed, clearing tokens');
              await window.electronAPI.clearTokens();
              setTokens(null);
              setIsAuthenticated(false);
            }
          } else {
            // No tokens found
            console.log('No stored tokens found');
            setIsAuthenticated(false);
          }
        } else {
          // Not in Electron environment
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
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
      setIsAuthenticated(true);

      console.log('Logged in successfully');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Login failed');
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
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
      setIsAuthenticated(true);

      console.log('Registered successfully');
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Registration failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Clear tokens from Electron keychain
      if (window.electronAPI) {
        await window.electronAPI.clearTokens();
      }

      setTokens(null);
      setIsAuthenticated(false);

      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const saveTokens = useCallback((newTokens: AuthTokens) => {
    setTokens(newTokens);
    setIsAuthenticated(true);
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (tokens?.accessToken) return tokens.accessToken;
    if (window.electronAPI) {
      const r = await window.electronAPI.getTokens();
      if (r.success && r.tokens?.accessToken) return r.tokens.accessToken;
    }
    return null;
  }, [tokens?.accessToken]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        saveTokens,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}