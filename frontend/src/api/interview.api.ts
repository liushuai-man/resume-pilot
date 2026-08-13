import request from '@/utils/request';

export interface Question {
  id: string;
  content: string;
  section: string;
  sectionKey: string;
  isIntroduction?: boolean;
  dimensionKeys: string[];
}

export interface Answer {
  questionId: string;
  content: string;
  submissionId?: string;
}

export interface InterviewResult {
  id: string;
  user_id: string;
  resume_id: string;
  position: string;
  score: number;
  report: any;
  status: 'generating' | 'completed' | 'failed';
  error_message?: string | null;
  current_node?: string | null;
  failed_node?: string | null;
  pipeline_state?: Record<string, 'pending' | 'running' | 'succeeded' | 'failed'>;
  evaluation_input_hash?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  resume?: {
    id: string;
    title: string;
  };
}

export interface StartInterviewResponse {
  sessionId: string;
  firstQuestion: Question;
  context: {
    position: string;
    resumeTitle: string;
    jobProfile: { id: string; version: number; jobTitle: string } | null;
    rubric: { version: string; mode: 'general' | 'job_profile' };
  };
}

export interface SubmitAnswerResponse {
  isFinished: boolean;
  questionId: string;
  duplicate: boolean;
}

export interface FinishInterviewResponse extends InterviewResult {}

export const interviewApi = {
  // 开始面试
  startInterview: async (
    resumeId: string,
    targetPosition?: string,
    questionCount?: number,
    jobProfileId?: string
  ): Promise<StartInterviewResponse> => {
    const response: any = await request.post('/interview/start', {
      resumeId,
      targetPosition,
      questionCount,
      jobProfileId,
    });
    return response.data || response;
  },

  // 提交答案
  submitAnswer: async (
    sessionId: string,
    answer: string,
    submissionId: string
  ): Promise<SubmitAnswerResponse> => {
    const response: any = await request.post('/interview/answer', {
      sessionId,
      answer,
      submissionId,
    });
    return response.data || response;
  },

  getNextQuestion: async (sessionId: string): Promise<Question | null> => {
    const response: any = await request.post('/interview/next-question', { sessionId });
    return response.data?.question || null;
  },

  // 完成面试
  finishInterview: async (
    sessionId: string
  ): Promise<FinishInterviewResponse> => {
    const response: any = await request.post('/interview/finish', {
      sessionId,
    });
    return response.data || response;
  },

  // 获取面试结果列表
  getInterviewResults: async (): Promise<InterviewResult[]> => {
    const response: any = await request.get('/interview/results');
    return response.data || response;
  },

  // 获取单个面试结果详情
  getInterviewResult: async (id: string): Promise<InterviewResult> => {
    const response: any = await request.get(`/interview/results/${id}`);
    return response.data || response;
  },

  // 删除面试结果
  deleteInterviewResult: async (id: string): Promise<void> => {
    await request.delete(`/interview/results/${id}`);
  },
  retryInterviewReport: async (id: string): Promise<InterviewResult> => {
    const response: any = await request.post(`/interview/results/${id}/retry`);
    return response.data || response;
  },
  retryInterviewNode: async (id: string, nodeKey: string, expectedInputHash: string): Promise<InterviewResult> => {
    const response: any = await request.post(`/interview/results/${id}/retry-node`, { nodeKey, expectedInputHash });
    return response.data || response;
  },
};
