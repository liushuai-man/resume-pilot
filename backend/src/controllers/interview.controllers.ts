import { Request, Response } from 'express';
import { success, error } from '../utils/response';
import {
  startInterview,
  submitAnswer,
  finishInterview,
  getInterviewResults,
  getInterviewResult,
  deleteInterviewResult,
  generateInterviewNextQuestion,
} from '../services/interview.service';

export const getNextQuestionHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { sessionId } = req.body;
    if (!userId || !sessionId) return error(res, '缺少会话信息', 400);
    const question = await generateInterviewNextQuestion(userId, sessionId);
    return success(res, { question });
  } catch (err) {
    console.error('生成下一题失败:', err);
    return error(res, '生成下一题失败');
  }
};

export const startInterviewHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { resumeId, targetPosition, questionCount } = req.body;

    if (!userId) {
      return error(res, '需要登录', 401);
    }

    if (!resumeId) {
      return error(res, '请提供简历ID', 400);
    }

    const normalizedQuestionCount = Number(questionCount || 5);
    if (
      !Number.isInteger(normalizedQuestionCount) ||
      normalizedQuestionCount < 3 ||
      normalizedQuestionCount > 10
    ) {
      return error(res, '面试题数必须是 3 到 10 之间的整数', 400);
    }

    const result = await startInterview(
      userId,
      resumeId,
      targetPosition,
      normalizedQuestionCount
    );
    return success(res, result, '面试已开始');
  } catch (err) {
    console.error('开始面试失败:', err);
    if (err instanceof Error && err.message === 'RESUME_NOT_FOUND') {
      return error(res, '所选简历不存在或已被删除', 404);
    }
    if (err instanceof Error && err.message === 'MODEL_CONFIG_REQUIRED') {
      return error(res, '请先添加并设置默认聊天模型', 400);
    }
    return error(res, '开始面试失败');
  }
};

export const submitAnswerHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { sessionId, answer } = req.body;

    if (!userId) {
      return error(res, '需要登录', 401);
    }

    if (!sessionId || !answer?.trim()) {
      return error(res, '请提供会话信息和回答内容', 400);
    }

    const result = await submitAnswer(userId, sessionId, answer);

    return success(res, result, '答案已提交');
  } catch (err) {
    console.error('提交答案失败:', err);
    return error(res, '提交答案失败');
  }
};

export const finishInterviewHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { sessionId } = req.body;

    if (!userId) {
      return error(res, '需要登录', 401);
    }

    if (!sessionId) return error(res, '请提供会话信息', 400);

    const result = await finishInterview(userId, sessionId);

    return success(res, result, '面试已完成');
  } catch (err) {
    console.error('完成面试失败:', err);
    return error(res, '完成面试失败');
  }
};

export const getInterviewResultsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return error(res, '需要登录', 401);
    }

    const results = await getInterviewResults(userId);
    return success(res, results, '获取成功');
  } catch (err) {
    console.error('获取面试结果失败:', err);
    return error(res, '获取面试结果失败');
  }
};

export const getInterviewResultHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      return error(res, '需要登录', 401);
    }

    const result = await getInterviewResult(id, userId);

    if (!result) {
      return error(res, '未找到面试结果', 404);
    }

    return success(res, result, '获取成功');
  } catch (err) {
    console.error('获取面试结果失败:', err);
    return error(res, '获取面试结果失败');
  }
};

export const deleteInterviewResultHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      return error(res, '需要登录', 401);
    }

    const result = await deleteInterviewResult(id, userId);

    if (!result) {
      return error(res, '未找到面试结果', 404);
    }

    return success(res, null, '删除成功');
  } catch (err) {
    console.error('删除面试结果失败:', err);
    return error(res, '删除面试结果失败');
  }
};
