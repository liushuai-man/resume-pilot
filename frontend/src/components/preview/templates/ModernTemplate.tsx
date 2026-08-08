import type { ResumeDocument } from '@/types/resume-document';
import { getSectionRenderer } from '../renderers';

interface ModernTemplateProps {
  document: ResumeDocument;
  highlightSectionId?: string;
  onSectionClick?: (sectionId: string) => void;
}

export function ModernTemplate({ document, highlightSectionId, onSectionClick }: ModernTemplateProps) {
  const { sections, style } = document;
  const visibleSections = sections.filter((s) => s.visible);
  const profileSection = visibleSections.find((s) => s.type === 'profile');
  const otherSections = visibleSections.filter((s) => s.type !== 'profile');

  return (
    <div
      className="resume-template modern"
      style={{
        fontFamily: style.fontFamily,
        fontSize: `${style.fontSize}px`,
        padding: `${style.margin}px`,
        lineHeight: style.lineHeight,
        color: '#374151',
        backgroundColor: style.backgroundColor || '#ffffff',
      }}
    >
      {profileSection && (
        <>
          {(() => {
            const Renderer = getSectionRenderer(profileSection.type);
            if (!Renderer) return null;
            return (
              <div data-resume-section-id={profileSection.id}>
                <Renderer
                  section={profileSection}
                  style={style}
                  variant="modern"
                  isHighlighted={highlightSectionId === profileSection.id}
                  onClick={() => onSectionClick?.(profileSection.id)}
                />
              </div>
            );
          })()}
        </>
      )}

      {otherSections.map((section) => {
        const Renderer = getSectionRenderer(section.type);
        if (!Renderer) return null;
        return (
          <div key={section.id} data-resume-section-id={section.id}>
            <Renderer
              section={section}
              style={style}
              variant="modern"
              isHighlighted={highlightSectionId === section.id}
              onClick={() => onSectionClick?.(section.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
