import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { TokenStorage } from './auth/token-storage';
import { startWebhookServer, stopWebhookServer } from './webhook-server';
import { handleGoogleOAuth, handleGitHubOAuth } from './auth/oauth-handler';

const WEBHOOK_PORT = 4280;
let webhookUrl: string;

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Start webhook server FIRST
  webhookUrl = startWebhookServer(WEBHOOK_PORT, mainWindow);

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/out/index.html'));
  }

  // Send webhook URL to renderer once it's ready
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[MAIN PROCESS] Window loaded, webhook ready');
  });
}

ipcMain.handle('get-webhook-url', () => {
  console.log(`[MAIN PROCESS] Renderer requested webhook URL: ${webhookUrl}`);
  return webhookUrl;
});

// IPC Handlers for token storage
ipcMain.handle('auth:store-tokens', async (_, accessToken: string, refreshToken: string) => {
  try {
    await TokenStorage.storeTokens(accessToken, refreshToken);
    return { success: true };
  } catch (error: any) {
    console.error('Error in auth:store-tokens handler:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:get-tokens', async () => {
  try {
    const tokens = await TokenStorage.getTokens();
    return { success: true, tokens };
  } catch (error: any) {
    console.error('Error in auth:get-tokens handler:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:clear-tokens', async () => {
  try {
    await TokenStorage.clearTokens();
    return { success: true };
  } catch (error: any) {
    console.error('Error in auth:clear-tokens handler:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:has-tokens', async () => {
  try {
    const hasTokens = await TokenStorage.hasTokens();
    return { success: true, hasTokens };
  } catch (error: any) {
    console.error('Error in auth:has-tokens handler:', error);
    return { success: false, error: error.message };
  }
});

// OAuth handlers
ipcMain.handle('auth:google-oauth', async () => {
  try {
    const result = await handleGoogleOAuth();
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Google OAuth handler error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:github-oauth', async () => {
  try {
    const code = await handleGitHubOAuth();
    return { success: true, code };
  } catch (error: any) {
    console.error('GitHub OAuth handler error:', error);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Cleanup on app close
app.on('before-quit', () => {
  console.log('[MAIN PROCESS] Shutting down webhook server...');
  stopWebhookServer();

  if (mainWindow) {
    mainWindow.webContents.send('app-closing');
  }
});