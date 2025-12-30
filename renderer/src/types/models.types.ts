export interface Person {
  id: string;
  name: string;
  index?: number;
}

export interface Interaction {
  id: string;
  text: string;
  timestamp: string;
  speaker_id: string;
  speaker?: Person;
}

export type ListeningStatus = 'idle' | 'listening' | 'processing';
export type ToastType = 'info' | 'error' | 'warning' | 'success';