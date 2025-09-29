import type { ChatMessage } from './types';
class WorkerService {
  private sessionId: string;
  private baseUrl: string;
  constructor() {
    this.sessionId = crypto.randomUUID();
    this.baseUrl = `/api/chat/${this.sessionId}`;
  }
  private getApiUrl(model: string): string {
    // This logic can be expanded if different models need different session handling
    return this.baseUrl;
  }
  async streamChat(
    model: string,
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (error: Error) => void
  ) {
    try {
      const response = await fetch(`${this.getApiUrl(model)}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messages[messages.length - 1].content,
          model: model,
          stream: true,
        }),
      });
      if (!response.ok || !response.body) {
        throw new Error(`Worker API request failed: ${response.statusText}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
      }
      onDone();
    } catch (error) {
      console.error('Worker streaming chat failed:', error);
      onError(error instanceof Error ? error : new Error('An unknown error occurred with worker chat'));
    }
  }
}
export const workerService = new WorkerService();