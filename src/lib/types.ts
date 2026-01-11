export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

export interface PersonaSettings {
  name: string;
  description: string;
  systemPrompt: string;
}

export interface MemoryItem {
  id: string;
  title: string;
  details: string;
  createdAt: number;
  tags: string[];
}

export interface SessionState {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
