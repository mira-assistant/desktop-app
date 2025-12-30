'use client';

import { ConnectionStatus } from '@/types';
import StatusIndicator from '@/components/ui/StatusIndicator';
import Tooltip from '@/components/ui/Tooltip';

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
    <div className="flex items-center gap-6">
      {/* Environment Toggle */}
      <button
        onClick={onEnvironmentToggle}
        className={`
          flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all duration-200
          ${environment === 'Prod'
            ? 'bg-gradient-to-br from-[#fef3c7] to-[#fde68a] border-[#fbbf24]'
            : 'bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] border-[#7dd3fc]'
          }
          hover:shadow-md hover:-translate-y-0.5
        `}
        title="Toggle Environment (Dev/Prod)"
      >
        <i className={`fas fa-exchange-alt text-xs ${environment === 'Prod' ? 'text-[#0284c7]' : 'text-[#0284c7]'}`} />
        <span className={`text-xs font-semibold min-w-[32px] text-center ${environment === 'Prod' ? 'text-[#0c4a6e]' : 'text-[#0c4a6e]'}`}>
          {environment}
        </span>
      </button>

      {/* Logout Button */}
      <button
        onClick={onLogout}
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
          onKeyDown={handleKeyDown}
          maxLength={50}
          placeholder="desktop-client"
          className="w-[140px] px-2.5 py-1.5 text-sm text-center text-gray-900 bg-[#f0fffa] border border-[#80ffdb] rounded-xl transition-all duration-300 focus:outline-none focus:border-[#00cc6a] focus:bg-white focus:shadow-[0_0_0_2px_rgba(0,204,106,0.2)]"
        />
      </div>

      {/* Status Indicator with Tooltip */}
      <Tooltip content={connectionStatus === 'connected' ? `Backend URL: ${backendUrl}` : 'Not connected to backend'}>
        <div className="flex items-center gap-2 px-3 py-2 bg-[#f0fffa] border border-[#80ffdb] rounded-[20px]">
          <StatusIndicator status={connectionStatus} statusText={statusText} />
        </div>
      </Tooltip>
    </div>
  );
}