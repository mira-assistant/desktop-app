'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import StatusIndicator from '@/components/StatusIndicator';
import Tooltip from '@/components/ui/Tooltip';
import MicrophoneButton from '@/components/MicrophoneButton';
import TranscriptionPanel from '@/components/TranscriptionPanel';
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

  // Features data
  const features = [
    {
      icon: 'fa-brain',
      name: 'Advanced NLP Processing',
      description: 'Intelligent text analysis and context understanding',
    },
    {
      icon: 'fa-users',
      name: 'Speaker Clustering',
      description: 'Automatically identify and separate different speakers',
    },
    {
      icon: 'fa-clipboard-list',
      name: 'Context Summarization',
      description: 'Generate concise summaries of conversations',
    },
    {
      icon: 'fa-database',
      name: 'Database Integration',
      description: 'Seamlessly store and search interaction history',
    },
  ];

  // Handlers
  const handleMicClick = () => {
    console.log('Mic clicked');
    setIsListening(!isListening);
    setMicStatusText(isListening ? 'Click to start listening' : 'Listening... Click to stop');
  };

  const handleEnvironmentToggle = () => {
    const newEnv = environment === 'Dev' ? 'Prod' : 'Dev';
    setEnvironment(newEnv);
    addToast(`Switched to ${newEnv} environment`, 'info');
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    addToast('Logged out successfully', 'success');
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

  const isProd = environment === 'Prod';

  return (
    <div className="flex flex-col h-screen bg-[rgba(255,255,255,0.95)] backdrop-blur-[10px] border border-[rgba(0,255,136,0.2)]">
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
          {/* Environment Toggle */}
          <button
            onClick={handleEnvironmentToggle}
            className={cn(
              "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
              isProd && "bg-gradient-to-br from-[#fef3c7] to-[#fde68a] border-[#fbbf24]",
              !isProd && "bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] border-[#7dd3fc]"
            )}
            title="Toggle Environment (Dev/Prod)"
          >
            <i className="fas fa-exchange-alt text-xs text-[#0284c7]" />
            <span className="text-xs font-semibold min-w-[32px] text-center text-[#0c4a6e]">
              {environment}
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#fef2f2] to-[#fee2e2] border border-[#fca5a5] text-[#dc2626] transition-all duration-200 hover:from-[#fee2e2] hover:to-[#fecaca] hover:border-[#dc2626] hover:-translate-y-0.5 hover:shadow-md"
            title="Logout"
          >
            <i className="fas fa-sign-out-alt text-sm" />
          </button>

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

          {/* Status Indicator */}
          <Tooltip content={connectionStatus === 'connected' ? `Backend URL: ${backendUrl}` : 'Not connected to backend'}>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#f0fffa] border border-[#80ffdb] rounded-[20px]">
              <StatusIndicator status={connectionStatus} statusText={statusText} />
            </div>
          </Tooltip>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Section */}
        <div className="flex-1 flex flex-col items-center justify-center gap-[60px] px-10 py-10 bg-gradient-to-br from-[#f0fffa] to-[#f0fffa]">
          {/* Microphone Button */}
          <MicrophoneButton
            isListening={isListening}
            isDisabled={connectionStatus !== 'connected'}
            statusText={micStatusText}
            onClick={handleMicClick}
          />

          {/* Features Card */}
          <div className="w-full bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#e5e7eb] p-6">
            <h3 className="text-xl font-semibold text-[#1f2937] mb-4">Features</h3>
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border border-[#e5e7eb] rounded-lg bg-[rgba(240,255,250,0.5)] transition-all duration-200 min-h-[60px] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,255,136,0.15)] hover:border-[#00ff88]"
                >
                  <i className={`fas ${feature.icon} text-[#00ff88] text-base w-5 text-center mt-0.5 flex-shrink-0`} />
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="font-poppins font-semibold text-[#1f2937] text-base leading-tight">
                      {feature.name}
                    </span>
                    <span className="text-[13px] text-[#6b7280] leading-snug">
                      {feature.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section */}
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