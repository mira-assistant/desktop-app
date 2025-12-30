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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <Logo />
        <StatusBar {...props} />
      </div>
    </header>
  );
}