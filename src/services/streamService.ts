import { StreamChunk, SearchStep } from '../types';

const API_BASE_URL = 'https://vera-assignment-api.vercel.app/api/stream';

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onSearchStep: (steps: SearchStep[]) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}

export class StreamService {
  private abortController: AbortController | null = null;

  async streamQuestion(question: string, callbacks: StreamCallbacks): Promise<void> {
    this.abortController = new AbortController();
    const encodedPrompt = encodeURIComponent(question);
    const url = `${API_BASE_URL}?prompt=${encodedPrompt}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Content-Type': 'text/event-stream',
        },
        signal: this.abortController.signal,
        // @ts-ignore - React Native specific
        reactNative: { textStreaming: true },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if streaming is supported
      if (response.body && typeof response.body.getReader === 'function') {
        // Browser/modern environment with streaming support
        await this.streamWithReader(response, callbacks);
      } else {
        // Fallback for environments without streaming support
        const text = await response.text();
        this.processStreamData(text, callbacks);
        callbacks.onComplete();
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Stream was cancelled, this is expected
        return;
      }
      callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private async streamWithReader(response: Response, callbacks: StreamCallbacks): Promise<void> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        callbacks.onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        this.processLine(line, callbacks);
      }
    }
  }

  private processStreamData(text: string, callbacks: StreamCallbacks): void {
    const lines = text.split('\n');
    for (const line of lines) {
      this.processLine(line, callbacks);
    }
  }

  private processLine(line: string, callbacks: StreamCallbacks): void {
    if (line.startsWith('data: ')) {
      try {
        const jsonStr = line.slice(6); // Remove 'data: ' prefix
        const data: any = JSON.parse(jsonStr);

        // Handle two different API response structures:
        // Structure 1: { type: "STREAM", content: "text" }
        if (data.type === 'STREAM' && typeof data.content === 'string') {
          callbacks.onChunk(data.content);
          return;
        }

        // Structure 2: { type: "NodeChunk", content: { nodeName: "X", content: ... } }
        if (data.content && data.content.nodeName) {
          if (data.content.nodeName === 'STREAM' && typeof data.content.content === 'string') {
            callbacks.onChunk(data.content.content);
          } else if (data.content.nodeName === 'SEARCH_STEPS' || data.content.nodeName === 'SEARCH_PROGRESS') {
            if (Array.isArray(data.content.content)) {
              callbacks.onSearchStep(data.content.content);
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing SSE data:', parseError);
      }
    }
  }

  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
