import type { RendererProps } from './index';
import { SectionWrapper } from './SectionWrapper';
import { DescriptionText } from './common';

export function ObjectiveRenderer({ section, style, variant, isHighlighted, onClick }: RendererProps) {
  if (section.type !== 'objective') return null;
  const data = section.data as any;
  if (!data.content) return null;

  const baseSize = style.fontSize || 14;
  const descSize = `${baseSize}px`;

  return (
    <SectionWrapper title={section.title} style={style} variant={variant} isHighlighted={isHighlighted} onClick={onClick}>
      <DescriptionText text={data.content} fontSize={descSize} variant={variant} />
    </SectionWrapper>
  );
}
