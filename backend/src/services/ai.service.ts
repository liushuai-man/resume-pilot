import { resumeAgent } from '../ai/agents/resume.agent';

export interface AICompleteRequest {
  text: string;
  context?: string;
  targetField?: string;
  userId?: string;
}

export interface AIPolishRequest {
  text: string;
  targetField?: string;
  tone?: 'professional' | 'concise' | 'creative' | 'formal';
  userId?: string;
}

export async function aiComplete(request: AICompleteRequest): Promise<string> {
  console.log('=== 使用 LangChain 进行 AI 补全 ===');
  return await resumeAgent.complete(request);
}

export async function aiPolish(request: AIPolishRequest): Promise<string> {
  console.log('=== 使用 LangChain 进行 AI 润色 ===');
  return await resumeAgent.polish(request);
}
