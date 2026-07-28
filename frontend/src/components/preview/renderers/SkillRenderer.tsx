import type { RendererProps } from './index';
import { SectionWrapper } from './SectionWrapper';

const LEVEL_LABELS: Record<string, string> = {
  beginner: '入门',
  intermediate: '熟练',
  advanced: '精通',
  expert: '专家',
};

const LEVEL_BARS: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

export function SkillRenderer({
  section,
  style,
  variant,
  isHighlighted,
  onClick,
}: RendererProps) {
  if (section.type !== 'skill') return null;
  const items = section.data as any[];
  if (!items || items.length === 0) return null;

  const baseSize = style.fontSize || 14;
  const descSize = `${baseSize}px`;
  const tagSize = `${Math.max(baseSize - 2, 10)}px`;
  const primaryColor = style.primaryColor || '#2563eb';

  const grouped: Record<string, any[]> = {};
  for (const item of items) {
    const cat = item.category || '其他';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  const hasCategories = Object.keys(grouped).length > 1;

  const renderSkillTag = (skill: any) => {
    const level = skill.level || 'intermediate';
    const barCount = LEVEL_BARS[level] || 2;
    const label = LEVEL_LABELS[level] || '';

    return (
      <span
        key={skill.id}
        title={`${skill.name} · ${label}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: variant === 'sidebar' ? '3px 8px' : '3px 10px',
          backgroundColor:
            variant === 'sidebar' ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
          color: variant === 'sidebar' ? '#e5e7eb' : '#374151',
          borderRadius: '4px',
          fontSize: tagSize,
        }}
      >
        <span>{skill.name}</span>
        <span style={{ display: 'inline-flex', gap: '2px' }}>
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: '4px',
                height: '10px',
                borderRadius: '1px',
                backgroundColor:
                  i <= barCount
                    ? variant === 'sidebar'
                      ? '#ffffff'
                      : primaryColor
                    : variant === 'sidebar'
                      ? 'rgba(255,255,255,0.3)'
                      : '#d1d5db',
              }}
            />
          ))}
        </span>
      </span>
    );
  };

  return (
    <SectionWrapper
      title={section.title}
      style={style}
      variant={variant}
      isHighlighted={isHighlighted}
      onClick={onClick}
    >
      {hasCategories ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(grouped).map(([category, skills]) => (
            <div key={category}>
              <h4
                style={{
                  fontSize: descSize,
                  fontWeight: 600,
                  margin: '0 0 6px 0',
                  color: '#374151',
                }}
              >
                {category}
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {skills.map((skill) => renderSkillTag(skill))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {items.map((skill) => renderSkillTag(skill))}
        </div>
      )}
    </SectionWrapper>
  );
}
