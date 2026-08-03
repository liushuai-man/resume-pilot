import type { RendererProps } from './index';
import { SectionWrapper } from './SectionWrapper';
import { DateRange, DescriptionText } from './common';

export function EducationRenderer({
  section,
  style,
  variant,
  isHighlighted,
  onClick,
}: RendererProps) {
  if (section.type !== 'education') return null;
  const items = section.data as any[];
  const safeItems = Array.isArray(items) ? items : [];

  const baseSize = style.fontSize || 14;
  const descSize = `${baseSize}px`;
  const smallSize = `${Math.max(baseSize - 2, 10)}px`;

  return (
    <SectionWrapper
      title={section.title}
      style={style}
      variant={variant}
      isHighlighted={isHighlighted}
      onClick={onClick}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {safeItems.map((item) => (
          <div key={item.id} className="education-item">
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
                    fontSize: descSize,
                    fontWeight: 600,
                    margin: 0,
                    color: '#1f2937',
                  }}
                >
                  {item.school}
                </h3>
                <p
                  style={{
                    fontSize: descSize,
                    color: '#6b7280',
                    margin: '2px 0 0 0',
                  }}
                >
                  {item.degree} · {item.major}
                  {item.gpa && <span> · GPA: {item.gpa}</span>}
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
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
