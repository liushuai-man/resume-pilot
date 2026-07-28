import type { RendererProps } from './index';
import { SectionWrapper } from './SectionWrapper';
import { DescriptionText } from './common';

export function CustomRenderer({
  section,
  style,
  variant,
  isHighlighted,
  onClick,
}: RendererProps) {
  if (section.type !== 'custom') return null;
  const items = Array.isArray(section.data) ? section.data : [];
  if (!items || items.length === 0) return null;

  const baseSize = style.fontSize || 14;
  const descSize = `${baseSize}px`;
  const titleSize = `${baseSize + 1}px`;
  const smallSize = `${Math.max(baseSize - 3, 10)}px`;

  return (
    <SectionWrapper
      title={section.title}
      style={style}
      variant={variant}
      isHighlighted={isHighlighted}
      onClick={onClick}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item) => (
          <div key={item.id}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <h4
                  style={{
                    fontSize: titleSize,
                    fontWeight: 600,
                    margin: 0,
                    color: '#1f2937',
                  }}
                >
                  {item.title}
                </h4>
                {item.subtitle && (
                  <p
                    style={{
                      fontSize: descSize,
                      color: '#6b7280',
                      margin: '2px 0 0 0',
                    }}
                  >
                    {item.subtitle}
                  </p>
                )}
              </div>
              {item.date && (
                <span style={{ fontSize: smallSize, color: '#9ca3af' }}>
                  {item.date}
                </span>
              )}
            </div>
            {item.description && (
              <DescriptionText
                text={item.description}
                fontSize={descSize}
                variant={variant}
              />
            )}
            {item.tags && item.tags.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginTop: '6px',
                }}
              >
                {item.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      borderRadius: '3px',
                      fontSize: smallSize,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
