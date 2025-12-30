'use client';

export default function RippleEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ripple" style={{ animationDelay: '0s' }} />
      <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ripple" style={{ animationDelay: '0.5s' }} />
      <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ripple" style={{ animationDelay: '1s' }} />

      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.2;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 2s ease-out infinite;
        }
      `}</style>
    </div>
  );
}