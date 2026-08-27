import { createHash } from 'node:crypto';
import type { LangGraphInterviewState } from '../ai/types/interview.types';

export const retryableReportNodes = [
  'transcript_validation',
  'batch_evaluation',
  'report_composition',
  'report_publication',
] as const;

export type RetryableReportNode = (typeof retryableReportNodes)[number];

export function evaluationInputHash(state: LangGraphInterviewState): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        resume: state.resumeSnapshot,
        jobProfile: state.jobProfileSnapshot,
        rubric: state.rubricSnapshot,
        questions: state.questions,
        answers: state.answers,
      })
    )
    .digest('hex');
}

export function assertRetryRequest(input: {
  nodeKey: string;
  expectedInputHash: string;
  currentInputHash: string;
  storedInputHash: string | null;
  status: string;
  failedNode: string | null;
}) {
  if (!retryableReportNodes.includes(input.nodeKey as RetryableReportNode)) {
    throw new Error('INTERVIEW_NODE_NOT_RETRYABLE');
  }
  if (input.status === 'generating') {
    throw new Error('INTERVIEW_NODE_ALREADY_RUNNING');
  }
  if (input.status !== 'failed' || input.failedNode !== input.nodeKey) {
    throw new Error('INTERVIEW_NODE_STATE_CONFLICT');
  }
  if (
    !input.expectedInputHash ||
    input.expectedInputHash !== input.currentInputHash ||
    input.storedInputHash !== input.currentInputHash
  ) {
    throw new Error('INTERVIEW_CHECKPOINT_STALE');
  }
}
