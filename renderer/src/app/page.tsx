'use client';

import { useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import MicrophoneButton from '@/components/mic/MicrophoneButton';
import FeaturesCard from '@/components/ui/FeaturesCard';
import TranscriptionPanel from '@/components/transcriptions/TranscriptionPanel';
import Toast from '@/components/ui/Toast';
import { ConnectionStatus, Interaction, ToastType } from '@/types';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export default function Home() {
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [statusText, setStatusText] = useState('Disconnected');
  const [backendUrl, setBackendUrl] = useState('');
  const [environment, setEnvironment] = useState<'Dev' | 'Prod'>('Dev');

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
    // TODO: Implement with useAudio hook
    console.log('Mic clicked');
    setIsListening(!isListening);
    setMicStatusText(isListening ? 'Click to start listening' : 'Listening... Click to stop');
  };

  const handleEnvironmentToggle = () => {
    // TODO: Implement with useApi hook
    const newEnv = environment === 'Dev' ? 'Prod' : 'Dev';
    setEnvironment(newEnv);
    addToast(`Switched to ${newEnv} environment`, 'info');
  };

  const handleLogout = () => {
    // TODO: Implement logout
    console.log('Logout clicked');
    addToast('Logged out successfully', 'success');
  };

  const handleClientNameChange = (name: string) => {
    // TODO: Implement with useApi hook
    if (name && name.trim() !== '') {
      setClientName(name.trim());
      addToast(`Client name updated to: ${name.trim()}`, 'info');
    }
  };

  const handleClearTranscriptions = () => {
    // TODO: Implement with useTranscriptions hook
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

  return (
    <div className="flex flex-col h-screen bg-[rgba(255,255,255,0.95)] backdrop-blur-[10px] border border-[rgba(0,255,136,0.2)]">
      {/* Header */}
      <AppHeader
        connectionStatus={connectionStatus}
        statusText={statusText}
        backendUrl={backendUrl}
        environment={environment}
        clientName={clientName}
        onEnvironmentToggle={handleEnvironmentToggle}
        onLogout={handleLogout}
        onClientNameChange={handleClientNameChange}
      />

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Section - Controls */}
        <div className="flex-1 flex flex-col items-center justify-center gap-[60px] px-10 py-10 bg-gradient-to-br from-[#f0fffa] to-[#f0fffa]">
          {/* Microphone Button */}
          <MicrophoneButton
            isListening={isListening}
            isDisabled={connectionStatus !== 'connected'}
            statusText={micStatusText}
            onClick={handleMicClick}
          />

          {/* Features Card */}
          <div className="w-full">
            <FeaturesCard />
          </div>
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