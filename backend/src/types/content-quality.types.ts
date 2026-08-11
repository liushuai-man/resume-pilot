export type ContentQualityDimensionKey =
  | 'coherence'
  | 'informationValue'
  | 'evidenceSpecificity'
  | 'consistency'
  | 'professionalism';

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

export interface ContentQualityResult {
  score: number;
  dimensions: ContentQualityDimension[];
  issues: ContentQualityIssue[];
  overallConfidence: number;
  modelName: string;
  promptVersion: string;
  evaluatorVersion: string;
}
