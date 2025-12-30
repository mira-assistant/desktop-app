'use client';

import { ConnectionStatus } from '@/types';
import Logo from './Logo';
import StatusBar from './StatusBar';

interface AppHeaderProps {
  connectionStatus: ConnectionStatus;
  statusText: string;
  backendUrl: string;
  environment: 'Dev' | 'Prod';
  clientName: string;
  onEnvironmentToggle: () => void;
  onLogout: () => void;
  onClientNameChange: (name: string) => void;
}

export default function AppHeader(props: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#f0fffa] to-[#e6fffa] border-b border-[#80ffdb] shadow-[0_2px_10px_rgba(0,255,136,0.1)]">
      <Logo />
      <StatusBar {...props} />
    </header>
  );
}