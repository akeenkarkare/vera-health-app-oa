export interface StreamChunk {
  type: string;
  content: {
    nodeName: string;
    content: string | SearchStep[];
  };
}

export interface SearchStep {
  text: string;
  isActive?: boolean;
  isCompleted?: boolean;
  extraInfo?: string;
}

export interface ContentSection {
  type: 'text' | 'guideline' | 'drug' | 'other';
  content: string;
  tagName?: string;
  id: string;
}

export interface Message {
  id: string;
  question: string;
  answer: ContentSection[];
  searchSteps?: SearchStep[];
  isStreaming: boolean;
  timestamp: number;
}
