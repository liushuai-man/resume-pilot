import { Card } from '@mantine/core';
import type { ResumeContent } from '@/types/resume';
import {
  ExperienceSection,
  ProjectsSection,
  CampusExperiencesSection,
  CareerObjectiveSection,
} from './sections';
import { SectionTitle } from './SectionTitle';

interface SidebarLayoutProps {
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
  sidebarColor: string;
  sidebarTextColor: string;
}

export function SidebarLayout({
  content,
  primaryColor,
  sectionTitleColor,
  lineColor,
  sectionTitleSize,
  highlightClass,
  cardClassName,
  fontFamily,
  fontSize,
  backgroundColor,
  sidebarColor,
  sidebarTextColor,
}: SidebarLayoutProps) {
  const mainSectionProps = {
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
      data-theme-exempt="true"
      style={{
        fontFamily,
        fontSize: `${fontSize}px`,
        backgroundColor,
        padding: 0,
      }}
    >
      <div className="flex w-full" style={{ minHeight: '100%' }}>
        <div
          className="p-8"
          style={{
            width: '35%',
            backgroundColor: sidebarColor,
            color: sidebarTextColor,
          }}
        >
          {content.basicInfo && (
            <div className="mb-8">
              <h1
                className="font-bold mb-2"
                style={{ color: sidebarTextColor, fontSize: '24px' }}
              >
                {content.basicInfo.name || '您的姓名'}
              </h1>
              <p style={{ color: `${sidebarTextColor}cc`, fontSize: '13px' }}>
                {content.basicInfo.title || '您的职位'}
              </p>
              <div className="mt-5 space-y-2" style={{ fontSize: '11px' }}>
                {content.basicInfo.phone && (
                  <div style={{ color: `${sidebarTextColor}dd` }}>
                    📱 {content.basicInfo.phone}
                  </div>
                )}
                {content.basicInfo.email && (
                  <div style={{ color: `${sidebarTextColor}dd` }}>
                    📧 {content.basicInfo.email}
                  </div>
                )}
                {content.basicInfo.location && (
                  <div style={{ color: `${sidebarTextColor}dd` }}>
                    📍 {content.basicInfo.location}
                  </div>
                )}
              </div>
            </div>
          )}

          {content.skills && content.skills.length > 0 && (
            <div className="mb-6">
              <SectionTitle primaryColor={primaryColor} sidebar>
                专业技能
              </SectionTitle>
              <div className="flex flex-wrap gap-1">
                {content.skills.map((item) => (
                  <span
                    key={item.id}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: `${primaryColor}30`,
                      color: sidebarTextColor,
                    }}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {content.education && content.education.length > 0 && (
            <div className="mb-6">
              <SectionTitle primaryColor={primaryColor} sidebar>
                教育背景
              </SectionTitle>
              {content.education.map((item) => (
                <div
                  key={item.id}
                  className="mb-3 last:mb-0"
                  style={{ fontSize: '11px' }}
                >
                  <div style={{ fontWeight: 'bold', color: sidebarTextColor }}>
                    {item.school}
                  </div>
                  <div style={{ color: `${sidebarTextColor}cc` }}>
                    {item.major} · {item.degree}
                  </div>
                </div>
              ))}
            </div>
          )}

          {content.certifications && content.certifications.length > 0 && (
            <div className="mb-6">
              <SectionTitle primaryColor={primaryColor} sidebar>
                证书荣誉
              </SectionTitle>
              {content.certifications.map((item) => (
                <div
                  key={item.id}
                  className="mb-2 last:mb-0"
                  style={{ fontSize: '11px', color: `${sidebarTextColor}cc` }}
                >
                  • {item.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="p-8 flex-1"
          style={{ backgroundColor: '#fff', color: '#333' }}
        >
          {content.basicInfo?.bio && (
            <div
              className={`mb-6 pb-6 ${highlightClass('basicInfo')}`}
              style={{ borderBottom: `1px solid ${lineColor}` }}
            >
              <SectionTitle
                primaryColor={primaryColor}
                sectionTitleColor={sectionTitleColor}
                sectionTitleSize={sectionTitleSize}
              >
                个人总结
              </SectionTitle>
              <p
                className="text-gray-600 leading-relaxed"
                style={{ fontSize: '13px' }}
              >
                {content.basicInfo.bio}
              </p>
            </div>
          )}

          <CareerObjectiveSection {...mainSectionProps} />
          <ExperienceSection {...mainSectionProps} />
          <ProjectsSection {...mainSectionProps} />
          <CampusExperiencesSection {...mainSectionProps} />
        </div>
      </div>
    </Card>
  );
}
