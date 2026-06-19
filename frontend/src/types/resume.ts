export interface BasicInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio?: string;
  avatar?: string;
  title?: string;
  gender?: string;
  website?: string;
  summary?: string;
}

export interface EducationItem {
  id: string;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  description?: string | string[];
}

export interface ExperienceItem {
  id?: string;
  company: string;
  position: string;
  department?: string;
  startDate: string;
  endDate: string;
  location?: string;
  description?: string | string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  location?: string;
  description?: string | string[];
  techStack?: string[];
}

export interface OrganizationItem {
  id: string;
  name: string;
  role: string;
  department?: string;
  startDate: string;
  endDate: string;
  location?: string;
  description?: string | string[];
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
    | 'certifications'
    | 'awards'
    | 'organizations';
  data:
    | BasicInfo
    | EducationItem[]
    | ExperienceItem[]
    | string[]
    | ProjectItem[]
    | OrganizationItem[]
    | { objective: string }
    | { certifications: string[] }
    | { certifications: { name: string; date: string }[] }
    | { awards: string[] };
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
  sectionTitleColor?: string;
  sectionTitleSize?: number;
  lineColor?: string;
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
