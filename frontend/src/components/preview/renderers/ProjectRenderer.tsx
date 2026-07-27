import type { RendererProps } from './index';
import { SectionWrapper } from './SectionWrapper';
import {
  DateRange,
  DescriptionText,
  AchievementList,
  TechStackTags,
} from './common';

export function ProjectRenderer({
  section,
  style,
  variant,
  isHighlighted,
  onClick,
}: RendererProps) {
  if (section.type !== 'project') return null;
  const items = section.data as any[];
  if (!items || items.length === 0) return null;

  const descSize = variant === 'minimal' ? '12px' : '13px';
  const titleSize = variant === 'minimal' ? '13px' : '14px';

  return (
    <SectionWrapper
      title={section.title}
      style={style}
      variant={variant}
      isHighlighted={isHighlighted}
      onClick={onClick}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((item) => (
          <div key={item.id} className="project-item">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: titleSize,
                    fontWeight: 600,
                    margin: 0,
                    color: '#1f2937',
                  }}
                >
                  {item.name}
                </h3>
                {item.role && (
                  <p
                    style={{
                      fontSize: descSize,
                      color: '#6b7280',
                      margin: '2px 0 0 0',
                    }}
                  >
                    {item.role}
                  </p>
                )}
              </div>
              <DateRange
                startDate={item.startDate}
                endDate={item.endDate}
                variant={variant}
              />
            </div>
            {item.techStack && item.techStack.length > 0 && (
              <TechStackTags
                techStack={item.techStack}
                primaryColor={style.primaryColor}
                variant={variant}
              />
            )}
            {item.description && (
              <DescriptionText
                text={item.description}
                fontSize={descSize}
                variant={variant}
              />
            )}
            {item.achievements && item.achievements.length > 0 && (
              <AchievementList
                achievements={item.achievements}
                fontSize={descSize}
              />
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
