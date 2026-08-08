import type { RendererProps } from './index';
import { SectionWrapper } from './SectionWrapper';
import { DateRange, DescriptionText, AchievementList } from './common';

export function ExperienceRenderer({
  section,
  style,
  variant,
  isHighlighted,
  onClick,
}: RendererProps) {
  if (section.type !== 'experience') return null;
  const items = section.data as any[];
  const safeItems = Array.isArray(items) ? items : [];

  const baseSize = style.fontSize || 14;
  const descSize = `${baseSize}px`;
  const titleSize = `${baseSize + 1}px`;
  const smallSize = `${Math.max(baseSize - 2, 10)}px`;

  return (
    <SectionWrapper
      title={section.title}
      style={style}
      variant={variant}
      isHighlighted={isHighlighted}
      onClick={onClick}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {safeItems.map((item) => (
          <div
            key={item.id}
            className="experience-item"
            data-resume-item-id={item.id}
          >
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
                  {item.position}
                </h3>
                <p
                  style={{
                    fontSize: descSize,
                    color: '#6b7280',
                    margin: '2px 0 0 0',
                  }}
                >
                  {item.company}
                  {item.location && <span> · {item.location}</span>}
                </p>
              </div>
              <DateRange
                startDate={item.startDate}
                endDate={item.endDate}
                variant={variant}
                fontSize={smallSize}
              />
            </div>
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
