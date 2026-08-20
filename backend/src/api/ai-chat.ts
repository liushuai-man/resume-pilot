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

export async function aiChatStream(
  request: AIChatRequest,
  onDelta: (delta: string) => Promise<void> | void
): Promise<string> {
  console.log('=== 使用新的 LangChain AI 流式对话');
  return await chatAgent.chatStream(request, onDelta);
}

export async function getSessionSummary(
  sessionId: string,
  userId?: string
): Promise<string> {
  return await chatAgent.getSessionSummary(sessionId, userId);
}

export async function clearSession(
  sessionId: string,
  userId?: string
): Promise<void> {
  await chatAgent.clearSession(sessionId, userId);
}
