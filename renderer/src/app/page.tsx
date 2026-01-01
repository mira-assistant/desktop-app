'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginOverlay from '@/components/ui/LoginOverlay';
import Header from '@/components/Header';
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
  const { isAuthenticated, isLoading } = useAuth();

  // Audio state
  const [isListening, setIsListening] = useState(false);
  const [micStatusText, setMicStatusText] = useState('Click to start listening');

  // Transcription state
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [personIndexMap] = useState(new Map<string, number>());

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Handlers
  const handleMicClick = () => {
    console.log('Mic clicked');
    setIsListening(!isListening);
    setMicStatusText(isListening ? 'Click to start listening' : 'Listening... Click to stop');
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
      {/* Login Overlay */}
      {!isAuthenticated && <LoginOverlay />}

      {/* Header - handles its own state */}
      <Header />

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