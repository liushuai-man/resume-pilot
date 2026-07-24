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
  customFields?: { id: string; label: string; value: string }[];
}

export interface Education {
  id: string;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  department?: string;
  startDate: string;
  endDate: string;
  location?: string;
  description?: string;
  achievements?: string[];
}

export interface Project {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description?: string;
  techStack?: string[];
  achievements?: string[];
}

export interface Skill {
  id: string;
  name: string;
  level?: string;
  category?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface CampusExperience {
  id: string;
  name: string;
  role: string;
  position?: string;
  startDate: string;
  endDate: string;
  description?: string;
  achievements?: string[];
}

// 保持向后兼容性
export type Club = CampusExperience;

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
  basicInfo: BasicInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  careerObjective: string;
  certifications: Certification[];
  campusExperiences: CampusExperience[];
  // 保持向后兼容性
  clubs?: Club[];
  // 上传文件相关字段
  isUploadedFile?: boolean;
  fileUrl?: string;
  fileType?: 'pdf' | 'image';
  ocrText?: string;
  pageCount?: number;
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
  defaultContent: ResumeContent;
  layout: 'classic' | 'sidebar' | 'minimal';
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
  sidebarColor?: string;
  sidebarTextColor?: string;
  layout?: 'classic' | 'sidebar' | 'minimal';
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
