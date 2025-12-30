'use client';

import { ConnectionStatus } from '@/types';
import StatusIndicator from '@/components/ui/StatusIndicator';
import Tooltip from '@/components/ui/Tooltip';
import Input from '@/components/ui/Input';

interface StatusBarProps {
  connectionStatus: ConnectionStatus;
  statusText: string;
  backendUrl: string;
  environment: 'Dev' | 'Prod';
  clientName: string;
  onEnvironmentToggle: () => void;
  onLogout: () => void;
  onClientNameChange: (name: string) => void;
}

export default function StatusBar({
  connectionStatus,
  statusText,
  backendUrl,
  environment,
  clientName,
  onEnvironmentToggle,
  onLogout,
  onClientNameChange,
}: StatusBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onClientNameChange(e.currentTarget.value);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Environment Toggle */}
      <button
        onClick={onEnvironmentToggle}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200
          ${environment === 'Prod'
            ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-400'
            : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300'
          }
          hover:shadow-md
        `}
        title="Toggle Environment (Dev/Prod)"
      >
        <i className="fas fa-exchange-alt text-sm" />
        <span className="text-sm font-medium">{environment}</span>
      </button>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Logout"
      >
        <i className="fas fa-sign-out-alt text-gray-600" />
      </button>

      {/* Client Name Input */}
      <div className="flex items-center gap-2">
        <label htmlFor="clientName" className="text-sm text-gray-700">
          Client Name:
        </label>
        <Input
          id="clientName"
          type="text"
          defaultValue={clientName}
          onKeyDown={handleKeyDown}
          maxLength={50}
          className="w-40"
        />
      </div>

      {/* Status Indicator with Tooltip */}
      <Tooltip content={connectionStatus === 'connected' ? `Backend URL: ${backendUrl}` : 'Not connected to backend'}>
        <div>
          <StatusIndicator status={connectionStatus} statusText={statusText} />
        </div>
      </Tooltip>
    </div>
  );
}