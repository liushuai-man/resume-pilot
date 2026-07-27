import React from 'react';
import type { ResumeSection, ResumeStyle } from '@/types/resume-document';
import { ProfileRenderer } from './ProfileRenderer';
import { EducationRenderer } from './EducationRenderer';
import { ExperienceRenderer } from './ExperienceRenderer';
import { ProjectRenderer } from './ProjectRenderer';
import { SkillRenderer } from './SkillRenderer';
import { CertificationRenderer } from './CertificationRenderer';
import { ObjectiveRenderer } from './ObjectiveRenderer';
import { CustomRenderer } from './CustomRenderer';

export type TemplateVariant = 'modern' | 'classic' | 'minimal' | 'sidebar';

export interface RendererProps {
  section: ResumeSection;
  style: ResumeStyle;
  variant: TemplateVariant;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export type SectionRenderer = React.FC<RendererProps>;

export const SECTION_RENDERERS: Record<string, SectionRenderer> = {
  profile: ProfileRenderer,
  education: EducationRenderer,
  experience: ExperienceRenderer,
  project: ProjectRenderer,
  skill: SkillRenderer,
  certification: CertificationRenderer,
  objective: ObjectiveRenderer,
  custom: CustomRenderer,
};

export function getSectionRenderer(type: string): SectionRenderer | null {
  return SECTION_RENDERERS[type] || null;
}
