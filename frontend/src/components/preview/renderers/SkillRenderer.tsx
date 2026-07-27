import type { RendererProps } from './index';
import { SectionWrapper } from './SectionWrapper';

export function SkillRenderer({ section, style, variant, isHighlighted, onClick }: RendererProps) {
  if (section.type !== 'skill') return null;
  const items = section.data as any[];
  if (!items || items.length === 0) return null;

  const descSize = variant === 'minimal' ? '12px' : '13px';

  const grouped: Record<string, any[]> = {};
  for (const item of items) {
    const cat = item.category || '其他';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  const hasCategories = Object.keys(grouped).length > 1;

  return (
    <SectionWrapper title={section.title} style={style} variant={variant} isHighlighted={isHighlighted} onClick={onClick}>
      {hasCategories ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(grouped).map(([category, skills]) => (
            <div key={category}>
              <h4 style={{ fontSize: descSize, fontWeight: 600, margin: '0 0 6px 0', color: '#374151' }}>
                {category}
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      backgroundColor: variant === 'sidebar' ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                      color: variant === 'sidebar' ? '#e5e7eb' : '#374151',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {items.map((skill) => (
            <span
              key={skill.id}
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: variant === 'sidebar' ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                color: variant === 'sidebar' ? '#e5e7eb' : '#374151',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            >
              {skill.name}
            </span>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
