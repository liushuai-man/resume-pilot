import type { ResumeContent } from '@/types/resume';

export interface ResumePreviewProps {
  content: ResumeContent;
  highlightSection?: string;
  variant?: 'editor' | 'card';
}

export interface TemplateStyles {
  primaryColor: string;
  sectionTitleColor: string;
  lineColor: string;
  backgroundColor: string;
  fontSize: number;
  fontFamily: string;
  sidebarColor: string;
  sidebarTextColor: string;
  sectionTitleSize: number;
}

export interface SectionProps {
  content: ResumeContent;
  primaryColor: string;
  lineColor: string;
  highlightClass: (section: string) => string;
  sectionTitleColor?: string;
  sidebar?: boolean;
  sidebarTextColor?: string;
}

export interface LayoutProps extends SectionProps {
  formatMargin: string;
}
