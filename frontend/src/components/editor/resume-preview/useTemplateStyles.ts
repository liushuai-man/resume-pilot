import { useResumeStore } from '@/store/useResumeStore';
import type { TemplateStyles } from './types';
import type { StyleConfig } from '@/types/resume';

const defaultTemplateStyle: StyleConfig & { layout?: string } = {
  primaryColor: '#2563EB',
  secondaryColor: '#64748B',
  fontSize: 14,
  fontFamily: "'Microsoft YaHei', Arial, sans-serif",
  backgroundColor: '#FFFFFF',
  sectionTitleColor: '#2563EB',
  sectionTitleSize: 16,
  lineColor: '#E2E8F0',
  layout: 'classic',
};

export function useTemplateStyles(
  overrideStyle?: StyleConfig | null,
  ignoreGlobal: boolean = false
): TemplateStyles {
  const { templateStyle } = useResumeStore();

  let style: StyleConfig & { sidebarColor?: string; sidebarTextColor?: string };
  
  if (overrideStyle !== undefined || ignoreGlobal) {
    style = (overrideStyle || defaultTemplateStyle) as any;
  } else {
    style = (templateStyle || defaultTemplateStyle) as any;
  }

  const primaryColor = style.primaryColor || '#2563EB';

  return {
    primaryColor,
    sectionTitleColor: style.sectionTitleColor || primaryColor,
    lineColor: style.lineColor || '#E2E8F0',
    backgroundColor: style.backgroundColor || '#FFFFFF',
    fontSize: style.fontSize || 14,
    fontFamily: style.fontFamily || "'Microsoft YaHei', Arial, sans-serif",
    sidebarColor: style.sidebarColor || '#0F172A',
    sidebarTextColor: style.sidebarTextColor || '#F1F5F9',
    sectionTitleSize: style.sectionTitleSize || 16,
  };
}

export function useIsEmpty(content: any): boolean {
  return (
    !content.basicInfo?.name &&
    !content.basicInfo?.title &&
    !content.education?.length &&
    !content.experience?.length &&
    !content.projects?.length &&
    !content.skills?.length &&
    !content.certifications?.length &&
    !content.campusExperiences?.length &&
    !content.careerObjective
  );
}

export function useHighlightClass(highlightSection?: string) {
  return (section: string) =>
    highlightSection === section
      ? 'ring-2 ring-blue-500 rounded-lg p-4 bg-blue-50'
      : '';
}

export function getTemplateLayout(
  template?: { schema?: any; style_config?: any } | null
): string {
  if (!template) return 'classic';
  return template.schema?.layout || template.style_config?.layout || 'classic';
}
