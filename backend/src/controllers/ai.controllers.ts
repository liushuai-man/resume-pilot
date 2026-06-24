import { Request, Response } from 'express';
import {
  aiComplete,
  aiPolish,
  AICompleteRequest,
  AIPolishRequest,
} from '../services/ai.service';
import { success, error } from '../utils/response';

export const completeText = async (req: Request, res: Response) => {
  try {
    const { text, context, targetField }: AICompleteRequest = req.body;

    if (!text || text.trim() === '') {
      return error(res, '请提供需要补全的文本', 400);
    }

    const result = await aiComplete({ text, context, targetField });

    return success(res, { content: result }, '补全成功');
  } catch (err: any) {
    console.error('AI补全失败:', err);
    return error(res, '补全失败，请稍后重试');
  }
};

export const polishText = async (req: Request, res: Response) => {
  try {
    const { text, targetField, tone }: AIPolishRequest = req.body;

    if (!text || text.trim() === '') {
      return error(res, '请提供需要润色的文本', 400);
    }

    const result = await aiPolish({ text, targetField, tone });

    return success(res, { content: result }, '润色成功');
  } catch (err: any) {
    console.error('AI润色失败:', err);
    return error(res, '润色失败，请稍后重试');
  }
};
