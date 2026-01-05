'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { serviceApi } from '@/lib/api/service';

interface ServiceContextType {
  // Service state
  isServiceEnabled: boolean;
  isConnected: boolean;
  clientName: string;

  // Actions
  toggleService: () => Promise<void>;
  setClientName: (name: string) => void;

  // Loading states
  isTogglingService: boolean;
}

export const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [isServiceEnabled, setIsServiceEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [clientName, setClientName] = useState('desktop-client');
  const [isTogglingService, setIsTogglingService] = useState(false);

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
      console.log('📥 Service status webhook:', status.enabled ? 'ENABLED' : 'DISABLED');
      setIsServiceEnabled(status.enabled);
      setIsTogglingService(false);
    };

    window.electronAPI.onServiceStatusChanged(handleServiceStatusChanged);
  }, []);

  // Toggle service
  const toggleService = useCallback(async () => {
    setIsTogglingService(true);
    try {
      if (isServiceEnabled) {
        await serviceApi.disable();
      } else {
        await serviceApi.enable();
      }
    } catch (error) {
      console.error('Failed to toggle service:', error);
      setIsTogglingService(false);
    }
  }, [isServiceEnabled]);

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