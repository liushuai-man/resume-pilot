import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { createUserLLM } from '../providers/llm.provider';
import { vectorMemoryManager } from '../memory/vector-memory';
import { AIChatRequest } from '../types/chat.types';

export class ChatAgent {
  async chat(request: AIChatRequest): Promise<string> {
    const {
      sessionId = `temp_${Date.now()}`,
      messages,
      resumeContent,
      currentField = '未指定',
      userId,
      resumeId,
    } = request;

    console.log(`=== 使用向量化记忆进行 AI 对话 - Session: ${sessionId} ===`);

    try {
      const latestUserMessage = messages[messages.length - 1]?.content || '';
      let relevantMemories = '';

      // Some OpenAI-compatible providers do not expose an embedding endpoint.
      // Memory must be optional so it never blocks the primary chat request.
      try {
        if (resumeContent) {
          await vectorMemoryManager.addResumeContent(
            sessionId,
            resumeContent,
            userId,
            resumeId
          );
        }
        relevantMemories = await vectorMemoryManager.retrieveRelevantMemories(
          sessionId,
          latestUserMessage
        );
      } catch (memoryError) {
        console.warn('Vector memory is unavailable; continuing without it:', memoryError);
      }

      const context = relevantMemories
        ? `\n相关对话历史：\n${relevantMemories}`
        : '';

      const historyMessages = messages
        .slice(0, -1)
        .map((msg) =>
          msg.role === 'user'
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content)
        );

      const chatPrompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          `你是一名专业的简历助手，擅长帮助用户优化和撰写简历。你的职责包括：
1. 优化简历内容的表达方式
2. 量化工作成果（用数据说话）
3. 补全缺失的内容
4. 提升简历的 ATS 通过率
5. 提供专业的求职建议

请用简洁、专业的语言回答用户的问题。如果需要修改简历内容，请提供清晰的修改建议或直接给出优化后的内容。

{context}

用户当前正在编辑的模块：{currentField}`,
        ],
        new MessagesPlaceholder('history'),
        ['human', '{input}'],
      ]);

      const llm = await createUserLLM(userId, {
        temperature: 0.7,
        maxTokens: 1000,
      });

      const chain = RunnableSequence.from([
        chatPrompt,
        llm,
        new StringOutputParser(),
      ]);

      const response = await chain.invoke({
        context,
        currentField,
        history: historyMessages,
        input: latestUserMessage,
      });

      try {
        await vectorMemoryManager.addUserMessage(
          sessionId,
          latestUserMessage,
          userId,
          resumeId
        );
        await vectorMemoryManager.addAssistantMessage(
          sessionId,
          response,
          userId,
          resumeId
        );
      } catch (memoryError) {
        console.warn('Unable to save vector memory:', memoryError);
      }

      return response.trim();
    } catch (error) {
      console.error('AI 对话失败:', error);
      throw error;
    }
  }

  async getSessionSummary(sessionId: string): Promise<string> {
    return await vectorMemoryManager.generateSessionSummary(sessionId);
  }

  clearSession(sessionId: string): void {
    vectorMemoryManager.clearSession(sessionId);
  }
}

export const chatAgent = new ChatAgent();
