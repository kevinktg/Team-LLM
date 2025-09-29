import type { OllamaModel, ChatMessage } from './types';
export async function getModels(apiUrl: string): Promise<OllamaModel[]> {
  try {
    const response = await fetch(`${apiUrl}/api/tags`);
    if (!response.ok) {
      throw new Error(`Ollama API request failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error("Failed to fetch Ollama models:", error);
    throw error;
  }
}
export async function checkConnection(apiUrl: string): Promise<boolean> {
  try {
    const response = await fetch(apiUrl);
    return response.ok;
  } catch {
    return false;
  }
}
interface StreamChatOptions {
  model: string;
  messages: ChatMessage[];
  systemPrompt: string;
  onChunk: (chunk: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}
export async function streamChat(apiUrl: string, options: StreamChatOptions) {
  const { model, messages, systemPrompt, onChunk, onDone, onError } = options;
  try {
    const response = await fetch(`${apiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        system: systemPrompt,
        stream: true,
      }),
    });
    if (!response.body) {
      throw new Error('Response body is null');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.trim() === '') continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.message && parsed.message.content) {
            onChunk(parsed.message.content);
          }
          if (parsed.done) {
            onDone();
            return;
          }
        } catch (e) {
          console.error('Failed to parse stream chunk:', line, e);
        }
      }
    }
    onDone();
  } catch (error) {
    console.error('Streaming chat failed:', error);
    onError(error instanceof Error ? error : new Error('An unknown error occurred'));
  }
}