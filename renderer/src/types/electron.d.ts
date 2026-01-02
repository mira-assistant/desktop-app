export interface ElectronAPI {
  storeTokens: (accessToken: string, refreshToken: string) => Promise<{ success: boolean; error?: string }>;
  getTokens: () => Promise<{ success: boolean; tokens?: { accessToken: string | null; refreshToken: string | null }; error?: string }>;
  clearTokens: () => Promise<{ success: boolean; error?: string }>;
  hasTokens: () => Promise<{ success: boolean; hasTokens?: boolean; error?: string }>;
  onAppClosing: (callback: () => void) => void;
  getWebhookUrl: () => Promise<string>;
  onNewInteraction: (callback: (interaction: any) => void) => void;
  onServiceStatusChanged: (callback: (status: { enabled: boolean }) => void) => void;
  loginWithGoogle: () => Promise<{ success: boolean; data?: { code: string; state: string }; error?: string }>;
  loginWithGitHub: () => Promise<{ success: boolean; code?: string; error?: string }>;
  storeClientName: (clientName: string) => Promise<{ success: boolean; error?: string }>;
  getClientName: () => Promise<{ success: boolean; clientName?: string; error?: string }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}