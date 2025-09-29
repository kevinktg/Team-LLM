export interface Character {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  avatar: string;
}
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  characterId?: string;
  characterName?: string;
}
export interface OllamaSettings {
  apiUrl: string;
}
export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}