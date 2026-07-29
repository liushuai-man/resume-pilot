import { useState, useEffect, useRef, useMemo } from 'react';
import { Text } from '@mantine/core';
import ResumePreview from './ResumePreview';
import { contentToDocument } from '@/utils/resume-migration';
import { ClassicTemplate } from '@/components/preview/templates/ClassicTemplate';
import { ModernTemplate } from '@/components/preview/templates/ModernTemplate';
import { MinimalTemplate } from '@/components/preview/templates/MinimalTemplate';
import { SidebarTemplate } from '@/components/preview/templates/SidebarTemplate';
import type { ResumeContent, StyleConfig } from '@/types/resume';
import type { ResumeDocument } from '@/types/resume-document';

const RESUME_WIDTH = 850;
const MIN_SCALE = 0.4;

const TEMPLATE_MAP: Record<
  string,
  React.ComponentType<{ document: ResumeDocument; highlightSectionId?: string }>
> = {
  classic: ClassicTemplate as any,
  modern: ModernTemplate as any,
  minimal: MinimalTemplate as any,
  sidebar: SidebarTemplate as any,
};

interface ResizableResumePreviewProps {
  content: ResumeContent | null;
  highlightSection?: string;
  emptyText?: string;
  className?: string;
  templateStyle?: StyleConfig | null;
  templateLayout?: string;
}

export default function ResizableResumePreview({
  content,
  highlightSection,
  emptyText = '请选择简历',
  className = '',
  templateStyle,
  templateLayout,
}: ResizableResumePreviewProps) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const document = useMemo(() => {
    if (!content || !templateLayout) return null;
    return contentToDocument(content, templateStyle || null, templateLayout);
  }, [content, templateStyle, templateLayout]);

  const highlightSectionId = useMemo(() => {
    if (!highlightSection || !document) return undefined;
    const typeMap: Record<string, string> = {
      basicInfo: 'profile',
      experience: 'experience',
      projects: 'project',
      skills: 'skill',
      education: 'education',
      careerObjective: 'objective',
      certifications: 'certification',
    };
    const type = typeMap[highlightSection];
    if (!type) return undefined;
    return document.sections.find((s) => s.type === type && s.visible)?.id;
  }, [highlightSection, document]);

  const TemplateComponent = templateLayout
    ? TEMPLATE_MAP[templateLayout] || ClassicTemplate
    : null;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const width = container.offsetWidth;
      const newScale = Math.min(Math.max(width / RESUME_WIDTH, MIN_SCALE), 1);
      setScale(newScale);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto flex items-start justify-center ${className}`}
    >
      {/* 缩放容器 - 固定宽度850px，根据可用空间等比缩放 */}
      <div
        ref={contentRef}
        className="transition-transform duration-300 ease-out flex-shrink-0"
        style={{
          width: RESUME_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {content ? (
          TemplateComponent && document ? (
            <TemplateComponent
              document={document}
              highlightSectionId={highlightSectionId}
            />
          ) : (
            <ResumePreview
              content={content}
              highlightSection={highlightSection}
            />
          )
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Text>{emptyText}</Text>
          </div>
        )}
      </div>
    </div>
  );
}
