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
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={cn(
          'relative w-32 h-32 rounded-full transition-all duration-300',
          'focus:outline-none focus:ring-4 focus:ring-green-300',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isListening
            ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-[0_0_30px_rgba(239,68,68,0.5)]'
            : 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)]'
        )}
      >
        {isListening && <RippleEffect />}

        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <div className="text-white">
            <MicIcon isListening={isListening} />
          </div>
        </div>
      </button>

      <p className="text-gray-700 font-medium">{statusText}</p>
    </div>
  );
}