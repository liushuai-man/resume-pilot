export type InterviewStreamOperation = 'start' | 'next_question' | 'finish';

export type PublicInterviewStage =
  | 'queued'
  | 'loading_context'
  | 'planning'
  | 'generating'
  | 'validating'
  | 'saving'
  | 'evaluating_answers'
  | 'building_report'
  | 'completed';

export type InterviewStreamEventType =
  | 'run.started'
  | 'stage.changed'
  | 'text.started'
  | 'text.delta'
  | 'text.completed'
  | 'result.committed'
  | 'run.completed'
  | 'run.failed'
  | 'heartbeat';

export interface StreamFailure {
  code:
    | 'UNAUTHORIZED'
    | 'SESSION_CONFLICT'
    | 'MODEL_TIMEOUT'
    | 'MODEL_OUTPUT_INVALID'
    | 'PERSIST_FAILED'
    | 'CLIENT_CANCELLED'
    | 'INTERNAL_ERROR';
  message: string;
  retryable: boolean;
  retryFrom?: InterviewStreamOperation;
  committed: boolean;
}

export interface InterviewStreamEvent<T = unknown> {
  version: 1;
  eventId: string;
  runId: string;
  sessionId?: string;
  operation: InterviewStreamOperation;
  sequence: number;
  timestamp: string;
  type: InterviewStreamEventType;
  data: T;
}

export type InterviewStreamRequest =
  | {
      operation: 'start';
      resumeId: string;
      targetPosition?: string;
      questionCount?: number;
      jobProfileId?: string;
      practiceTopic?: string;
    }
  | {
      operation: 'next_question';
      sessionId: string;
    }
  | {
      operation: 'finish';
      sessionId: string;
    };
