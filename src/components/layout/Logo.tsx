'use client';

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-[#00cc6a]">
        <i className="fas fa-microphone-alt" />
        Mira
      </h1>
      <span className="px-2 py-0.5 text-xs font-medium text-[#00cc6a] bg-[#e6fffa] rounded-xl">
        v4.3.0
      </span>
    </div>
  );
}