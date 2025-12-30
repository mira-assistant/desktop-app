import { api } from './client';
import { LoginCredentials, RegisterData, AuthResponse } from '../../types/auth.types';

export const authApi = {
  /**
   * Login with username/email and password
   * POST /api/v2/auth/login
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      username: credentials.username,  // Can be username OR email
      password: credentials.password,
    });
    return data;
  },

  /**
   * Register new user
   * POST /api/v2/auth/register
   */
  register: async (registerData: RegisterData): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
    });
    return data;
  },

  /**
   * Refresh access token
   * POST /api/v2/auth/refresh
   */
  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  },

  /**
   * Get Google OAuth URL
   * GET /api/v2/auth/google/url
   */
  getGoogleOAuthUrl: async (redirectPort: number = 4280): Promise<{ url: string; state: string }> => {
    const { data } = await api.get<{ url: string; state: string }>('/auth/google/url', {
      params: { redirect_port: redirectPort },
    });
    return data;
  },

  /**
   * Exchange Google OAuth code for tokens
   * POST /api/v2/auth/google/callback
   */
  googleCallback: async (code: string, state: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/google/callback', {
      code,
      state,
    });
    return data;
  },

  /**
   * Get GitHub OAuth URL
   * GET /api/v2/auth/github/url
   */
  getGitHubOAuthUrl: async (redirectPort: number = 4280): Promise<{ url: string; state: string }> => {
    const { data } = await api.get<{ url: string; state: string }>('/auth/github/url', {
      params: { redirect_port: redirectPort },
    });
    return data;
  },

  /**
   * Exchange GitHub OAuth code for tokens
   * POST /api/v2/auth/github/exchange
   */
  gitHubExchange: async (code: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/github/exchange', {
      code,
    });
    return data;
  },
};