import type { ResumeContent } from '@/types/resume';
import {
  SectionWrapper,
  DescriptionHtml,
  AchievementList,
  TechStackTags,
} from './common';

interface SectionProps {
  content: ResumeContent;
  primaryColor: string;
  lineColor: string;
  highlightClass: (section: string) => string;
  sectionTitleColor?: string;
  sectionTitleSize?: number;
  variant?: 'classic' | 'sidebar' | 'minimal';
}

export function EducationSection({
  content,
  primaryColor,
  lineColor,
  highlightClass,
  sectionTitleColor,
  sectionTitleSize,
  variant = 'classic',
}: SectionProps) {
  if (!content.education || content.education.length === 0) return null;

  const titleSize = variant === 'minimal' ? '14px' : '15px';
  const subSize = variant === 'minimal' ? '12px' : '13px';
  const dateSize = variant === 'minimal' ? '11px' : '12px';
  const dateColor = variant === 'minimal' ? '#bbb' : '#9ca3af';

  return (
    <SectionWrapper
      title="教育背景"
      primaryColor={primaryColor}
      lineColor={lineColor}
      sectionTitleColor={sectionTitleColor}
      sectionTitleSize={sectionTitleSize}
      highlightClass={highlightClass('education')}
      variant={variant}
    >
      {content.education.map((item) => (
        <div key={item.id} className="mb-4 last:mb-0">
          <div className="flex justify-between">
            <div>
              <h3
                className="font-medium text-gray-800"
                style={{ fontSize: titleSize }}
              >
                {item.school}
              </h3>
              <p className="text-gray-500" style={{ fontSize: subSize }}>
                {item.major} | {item.degree}
              </p>
            </div>
            <span style={{ fontSize: dateSize, color: dateColor }}>
              {item.startDate} - {item.endDate}
            </span>
          </div>
          {item.gpa && (
            <p className="text-gray-500 mt-1" style={{ fontSize: subSize }}>
              GPA: {item.gpa}
            </p>
          )}
        </div>
      ))}
    </SectionWrapper>
  );
}

export function ExperienceSection({
  content,
  primaryColor,
  lineColor,
  highlightClass,
  sectionTitleColor,
  sectionTitleSize,
  variant = 'classic',
}: SectionProps) {
  if (!content.experience || content.experience.length === 0) return null;

  const titleSize = variant === 'minimal' ? '14px' : '15px';
  const subSize = variant === 'minimal' ? '12px' : '13px';
  const dateSize = variant === 'minimal' ? '11px' : '12px';
  const dateColor = variant === 'minimal' ? '#bbb' : '#9ca3af';
  const descSize = variant === 'minimal' ? '12px' : '13px';
  const descColor = variant === 'minimal' ? '#666' : '#4b5563';
  const lineHeight = variant === 'minimal' ? '1.8' : undefined;

  return (
    <SectionWrapper
      title="工作经历"
      primaryColor={primaryColor}
      lineColor={lineColor}
      sectionTitleColor={sectionTitleColor}
      sectionTitleSize={sectionTitleSize}
      highlightClass={highlightClass('experience')}
      variant={variant}
    >
      {content.experience.map((item) => (
        <div key={item.id} className="mb-4 last:mb-0">
          <div className="flex justify-between">
            <div>
              <h3
                className="font-medium text-gray-800"
                style={{ fontSize: titleSize }}
              >
                {item.company}
              </h3>
              <p className="text-gray-500" style={{ fontSize: subSize }}>
                {item.position}
                {item.location ? ` | ${item.location}` : ''}
              </p>
            </div>
            <span style={{ fontSize: dateSize, color: dateColor }}>
              {item.startDate} - {item.endDate || '至今'}
            </span>
          </div>
          <DescriptionHtml
            html={item.description || ''}
            fontSize={descSize}
            color={descColor}
            lineHeight={lineHeight}
          />
          <AchievementList
            achievements={item.achievements || []}
            primaryColor={primaryColor}
            fontSize={descSize}
            color={descColor}
          />
        </div>
      ))}
    </SectionWrapper>
  );
}

export function ProjectsSection({
  content,
  primaryColor,
  lineColor,
  highlightClass,
  sectionTitleColor,
  sectionTitleSize,
  variant = 'classic',
}: SectionProps) {
  if (!content.projects || content.projects.length === 0) return null;

  const titleSize = variant === 'minimal' ? '14px' : '15px';
  const subSize = variant === 'minimal' ? '12px' : '13px';
  const dateSize = variant === 'minimal' ? '11px' : '12px';
  const dateColor = variant === 'minimal' ? '#bbb' : '#9ca3af';
  const descSize = variant === 'minimal' ? '12px' : '13px';
  const descColor = variant === 'minimal' ? '#666' : '#4b5563';
  const lineHeight = variant === 'minimal' ? '1.8' : undefined;

  return (
    <SectionWrapper
      title="项目经验"
      primaryColor={primaryColor}
      lineColor={lineColor}
      sectionTitleColor={sectionTitleColor}
      sectionTitleSize={sectionTitleSize}
      highlightClass={highlightClass('projects')}
      variant={variant}
    >
      {content.projects.map((item) => (
        <div key={item.id} className="mb-4 last:mb-0">
          <div className="flex justify-between">
            <div>
              <h3
                className="font-medium text-gray-800"
                style={{ fontSize: titleSize }}
              >
                {item.name}
              </h3>
              <p className="text-gray-500" style={{ fontSize: subSize }}>
                {item.role}
              </p>
            </div>
            <span style={{ fontSize: dateSize, color: dateColor }}>
              {item.startDate} - {item.endDate || '至今'}
            </span>
          </div>
          <DescriptionHtml
            html={item.description || ''}
            fontSize={descSize}
            color={descColor}
            lineHeight={lineHeight}
          />
          <TechStackTags
            techStack={item.techStack || []}
            primaryColor={primaryColor}
            variant={variant === 'minimal' ? 'minimal' : 'classic'}
          />
          <AchievementList
            achievements={item.achievements || []}
            primaryColor={primaryColor}
            fontSize={descSize}
            color={descColor}
          />
        </div>
      ))}
    </SectionWrapper>
  );
}

export function SkillsSection({
  content,
  primaryColor,
  lineColor,
  highlightClass,
  sectionTitleColor,
  sectionTitleSize,
  variant = 'classic',
}: SectionProps) {
  if (!content.skills || content.skills.length === 0) return null;

  const grouped = new Map<string, typeof content.skills>();
  for (const item of content.skills.filter((skill) => skill.name?.trim())) {
    const category = item.category?.trim() || '';
    grouped.set(category, [...(grouped.get(category) || []), item]);
  }
  if (grouped.size === 0) return null;

  return (
    <SectionWrapper
      title="专业技能"
      primaryColor={primaryColor}
      lineColor={lineColor}
      sectionTitleColor={sectionTitleColor}
      sectionTitleSize={sectionTitleSize}
      highlightClass={highlightClass('skills')}
      variant={variant}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {Array.from(grouped.entries()).map(([category, skills]) => (
          <div
            key={category || 'uncategorized'}
            style={{
              lineHeight: 1.7,
            }}
          >
            {category && (
              <strong
                style={{
                  display: 'block',
                  marginBottom: '2px',
                  color: variant === 'sidebar' ? 'inherit' : '#4b5563',
                  fontSize: variant === 'minimal' ? '11px' : '12px',
                  fontWeight: 600,
                }}
              >
                {category}
              </strong>
            )}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                fontSize: variant === 'minimal' ? '10px' : '11px',
              }}
            >
              {skills.map((item) => (
                <div key={item.id}>{item.name}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function CertificationsSection({
  content,
  primaryColor,
  lineColor,
  highlightClass,
  sectionTitleColor,
  sectionTitleSize,
  variant = 'classic',
}: SectionProps) {
  if (!content.certifications || content.certifications.length === 0)
    return null;

  if (variant === 'minimal') {
    return (
      <SectionWrapper
        title="证书荣誉"
        primaryColor={primaryColor}
        lineColor={lineColor}
        sectionTitleColor={sectionTitleColor}
        sectionTitleSize={sectionTitleSize}
        highlightClass={highlightClass('certifications')}
        variant={variant}
      >
        {content.certifications.map((item) => (
          <div key={item.id} className="mb-2 last:mb-0">
            <div className="flex justify-between">
              <h3
                className="font-medium text-gray-700"
                style={{ fontSize: '13px' }}
              >
                {item.name}
              </h3>
              <span style={{ fontSize: '11px', color: '#bbb' }}>
                {item.date}
              </span>
            </div>
          </div>
        ))}
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      title="证书荣誉"
      primaryColor={primaryColor}
      lineColor={lineColor}
      sectionTitleColor={sectionTitleColor}
      sectionTitleSize={sectionTitleSize}
      highlightClass={highlightClass('certifications')}
      variant={variant}
    >
      <div className="flex flex-wrap gap-2">
        {content.certifications.map((item) => (
          <span
            key={item.id}
            className="px-3 py-1 rounded text-sm"
            style={{
              backgroundColor: `${primaryColor}20`,
              color: primaryColor,
              border: `1px solid ${primaryColor}40`,
            }}
          >
            {item.name} {item.date || ''}
          </span>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function CampusExperiencesSection({
  content,
  primaryColor,
  lineColor,
  highlightClass,
  sectionTitleColor,
  sectionTitleSize,
  variant = 'classic',
}: SectionProps) {
  if (!content.campusExperiences || content.campusExperiences.length === 0)
    return null;

  const titleSize = variant === 'minimal' ? '13px' : '15px';
  const subSize = variant === 'minimal' ? '12px' : '13px';
  const dateSize = variant === 'minimal' ? '11px' : '12px';
  const dateColor = variant === 'minimal' ? '#bbb' : '#9ca3af';
  const descSize = variant === 'minimal' ? '12px' : '13px';
  const descColor = variant === 'minimal' ? '#666' : '#4b5563';

  return (
    <SectionWrapper
      title="校园经历"
      primaryColor={primaryColor}
      lineColor={lineColor}
      sectionTitleColor={sectionTitleColor}
      sectionTitleSize={sectionTitleSize}
      highlightClass={highlightClass('campusExperiences')}
      variant={variant}
      hasDivider={false}
    >
      {content.campusExperiences.map((item) => (
        <div key={item.id} className="mb-3 last:mb-0">
          <div className="flex justify-between">
            <div>
              <h3
                className="font-medium text-gray-800"
                style={{ fontSize: titleSize }}
              >
                {item.name}
              </h3>
              <p className="text-gray-500" style={{ fontSize: subSize }}>
                {item.role || item.position}
              </p>
            </div>
            <span style={{ fontSize: dateSize, color: dateColor }}>
              {item.startDate} - {item.endDate || '至今'}
            </span>
          </div>
          <AchievementList
            achievements={item.achievements || []}
            primaryColor={primaryColor}
            fontSize={descSize}
            color={descColor}
          />
        </div>
      ))}
    </SectionWrapper>
  );
}

export function CareerObjectiveSection({
  content,
  primaryColor,
  lineColor,
  highlightClass,
  sectionTitleColor,
  sectionTitleSize,
  variant = 'classic',
}: SectionProps) {
  if (!content.careerObjective) return null;

  const descSize = variant === 'minimal' ? '12px' : '13px';
  const descColor = variant === 'minimal' ? '#666' : '#4b5563';
  const lineHeight = variant === 'minimal' ? '1.8' : undefined;

  return (
    <div className={highlightClass('careerObjective')}>
      <SectionWrapper
        title="职业目标"
        primaryColor={primaryColor}
        lineColor={lineColor}
        sectionTitleColor={sectionTitleColor}
        sectionTitleSize={sectionTitleSize}
        variant={variant}
        hasDivider={false}
      >
        <DescriptionHtml
          html={content.careerObjective}
          fontSize={descSize}
          color={descColor}
          lineHeight={lineHeight}
        />
      </SectionWrapper>
    </div>
  );
}
