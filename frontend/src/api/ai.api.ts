import request from '@/utils/request';
import { ApiResponse } from '@/types';

export interface AICompleteRequest {
  text: string;
  context?: string;
  targetField?: string;
}

export interface AIPolishRequest {
  text: string;
  targetField?: string;
  tone?: 'professional' | 'concise' | 'creative' | 'formal';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatRequest {
  sessionId?: string;
  resumeId?: string;
  messages: ChatMessage[];
  resumeContent?: any;
  currentField?: string;
}

export interface AIResponse {
  content: string;
}

export const aiApi = {
  complete: async (
    data: AICompleteRequest
  ): Promise<ApiResponse<AIResponse>> => {
    return await request.post('/ai/complete', data);
  },

  polish: async (data: AIPolishRequest): Promise<ApiResponse<AIResponse>> => {
    return await request.post('/ai/polish', data);
  },

  chat: async (data: AIChatRequest): Promise<ApiResponse<AIResponse>> => {
    return await request.post('/ai/chat', data);
  },
};

export default aiApi;
