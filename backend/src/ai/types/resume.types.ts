export interface AICompleteRequest {
  text: string;
  context?: string;
  targetField?: string;
}

export interface AIPolishRequest {
  text: string;
  targetField?: string;
  tone?: 'professional' | 'concise' | 'creative' | 'formal';
}

export interface ResumeState {
  resumeContent: any;
  targetPosition?: string;
  optimizeType?: string;
  result?: string;
}
