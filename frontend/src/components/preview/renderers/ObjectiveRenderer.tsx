import type { RendererProps } from './index';
import { SectionWrapper } from './SectionWrapper';

export function ObjectiveRenderer({ section, style, variant, isHighlighted, onClick }: RendererProps) {
  if (section.type !== 'objective') return null;
  const data = section.data as any;
  if (!data.content) return null;

  const baseSize = style.fontSize || 14;
  const descSize = `${baseSize}px`;

  return (
    <SectionWrapper title={section.title} style={style} variant={variant} isHighlighted={isHighlighted} onClick={onClick}>
      <p
        style={{
          fontSize: descSize,
          color: '#4b5563',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {data.content}
      </p>
    </SectionWrapper>
  );
}
