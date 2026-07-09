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

export interface Evaluation {
  questionId: string;
  score: number;
  feedback: string;
}

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
}

export interface InterviewReport {
  overallScore: number;
  introductionEvaluation?: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}
