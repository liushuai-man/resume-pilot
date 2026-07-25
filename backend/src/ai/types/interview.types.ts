// ==================== 基础类型 ====================

export interface Question {
  id: string;
  content: string;
  section: string;
  sectionKey: string;
  isIntroduction?: boolean;
  type?: 'technical' | 'project' | 'followup' | 'introduction';
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  followUpFrom?: string;
  projectName?: string;
}

export interface Answer {
  questionId: string;
  content: string;
}

// ==================== 评估类型 ====================

export interface ProfileUpdate {
  skill: string;
  level: number;
  confidence: number;
}

export interface Evaluation {
  questionId: string;
  score: number;
  feedback: string;
  knowledgeLevel?: string;
  strengths?: string[];
  weaknesses?: string[];
  knowledgeGap?: string[];
  followUpSuggestion?: string;
  profileUpdate?: ProfileUpdate | null;
}

// ==================== 能力画像 ====================

export interface CandidateProfile {
  skills: Record<string, { level: number; confidence: number }>;
  overallLevel: number;
}

// ==================== 面试计划 ====================

export interface InterviewPlanItem {
  topic: string;
  priority: number;
  count: number;
  askedCount: number;
}

export interface Strategy {
  nextTopic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reason: string;
  questionType: 'technical' | 'project' | 'followup';
}

// ==================== 记忆类型 ====================

export interface MemoryItem {
  content: string;
  topic: string;
  score: number;
  metadata: Record<string, any>;
}

export interface MemoryResult {
  semanticMemory: MemoryItem[];
  profileUpdated: boolean;
}

// ==================== 面试状态 ====================

export interface InterviewState {
  resumeId: string;
  resumeContent: any;
  targetPosition?: string;
  maxQuestions: number;
  currentSection: string;
  questions: Question[];
  answers: Answer[];
  evaluations: Evaluation[];
  currentQuestionIndex: number;
  isFinished: boolean;
  finalReport?: any;
  userId?: string;
}

export interface InterviewReport {
  overallScore: number;
  introductionEvaluation?: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

// ==================== LangGraph 面试状态 ====================

export interface LangGraphInterviewState {
  resumeId: string;
  resumeContent: any;
  resumeText: string;
  targetPosition: string;
  maxQuestions: number;
  questions: Question[];
  answers: Answer[];
  evaluations: Evaluation[];
  currentQuestionIndex: number;
  isFinished: boolean;
  report?: any;
  userId?: string;

  // 面试计划（由 Strategy Agent 生成）
  interviewPlan: InterviewPlanItem[];

  // 当前策略（由 Strategy Agent 更新）
  strategy: Strategy | null;

  // 用户能力画像
  profile: CandidateProfile;

  // 已提问统计
  askedQuestionTypes: {
    technical: number;
    project: number;
    followup: number;
  };

  // 记忆检索结果
  memoryResult: MemoryResult | null;

  // 简历分析结果
  resumeAnalysis?: {
    sections: { key: string; name: string; description: string }[];
    keySkills: string[];
  };
}
