'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginOverlay from '@/components/ui/LoginOverlay';
import MicrophoneButton from '@/components/MicrophoneButton';
import TranscriptionPanel from '@/components/TranscriptionPanel';
import Toast from '@/components/ui/Toast';
import { Interaction, ToastType } from '@/types/models.types';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export default function Home() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Audio state
  const [isListening, setIsListening] = useState(false);
  const [micStatusText, setMicStatusText] = useState('Click to start listening');

  // Transcription state
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [personIndexMap] = useState(new Map<string, number>());

  // Client state
  const [clientName, setClientName] = useState('desktop-client');

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Handlers
  const handleMicClick = () => {
    console.log('Mic clicked');
    setIsListening(!isListening);
    setMicStatusText(isListening ? 'Click to start listening' : 'Listening... Click to stop');
  };

  const handleClientNameChange = (name: string) => {
    if (name && name.trim() !== '') {
      setClientName(name.trim());
      addToast(`Client name updated to: ${name.trim()}`, 'info');
    }
  };

  const handleClientNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleClientNameChange(e.currentTarget.value);
    }
  };

  const handleClearTranscriptions = () => {
    setInteractions([]);
    addToast('Cleared transcriptions', 'info');
  };

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#00ff88] to-[#00cc6a]">
        <div className="flex flex-col items-center gap-4">
          <i className="fas fa-microphone-alt text-6xl text-white animate-pulse" />
          <p className="text-white text-xl font-medium">Loading Mira...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[rgba(255,255,255,0.95)] backdrop-blur-[2px] border border-[rgba(0,255,136,0.2)]">
      {/* Login Overlay - shows when not authenticated */}
      {!isAuthenticated && <LoginOverlay />}

      {/* Header */}
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
            <input
              id="clientName"
              type="text"
              defaultValue={clientName}
              onKeyDown={handleClientNameKeyDown}
              maxLength={50}
              placeholder="desktop-client"
              className="w-[140px] px-2.5 py-1.5 text-sm text-center text-gray-900 bg-[#f0fffa] border border-[#80ffdb] rounded-xl transition-all duration-300 focus:outline-none focus:border-[#00cc6a] focus:bg-white focus:shadow-[0_0_0_2px_rgba(0,204,106,0.2)]"
            />
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

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Section - Microphone */}
        <div className="flex-1 flex items-center justify-center px-10 py-10 bg-gradient-to-br from-[#f0fffa] to-[#f0fffa]">
          <MicrophoneButton
            isListening={isListening}
            statusText={micStatusText}
            onClick={handleMicClick}
          />
        </div>

        {/* Right Section - Transcriptions */}
        <div className="flex-1 flex flex-col min-w-0">
          <TranscriptionPanel
            interactions={interactions}
            personIndexMap={personIndexMap}
            onClear={handleClearTranscriptions}
          />
        </div>
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col-reverse gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}