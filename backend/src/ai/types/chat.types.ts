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
