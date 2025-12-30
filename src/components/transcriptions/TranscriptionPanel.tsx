'use client';

import { Interaction } from '@/types';
import TranscriptionList from './TranscriptionList';

interface TranscriptionPanelProps {
  interactions: Interaction[];
  personIndexMap: Map<string, number>;
  onClear: () => void;
}

export default function TranscriptionPanel({
  interactions,
  personIndexMap,
  onClear,
}: TranscriptionPanelProps) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-[#f0fffa] rounded-none overflow-hidden border-l border-[#80ffdb]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-[#80ffdb] bg-gradient-to-r from-[#f0fffa] to-white">
        <h2 className="text-xl font-semibold text-[#1f2937]">Transcriptions</h2>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#00cc6a] bg-[#f0fffa] border border-[#80ffdb] rounded-lg transition-all duration-200 hover:bg-[#e6fffa] hover:text-[#00b359]"
        >
          <i className="fas fa-trash" />
          Clear
        </button>
      </div>

      {/* Transcription List */}
      <div className="flex-1 overflow-hidden">
        <TranscriptionList interactions={interactions} personIndexMap={personIndexMap} />
      </div>
    </div>
  );
}