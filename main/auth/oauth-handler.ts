import { BrowserWindow } from 'electron';
import { api } from '../../renderer/src/lib/api/client';

export async function handleGoogleOAuth(): Promise<{ code: string; state: string } | null> {
  try {
    // Get OAuth URL from backend
    const { data } = await api.get('/auth/google/url', {
      params: { redirect_port: 4280 }
    });

    const { url, state } = data;

    return new Promise((resolve) => {
      const authWindow = new BrowserWindow({
        width: 600,
        height: 700,
        show: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        }
      });

      authWindow.loadURL(url);

      // Listen for navigation to callback URL
      authWindow.webContents.on('will-redirect', (event, redirectUrl) => {
        if (redirectUrl.startsWith('http://127.0.0.1:4280/auth/google/callback')) {
          const urlObj = new URL(redirectUrl);
          const code = urlObj.searchParams.get('code');
          const returnedState = urlObj.searchParams.get('state');

          if (code && returnedState) {
            authWindow.close();
            resolve({ code, state: returnedState });
          }
        }
      });

      authWindow.on('closed', () => {
        resolve(null);
      });
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return null;
  }
}

export async function handleGitHubOAuth(): Promise<string | null> {
  try {
    // Get OAuth URL from backend
    const { data } = await api.get('/auth/github/url', {
      params: { redirect_port: 4280 }
    });

    const { url } = data;

    return new Promise((resolve) => {
      const authWindow = new BrowserWindow({
        width: 600,
        height: 700,
        show: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        }
      });

      authWindow.loadURL(url);

      // Listen for navigation to callback URL
      authWindow.webContents.on('will-redirect', (event, redirectUrl) => {
        if (redirectUrl.startsWith('http://127.0.0.1:4280/auth/github/callback')) {
          const urlObj = new URL(redirectUrl);
          const code = urlObj.searchParams.get('code');

          if (code) {
            authWindow.close();
            resolve(code);
          }
        }
      });

      authWindow.on('closed', () => {
        resolve(null);
      });
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return null;
  }
}