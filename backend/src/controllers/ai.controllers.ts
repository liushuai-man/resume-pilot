import { Request, Response } from 'express';
import {
  aiComplete,
  aiPolish,
  AICompleteRequest,
  AIPolishRequest,
} from '../services/ai.service';
import { aiChat, ChatMessage, AIChatRequest } from '../api/ai-chat';
import { success, error } from '../utils/response';
import { aiConfig } from '../config/ai';

export const completeText = async (req: Request, res: Response) => {
  try {
    console.log('=== AI补全请求 ===');
    console.log('使用模型:', aiConfig.provider);
    console.log('请求体:', {
      ...req.body,
      text: req.body.text?.substring(0, 50) + '...',
    });

    const { text, context, targetField }: AICompleteRequest = req.body;

    if (!text || text.trim() === '') {
      return error(res, '请提供需要补全的文本', 400);
    }

    const result = await aiComplete({ text, context, targetField });
    console.log('AI补全成功:', result?.substring(0, 50) + '...');

    return success(res, { content: result }, '补全成功');
  } catch (err: any) {
    console.error('=== AI补全失败 ===');
    console.error('错误名称:', err.name);
    console.error('错误消息:', err.message);
    console.error('错误堆栈:', err.stack);
    if (err.response) {
      console.error('API响应状态:', err.response.status);
      console.error('API响应数据:', err.response.data);
    }
    return error(res, `补全失败: ${err.message}`, 500);
  }
};

export const polishText = async (req: Request, res: Response) => {
  try {
    console.log('=== AI润色请求 ===');
    console.log('使用模型:', aiConfig.provider);
    console.log('请求体:', {
      ...req.body,
      text: req.body.text?.substring(0, 50) + '...',
    });

    const { text, targetField, tone }: AIPolishRequest = req.body;

    if (!text || text.trim() === '') {
      return error(res, '请提供需要润色的文本', 400);
    }

    const result = await aiPolish({ text, targetField, tone });
    console.log('AI润色成功:', result?.substring(0, 50) + '...');

    return success(res, { content: result }, '润色成功');
  } catch (err: any) {
    console.error('=== AI润色失败 ===');
    console.error('错误名称:', err.name);
    console.error('错误消息:', err.message);
    console.error('错误堆栈:', err.stack);
    if (err.response) {
      console.error('API响应状态:', err.response.status);
      console.error('API响应数据:', err.response.data);
    }
    return error(res, `润色失败: ${err.message}`, 500);
  }
};

export const chat = async (req: Request, res: Response) => {
  try {
    console.log('=== AI对话请求 ===');
    console.log('使用模型:', aiConfig.provider);
    console.log('消息数量:', req.body.messages?.length);

    const { messages, resumeContent, currentField }: AIChatRequest = req.body;

    if (!messages || messages.length === 0) {
      return error(res, '请提供对话消息', 400);
    }

    const response = await aiChat({ messages, resumeContent, currentField });
    console.log('AI对话成功:', response?.substring(0, 50) + '...');

    return success(res, { content: response }, '对话成功');
  } catch (err: any) {
    console.error('=== AI对话失败 ===');
    console.error('错误名称:', err.name);
    console.error('错误消息:', err.message);
    console.error('错误堆栈:', err.stack);
    if (err.response) {
      console.error('API响应状态:', err.response.status);
      console.error('API响应数据:', err.response.data);
    }
    return error(res, `对话失败: ${err.message}`, 500);
  }
};

export const testAIConnection = async (req: Request, res: Response) => {
  try {
    console.log('=== AI连接测试 ===');
    console.log('原始配置:', aiConfig.originalProvider);
    console.log('使用配置:', aiConfig.provider);
    console.log('完整配置:', {
      provider: aiConfig.provider,
      model:
        aiConfig.provider === 'mimo'
          ? aiConfig.mimo.model
          : aiConfig.provider === 'deepseek'
            ? aiConfig.deepseek.model
            : aiConfig.openai.model,
      baseURL:
        aiConfig.provider === 'mimo'
          ? aiConfig.mimo.baseURL
          : aiConfig.provider === 'deepseek'
            ? 'https://api.deepseek.com'
            : 'OpenAI 默认',
      hasApiKey: !!(aiConfig.provider === 'mimo'
        ? aiConfig.mimo.apiKey
        : aiConfig.provider === 'deepseek'
          ? aiConfig.deepseek.apiKey
          : aiConfig.openai.apiKey),
    });

    // 列出可能的 API 路径供参考
    const possiblePaths = [
      'https://token-plan-cn.xiaomimimo.com/v1',
      'https://token-plan-cn.xiaomimimo.com/api',
      'https://token-plan-cn.xiaomimimo.com/anthropic',
      'https://token-plan-cn.xiaomimimo.com',
    ];

    return success(
      res,
      {
        provider: aiConfig.provider,
        originalProvider: aiConfig.originalProvider,
        baseURL:
          aiConfig.provider === 'mimo' ? aiConfig.mimo.baseURL : undefined,
        configStatus: 'ok',
        message: '配置加载成功，请尝试不同的 MIMO_API_BASE_URL 值',
        possibleBaseURLs: possiblePaths,
      },
      '测试成功'
    );
  } catch (err: any) {
    console.error('AI连接测试失败:', err);
    return error(res, `测试失败: ${err.message}`, 500);
  }
};
