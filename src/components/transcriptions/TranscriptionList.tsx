'use client';

import { Interaction } from '@/types';
import TranscriptionItem from './TranscriptionItem';
import EmptyState from './EmptyState';
import { useEffect, useRef } from 'react';

interface TranscriptionListProps {
  interactions: Interaction[];
  personIndexMap: Map<string, number>;
}

export default function TranscriptionList({ interactions, personIndexMap }: TranscriptionListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new interactions arrive
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [interactions]);

  if (interactions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-4 py-3 space-y-3"
    >
      {interactions.map((interaction) => (
        <TranscriptionItem
          key={interaction.id}
          interaction={interaction}
          personIndex={personIndexMap.get(interaction.speaker_id) || 0}
        />
      ))}
    </div>
  );
}