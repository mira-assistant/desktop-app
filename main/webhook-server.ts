import express from 'express';
import { BrowserWindow } from 'electron';

let webhookServer: any = null;

export function startWebhookServer(port: number, mainWindow: BrowserWindow): string {
  const app = express();
  app.use(express.json());

  // Webhook endpoint
  app.post('/webhook/interaction', (req, res) => {
    const interaction = req.body;

    console.log('[WEBHOOK] Received interaction:', interaction);

    // Send to renderer process
    mainWindow.webContents.send('new-interaction', interaction);

    res.status(200).json({ received: true });
  });

  webhookServer = app.listen();

  return `http://localhost:${port}/webhook/interaction`;
}

export function stopWebhookServer() {
  if (webhookServer) {
    console.log('[WEBHOOK] Stopping server...');
    webhookServer.close();
    webhookServer = null;
  }
}