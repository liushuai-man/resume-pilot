import type { ResumeDocument } from '@/types/resume-document';
import { getSectionRenderer } from '../renderers';

interface SidebarTemplateProps {
  document: ResumeDocument;
  highlightSectionId?: string;
  onSectionClick?: (sectionId: string) => void;
}

export function SidebarTemplate({ document, highlightSectionId, onSectionClick }: SidebarTemplateProps) {
  const { sections, style } = document;
  const visibleSections = sections.filter((s) => s.visible);

  const sidebarTypes = ['profile', 'skill', 'certification', 'objective'];
  const sidebarSections = visibleSections.filter((s) => sidebarTypes.includes(s.type));
  const mainSections = visibleSections.filter((s) => !sidebarTypes.includes(s.type));

  return (
    <div
      className="resume-template sidebar"
      style={{
        display: 'flex',
        fontFamily: style.fontFamily,
        fontSize: `${style.fontSize}px`,
        lineHeight: style.lineHeight,
        backgroundColor: style.backgroundColor || '#ffffff',
        minHeight: '100%',
      }}
    >
      <div
        style={{
          width: '200px',
          flexShrink: 0,
          backgroundColor: style.primaryColor,
          color: '#ffffff',
          padding: '20px 16px',
        }}
      >
        {sidebarSections.map((section) => {
          const Renderer = getSectionRenderer(section.type);
          if (!Renderer) return null;
          return (
            <Renderer
              key={section.id}
              section={section}
              style={style}
              variant="sidebar"
              isHighlighted={highlightSectionId === section.id}
              onClick={() => onSectionClick?.(section.id)}
            />
          );
        })}
      </div>

      <div
        style={{
          flex: 1,
          padding: `${style.margin}px`,
          color: '#374151',
        }}
      >
        {mainSections.map((section) => {
          const Renderer = getSectionRenderer(section.type);
          if (!Renderer) return null;
          return (
            <Renderer
              key={section.id}
              section={section}
              style={style}
              variant="sidebar"
              isHighlighted={highlightSectionId === section.id}
              onClick={() => onSectionClick?.(section.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
