import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createLLM } from '../providers/llm.provider';
import { COMPLETE_PROMPT } from '../prompts/resume/complete.prompt';
import { POLISH_PROMPT, TONE_DESCRIPTIONS } from '../prompts/resume/polish.prompt';
import { AICompleteRequest, AIPolishRequest } from '../types/resume.types';

export class ResumeAgent {
  private llm = createLLM({ temperature: 0.7, maxTokens: 500 });

  /**
   * AI 内容补全
   */
  async complete(request: AICompleteRequest): Promise<string> {
    const { text, context = '', targetField = '某个部分' } = request;

    const chain = RunnableSequence.from([
      COMPLETE_PROMPT,
      this.llm,
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

  /**
   * AI 内容润色
   */
  async polish(request: AIPolishRequest): Promise<string> {
    const { text, targetField = '简历通用内容', tone = 'professional' } = request;
    const toneDescription = TONE_DESCRIPTIONS[tone];

    const chain = RunnableSequence.from([
      POLISH_PROMPT,
      this.llm,
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
