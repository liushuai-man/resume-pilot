import type { RendererProps } from './index';
import { SectionWrapper } from './SectionWrapper';

export function CertificationRenderer({
  section,
  style,
  variant,
  isHighlighted,
  onClick,
}: RendererProps) {
  if (section.type !== 'certification') return null;
  const items = section.data as any[];
  if (!items || items.length === 0) return null;

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <h4
                style={{
                  fontSize: descSize,
                  fontWeight: 500,
                  margin: 0,
                  color: '#374151',
                }}
              >
                {item.name}
              </h4>
              {item.issuer && (
                <p
                  style={{
                    fontSize: smallSize,
                    color: '#6b7280',
                    margin: '2px 0 0 0',
                  }}
                >
                  {item.issuer}
                </p>
              )}
            </div>
            {item.date && (
              <span style={{ fontSize: smallSize, color: '#9ca3af' }}>
                {item.date}
              </span>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
