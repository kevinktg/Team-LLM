import { createPersistentStore } from '@/hooks/usePersistentStore';
import type { Character, ChatMessage } from '@/lib/types';
import { getModels as getOllamaModels, checkConnection, streamChat as streamOllamaChat } from '@/lib/ollama';
import { workerService } from '@/lib/workerService';
import { v4 as uuidv4 } from 'uuid';
import { EXTERNAL_MODELS, Model } from '@/lib/models';
export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error';
interface AppState {
  ollamaApiUrl: string;
  connectionState: ConnectionState;
  characters: Character[];
  models: Model[];
  activeCharacterId: string | null;
  chatMessages: ChatMessage[];
  isGenerating: boolean;
  isSettingsOpen: boolean;
  isCharacterSheetOpen: boolean;
  editingCharacterId: string | null;
  isGroupChatMode: boolean;
  groupChatParticipantIds: string[];
  isOrchestrating: boolean;
}
interface AppActions {
  setOllamaApiUrl: (url: string) => void;
  connectToOllama: () => Promise<void>;
  addCharacter: (character: Omit<Character, 'id'>) => void;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (id: string) => void;
  setActiveCharacterId: (id: string | null) => void;
  startChat: (prompt: string) => void;
  toggleSettings: (isOpen?: boolean) => void;
  toggleCharacterSheet: (isOpen?: boolean, editingId?: string | null) => void;
  toggleGroupChatMode: () => void;
  toggleGroupParticipant: (id: string) => void;
  startGroupConversation: (initialPrompt: string) => Promise<void>;
}
export const useAppStore = createPersistentStore<AppState & AppActions>((set, get) => ({
  ollamaApiUrl: 'http://localhost:11434',
  connectionState: 'idle',
  characters: [],
  models: [...EXTERNAL_MODELS],
  activeCharacterId: null,
  chatMessages: [],
  isGenerating: false,
  isSettingsOpen: false,
  isCharacterSheetOpen: false,
  editingCharacterId: null,
  isGroupChatMode: false,
  groupChatParticipantIds: [],
  isOrchestrating: false,
  setOllamaApiUrl: (url) => set({ ollamaApiUrl: url }),
  connectToOllama: async () => {
    const { ollamaApiUrl } = get();
    if (!ollamaApiUrl) return;
    set({ connectionState: 'connecting' });
    try {
      const isConnected = await checkConnection(ollamaApiUrl);
      if (!isConnected) throw new Error('Failed to connect');
      const localOllamaModels = await getOllamaModels(ollamaApiUrl);
      const localModels: Model[] = localOllamaModels.map(m => ({ name: m.name, isLocal: true }));
      set({ connectionState: 'connected', models: [...localModels, ...EXTERNAL_MODELS] });
    } catch (error) {
      console.error('Ollama connection error:', error instanceof Error ? error.message : String(error));
      set({ connectionState: 'error', models: [...EXTERNAL_MODELS] });
    }
  },
  addCharacter: (character) => {
    const newCharacter: Character = { ...character, id: uuidv4(), avatar: character.avatar || '🤖' };
    set(state => ({ characters: [...state.characters, newCharacter] }));
  },
  updateCharacter: (character) => {
    set(state => ({
      characters: state.characters.map(c => c.id === character.id ? { ...character, avatar: character.avatar || '🤖' } : c),
    }));
  },
  deleteCharacter: (id) => {
    set(state => ({
      characters: state.characters.filter(c => c.id !== id),
      activeCharacterId: state.activeCharacterId === id ? null : state.activeCharacterId,
      chatMessages: state.activeCharacterId === id ? [] : state.chatMessages,
      groupChatParticipantIds: state.groupChatParticipantIds.filter(pId => pId !== id),
    }));
  },
  setActiveCharacterId: (id) => {
    if (get().isGroupChatMode) return;
    if (get().activeCharacterId !== id) {
      set({ activeCharacterId: id, chatMessages: [] });
    }
  },
  startChat: (prompt) => {
    const { ollamaApiUrl, activeCharacterId, characters, models } = get();
    const activeCharacter = characters.find(c => c.id === activeCharacterId);
    if (!activeCharacter || get().isGenerating) return;
    const modelInfo = models.find(m => m.name === activeCharacter.model);
    const isLocalModel = modelInfo?.isLocal ?? false;
    const userMessage: ChatMessage = { id: uuidv4(), role: 'user', content: prompt };
    const assistantMessage: ChatMessage = { id: uuidv4(), role: 'assistant', content: '', characterId: activeCharacter.id, characterName: activeCharacter.name };
    set(state => ({
      chatMessages: [...state.chatMessages, userMessage, assistantMessage],
      isGenerating: true,
    }));
    const messagesForApi = get().chatMessages.slice(0, -1);
    const onChunk = (chunk: string) => {
      set(state => ({
        chatMessages: state.chatMessages.map(m =>
          m.id === assistantMessage.id ? { ...m, content: m.content + chunk } : m
        ),
      }));
    };
    const onDone = () => set({ isGenerating: false });
    const onError = (error: Error) => {
      console.error("Chat stream error:", error);
      set(state => ({
        chatMessages: state.chatMessages.map(m =>
          m.id === assistantMessage.id ? { ...m, content: `${m.content}\n\n**Error:** ${error.message}` } : m
        ),
        isGenerating: false,
      }));
    };
    if (isLocalModel) {
      streamOllamaChat(ollamaApiUrl, {
        model: activeCharacter.model,
        messages: messagesForApi,
        systemPrompt: activeCharacter.systemPrompt,
        onChunk,
        onDone,
        onError,
      });
    } else {
      workerService.streamChat(activeCharacter.model, messagesForApi, onChunk, onDone, onError);
    }
  },
  toggleSettings: (isOpen) => {
    set(state => ({ isSettingsOpen: isOpen ?? !state.isSettingsOpen }));
  },
  toggleCharacterSheet: (isOpen, editingId = null) => {
    set(state => ({
      isCharacterSheetOpen: isOpen ?? !state.isCharacterSheetOpen,
      editingCharacterId: isOpen === false ? null : editingId,
    }));
  },
  toggleGroupChatMode: () => {
    set(state => ({
      isGroupChatMode: !state.isGroupChatMode,
      groupChatParticipantIds: [],
      chatMessages: [],
      activeCharacterId: null,
    }));
  },
  toggleGroupParticipant: (id) => {
    set(state => {
      const isParticipant = state.groupChatParticipantIds.includes(id);
      if (isParticipant) {
        return { groupChatParticipantIds: state.groupChatParticipantIds.filter(pId => pId !== id) };
      } else {
        return { groupChatParticipantIds: [...state.groupChatParticipantIds, id] };
      }
    });
  },
  startGroupConversation: async (initialPrompt: string) => {
    const { groupChatParticipantIds, characters, models, ollamaApiUrl } = get();
    const participants = characters.filter(c => groupChatParticipantIds.includes(c.id));
    if (participants.length < 2 || get().isOrchestrating) return;
    set({ isOrchestrating: true, chatMessages: [{ id: uuidv4(), role: 'user', content: initialPrompt }] });
    const MAX_TURNS = participants.length * 2; // Each character speaks twice
    for (let i = 0; i < MAX_TURNS; i++) {
      const currentCharacter = participants[i % participants.length];
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: '',
        characterId: currentCharacter.id,
        characterName: currentCharacter.name,
      };
      set(state => ({ chatMessages: [...state.chatMessages, assistantMessage], isGenerating: true }));
      const messagesForApi = get().chatMessages.slice(0, -1);
      const modelInfo = models.find(m => m.name === currentCharacter.model);
      const isLocalModel = modelInfo?.isLocal ?? false;
      await new Promise<void>((resolve, reject) => {
        const onChunk = (chunk: string) => {
          set(state => ({
            chatMessages: state.chatMessages.map(m =>
              m.id === assistantMessage.id ? { ...m, content: m.content + chunk } : m
            ),
          }));
        };
        const onDone = () => {
          set({ isGenerating: false });
          resolve();
        };
        const onError = (error: Error) => {
          console.error("Group chat stream error:", error);
          set(state => ({
            chatMessages: state.chatMessages.map(m =>
              m.id === assistantMessage.id ? { ...m, content: `${m.content}\n\n**Error:** ${error.message}` } : m
            ),
            isGenerating: false,
          }));
          reject(error);
        };
        if (isLocalModel) {
          streamOllamaChat(ollamaApiUrl, {
            model: currentCharacter.model,
            messages: messagesForApi,
            systemPrompt: currentCharacter.systemPrompt,
            onChunk,
            onDone,
            onError,
          });
        } else {
          workerService.streamChat(currentCharacter.model, messagesForApi, onChunk, onDone, onError);
        }
      }).catch(() => {
        // Stop orchestration on error
        i = MAX_TURNS;
      });
    }
    set({ isOrchestrating: false });
  },
}), 'brutal-ai-store');