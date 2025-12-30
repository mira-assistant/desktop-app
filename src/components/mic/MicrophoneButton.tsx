'use client';

import { cn } from '@/lib/utils/cn';
import MicIcon from './MicIcon';
import RippleEffect from './RippleEffect';

interface MicrophoneButtonProps {
  isListening: boolean;
  isDisabled: boolean;
  statusText: string;
  onClick: () => void;
}

export default function MicrophoneButton({
  isListening,
  isDisabled,
  statusText,
  onClick,
}: MicrophoneButtonProps) {
  return (
    <div className="flex flex-col items-center gap-10">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={cn(
          'relative w-40 h-40 rounded-full transition-all duration-300 border-[3px] border-[rgba(255,255,255,0.3)]',
          'flex items-center justify-center',
          'focus:outline-none',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[#6b7280] disabled:shadow-none',
          isListening
            ? 'bg-gradient-to-br from-[#ff4444] to-[#e53e3e] shadow-[0_10px_30px_rgba(255,68,68,0.6),0_0_30px_rgba(255,68,68,0.4),0_0_60px_rgba(255,68,68,0.2)] hover:scale-105 hover:shadow-[0_15px_40px_rgba(255,68,68,0.7),0_0_40px_rgba(255,68,68,0.5),0_0_80px_rgba(255,68,68,0.3)]'
            : 'bg-gradient-to-br from-[#00ff88] to-[#00e676] shadow-none hover:scale-105 hover:shadow-[0_15px_40px_rgba(0,255,136,0.7),0_0_40px_rgba(0,255,136,0.5),0_0_80px_rgba(0,255,136,0.3)]',
          'active:scale-[0.98]'
        )}
      >
        {isListening && !isDisabled && (
          <div className="hover:opacity-0">
            <RippleEffect />
          </div>
        )}

        <div className="relative z-10 text-white flex items-center justify-center transition-transform duration-300 hover:scale-110">
          <MicIcon isListening={isListening} />
        </div>
      </button>

      <p className="text-base font-medium text-[#6b7280]">{statusText}</p>
    </div>
  );
}