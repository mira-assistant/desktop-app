'use client';

import { Interaction } from '@/types';
import { getPersonColor } from '@/lib/utils/colors';

interface TranscriptionItemProps {
  interaction: Interaction;
  personIndex: number;
}

export default function TranscriptionItem({ interaction, personIndex }: TranscriptionItemProps) {
  const colors = getPersonColor(personIndex);

  return (
    <div
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
      <div className="text-base text-[#1f2937] leading-relaxed">{interaction.text}</div>
    </div>
  );
}