import type { ResumeDocument } from '@/types/resume-document';
import { getSectionRenderer } from '../renderers';

interface MinimalTemplateProps {
  document: ResumeDocument;
  highlightSectionId?: string;
  onSectionClick?: (sectionId: string) => void;
}

export function MinimalTemplate({ document, highlightSectionId, onSectionClick }: MinimalTemplateProps) {
  const { sections, style } = document;
  const visibleSections = sections.filter((s) => s.visible);

  return (
    <div
      className="resume-template minimal"
      style={{
        fontFamily: style.fontFamily,
        fontSize: `${style.fontSize}px`,
        padding: `${style.margin}px`,
        lineHeight: style.lineHeight,
        color: '#374151',
        backgroundColor: style.backgroundColor || '#ffffff',
      }}
    >
      {visibleSections.map((section) => {
        const Renderer = getSectionRenderer(section.type);
        if (!Renderer) return null;
        return (
          <div key={section.id} data-resume-section-id={section.id}>
            <Renderer
              section={section}
              style={style}
              variant="minimal"
              isHighlighted={highlightSectionId === section.id}
              onClick={() => onSectionClick?.(section.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
