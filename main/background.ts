import './env';
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { assertBackendMajorCompatible, configureSilentAutoUpdates } from './updater';
import { api } from '../shared/api/client';
import { ENDPOINTS } from '../shared/api/constants';
import { TokenStorage } from './auth/token-storage';
import { handleGoogleOAuth, handleGitHubOAuth } from './auth/oauth-handler';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;
let currentClientName: string | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../renderer/dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function deregisterClient(): Promise<void> {
  if (!currentClientName) {
    console.log('No client to deregister');
    return;
  }

  try {
    const accessToken = await TokenStorage.getAccessToken();
    if (!accessToken) return;

    console.log(`Deregistering client: ${currentClientName}`);

    await api.delete(ENDPOINTS.SERVICE_CLIENTS + `/${encodeURIComponent(currentClientName)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 5000,
    });
  } catch (error: any) {
    console.error('Failed to deregister client:', error.message);
  }
}

ipcMain.handle('auth:store-tokens', async (_, accessToken: string, refreshToken: string) => {
  try {
    await TokenStorage.storeTokens(accessToken, refreshToken);
    return { success: true };
  } catch (error: any) {
    console.error('[IPC] Error storing tokens:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:get-tokens', async () => {
  try {
    const tokens = await TokenStorage.getTokens();
    return { success: true, tokens };
  } catch (error: any) {
    console.error('[IPC] Error getting tokens:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:clear-tokens', async () => {
  try {
    await TokenStorage.clearTokens();
    return { success: true };
  } catch (error: any) {
    console.error('[IPC] Error clearing tokens:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:has-tokens', async () => {
  try {
    const hasTokens = await TokenStorage.hasTokens();
    return { success: true, hasTokens };
  } catch (error: any) {
    console.error('[IPC] Error checking tokens:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:google-oauth', async () => {
  try {
    const result = await handleGoogleOAuth();
    return { success: true, data: result };
  } catch (error: any) {
    console.error('[IPC] Google OAuth error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:github-oauth', async () => {
  try {
    const code = await handleGitHubOAuth();
    return { success: true, code };
  } catch (error: any) {
    console.error('[IPC] GitHub OAuth error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('client:store-name', async (_, clientName: string) => {
  try {
    await TokenStorage.storeClientName(clientName);
    currentClientName = clientName;
    console.log(`[IPC] Client name stored: ${clientName}`);
    return { success: true };
  } catch (error: any) {
    console.error('[IPC] Error storing client name:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('client:get-name', async () => {
  try {
    const clientName = await TokenStorage.getClientName();
    if (clientName) {
      currentClientName = clientName;
    }
    return { success: true, clientName };
  } catch (error: any) {
    console.error('[IPC] Error getting client name:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('client:deregister', async () => {
  await deregisterClient();
});

app.whenReady().then(async () => {
  const backendOk = await assertBackendMajorCompatible();
  if (!backendOk) {
    app.quit();
    return;
  }

  configureSilentAutoUpdates();
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

app.on('before-quit', async (event) => {
  event.preventDefault();

  const forceQuitTimeout = setTimeout(() => {
    console.warn('Cleanup timed out, forcing exit...');
    app.exit(0);
  }, 4000);

  try {
    await deregisterClient();

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('app-closing');
    }
  } catch (e) {
    console.error('Error during cleanup:', e);
  } finally {
    clearTimeout(forceQuitTimeout);
    console.log('Cleanup complete, quitting.');
    app.exit(0);
  }
});
