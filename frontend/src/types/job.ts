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
