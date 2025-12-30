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
      className="p-4 rounded-lg mb-3 border-l-4 transition-all hover:shadow-md"
      style={{
        backgroundColor: colors.background,
        borderLeftColor: colors.border,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="font-semibold"
          style={{ color: colors.text }}
        >
          {interaction.speaker?.name || `Person ${personIndex}`}
        </span>
        <span className="text-xs text-gray-500">{interaction.timestamp}</span>
      </div>
      <div className="text-gray-800">{interaction.text}</div>
    </div>
  );
}