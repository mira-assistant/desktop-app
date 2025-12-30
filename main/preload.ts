import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Token storage
  storeTokens: (accessToken: string, refreshToken: string) =>
    ipcRenderer.invoke('auth:store-tokens', accessToken, refreshToken),

  getTokens: () =>
    ipcRenderer.invoke('auth:get-tokens'),

  clearTokens: () =>
    ipcRenderer.invoke('auth:clear-tokens'),

  hasTokens: () =>
    ipcRenderer.invoke('auth:has-tokens'),

  // App lifecycle
  onAppClosing: (callback: () => void) =>
    ipcRenderer.on('app-closing', callback),

  getWebhookUrl: () => ipcRenderer.invoke('get-webhook-url'),

  onNewInteraction: (callback: (interaction: any) => void) =>
    ipcRenderer.on('new-interaction', (_, interaction) => callback(interaction)),
});