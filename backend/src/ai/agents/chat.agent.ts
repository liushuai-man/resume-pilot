import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { createLLM } from '../providers/llm.provider';
import { vectorMemoryManager } from '../memory/vector-memory';
import { CHAT_SYSTEM_PROMPT } from '../prompts/chat/system.prompt';
import { AIChatRequest, ChatMessage } from '../types/chat.types';

export class ChatAgent {
  private llm = createLLM({ temperature: 0.7, maxTokens: 1000 });

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
      // 如果有简历内容，先将其添加到记忆中
      if (resumeContent) {
        await vectorMemoryManager.addResumeContent(
          sessionId,
          resumeContent,
          userId,
          resumeId
        );
      }

      // 获取最新的用户问题
      const latestUserMessage = messages[messages.length - 1]?.content || '';

      // 从向量记忆中检索相关信息
      const relevantMemories = await vectorMemoryManager.retrieveRelevantMemories(
        sessionId,
        latestUserMessage
      );

      // 构建完整的 Prompt
      const context = relevantMemories
        ? `\n相关对话历史：\n${relevantMemories}`
        : '';

      // 将历史消息转换为 LangChain 消息格式
      const historyMessages = messages.slice(0, -1).map((msg) =>
        msg.role === 'user'
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      );

      // 创建聊天 Prompt 模板
      const chatPrompt = ChatPromptTemplate.fromMessages([
        ['system', `你是一名专业的简历助手，擅长帮助用户优化和撰写简历。你的职责包括：
1. 优化简历内容的表达方式
2. 量化工作成果（用数据说话）
3. 补全缺失的内容
4. 提升简历的 ATS 通过率
5. 提供专业的求职建议

请用简洁、专业的语言回答用户的问题。如果需要修改简历内容，请提供清晰的修改建议或直接给出优化后的内容。

{context}

用户当前正在编辑的模块：{currentField}`],
        new MessagesPlaceholder('history'),
        ['human', '{input}'],
      ]);

      // 构建链
      const chain = RunnableSequence.from([
        chatPrompt,
        this.llm,
        new StringOutputParser(),
      ]);

      // 调用链获取响应
      const response = await chain.invoke({
        context,
        currentField,
        history: historyMessages,
        input: latestUserMessage,
      });

      // 将新的对话添加到记忆中
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

      return response.trim();
    } catch (error) {
      console.error('AI 对话失败:', error);
      throw new Error('AI 对话服务暂时不可用，请稍后重试');
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
