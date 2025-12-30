export interface ElectronAPI {
    storeTokens: (accessToken: string, refreshToken: string) => Promise<{ success: boolean; error?: string }>;
    getTokens: () => Promise<{ success: boolean; tokens?: { accessToken: string | null; refreshToken: string | null }; error?: string }>;
    clearTokens: () => Promise<{ success: boolean; error?: string }>;
    hasTokens: () => Promise<{ success: boolean; hasTokens?: boolean; error?: string }>;
    onAppClosing: (callback: () => void) => void;
  }

  declare global {
    interface Window {
      electronAPI?: ElectronAPI;
    }
  }