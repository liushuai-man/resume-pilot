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

  chatStream: async (
    data: AIChatRequest,
    handlers: {
      onDelta: (delta: string) => void;
      onComplete?: (content: string) => void;
    },
    signal?: AbortSignal
  ): Promise<string> => {
    const baseUrl = `${import.meta.env.VITE_API_BASE_URL || ''}/api`;
    const response = await fetch(`${baseUrl}/ai/chat/stream`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal,
    });

    if (!response.ok || !response.body) {
      throw new Error((await response.text()) || 'AI 流式对话失败');
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = '';
    let finalContent = '';

    const handleFrame = (frame: string) => {
      const dataLine = frame
        .split(/\r?\n/)
        .find((line) => line.startsWith('data:'));
      if (!dataLine) return;
      const payload = JSON.parse(dataLine.slice(5).trimStart());
      if (payload.type === 'delta' && payload.delta) {
        finalContent += payload.delta;
        handlers.onDelta(payload.delta);
      }
      if (payload.type === 'completed') {
        finalContent = payload.content || finalContent;
        handlers.onComplete?.(finalContent);
      }
      if (payload.type === 'failed') {
        throw new Error(payload.message || 'AI 流式对话失败');
      }
    };

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const frames = buffer.split(/\r?\n\r?\n/);
        buffer = frames.pop() || '';
        frames.forEach(handleFrame);
      }
      return finalContent;
    } finally {
      reader.releaseLock();
    }
  },
};

export default aiApi;
