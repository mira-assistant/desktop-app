'use client';

import { ConnectionStatus } from '@/types';
import { cn } from '@/lib/utils/cn';

interface StatusIndicatorProps {
  status: ConnectionStatus;
  statusText: string;
}

export default function StatusIndicator({ status, statusText }: StatusIndicatorProps) {
  const dotStyles = cn(
    'w-3 h-3 rounded-full transition-all duration-300',
    {
      'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]': status === 'connected',
      'bg-red-500': status === 'disconnected',
      'bg-yellow-500 animate-pulse': status === 'connecting',
    }
  );

  return (
    <div className="flex items-center gap-2">
      <div className={dotStyles} />
      <span className="text-sm text-gray-700">{statusText}</span>
    </div>
  );
}