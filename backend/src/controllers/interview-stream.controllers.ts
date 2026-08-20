import { Request, Response } from 'express';
import { createRunId, InterviewStreamPublisher } from '../ai/streaming/interview-stream.publisher';
import type { InterviewStreamRequest } from '../ai/streaming/interview-stream.events';
import { runInterviewStream } from '../services/interview-stream.service';
import { error } from '../utils/response';

const isValidRequest = (body: any): body is InterviewStreamRequest => {
  if (!body || typeof body.operation !== 'string') return false;
  if (body.operation === 'start') return typeof body.resumeId === 'string';
  if (body.operation === 'next_question' || body.operation === 'finish') return typeof body.sessionId === 'string';
  return false;
};

export const interviewStreamHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) return error(res, '需要登录', 401);
  if (!isValidRequest(req.body)) return error(res, '流式请求参数无效', 400);

  const runId = createRunId();
  const publisher = new InterviewStreamPublisher(
    res,
    runId,
    req.body.operation,
    req.body.operation === 'start' ? undefined : req.body.sessionId
  );
  req.on('close', () => {
    if (!res.writableEnded) publisher.close();
  });

  publisher.open();
  await runInterviewStream(userId, req.body, publisher);
  publisher.close();
};
