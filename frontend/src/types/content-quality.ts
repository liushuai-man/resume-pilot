export type ContentQualityDimensionKey = 'coherence' | 'informationValue' | 'evidenceSpecificity' | 'consistency' | 'professionalism';

export interface ContentQualityDimension {
  key: ContentQualityDimensionKey;
  score: number;
  maxScore: number;
  confidence: number;
  reason: string;
}

export interface ContentQualityIssue {
  fieldId: string;
  section: string;
  itemId: string | null;
  field: string;
  evidence: string;
  dimension: ContentQualityDimensionKey;
  severity: 'error' | 'warning' | 'suggestion';
  reason: string;
  suggestion: string;
  confidence: number;
  status: 'confirmed' | 'needs_confirmation';
}

export interface ContentQualityAnalysis {
  id: string;
  resumeId: string;
  resumeUpdatedAt: string;
  score: number;
  dimensions: ContentQualityDimension[];
  issues: ContentQualityIssue[];
  overallConfidence: number;
  modelName: string;
  promptVersion: string;
  evaluatorVersion: string;
  createdAt: string;
  stale: boolean;
}

export type ResumeOptimizationResult = {
  analysisId: string; issueIndex: number; fieldId: string; originalText: string;
  promptVersion: string; evaluatorVersion: string;
} & ({ mode: 'needs_input'; questions: string[] } | { mode: 'suggestion'; suggestedText: string; reason: string; usedUserFacts: string[]; modelName?: string });

export interface AppliedResumeOptimization {
  versionId: string;
  fieldId: string;
  resume: import('./resume').Resume;
}

export type AtsOptimizationResult = { issueId: string; fieldId: string; originalText: string } & ({ mode: 'needs_input'; questions: string[] } | { mode: 'suggestion'; suggestedText: string; reason: string; usedUserFacts: string[] });
