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

interface MinimalLayoutProps {
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

export function MinimalLayout({
  content,
  primaryColor,
  lineColor,
  sectionTitleSize,
  highlightClass,
  cardClassName,
  fontFamily,
  fontSize,
  backgroundColor,
}: MinimalLayoutProps) {
  const sectionProps = {
    content,
    primaryColor,
    lineColor,
    highlightClass,
    sectionTitleSize,
    variant: 'minimal' as const,
  };

  return (
    <Card
      className={cardClassName}
      style={{ fontFamily, fontSize: `${fontSize}px`, backgroundColor, lineHeight: '1.8' }}
    >
      <div style={{ padding: '50px 40px' }}>
        {content.basicInfo && (
          <div className={`mb-10 ${highlightClass('basicInfo')}`}>
            <h1
              className="font-light mb-1 tracking-wider"
              style={{ color: '#222', fontSize: '36px', letterSpacing: '2px' }}
            >
              {content.basicInfo.name || '您的姓名'}
            </h1>
            <p
              className="tracking-wide mb-4"
              style={{ color: '#999', fontSize: '14px', letterSpacing: '1px' }}
            >
              {content.basicInfo.title || '您的职位'}
            </p>
            <div style={{ fontSize: '12px', color: '#aaa' }}>
              {content.basicInfo.phone && <span>{content.basicInfo.phone} · </span>}
              {content.basicInfo.email && <span>{content.basicInfo.email} · </span>}
              {content.basicInfo.location && <span>{content.basicInfo.location}</span>}
            </div>
            {content.basicInfo.bio && (
              <p
                className="mt-5 leading-relaxed"
                style={{ fontSize: '12px', color: '#777', maxWidth: '80%' }}
              >
                {content.basicInfo.bio}
              </p>
            )}
          </div>
        )}

        <CareerObjectiveSection {...sectionProps} />
        <ExperienceSection {...sectionProps} />
        <EducationSection {...sectionProps} />
        <ProjectsSection {...sectionProps} />
        <SkillsSection {...sectionProps} />
        <CertificationsSection {...sectionProps} />
        <CampusExperiencesSection {...sectionProps} />
      </div>
    </Card>
  );
}
