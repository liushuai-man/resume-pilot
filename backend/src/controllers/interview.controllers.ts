import { Request, Response } from 'express';
import {
  startInterview,
  submitAnswer,
  finishInterview,
  getInterviewResults,
  getInterviewResult,
  deleteInterviewResult,
} from '../services/interview.service';
import { prisma } from '../database/prisma';
import { success, error } from '../utils/response';

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

    const result = await startInterview(
      userId,
      resumeId,
      targetPosition,
      questionCount
    );
    return success(res, result, '面试已开始');
  } catch (err) {
    console.error('开始面试失败:', err);
    return error(res, '开始面试失败');
  }
};

export const submitAnswerHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { sessionId, question, answer, resumeId } = req.body;

    if (!userId) {
      return error(res, '需要登录', 401);
    }

    // 获取简历内容
    const resume = await prisma.resume.findUniqueOrThrow({
      where: { id: resumeId, user_id: userId },
    });

    const result = await submitAnswer(
      sessionId,
      question,
      answer,
      resume.content
    );

    return success(res, result, '答案已提交');
  } catch (err) {
    console.error('提交答案失败:', err);
    return error(res, '提交答案失败');
  }
};

export const finishInterviewHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { sessionId, resumeId, questions, answers, report } = req.body;

    if (!userId) {
      return error(res, '需要登录', 401);
    }

    // 获取简历内容
    const resume = await prisma.resume.findUniqueOrThrow({
      where: { id: resumeId, user_id: userId },
    });

    const result = await finishInterview(
      userId,
      sessionId,
      resumeId,
      questions,
      answers,
      resume.content,
      report
    );

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
