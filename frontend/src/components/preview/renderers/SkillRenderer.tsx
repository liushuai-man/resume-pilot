import type { RendererProps } from './index';
import { SectionWrapper } from './SectionWrapper';

interface SkillLine {
  id?: string;
  name?: string;
  category?: string;
}

export function SkillRenderer({
  section,
  style,
  variant,
  isHighlighted,
  onClick,
}: RendererProps) {
  if (section.type !== 'skill') return null;

  const items = Array.isArray(section.data)
    ? (section.data as SkillLine[]).filter((item) => item.name?.trim())
    : [];
  if (items.length === 0) return null;

  const grouped = new Map<string, SkillLine[]>();
  for (const item of items) {
    const category = item.category?.trim() || '';
    grouped.set(category, [...(grouped.get(category) || []), item]);
  }

  const baseSize = style.fontSize || 14;
  const textColor = variant === 'sidebar' ? '#e5e7eb' : '#374151';
  const subtitleColor = variant === 'sidebar' ? '#f3f4f6' : '#4b5563';

  return (
    <SectionWrapper
      title={section.title}
      style={style}
      variant={variant}
      isHighlighted={isHighlighted}
      onClick={onClick}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Array.from(grouped.entries()).map(([category, skills]) => (
          <div
            key={category || 'uncategorized'}
            style={{
              breakInside: 'avoid',
            }}
          >
            {category && (
              <div
                style={{
                  color: subtitleColor,
                  fontSize: `${Math.max(baseSize - 1, 11)}px`,
                  fontWeight: 600,
                  lineHeight: 1.5,
                  marginBottom: '2px',
                }}
              >
                {category}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {skills.map((skill, index) => (
                <div
                  key={skill.id || `${category}-${index}`}
                  style={{
                    color: textColor,
                    fontSize: `${Math.max(baseSize - 2, 10)}px`,
                    lineHeight: 1.7,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {skill.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
