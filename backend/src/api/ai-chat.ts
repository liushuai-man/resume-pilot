import { Request, Response } from 'express';
import { OpenAI } from 'openai';
import { aiConfig } from '../config/ai';

// 根据配置创建对应的 AI 客户端
function createAIClient() {
  const config = {
    timeout: 100000, // 100 秒超时
    maxRetries: 2, // 最多重试 2 次
  };

  switch (aiConfig.provider) {
    case 'mimo':
      console.log('使用 Mimo 模型');
      return new OpenAI({
        apiKey: aiConfig.mimo.apiKey,
        baseURL: aiConfig.mimo.baseURL,
        ...config,
      });
    case 'deepseek':
      console.log('使用 DeepSeek 模型');
      return new OpenAI({
        apiKey: aiConfig.deepseek.apiKey,
        baseURL: 'https://api.deepseek.com',
        ...config,
      });
    case 'openai':
    default:
      console.log('使用 OpenAI 模型');
      return new OpenAI({
        apiKey: aiConfig.openai.apiKey,
        ...config,
      });
  }
}

const aiClient = createAIClient();

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatRequest {
  messages: ChatMessage[];
  resumeContent?: any;
  currentField?: string;
}

/**
 * 带重试和超时的 AI 调用包装函数
 */
async function callWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  timeoutMs = 90000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i <= retries; i++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('AI 请求超时')), timeoutMs);
      });

      const result = await Promise.race([fn(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.warn(`AI 对话调用失败 (尝试 ${i + 1}/${retries + 1}):`, error);

      if (i < retries) {
        // 等待一段时间后重试，指数退避
        const waitTime = Math.min(1000 * Math.pow(2, i), 3000);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error('AI 请求失败');
}

export async function aiChat(request: AIChatRequest): Promise<string> {
  const { messages, resumeContent, currentField } = request;

  // 构建系统提示
  let systemPrompt = `你是一名专业的简历助手，擅长帮助用户优化和撰写简历。你的职责包括：
1. 优化简历内容的表达方式
2. 量化工作成果（用数据说话）
3. 补全缺失的内容
4. 提升简历的 ATS 通过率
5. 提供专业的求职建议

请用简洁、专业的语言回答用户的问题。如果需要修改简历内容，请提供清晰的修改建议或直接给出优化后的内容。`;

  // 如果有简历内容，添加上下文
  if (resumeContent) {
    const resumeContext = `
当前简历内容：
${formatResumeForContext(resumeContent)}

用户当前正在编辑的模块：${currentField || '未指定'}
`;

    systemPrompt += resumeContext;
  }

  try {
    const response = await callWithRetry(async () => {
      const model =
        aiConfig.provider === 'mimo'
          ? aiConfig.mimo.model
          : aiConfig.provider === 'deepseek'
            ? aiConfig.deepseek.model
            : aiConfig.openai.model;

      return await aiClient.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('AI 对话失败:', error);
    throw new Error('AI 对话服务暂时不可用，请稍后重试');
  }
}

function formatResumeForContext(content: any): string {
  if (!content) return '暂无内容';

  let context = '';

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

  return context || '简历内容为空';
}
