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
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Transcriptions</h2>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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