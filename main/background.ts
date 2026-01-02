import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import axios from 'axios';
import { TokenStorage } from './auth/token-storage';
import { startWebhookServer, stopWebhookServer } from './webhook-server';
import { handleGoogleOAuth, handleGitHubOAuth } from './auth/oauth-handler';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const WEBHOOK_PORT = 4280;
let webhookUrl: string;
let currentClientName: string | null = null;

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
  console.log(`✅ Webhook server started: ${webhookUrl}`);

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

// Client name handlers
ipcMain.handle('client:store-name', async (_, clientName: string) => {
  try {
    await TokenStorage.storeClientName(clientName);
    currentClientName = clientName; // Track for cleanup
    return { success: true };
  } catch (error: any) {
    console.error('Error storing client name:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('client:get-name', async () => {
  try {
    const clientName = await TokenStorage.getClientName();
    if (clientName) {
      currentClientName = clientName; // Track for cleanup
    }
    return { success: true, clientName };
  } catch (error: any) {
    console.error('Error getting client name:', error);
    return { success: false, error: error.message };
  }
});

// Deregister client function
async function deregisterClient() {
  if (!currentClientName) {
    console.log('ℹ️  No client to deregister');
    return;
  }

  try {
    // Get access token
    const accessToken = await TokenStorage.getAccessToken();
    if (!accessToken) {
      console.log('ℹ️  No access token, skipping deregistration');
      return;
    }

    // Determine API URL
    const apiUrl = isDev
      ? 'http://localhost:8000/api/v1'
      : 'https://vyl7ozve5sbobqeg2hbiik3gzu0vqbio.lambda-url.us-east-1.on.aws/api/v1';

    console.log(`🚪 Deregistering client: ${currentClientName}`);

    // Call deregister endpoint
    await axios.delete(
      `${apiUrl}/service/clients/${encodeURIComponent(currentClientName)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 5000,
      }
    );

    console.log('✅ Client deregistered successfully');
  } catch (error: any) {
    console.error('❌ Failed to deregister client:', error.message);
  }
}

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
app.on('before-quit', async (event) => {
  console.log('🛑 App quitting, cleaning up...');

  // Prevent immediate quit
  event.preventDefault();

  // Deregister client
  await deregisterClient();

  // Stop webhook server
  console.log('[MAIN PROCESS] Shutting down webhook server...');
  stopWebhookServer();

  // Send shutdown signal to renderer
  if (mainWindow) {
    mainWindow.webContents.send('app-closing');
  }

  // Now actually quit
  app.exit(0);
});