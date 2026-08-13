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
  retryInterviewReport,
  retryInterviewNode,
  getActiveInterviewSession,
} from '../services/interview.service';

export const getActiveInterviewSessionHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return error(res, '需要登录', 401);
    const result = await getActiveInterviewSession(userId, req.params.id);
    return success(res, result, '面试会话已恢复');
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('not found') || message.includes('forbidden')) return error(res, '面试会话不存在或无权访问', 404);
    if (message.includes('no longer active')) return error(res, '面试会话已经结束', 410);
    return error(res, '恢复面试会话失败');
  }
};

export const retryInterviewNodeHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return error(res, '需要登录', 401);
    const { nodeKey, expectedInputHash } = req.body;
    if (!nodeKey || !expectedInputHash) return error(res, '缺少重试节点或输入版本', 400);
    const result = await retryInterviewNode(userId, req.params.id, nodeKey, expectedInputHash);
    return success(res, result, result.status === 'completed' ? '报告已生成' : '节点执行失败');
  } catch (err) {
    const code = err instanceof Error ? err.message : '';
    if (code === 'INTERVIEW_RESULT_NOT_FOUND') return error(res, '未找到面试结果', 404);
    if (code === 'INTERVIEW_SESSION_UNAVAILABLE') return error(res, '完整问答记录不可用', 409);
    if (code === 'INTERVIEW_CHECKPOINT_STALE') return error(res, '面试输入已变化，请刷新后重新生成', 409);
    if (code === 'INTERVIEW_NODE_ALREADY_RUNNING') return error(res, '该步骤正在执行，请勿重复提交', 409);
    if (code === 'INTERVIEW_NODE_STATE_CONFLICT') return error(res, '当前失败步骤已变化，请刷新页面', 409);
    if (code === 'INTERVIEW_NODE_NOT_RETRYABLE') return error(res, '该步骤不支持单独重试', 400);
    return error(res, '重试节点失败');
  }
};

export const retryInterviewReportHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return error(res, '需要登录', 401);
    const result = await retryInterviewReport(userId, req.params.id);
    return success(res, result, result.status === 'completed' ? '报告已生成' : '报告生成失败');
  } catch (err) {
    if (err instanceof Error && err.message === 'INTERVIEW_RESULT_NOT_FOUND') return error(res, '未找到面试结果', 404);
    if (err instanceof Error && err.message === 'INTERVIEW_SESSION_UNAVAILABLE') return error(res, '完整问答记录不可用，无法重试', 409);
    return error(res, '重试报告生成失败');
  }
};

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
    const { resumeId, targetPosition, questionCount, jobProfileId, practiceTopic } = req.body;

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
      normalizedQuestionCount,
      jobProfileId,
      typeof practiceTopic === 'string' ? practiceTopic.slice(0, 200) : undefined
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
    if (err instanceof Error && err.message === 'JOB_PROFILE_NOT_CONFIRMED') {
      return error(res, '所选岗位画像不存在或尚未确认', 400);
    }
    return error(res, '开始面试失败');
  }
};

export const submitAnswerHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { sessionId, answer, submissionId } = req.body;

    if (!userId) {
      return error(res, '需要登录', 401);
    }

    if (!sessionId || !answer?.trim() || !submissionId) {
      return error(res, '请提供会话信息、回答内容和提交标识', 400);
    }

    const result = await submitAnswer(userId, sessionId, answer, submissionId);

    return success(res, result, '答案已提交');
  } catch (err) {
    console.error('提交答案失败:', err);
    if (err instanceof Error && err.message === 'INTERVIEW_QUESTION_UNAVAILABLE') return error(res, '当前问题不可用，请刷新会话', 409);
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
