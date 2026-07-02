import request from '@/utils/request';

export interface Question {
  id: string;
  content: string;
  section: string;
  sectionKey: string;
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
}

export interface FinishInterviewResponse extends InterviewResult {}

export const interviewApi = {
  // 开始面试
  startInterview: async (
    resumeId: string,
    targetPosition?: string,
    questionCount?: number
  ): Promise<StartInterviewResponse> => {
    return request.post('/api/interview/start', {
      resumeId,
      targetPosition,
      questionCount,
    });
  },

  // 提交答案
  submitAnswer: async (
    sessionId: string,
    question: Question,
    answer: string,
    resumeId: string
  ): Promise<SubmitAnswerResponse> => {
    return request.post('/api/interview/answer', {
      sessionId,
      question,
      answer,
      resumeId,
    });
  },

  // 完成面试
  finishInterview: async (
    sessionId: string,
    resumeId: string,
    questions: Question[],
    answers: Answer[]
  ): Promise<FinishInterviewResponse> => {
    return request.post('/api/interview/finish', {
      sessionId,
      resumeId,
      questions,
      answers,
    });
  },

  // 获取面试结果列表
  getInterviewResults: async (): Promise<InterviewResult[]> => {
    return request.get('/api/interview/results');
  },

  // 获取单个面试结果详情
  getInterviewResult: async (id: string): Promise<InterviewResult> => {
    return request.get(`/api/interview/results/${id}`);
  },
};
