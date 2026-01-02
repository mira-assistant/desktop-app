'use client';

import { useService } from '@/hooks/useService';
import { cn } from '@/lib/cn';

export default function MicrophoneButton() {
  const {
    isServiceEnabled,
    toggleService,
    isTogglingService,
  } = useService();

  // Determine status text
  const getStatusText = () => {
    if (isTogglingService && !isServiceEnabled) return 'Enabling Mira...';
    if (isTogglingService && isServiceEnabled) return 'Disabling Mira...';
    if (isServiceEnabled) return 'Mira is listening';
    return 'Click to enable Mira';
  };

  // Handle click - just toggle service
  const handleClick = async () => {
    if (isTogglingService) return;
    await toggleService();
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <button
        onClick={handleClick}
        disabled={isTogglingService}
        className={cn(
          'relative w-40 h-40 rounded-full transition-all duration-300 border-[3px] border-[rgba(255,255,255,0.3)]',
          'flex items-center justify-center',
          'focus:outline-none',
          isTogglingService
            ? 'bg-[#6b7280] cursor-not-allowed opacity-60'
            : isServiceEnabled
            ? 'bg-gradient-to-br from-[#ff4444] to-[#e53e3e] shadow-[0_10px_30px_rgba(255,68,68,0.6),0_0_30px_rgba(255,68,68,0.4),0_0_60px_rgba(255,68,68,0.2)]'
            : 'bg-gradient-to-br from-[#00ff88] to-[#00e676] shadow-none hover:scale-105 hover:shadow-[0_15px_40px_rgba(0,255,136,0.7),0_0_40px_rgba(0,255,136,0.5),0_0_80px_rgba(0,255,136,0.3)] active:scale-[0.98]'
        )}
      >
        {/* Red Ripple Waves - always when service enabled */}
        {isServiceEnabled && !isTogglingService && (
          <div className="absolute inset-0 flex pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] border-2 border-[rgba(255,68,68,0.6)] rounded-full bg-transparent animate-[redRipple_2s_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] border-2 border-[rgba(255,68,68,0.6)] rounded-full bg-transparent animate-[redRipple_2s_infinite_0.4s]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] border-2 border-[rgba(255,68,68,0.6)] rounded-full bg-transparent animate-[redRipple_2s_infinite_0.8s]" />
          </div>
        )}

        {/* Microphone Icon - always */}
        <div className="relative z-10 text-white flex items-center justify-center">
          <svg className="w-16 h-16 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
        </div>
      </button>

      <p className="text-base font-medium text-[#6b7280]">{getStatusText()}</p>
    </div>
  );
}