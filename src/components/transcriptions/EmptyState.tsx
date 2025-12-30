'use client';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <i className="fas fa-robot text-6xl text-gray-300 mb-4" />
      <p className="text-gray-600 font-medium mb-2">No conversations yet</p>
      <small className="text-gray-500">Start speaking to interact with your AI assistant</small>
    </div>
  );
}