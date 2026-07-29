import request from '@/utils/request';

export interface Question {
  id: string;
  content: string;
  section: string;
  sectionKey: string;
  isIntroduction?: boolean;
}

export interface Answer {
  questionId: string;
  content: string;
}

export interface InterviewResult {
  id: string;
  user_id: string;
  resume_id: string;
  position: string;
  score: number;
  report: any;
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
}

export interface SubmitAnswerResponse {
  feedback: string;
  nextQuestion: Question | null;
  isFinished: boolean;
  report?: any;
}

export interface FinishInterviewResponse extends InterviewResult {}

export const interviewApi = {
  // 开始面试
  startInterview: async (
    resumeId: string,
    targetPosition?: string,
    questionCount?: number
  ): Promise<StartInterviewResponse> => {
    const response: any = await request.post('/interview/start', {
      resumeId,
      targetPosition,
      questionCount,
    });
    return response.data || response;
  },

  // 提交答案
  submitAnswer: async (
    sessionId: string,
    question: Question,
    answer: string,
    resumeId: string
  ): Promise<SubmitAnswerResponse> => {
    const response: any = await request.post('/interview/answer', {
      sessionId,
      question,
      answer,
      resumeId,
    });
    return response.data || response;
  },

  // 完成面试
  finishInterview: async (
    sessionId: string,
    resumeId: string,
    questions: Question[],
    answers: Answer[],
    report?: any
  ): Promise<FinishInterviewResponse> => {
    const response: any = await request.post('/interview/finish', {
      sessionId,
      resumeId,
      questions,
      answers,
      report,
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
};
