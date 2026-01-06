export interface Person {
  id: string;
  name: string | null;
  index: number;
  network_id: string;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: string;
  text: string;
  timestamp: string;
  network_id: string;
  person_id: string;
  conversation_id: string | null;
  sentiment: number | null;
}

export interface Conversation {
  id: string;
  user_ids: string;
  person_ids: string[];
  start_of_conversation: string;
  end_of_conversation: string | null;
  topic_summary: string | null;
  context_summary: string | null;
}

// Toast notifications
export type ToastType = 'success' | 'error' | 'warning' | 'info';