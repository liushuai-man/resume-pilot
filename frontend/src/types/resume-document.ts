export interface ResumeDocument {
  id: string;
  title: string;

  sections: ResumeSection[];

  style: ResumeStyle;

  layout: ResumeLayout;

  createdAt?: string;
  updatedAt?: string;
}

export type ResumeSection =
  | ProfileSection
  | EducationSection
  | ExperienceSection
  | ProjectSection
  | SkillSection
  | CertificationSection
  | ObjectiveSection
  | CustomSection;

interface BaseSection<T = unknown> {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  order: number;
  data: T;
}

export interface ProfileSection extends BaseSection<ProfileData> {
  type: 'profile';
}

export interface EducationSection extends BaseSection<EducationItem[]> {
  type: 'education';
}

export interface ExperienceSection extends BaseSection<ExperienceItem[]> {
  type: 'experience';
}

export interface ProjectSection extends BaseSection<ProjectItem[]> {
  type: 'project';
}

export interface SkillSection extends BaseSection<SkillItem[]> {
  type: 'skill';
}

export interface CertificationSection extends BaseSection<CertificationItem[]> {
  type: 'certification';
}

export interface ObjectiveSection extends BaseSection<ObjectiveData> {
  type: 'objective';
}

export interface CustomSection extends BaseSection<CustomItem[]> {
  type: 'custom';
}

export interface ProfileData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
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
  gpa?: string;
  description?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements?: string[];
  location?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  techStack?: string[];
  achievements?: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface ObjectiveData {
  content: string;
}

export interface CustomItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  tags?: string[];
}

export interface ResumeStyle {
  theme: string;
  primaryColor: string;
  secondaryColor?: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  margin: number;
  sectionSpacing: number;
  sectionTitleColor?: string;
  sectionTitleSize?: number;
  lineColor?: string;
  sidebarColor?: string;
  sidebarTextColor?: string;
  backgroundColor?: string;
}

export interface ResumeLayout {
  template: 'modern' | 'classic' | 'minimal' | 'sidebar';
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

export type SectionType = ResumeSection['type'];

export interface SectionTypeConfig {
  type: SectionType;
  label: string;
  icon: string;
  defaultTitle: string;
  isList: boolean;
}

export const SECTION_TYPE_CONFIGS: SectionTypeConfig[] = [
  { type: 'profile', label: '个人信息', icon: 'user', defaultTitle: '个人信息', isList: false },
  { type: 'education', label: '教育经历', icon: 'graduation', defaultTitle: '教育经历', isList: true },
  { type: 'experience', label: '工作经历', icon: 'briefcase', defaultTitle: '工作经历', isList: true },
  { type: 'project', label: '项目经验', icon: 'folder', defaultTitle: '项目经验', isList: true },
  { type: 'skill', label: '专业技能', icon: 'wrench', defaultTitle: '专业技能', isList: true },
  { type: 'certification', label: '证书荣誉', icon: 'award', defaultTitle: '证书荣誉', isList: true },
  { type: 'objective', label: '职业目标', icon: 'target', defaultTitle: '职业目标', isList: false },
  { type: 'custom', label: '自定义模块', icon: 'plus', defaultTitle: '自定义模块', isList: true },
];
