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

export interface Evaluation {
  questionId: string;
  score: number;
  feedback: string;
}

export interface InterviewState {
  resumeId: string;
  resumeContent: any;
  targetPosition?: string;
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
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}
