export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatRequest {
  sessionId?: string;
  messages: ChatMessage[];
  resumeContent?: any;
  currentField?: string;
  userId?: string;
  resumeId?: string;
}

export interface MemoryDocument {
  id: string;
  content: string;
  metadata: {
    sessionId?: string;
    userId?: string;
    resumeId?: string;
    timestamp: Date;
    type: 'user_message' | 'assistant_message' | 'resume_content' | 'summary';
  };
}
