import type {
  InterviewStreamRequest,
  StreamFailure,
} from '../ai/streaming/interview-stream.events';
import type { InterviewStreamPublisher } from '../ai/streaming/interview-stream.publisher';
import {
  finishInterview,
  generateInterviewNextQuestion,
  startInterview,
} from './interview.service';

export async function runInterviewStream(
  userId: string,
  request: InterviewStreamRequest,
  publisher: InterviewStreamPublisher
) {
  await publisher.started({ protocolVersion: 1 });
  try {
    if (request.operation === 'start') {
      await publisher.stage('loading_context');
      await publisher.stage('planning');
      await publisher.stage('generating');
      const result = await startInterview(
        userId,
        request.resumeId,
        request.targetPosition,
        request.questionCount,
        request.jobProfileId,
        request.practiceTopic
      );
      publisher.setSessionId(result.sessionId);
      await publisher.stage('saving');
      await publisher.committed({ start: result });
      await publisher.completed();
      return;
    }

    publisher.setSessionId(request.sessionId);

    if (request.operation === 'next_question') {
      await publisher.stage('loading_context');
      await publisher.stage('generating');
      const question = await generateInterviewNextQuestion(
        userId,
        request.sessionId
      );
      await publisher.stage('saving');
      await publisher.committed({ question });
      await publisher.completed();
      return;
    }

    await publisher.stage('loading_context');
    await publisher.stage('evaluating_answers');
    await publisher.stage('building_report');
    const result = await finishInterview(userId, request.sessionId);
    await publisher.stage('saving');
    await publisher.committed({ result });
    await publisher.completed();
  } catch (error) {
    const failure: StreamFailure = {
      code:
        error instanceof Error && error.message === 'MODEL_CONFIG_REQUIRED'
          ? 'MODEL_OUTPUT_INVALID'
          : 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : '流式执行失败',
      retryable: true,
      retryFrom: request.operation,
      committed: false,
    };
    await publisher.failed(failure);
  }
}
