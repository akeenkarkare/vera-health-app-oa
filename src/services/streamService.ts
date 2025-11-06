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
    const encodedPrompt = encodeURIComponent(question);
    const url = `${API_BASE_URL}?prompt=${encodedPrompt}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.setRequestHeader('Accept', 'text/event-stream');

      let buffer = '';
      let lastProcessedIndex = 0;

      xhr.onprogress = () => {
        // Get only the new data since last update
        const newData = xhr.responseText.substring(lastProcessedIndex);
        lastProcessedIndex = xhr.responseText.length;

        buffer += newData;
        const lines = buffer.split('\n');

        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          this.processLine(line, callbacks);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Process any remaining buffer
          if (buffer) {
            const lines = buffer.split('\n');
            for (const line of lines) {
              this.processLine(line, callbacks);
            }
          }
          callbacks.onComplete();
          resolve();
        } else {
          const error = new Error(`HTTP error! status: ${xhr.status}`);
          callbacks.onError(error);
          reject(error);
        }
      };

      xhr.onerror = () => {
        const error = new Error('Network error');
        callbacks.onError(error);
        reject(error);
      };

      xhr.onabort = () => {
        resolve(); // Cancelled is expected
      };

      this.abortController = {
        abort: () => xhr.abort(),
      } as AbortController;

      xhr.send();
    });
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
