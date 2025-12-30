import { api } from './client';
import { getClientIpAddresses, retryWithBackoff } from './utils';

// Types
interface ClientRegistration {
  client_id: string;
  webhook_url?: string;
  metadata?: Record<string, unknown>;
}

interface ClientResponse {
  client_id: string;
  webhook_url: string | null;
  ip_address: string;
  connected_at: string;
  metadata?: Record<string, unknown>;
}

export const serviceApi = {
  /**
   * Register client with network
   * POST /api/v2/service/clients
   */
  async registerClient(clientId: string, webhookUrl: string): Promise<ClientResponse> {
    const ipAddresses = getClientIpAddresses();

    const registration: ClientRegistration = {
      client_id: clientId,
      webhook_url: webhookUrl,
      metadata: {
        local_ip: ipAddresses.local,
        external_ip: ipAddresses.external,
      },
    };

    const { data } = await api.post<ClientResponse>('/service/clients', registration);
    return data;
  },

  /**
   * Deregister client from network
   * DELETE /api/v2/service/clients/{client_id}
   */
  async deregisterClient(clientId: string): Promise<void> {
    const endpoint = `/service/clients/${encodeURIComponent(clientId)}`;
    await api.delete(endpoint);
  },

  /**
   * List all registered clients
   * GET /api/v2/service/clients
   */
  async listClients(): Promise<{
    clients: ClientResponse[];
    total_count: number;
    network_id: string;
  }> {
    const { data } = await api.get('/service/clients');
    return data;
  },

  /**
   * Enable service for network
   * PATCH /api/v2/service/network/enable
   */
  async enable(): Promise<void> {
    await api.patch('/service/network/enable');
  },

  /**
   * Disable service for network with retry
   * PATCH /api/v2/service/network/disable
   */
  async disable(): Promise<void> {
    await retryWithBackoff(
      () => api.patch('/service/network/disable')
    );
  },
};