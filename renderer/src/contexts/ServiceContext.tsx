'use client';

import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { serviceApi } from '@/lib/api/service';

interface ServiceContextType {
  isServiceEnabled: boolean;
  isConnected: boolean;
  clientName: string;
  toggleService: () => Promise<void>;
  setClientName: (name: string) => void;
  isTogglingService: boolean;
}

export const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

const ENABLE_TIMEOUT_MS = 5000;

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  const [isServiceEnabled, setIsServiceEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [clientName, setClientName] = useState('desktop-client');
  const [isTogglingService, setIsTogglingService] = useState(false);

  const enableTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize: Load client name
  useEffect(() => {
    const initialize = async () => {
      if (window.electronAPI) {
        const result = await window.electronAPI.getClientName();
        if (result.success && result.clientName) {
          setClientName(result.clientName);
        }
      }
    };
    initialize();
  }, []);

  // Register client when authenticated
  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      setIsConnected(false);
      return;
    }

    const registerClient = async () => {
      if (!clientName) return;
      if (!window.electronAPI) return;

      try {
        const webhookUrl = await window.electronAPI.getWebhookUrl();
        await serviceApi.registerClient(clientName, webhookUrl);
        setIsConnected(true);
        console.log(`Client ${clientName} registered`);
      } catch (error: any) {
        console.error('Failed to register client:', error);
        setIsConnected(false);
      }
    };

    registerClient();

    return () => {
      if (clientName && isConnected) {
        serviceApi.deregisterClient(clientName).catch(console.error);
      }
    };
  }, [clientName, isAuthenticated, isAuthLoading]);

  // Listen for service status changes via webhook
  useEffect(() => {
    if (!window.electronAPI) return;

    const handleServiceStatusChanged = (status: { enabled: boolean }) => {
      console.log('[Service] Status webhook:', status.enabled ? 'ENABLED' : 'DISABLED');

      // Clear timeout if webhook arrives
      if (enableTimeoutRef.current) {
        clearTimeout(enableTimeoutRef.current);
        enableTimeoutRef.current = null;
      }

      setIsServiceEnabled(status.enabled);
      setIsTogglingService(false);
    };

    window.electronAPI.onServiceStatusChanged(handleServiceStatusChanged);
  }, []);

  const toggleService = useCallback(async () => {
    setIsTogglingService(true);

    try {
      if (isServiceEnabled) {
        await serviceApi.disable();
      } else {
        await serviceApi.enable();

        // Set timeout for enable operation
        enableTimeoutRef.current = setTimeout(() => {
          console.error('[Service] Enable timeout - no webhook received');
          setIsTogglingService(false);
          showToast('Service failed to enable - no response from backend', 'error');
        }, ENABLE_TIMEOUT_MS);
      }
    } catch (error) {
      console.error('Failed to toggle service:', error);
      setIsTogglingService(false);
      showToast('Failed to communicate with backend', 'error');
    }
  }, [isServiceEnabled, showToast]);

  return (
    <ServiceContext.Provider
      value={{
        isServiceEnabled,
        isConnected,
        clientName,
        toggleService,
        setClientName,
        isTogglingService,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
}