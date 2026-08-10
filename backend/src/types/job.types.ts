export interface JobRequirement {
  name: string;
  evidence: string;
  confidence: number;
}

export interface ParsedJobProfile {
  jobTitle: string;
  seniority?: string;
  industry?: string;
  responsibilities: JobRequirement[];
  requiredSkills: JobRequirement[];
  preferredSkills: JobRequirement[];
  keywords: string[];
  confidence: number;
}
