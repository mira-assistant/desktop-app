'use client';

import { useEffect, useRef } from 'react';
import { Interaction } from '@/types/models.types';
import { getPersonColor } from '@/lib/colors';

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new interactions arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [interactions]);

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
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
      >
        {interactions.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full text-center">
            <i className="fas fa-robot text-5xl text-[#9ca3af] opacity-50 mb-4" />
            <p className="text-lg font-medium text-[#9ca3af] mb-2">No conversations yet</p>
            <small className="text-sm text-[#9ca3af] opacity-80">
              Start speaking to interact with your AI assistant
            </small>
          </div>
        ) : (
          // Transcription Items
          interactions.map((interaction) => {
            const personIndex = personIndexMap.get(interaction.speaker_id) || 0;
            const colors = getPersonColor(personIndex);

            return (
              <div
                key={interaction.id}
                className="p-4 rounded-xl border-l-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,255,136,0.15)] animate-[slideIn_0.3s_ease]"
                style={{
                  backgroundColor: colors.background,
                  borderLeftColor: colors.border,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: colors.text }}
                  >
                    {interaction.speaker?.name || `Person ${personIndex}`}
                  </span>
                  <span className="text-[11px] font-medium text-[#6b7280]">
                    {interaction.timestamp}
                  </span>
                </div>
                <div className="text-base text-[#1f2937] leading-relaxed">
                  {interaction.text}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}