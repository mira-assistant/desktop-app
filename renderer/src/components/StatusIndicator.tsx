'use client';

import { ConnectionStatus } from '@/types';
import { cn } from '@/lib/cn';

interface StatusIndicatorProps {
  status: ConnectionStatus;
  statusText: string;
}

export default function StatusIndicator({ status, statusText }: StatusIndicatorProps) {
  const dotStyles = cn(
    'w-2 h-2 rounded-full transition-all duration-300',
    {
      'bg-[#00ff88] animate-[pulse_2s_infinite]': status === 'connected',
      'bg-[#ef4444]': status === 'disconnected',
      'bg-yellow-500 animate-pulse': status === 'connecting',
    }
  );

  return (
    <>
      <div className={dotStyles} />
      <span className="text-sm font-medium text-[#6b7280]">{statusText}</span>
    </>
  );
}