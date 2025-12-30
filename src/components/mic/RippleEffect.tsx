'use client';

export default function RippleEffect() {
  return (
    <div className="absolute inset-0 flex pointer-events-none opacity-100 transition-opacity duration-300">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] border-2 border-[rgba(255,68,68,0.6)] rounded-full bg-transparent animate-[redRipple_2s_infinite]"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] border-2 border-[rgba(255,68,68,0.6)] rounded-full bg-transparent animate-[redRipple_2s_infinite_0.4s]"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] border-2 border-[rgba(255,68,68,0.6)] rounded-full bg-transparent animate-[redRipple_2s_infinite_0.8s]"
      />
    </div>
  );
}