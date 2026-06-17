export interface BasicInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio?: string;
  avatar?: string;
  title?: string;
}

export interface EducationItem {
  id: string;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description?: string;
  techStack?: string[];
}

export interface ResumeBlock {
  id: string;
  type:
    | 'basic'
    | 'education'
    | 'experience'
    | 'skills'
    | 'projects'
    | 'objective'
    | 'certifications';
  data:
    | BasicInfo
    | EducationItem[]
    | ExperienceItem[]
    | string[]
    | ProjectItem[]
    | { objective: string }
    | { certifications: string[] };
}

export interface ResumeContent {
  blocks: ResumeBlock[];
}

export interface Resume {
  id: string;
  user_id: string;
  template_id: string;
  title: string;
  content: ResumeContent;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface TemplateSchema {
  blocks: ResumeBlock[];
}

export interface StyleConfig {
  primaryColor: string;
  secondaryColor: string;
  fontSize: number;
  fontFamily: string;
  backgroundColor?: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  preview_image: string;
  schema: TemplateSchema;
  style_config: StyleConfig;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}
