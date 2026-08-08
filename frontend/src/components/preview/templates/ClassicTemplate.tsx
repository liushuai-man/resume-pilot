import type { ResumeDocument } from '@/types/resume-document';
import { getSectionRenderer } from '../renderers';

interface ClassicTemplateProps {
  document: ResumeDocument;
  highlightSectionId?: string;
  onSectionClick?: (sectionId: string) => void;
}

export function ClassicTemplate({ document, highlightSectionId, onSectionClick }: ClassicTemplateProps) {
  const { sections, style } = document;
  const visibleSections = sections.filter((s) => s.visible);

  return (
    <div
      className="resume-template classic"
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
              variant="classic"
              isHighlighted={highlightSectionId === section.id}
              onClick={() => onSectionClick?.(section.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
