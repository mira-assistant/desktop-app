'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { serviceApi } from '@/lib/api/service';

export default function Header() {
  const { logout } = useAuth();

  const [clientName, setClientName] = useState('desktop-client');
  const [inputValue, setInputValue] = useState('desktop-client');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Cache client list to avoid repeated API calls
  const clientListCache = useRef<string[]>([]);
  const cacheTimestamp = useRef<number>(0);
  const CACHE_DURATION = 30000; // 30 seconds

  // Debounce timer
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Load client name from storage on mount
  useEffect(() => {
    const loadClientName = async () => {
      if (window.electronAPI) {
        const result = await window.electronAPI.getClientName();
        if (result.success && result.clientName) {
          setClientName(result.clientName);
          setInputValue(result.clientName);
        }
      }
    };
    loadClientName();
  }, []);

  // Fetch client list (with caching)
  const fetchClientList = useCallback(async (): Promise<string[]> => {
    const now = Date.now();

    // Use cache if still valid
    if (now - cacheTimestamp.current < CACHE_DURATION && clientListCache.current.length > 0) {
      return clientListCache.current;
    }

    // Fetch fresh data
    try {
      const response = await serviceApi.listClients();
      clientListCache.current = response.clients;
      cacheTimestamp.current = now;
      return response.clients;
    } catch (error) {
      console.error('Failed to fetch client list:', error);
      return clientListCache.current; // Fall back to old cache
    }
  }, []);

  // Check if client name is available
  const checkAvailability = useCallback(async (name: string) => {
    if (!name || name.trim() === '') {
      setIsAvailable(null);
      return;
    }

    // Don't check if it's the current name
    if (name === clientName) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);

    try {
      const existingClients = await fetchClientList();
      const available = !existingClients.includes(name);
      setIsAvailable(available);
    } catch (error) {
      console.error('Failed to check client name availability:', error);
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  }, [clientName, fetchClientList]);

  // Handle input change with proper debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setInputValue(value);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Reset availability while typing
    setIsAvailable(null);

    // Set new debounced check
    debounceTimer.current = setTimeout(() => {
      checkAvailability(value);
    }, 500);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newName = inputValue.trim();

      if (!newName) return;
      if (newName === clientName) return; // No change
      if (isAvailable === false) return; // Name taken

      setIsRegistering(true);

      try {
        // Rename client
        await serviceApi.renameClient(clientName, newName);

        // Store in persistent storage
        if (window.electronAPI) {
          await window.electronAPI.storeClientName(newName);
        }

        setClientName(newName);
        setIsAvailable(null);

        // Invalidate cache
        clientListCache.current = [];
        cacheTimestamp.current = 0;

        console.log(`✅ Client renamed to: ${newName}`);
      } catch (error) {
        console.error('❌ Failed to update client name:', error);
        setInputValue(clientName); // Revert on failure
      } finally {
        setIsRegistering(false);
      }
    }
  };

  // Determine border color based on availability
  const getBorderColor = () => {
    if (isChecking) return 'border-yellow-400';
    if (isAvailable === false) return 'border-red-500';
    if (isAvailable === true && inputValue !== clientName) return 'border-green-500';
    return 'border-[#80ffdb]';
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#f0fffa] to-[#e6fffa] border-b border-[#80ffdb] shadow-[0_2px_10px_rgba(0,255,136,0.1)]">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-[#00cc6a]">
          <i className="fas fa-microphone-alt" />
          Mira
        </h1>
        <span className="px-2 py-0.5 text-xs font-medium text-[#00cc6a] bg-[#e6fffa] rounded-xl">
          v6.0.1
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Client Name Input */}
        <div className="flex items-center gap-2">
          <label htmlFor="clientName" className="text-sm font-semibold text-[#00cc6a]">
            Client Name:
          </label>
          <div className="relative">
            <input
              id="clientName"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isRegistering}
              maxLength={50}
              placeholder="desktop-client"
              className={`w-[140px] px-2.5 py-1.5 text-sm text-center text-gray-900 bg-[#f0fffa] border-2 ${getBorderColor()} rounded-xl transition-all duration-300 focus:outline-none focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {isChecking && (
              <i className="fas fa-spinner fa-spin absolute right-2 top-1/2 -translate-y-1/2 text-yellow-500 text-xs" />
            )}
            {isRegistering && (
              <i className="fas fa-spinner fa-spin absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 text-xs" />
            )}
          </div>
          {isAvailable === false && inputValue !== clientName && (
            <span className="text-xs text-red-500">Taken</span>
          )}
          {isAvailable === true && inputValue !== clientName && (
            <span className="text-xs text-green-500">Available</span>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#fef2f2] to-[#fee2e2] border border-[#fca5a5] text-[#dc2626] transition-all duration-200 hover:from-[#fee2e2] hover:to-[#fecaca] hover:border-[#dc2626] hover:-translate-y-0.5 hover:shadow-md"
          title="Logout"
        >
          <i className="fas fa-sign-out-alt text-sm" />
        </button>
      </div>
    </header>
  );
}