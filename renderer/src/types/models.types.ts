// Person/Speaker
export interface Person {
  id: string;
  name: string | null;
  index: number;
  voice_embedding: number[] | null;
  cluster_id: number | null;
  created_at: string;
  updated_at: string;
}

// Interaction
export interface Interaction {
  id: string;
  text: string;
  timestamp: string;
  network_id: string;
  speaker_id: string | null;
  voice_embedding: number[] | null;
  entities: unknown[] | null;
  topics: unknown[] | null;
  sentiment: number | null;
}

// Conversation
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

// Toast notifications
export type ToastType = 'success' | 'error' | 'warning' | 'info';