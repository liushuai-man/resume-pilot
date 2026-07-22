import { Card } from '@mantine/core';
import type { ResumeContent } from '@/types/resume';
import {
  EducationSection,
  ExperienceSection,
  ProjectsSection,
  SkillsSection,
  CertificationsSection,
  CampusExperiencesSection,
  CareerObjectiveSection,
} from './sections';

interface ClassicLayoutProps {
  content: ResumeContent;
  primaryColor: string;
  sectionTitleColor: string;
  lineColor: string;
  sectionTitleSize: number;
  highlightClass: (section: string) => string;
  formatMargin: string;
  cardClassName: string;
  fontFamily: string;
  fontSize: number;
  backgroundColor: string;
}

export function ClassicLayout({
  content,
  primaryColor,
  sectionTitleColor,
  lineColor,
  sectionTitleSize,
  highlightClass,
  formatMargin,
  cardClassName,
  fontFamily,
  fontSize,
  backgroundColor,
}: ClassicLayoutProps) {
  const sectionProps = {
    content,
    primaryColor,
    lineColor,
    highlightClass,
    sectionTitleColor,
    sectionTitleSize,
    variant: 'classic' as const,
  };

  return (
    <Card
      className={cardClassName}
      style={{ fontFamily, fontSize: `${fontSize}px`, backgroundColor }}
    >
      <div style={{ padding: `${formatMargin}px` }}>
        {content.basicInfo && (
          <div
            className={`text-center mb-6 pb-6 ${highlightClass('basicInfo')}`}
            style={{ borderBottom: `3px solid ${primaryColor}` }}
          >
            <h1
              className="font-bold mb-2"
              style={{ color: primaryColor, fontSize: '32px' }}
            >
              {content.basicInfo.name || '您的姓名'}
            </h1>
            <p
              style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}
            >
              {content.basicInfo.title || '您的职位'}
            </p>
            <div
              className="flex justify-center gap-4"
              style={{ fontSize: '12px', color: '#888' }}
            >
              {content.basicInfo.email && (
                <span>{content.basicInfo.email}</span>
              )}
              {content.basicInfo.phone && (
                <span>{content.basicInfo.phone}</span>
              )}
              {content.basicInfo.location && (
                <span>{content.basicInfo.location}</span>
              )}
            </div>
            {content.basicInfo.bio && (
              <p
                className="mt-4 text-gray-600 leading-relaxed text-left"
                style={{ fontSize: '13px' }}
              >
                {content.basicInfo.bio}
              </p>
            )}
          </div>
        )}

        <EducationSection {...sectionProps} />
        <ExperienceSection {...sectionProps} />
        <ProjectsSection {...sectionProps} />
        <SkillsSection {...sectionProps} />
        <CertificationsSection {...sectionProps} />
        <CampusExperiencesSection {...sectionProps} />
        <CareerObjectiveSection {...sectionProps} />
      </div>
    </Card>
  );
}
