import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { createLLM } from '../providers/llm.provider';
import { aiConfig } from '../../config/ai';
import { MemoryDocument } from '../types/chat.types';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';

export class VectorMemoryManager {
  private embeddings: OpenAIEmbeddings;
  private vectorStores: Map<string, MemoryVectorStore> = new Map();
  private llm = createLLM({ temperature: 0.3, maxTokens: 500 });

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: this.getApiKey(),
      configuration: {
        baseURL: this.getBaseURL(),
      },
    });
  }

  private getApiKey(): string {
    switch (aiConfig.provider) {
      case 'mimo':
        return aiConfig.mimo.apiKey || '';
      case 'deepseek':
        return aiConfig.deepseek.apiKey || '';
      case 'openai':
      default:
        return aiConfig.openai.apiKey || '';
    }
  }

  private getBaseURL(): string | undefined {
    switch (aiConfig.provider) {
      case 'mimo':
        return aiConfig.mimo.baseURL;
      case 'deepseek':
        return 'https://api.deepseek.com/v1';
      case 'openai':
      default:
        return undefined;
    }
  }

  private getOrCreateVectorStore(sessionId: string): MemoryVectorStore {
    if (!this.vectorStores.has(sessionId)) {
      this.vectorStores.set(sessionId, new MemoryVectorStore(this.embeddings));
    }
    return this.vectorStores.get(sessionId)!;
  }

  async addMemory(
    sessionId: string,
    content: string,
    metadata: Omit<MemoryDocument['metadata'], 'timestamp'>
  ): Promise<void> {
    const vectorStore = this.getOrCreateVectorStore(sessionId);
    const doc = new Document({
      pageContent: content,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    });
    await vectorStore.addDocuments([doc]);
  }

  async addUserMessage(
    sessionId: string,
    content: string,
    userId?: string,
    resumeId?: string
  ): Promise<void> {
    await this.addMemory(sessionId, `用户说：${content}`, {
      sessionId,
      userId,
      resumeId,
      type: 'user_message',
    });
  }

  async addAssistantMessage(
    sessionId: string,
    content: string,
    userId?: string,
    resumeId?: string
  ): Promise<void> {
    await this.addMemory(sessionId, `助手回答：${content}`, {
      sessionId,
      userId,
      resumeId,
      type: 'assistant_message',
    });
  }

  async addResumeContent(
    sessionId: string,
    resumeContent: any,
    userId?: string,
    resumeId?: string
  ): Promise<void> {
    const formattedContent = this.formatResumeForMemory(resumeContent);
    await this.addMemory(sessionId, formattedContent, {
      sessionId,
      userId,
      resumeId,
      type: 'resume_content',
    });
  }

  private formatResumeForMemory(content: any): string {
    if (!content) return '简历内容为空';

    let context = '当前简历内容：\n';

    if (content.basicInfo) {
      context += `基本信息：
- 姓名：${content.basicInfo.name || '未填写'}
- 职位：${content.basicInfo.title || '未填写'}
- 邮箱：${content.basicInfo.email || '未填写'}
- 电话：${content.basicInfo.phone || '未填写'}
- 简介：${content.basicInfo.bio || '未填写'}
`;
    }

    if (content.experience && content.experience.length > 0) {
      context += `\n工作经历：\n`;
      content.experience.forEach((exp: any, index: number) => {
        context += `${index + 1}. ${exp.company || '公司未填写'} | ${exp.position || '职位未填写'} (${exp.startDate || ''} - ${exp.endDate || ''})
   描述：${exp.description || '未填写'}
`;
      });
    }

    if (content.education && content.education.length > 0) {
      context += `\n教育经历：\n`;
      content.education.forEach((edu: any, index: number) => {
        context += `${index + 1}. ${edu.school || '学校未填写'} | ${edu.major || '专业未填写'} | ${edu.degree || '学历未填写'}
`;
      });
    }

    if (content.projects && content.projects.length > 0) {
      context += `\n项目经验：\n`;
      content.projects.forEach((proj: any, index: number) => {
        context += `${index + 1}. ${proj.name || '项目未填写'} | ${proj.role || '角色未填写'}
   描述：${proj.description || '未填写'}
`;
      });
    }

    if (content.skills && content.skills.length > 0) {
      context += `\n技能：${content.skills.map((s: any) => s.name || s).join('、')}`;
    }

    if (content.careerObjective) {
      context += `\n职业目标：${content.careerObjective}`;
    }

    return context;
  }

  async retrieveRelevantMemories(
    sessionId: string,
    query: string,
    k: number = 5
  ): Promise<string> {
    const vectorStore = this.getOrCreateVectorStore(sessionId);
    const docs = await vectorStore.similaritySearch(query, k);
    
    if (docs.length === 0) {
      return '';
    }

    return docs.map((doc, index) => `[记忆 ${index + 1}] ${doc.pageContent}`).join('\n\n');
  }

  async generateSessionSummary(sessionId: string): Promise<string> {
    const vectorStore = this.getOrCreateVectorStore(sessionId);
    const allDocs = await vectorStore.similaritySearch('', 100);
    
    if (allDocs.length === 0) {
      return '暂无对话记录';
    }

    const allContent = allDocs.map(doc => doc.pageContent).join('\n\n');

    const summaryPrompt = PromptTemplate.fromTemplate(`
请为以下对话内容生成一个简短的摘要（不超过100字）：

{content}

摘要：
`.trim());

    const chain = RunnableSequence.from([
      summaryPrompt,
      this.llm,
      new StringOutputParser(),
    ]);

    return await chain.invoke({ content: allContent });
  }

  clearSession(sessionId: string): void {
    this.vectorStores.delete(sessionId);
  }

  clearAll(): void {
    this.vectorStores.clear();
  }
}

export const vectorMemoryManager = new VectorMemoryManager();
