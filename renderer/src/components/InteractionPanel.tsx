
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Interaction, Person, Conversation } from '@/types/models.types';
import { personsApi } from '@/lib/api/persons';
import { interactionsApi } from '@/lib/api/interactions';
import { conversationsApi } from '@/lib/api/conversations';
import { useService } from '@/hooks/useService';
import { useToast } from '@/contexts/ToastContext';
import Modal from '@/components/ui/Modal';

interface ConversationGroup {
  conversation: Conversation | null;
  interactions: Interaction[];
  isExpanded: boolean;
  isActive: boolean;
}

export default function InteractionPanel() {
  const { isConnected } = useService();
  const containerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const [conversationGroups, setConversationGroups] = useState<ConversationGroup[]>([]);
  const [persons, setPersons] = useState<Map<string, Person>>(new Map());
  const [loading, setLoading] = useState(false);

  // Delete modals
  const [deleteInteractionModal, setDeleteInteractionModal] = useState<string | null>(null);
  const [deleteConversationModal, setDeleteConversationModal] = useState<string | null>(null);

  const greenShades = [
    { background: '#f0fffa', border: '#00ff88', text: '#00cc6a' },
    { background: '#e6fffa', border: '#00e074', text: '#00b359' },
    { background: '#dcfdf7', border: '#00d15a', text: '#009944' },
    { background: '#d1fae5', border: '#00c249', text: '#007f30' },
  ];

  // Load interactions and build conversation groups
  useEffect(() => {
    if (!isConnected) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch all interactions
        const interactions = await interactionsApi.getAll();

        // 2. Group by conversation_id
        const conversationIds = new Set<string>();
        const interactionGroups = new Map<string | null, Interaction[]>();

        interactions.forEach(interaction => {
          const convId = interaction.conversation_id;
          if (convId) conversationIds.add(convId);

          const existing = interactionGroups.get(convId) || [];
          interactionGroups.set(convId, [...existing, interaction]);
        });

        // 3. Fetch conversation metadata for unique IDs
        const conversationMap = new Map<string, Conversation>();
        if (conversationIds.size > 0) {
          const conversations = await Promise.all(
            Array.from(conversationIds).map(id =>
              conversationsApi.getById(id).catch(() => null)
            )
          );

          conversations.forEach(conv => {
            if (conv) conversationMap.set(conv.id, conv);
          });
        }

        // 4. Amalgamate into ConversationGroup objects
        const groups: ConversationGroup[] = [];

        for (const [conversationId, groupInteractions] of interactionGroups.entries()) {
          const sortedInteractions = groupInteractions.sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          if (conversationId === null) {
            // Orphaned interactions
            groups.push({
              conversation: null,
              interactions: sortedInteractions,
              isExpanded: false,
              isActive: false,
            });
          } else {
            const conversation = conversationMap.get(conversationId);
            const isActive = conversation ? conversation.topic_summary === null : false;

            groups.push({
              conversation: conversation || null,
              interactions: sortedInteractions,
              isExpanded: isActive, // Auto-expand active conversations
              isActive,
            });
          }
        }

        // 5. Sort by start time (newest first)
        groups.sort((a, b) => {
          const aTime = a.conversation?.started_at || a.interactions[0]?.timestamp || '';
          const bTime = b.conversation?.started_at || b.interactions[0]?.timestamp || '';
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });

        setConversationGroups(groups);
      } catch (error) {
        console.error('Failed to load data:', error);
        showToast('Failed to load interactions', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isConnected, showToast]);

  // Listen for new interactions via webhook
  useEffect(() => {
    if (!window.electronAPI) return;

    const handleNewInteraction = async (payload: any) => {
      const interaction: Interaction = payload.data;

      setConversationGroups(prev => {
        const existingGroupIndex = prev.findIndex(
          g => g.conversation?.id === interaction.conversation_id
        );

        if (existingGroupIndex !== -1) {
          const updated = [...prev];
          updated[existingGroupIndex] = {
            ...updated[existingGroupIndex],
            interactions: [...updated[existingGroupIndex].interactions, interaction],
          };
          return updated;
        }

        // Not found - it's a new conversation, will be handled below
        return prev;
      });

      // Check if this is a new conversation (async operations outside setState)
      setConversationGroups(prev => {
        const exists = prev.some(g => g.conversation?.id === interaction.conversation_id);
        return exists ? prev : prev; // No change if exists
      });

      // If new conversation, fetch metadata and add it
      const existsInState = conversationGroups.some(
        g => g.conversation?.id === interaction.conversation_id
      );

      if (!existsInState && interaction.conversation_id) {
        // Mark all previous conversations as inactive
        setConversationGroups(prev =>
          prev.map(group => ({
            ...group,
            isActive: false,
            isExpanded: false,
          }))
        );

        try {
          // Fetch new conversation metadata
          const conversation = await conversationsApi.getById(interaction.conversation_id);

          const newGroup: ConversationGroup = {
            conversation,
            interactions: [interaction],
            isExpanded: true,
            isActive: conversation.topic_summary === null,
          };

          setConversationGroups(prev => [newGroup, ...prev]);
        } catch (error) {
          console.error('Failed to fetch new conversation:', error);

          // Fallback: add without conversation metadata
          const newGroup: ConversationGroup = {
            conversation: null,
            interactions: [interaction],
            isExpanded: true,
            isActive: true,
          };

          setConversationGroups(prev => [newGroup, ...prev]);
        }
      } else if (!interaction.conversation_id) {
        // Orphaned interaction (no conversation_id)
        const orphanGroup: ConversationGroup = {
          conversation: null,
          interactions: [interaction],
          isExpanded: false,
          isActive: false,
        };

        setConversationGroups(prev => [orphanGroup, ...prev]);
      }
    };

    const cleanup = window.electronAPI.onNewInteraction(handleNewInteraction);

    // Cleanup function to remove listener
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Fetch person details
  useEffect(() => {
    const fetchMissingPersons = async () => {
      const allInteractions = conversationGroups.flatMap(g => g.interactions);
      const personIds = new Set(
        allInteractions
          .map(i => i.person_id)
          .filter((id): id is string => id !== null && id !== undefined)
      );

      const missingIds = Array.from(personIds).filter(id => !persons.has(id));
      if (missingIds.length === 0) return;

      try {
        const fetchedPersons = await Promise.all(
          missingIds.map(id => personsApi.getById(id).catch(() => null))
        );

        setPersons(prev => {
          const newMap = new Map(prev);
          fetchedPersons.forEach((person, idx) => {
            if (person) newMap.set(missingIds[idx], person);
          });
          return newMap;
        });
      } catch (error) {
        console.error('Failed to fetch persons:', error);
      }
    };

    fetchMissingPersons();
  }, [conversationGroups, persons]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [conversationGroups]);

  const toggleConversation = (index: number) => {
    setConversationGroups(prev =>
      prev.map((group, i) =>
        i === index ? { ...group, isExpanded: !group.isExpanded } : group
      )
    );
  };

  const handleDeleteInteraction = async (interactionId: string) => {
    try {
      await interactionsApi.delete(interactionId);

      setConversationGroups(prev =>
        prev.map(group => ({
          ...group,
          interactions: group.interactions.filter(i => i.id !== interactionId)
        })).filter(group => group.interactions.length > 0)
      );

      showToast('Interaction deleted', 'success');
    } catch (error) {
      console.error('Failed to delete interaction:', error);
      showToast('Failed to delete interaction', 'error');
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const group = conversationGroups.find(g => g.conversation?.id === conversationId);
      if (!group) return;

      // Delete all interactions in conversation
      await Promise.all(group.interactions.map(i => interactionsApi.delete(i.id)));

      setConversationGroups(prev =>
        prev.filter(g => g.conversation?.id !== conversationId)
      );

      showToast('Conversation deleted', 'success');
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      showToast('Failed to delete conversation', 'error');
    }
  };

  const getConversationTitle = (group: ConversationGroup): string => {
    if (group.isActive) return 'Active Conversation';
    if (group.conversation?.topic_summary) return group.conversation.topic_summary;
    if (!group.conversation && group.interactions.length > 0) return 'Untitled Conversation';
    return 'Conversation';
  };

  const handleClearAll = async () => {
    try {
      await Promise.all(conversationGroups.map(async (group) => {
        if (group.conversation) {
          await conversationsApi.delete(group.conversation.id);
        } else {
          await Promise.all(group.interactions.map((interaction) => interactionsApi.delete(interaction.id)));
        }
      }));
      const allInteractions = conversationGroups.flatMap(g => g.interactions);
      await Promise.all(allInteractions.map(i => interactionsApi.delete(i.id)));
      setConversationGroups([]);
      setPersons(new Map());
      showToast('All interactions cleared', 'success');
    } catch (error) {
      console.error('Failed to clear:', error);
      showToast('Failed to clear interactions', 'error');
    }
  };

  const getPersonDisplay = (personId: string): { label: string; index: number } => {
    const person = persons.get(personId);
    if (person?.name) return { label: person.name, index: person.index };
    if (person?.index !== undefined) return { label: `Person ${person.index}`, index: person.index };
    return { label: 'Loading...', index: 1 };
  };

  const getPersonColor = (personIndex: number) => {
    return greenShades[personIndex % greenShades.length];
  };

  return (
    <>
      <div className="flex flex-col h-full bg-gradient-to-br from-white to-[#f0fffa] rounded-none overflow-hidden border-l border-[#80ffdb]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-[#80ffdb] bg-gradient-to-r from-[#f0fffa] to-white">
          <h2 className="text-xl font-semibold text-[#1f2937]">Interactions</h2>
          <button
            onClick={handleClearAll}
            disabled={conversationGroups.length === 0 || loading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#00cc6a] bg-[#f0fffa] border border-[#80ffdb] rounded-lg transition-all duration-200 hover:bg-[#e6fffa] hover:text-[#00b359] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-trash" />
            Clear All
          </button>
        </div>

        {/* Interaction List */}
        <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <i className="fas fa-spinner fa-spin text-3xl text-[#00cc6a]" />
            </div>
          ) : conversationGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <i className="fas fa-robot text-5xl text-[#9ca3af] opacity-50 mb-4" />
              <p className="text-lg font-medium text-[#9ca3af] mb-2">No conversations yet</p>
              <small className="text-sm text-[#9ca3af] opacity-80">
                Start speaking to interact with your AI assistant
              </small>
            </div>
          ) : (
            conversationGroups.map((group, groupIndex) => (
              <div key={group.conversation?.id || `orphan-${groupIndex}`} className="space-y-2">
                {/* Conversation Card */}
                <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Conversation Header */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#f9fafb] to-white border-b border-[#e5e7eb]">
                    <button
                      onClick={() => toggleConversation(groupIndex)}
                      className="flex items-center gap-3 flex-1 text-left group"
                    >
                      <i
                        className={`fas fa-chevron-${group.isExpanded ? 'down' : 'right'} text-sm text-[#6b7280] transition-transform group-hover:text-[#00cc6a]`}
                      />

                      {group.isActive && (
                        <span className="inline-block w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-[#1f2937] flex items-center gap-2">
                          {getConversationTitle(group)}
                        </h3>
                        {group.conversation?.context_summary && !group.isActive && (
                          <p className="text-xs text-[#9ca3af] truncate mt-0.5">
                            {group.conversation.context_summary}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[#9ca3af]">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-comment" />
                          {group.interactions.length}
                        </span>
                        <span>
                          {new Date(
                            group.conversation?.started_at || group.interactions[0]?.timestamp
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </button>

                    {/* Delete Conversation Button */}
                    {group.conversation && (
                      <button
                        onClick={() => setDeleteConversationModal(group.conversation!.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                        title="Delete conversation"
                      >
                        <i className="fas fa-trash text-xs" />
                      </button>
                    )}
                  </div>

                  {/* Interactions (Expanded) */}
                  <AnimatePresence>
                    {group.isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-2 bg-[#fafbfc]">
                          {group.interactions.map((interaction) => {
                            const person = getPersonDisplay(interaction.person_id);
                            const colors = getPersonColor(person.index);

                            return (
                              <div
                                key={interaction.id}
                                className="group/interaction bg-white rounded-lg border border-[#e5e7eb] overflow-hidden hover:border-[#80ffdb] transition-all"
                              >
                                <div className="flex items-start gap-3 p-3">
                                  {/* Avatar */}
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                    style={{ backgroundColor: colors.border }}
                                  >
                                    {person.label[0].toUpperCase()}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span
                                        className="text-xs font-semibold"
                                        style={{ color: colors.text }}
                                      >
                                        {person.label}
                                      </span>
                                      <span className="text-[10px] text-[#9ca3af]">
                                        {new Date(interaction.timestamp).toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-[#1f2937] leading-relaxed">
                                      {interaction.text}
                                    </p>
                                  </div>

                                  {/* Delete Button */}
                                  <button
                                    onClick={() => setDeleteInteractionModal(interaction.id)}
                                    className="w-7 h-7 flex items-center justify-center rounded-md opacity-0 group-hover/interaction:opacity-100 hover:bg-red-50 text-red-400 hover:text-red-600 transition-all flex-shrink-0"
                                    title="Delete interaction"
                                  >
                                    <i className="fas fa-trash text-xs" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Interaction Modal */}
      <Modal
        isOpen={deleteInteractionModal !== null}
        onClose={() => setDeleteInteractionModal(null)}
        onConfirm={() => {
          if (deleteInteractionModal) handleDeleteInteraction(deleteInteractionModal);
          setDeleteInteractionModal(null);
        }}
        title="Delete Interaction"
        message="Are you sure you want to delete this interaction? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      {/* Delete Conversation Modal */}
      <Modal
        isOpen={deleteConversationModal !== null}
        onClose={() => setDeleteConversationModal(null)}
        onConfirm={() => {
          if (deleteConversationModal) handleDeleteConversation(deleteConversationModal);
          setDeleteConversationModal(null);
        }}
        title="Delete Conversation"
        message="Are you sure you want to delete this entire conversation? All interactions will be permanently deleted."
        confirmText="Delete Conversation"
        variant="danger"
      />
    </>
  );
}