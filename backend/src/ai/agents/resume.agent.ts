import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createUserLLM } from '../providers/llm.provider';
import { COMPLETE_PROMPT } from '../prompts/resume/complete.prompt';
import { POLISH_PROMPT, TONE_DESCRIPTIONS } from '../prompts/resume/polish.prompt';
import { AICompleteRequest, AIPolishRequest } from '../types/resume.types';

export class ResumeAgent {
  async complete(request: AICompleteRequest & { userId?: string }): Promise<string> {
    const { text, context = '', targetField = '某个部分', userId } = request;

    const llm = await createUserLLM(userId, { temperature: 0.7, maxTokens: 500 });

    const chain = RunnableSequence.from([
      COMPLETE_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        text,
        context,
        targetField,
      });
      return result.trim();
    } catch (error) {
      console.error('AI 补全失败:', error);
      throw new Error('AI 补全服务暂时不可用，请稍后重试');
    }
  }

  async polish(request: AIPolishRequest & { userId?: string }): Promise<string> {
    const { text, targetField = '简历通用内容', tone = 'professional', userId } = request;
    const toneDescription = TONE_DESCRIPTIONS[tone];

    const llm = await createUserLLM(userId, { temperature: 0.7, maxTokens: 500 });

    const chain = RunnableSequence.from([
      POLISH_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        text,
        targetField,
        toneDescription,
      });
      return result.trim();
    } catch (error) {
      console.error('AI 润色失败:', error);
      throw new Error('AI 润色服务暂时不可用，请稍后重试');
    }
  }
}

export const resumeAgent = new ResumeAgent();
