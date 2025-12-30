'use client';

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
        <i className="fas fa-microphone-alt text-green-600" />
        Mira
      </h1>
      <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">
        v4.3.0
      </span>
    </div>
  );
}