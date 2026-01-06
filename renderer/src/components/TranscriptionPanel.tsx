'use client';

import { useEffect, useRef, useState } from 'react';
import { Interaction, Person } from '@/types/models.types';
import { personsApi } from '@/lib/api/persons';
import { interactionsApi } from '@/lib/api/interactions';
import { getPersonColor } from '@/lib/colors';
import { useService } from '@/hooks/useService';
import { useToast } from '@/contexts/ToastContext';

export default function TranscriptionPanel() {
  const { isConnected } = useService();
  const containerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [persons, setPersons] = useState<Map<string, Person>>(new Map());

  // Load existing interactions when connected
  useEffect(() => {
    if (!isConnected) return;

    const loadInteractions = async () => {
      try {
        const data = await interactionsApi.getAll();
        setInteractions(data);
      } catch (error) {
        console.error('Failed to load interactions:', error);
      }
    };

    loadInteractions();
  }, [isConnected]);

  // Listen for new interactions via webhook
  useEffect(() => {
    if (!window.electronAPI) return;

    const handleNewInteraction = (webhookPayload: any) => {
      console.log('📥 Webhook received:', webhookPayload);

      let interaction: Interaction;

      try {
        const parsedInteractionData = JSON.parse(webhookPayload.data);
        interaction = parsedInteractionData;
      } catch (err) {
        console.error('Failed to parse webhook payload', err);
        showToast('Failed to parse interaction data', 'error');
        return;
      }

      setInteractions(prev => [...prev, interaction]);
    };

    window.electronAPI.onNewInteraction(handleNewInteraction);
  }, []);

  // Fetch person details when new person IDs appear
  useEffect(() => {
    const fetchMissingPersons = async () => {
      const personIds = new Set(
        interactions
          .map(i => i.person_id)
          .filter((id): id is string => id !== null && id !== undefined)
      );

      const missingIds = Array.from(personIds).filter(id => !persons.has(id));

      if (missingIds.length === 0) return;

      console.log('Fetching missing persons:', missingIds);

      try {
        const fetchedPersons = await Promise.all(
          missingIds.map(id => personsApi.getById(id).catch(() => null))
        );

        setPersons(prev => {
          const newMap = new Map(prev);
          fetchedPersons.forEach((person, idx) => {
            if (person) {
              newMap.set(missingIds[idx], person);
            }
          });
          return newMap;
        });
      } catch (error) {
        console.error('❌ Failed to fetch person details:', error);
      }
    };

    fetchMissingPersons();
  }, [interactions, persons]);

  // Auto-scroll to bottom when new interactions arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [interactions]);

  const handleClear = () => {
    let interaction = interactions.pop();

    while (interaction) {
      interactionsApi.delete(interaction.id).catch((error) => {
        if (!interaction) return;
        console.error(`Failed to delete interaction with id ${interaction.id}:`, error);
        showToast(`Failed to delete interaction: ${interaction.id}`, 'error');
      })
      interaction = interactions.pop();
    }
    setInteractions([]);
    showToast('Previous interactions cleared.', 'success')
  };

  const getPersonDisplay = (interaction: Interaction): { label: string; index: number } => {
    if (!interaction.person_id) {
      return { label: 'Unknown Person', index: 0 };
    }

    const person = persons.get(interaction.person_id);

    if (person?.name) {
      return { label: person.name, index: person.index };
    }

    if (person?.index !== undefined) {
      return { label: `Person ${person.index}`, index: person.index };
    }

    // Fallback if person not loaded yet
    return { label: 'Loading...', index: 1 };
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-[#f0fffa] rounded-none overflow-hidden border-l border-[#80ffdb]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-[#80ffdb] bg-gradient-to-r from-[#f0fffa] to-white">
        <h2 className="text-xl font-semibold text-[#1f2937]">Transcriptions</h2>
        <button
          onClick={handleClear}
          disabled={interactions.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#00cc6a] bg-[#f0fffa] border border-[#80ffdb] rounded-lg transition-all duration-200 hover:bg-[#e6fffa] hover:text-[#00b359] disabled:opacity-50 disabled:cursor-not-allowed"
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
            const person = getPersonDisplay(interaction);
            const colors = getPersonColor(person.index);

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
                    {person.label}
                  </span>
                  <span className="text-[11px] font-medium text-[#6b7280]">
                    {new Date(interaction.timestamp).toLocaleTimeString()}
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