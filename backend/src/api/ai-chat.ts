import { chatAgent } from '../ai/agents/chat.agent';

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

export async function aiChat(request: AIChatRequest): Promise<string> {
  console.log('=== 使用新的 LangChain AI 对话');
  return await chatAgent.chat(request);
}

export async function getSessionSummary(sessionId: string): Promise<string> {
  return await chatAgent.getSessionSummary(sessionId);
}

export async function clearSession(sessionId: string): Promise<void> {
  chatAgent.clearSession(sessionId);
}
