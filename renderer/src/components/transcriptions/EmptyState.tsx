'use client';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <i className="fas fa-robot text-5xl text-[#9ca3af] opacity-50 mb-4" />
      <p className="text-lg font-medium text-[#9ca3af] mb-2">No conversations yet</p>
      <small className="text-sm text-[#9ca3af] opacity-80">
        Start speaking to interact with your AI assistant
      </small>
    </div>
  );
}