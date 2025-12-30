'use client';

interface MicIconProps {
  isListening: boolean;
}

export default function MicIcon({ isListening }: MicIconProps) {
  if (isListening) {
    return (
      <svg className="w-16 h-16 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h12v12H6z" />
      </svg>
    );
  }

  return (
    <svg className="w-16 h-16 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
    </svg>
  );
}