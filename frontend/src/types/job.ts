export interface JobRequirement {
  name: string;
  evidence: string;
  confidence: number;
}

export interface JobProfile {
  id: string;
  jobDescriptionId: string;
  version: number;
  status: 'draft' | 'confirmed' | 'superseded';
  jobTitle: string;
  seniority?: string | null;
  industry?: string | null;
  responsibilities: JobRequirement[];
  requiredSkills: JobRequirement[];
  preferredSkills: JobRequirement[];
  keywords: string[];
  confidence?: number | null;
  parserVersion: string;
  promptVersion: string;
  modelName?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobDescription {
  id: string;
  title?: string | null;
  company?: string | null;
  rawText: string;
  sourceUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  latestProfile?: JobProfile | null;
}

export type EditableJobProfile = Pick<
  JobProfile,
  | 'jobTitle'
  | 'seniority'
  | 'industry'
  | 'responsibilities'
  | 'requiredSkills'
  | 'preferredSkills'
  | 'keywords'
>;

export interface AtsIssue {
  id: string;
  category: 'parseability' | 'basic' | 'education' | 'evidence' | 'skills' | 'expression';
  severity: 'error' | 'warning' | 'suggestion';
  section: string;
  itemId: string | null;
  field: string;
  title: string;
  message: string;
  availablePoints: number;
}

export interface AtsAnalysisResult {
  jobDescriptionId: string;
  resumeId: string;
  resumeTitle: string;
  resumeUpdatedAt: string;
  score: number;
  maxScore: 100;
  scorerVersion: string;
  analyzedAt: string;
  summary: { errors: number; warnings: number; suggestions: number };
  dimensions: Array<{
    key: AtsIssue['category'];
    label: string;
    score: number;
    maxScore: number;
  }>;
  issues: AtsIssue[];
  limitations: string[];
}
