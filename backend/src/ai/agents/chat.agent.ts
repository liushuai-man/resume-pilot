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

const SHORT_TERM_MESSAGE_LIMIT = 10;

function serializeResume(resumeContent: unknown): string {
  if (!resumeContent) return '当前没有可用的简历内容。';
  try {
    return JSON.stringify(resumeContent, null, 2);
  } catch {
    return String(resumeContent);
  }
}

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

    console.log(`=== AI 助手分层记忆对话 - Session: ${sessionId} ===`);

    try {
      const latestUserMessage = messages[messages.length - 1]?.content || '';
      const shortTermMessages = messages.slice(-(SHORT_TERM_MESSAGE_LIMIT + 1));
      const retrieval = await vectorMemoryManager.retrieveMemory({
        sessionId,
        query: latestUserMessage,
        userId,
        messages: shortTermMessages,
        k: 5,
      });
      console.log(
        `Long-term memory retrieval: mode=${retrieval.mode}, memories=${retrieval.count}`
      );

      const longTermMemory = retrieval.context || '没有检索到相关的长期记忆。';
      const historyMessages = shortTermMessages
        .slice(0, -1)
        .map((message) =>
          message.role === 'user'
            ? new HumanMessage(message.content)
            : new AIMessage(message.content)
        );

      const chatPrompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          `你是一名专业的简历助手，擅长帮助用户优化和撰写简历。你的职责包括：
1. 优化简历内容的表达方式
2. 量化工作成果
3. 补全缺失内容
4. 提升简历的 ATS 通过率
5. 提供专业、真实的求职建议

请使用简洁、专业的语言回答。不要编造简历中不存在的事实；需要补充信息时，应明确向用户询问。

【当前完整简历】
{resume}

【相关长期对话记忆】
{longTermMemory}

长期记忆可能来自较早的对话，只用于理解用户偏好、历史决定和相关讨论；若它与当前简历或用户最新要求冲突，以当前简历和最新要求为准。

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
        resume: serializeResume(resumeContent),
        longTermMemory,
        currentField,
        history: historyMessages,
        input: latestUserMessage,
      });

      // Long-term memory persistence is asynchronous so embedding latency does
      // not delay the response shown to the user.
      void vectorMemoryManager
        .addConversationTurn(
          sessionId,
          latestUserMessage,
          response,
          userId,
          resumeId
        )
        .catch((memoryError) => {
          console.warn('Unable to save long-term conversation memory:', memoryError);
        });

      return response.trim();
    } catch (error) {
      console.error('AI 对话失败:', error);
      throw error;
    }
  }

  async getSessionSummary(sessionId: string, userId?: string): Promise<string> {
    return await vectorMemoryManager.generateSessionSummary(sessionId, userId);
  }

  async clearSession(sessionId: string, userId?: string): Promise<void> {
    await vectorMemoryManager.clearSession(sessionId, userId);
  }
}

export const chatAgent = new ChatAgent();
