import express from 'express';
import { BrowserWindow } from 'electron';

let webhookServer: any = null;

export function startWebhookServer(port: number, mainWindow: BrowserWindow): string {
  const app = express();
  app.use(express.json());

  // Main webhook endpoint - handle all webhook events
  app.post('/webhook', (req, res) => {
    const event = req.body.event;

    console.log('📥 Webhook received:', event || 'interaction');

    if (event === 'service_status') {
      // Service status change
      mainWindow.webContents.send('service-status-changed', req.body);
    } else {
      // Default to interaction
      mainWindow.webContents.send('new-interaction', req.body);
    }

    res.status(200).json({ received: true });
  });

  webhookServer = app.listen(port, () => {
    console.log(`✅ Webhook server listening on port ${port}`);
  });

  return `http://localhost:${port}/webhook`;
}

export function stopWebhookServer() {
  if (webhookServer) {
    webhookServer.close();
    webhookServer = null;
    console.log('🛑 Webhook server stopped');
  }
}