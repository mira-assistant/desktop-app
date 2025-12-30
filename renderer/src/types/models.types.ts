export interface Person {
    id: string;
    name: string | null;
    index: number;
    voice_embedding: number[] | null;
    cluster_id: number | null;
    created_at: string;
    updated_at: string;
  }

  export interface Interaction {
    id: string;
    text: string;
    timestamp: string;
    conversation_id: string | null;
    voice_embedding: number[] | null;
    speaker_id: string | null;
    speaker?: Person;
    entities: unknown[] | null;
    topics: unknown[] | null;
    sentiment: number | null;
  }

  export interface Conversation {
    id: string;
    user_ids: string;
    speaker_id: string | null;
    start_of_conversation: string;
    end_of_conversation: string | null;
    topic_summary: string | null;
    context_summary: string | null;
    participants: string[] | null;
  }

  export interface HealthStatus {
    enabled: boolean;
    connected_clients: Record<string, unknown>;
    recent_interactions: string[];
  }