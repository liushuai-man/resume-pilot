import { useState, useEffect, useRef, useMemo } from 'react';
import { Text } from '@mantine/core';
import { useDocumentStore } from '@/store/useDocumentStore';
import { ModernTemplate } from '@/components/preview/templates/ModernTemplate';
import { ClassicTemplate } from '@/components/preview/templates/ClassicTemplate';
import { MinimalTemplate } from '@/components/preview/templates/MinimalTemplate';
import { SidebarTemplate } from '@/components/preview/templates/SidebarTemplate';
import type { ResumeContent } from '@/types/resume';
import type { ResumeLayout } from '@/types/resume-document';

const TEMPLATE_MAP = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  sidebar: SidebarTemplate,
};

const RESUME_WIDTH = 794;
const MIN_SCALE = 0.4;

interface ResizableResumePreviewProps {
  content: ResumeContent | null;
  highlightSection?: string;
  emptyText?: string;
  className?: string;
}

const sectionKeyToType: Record<string, string> = {
  basicInfo: 'profile',
  experience: 'experience',
  projects: 'project',
  skills: 'skill',
  education: 'education',
  careerObjective: 'objective',
  certifications: 'certification',
};

export default function ResizableResumePreview({
  content,
  highlightSection,
  emptyText = '请选择简历',
  className = '',
}: ResizableResumePreviewProps) {
  const { document: storeDocument } = useDocumentStore();
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const document = storeDocument;

  const activeSectionId = useMemo(() => {
    if (!highlightSection || !document) return undefined;
    const type = sectionKeyToType[highlightSection];
    if (!type) return undefined;
    return document.sections.find((s) => s.type === type && s.visible)?.id;
  }, [highlightSection, document]);

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

  if (!document) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center h-full text-gray-400 ${className}`}
      >
        <Text>{content ? '正在加载简历预览...' : emptyText}</Text>
      </div>
    );
  }

  const templateId =
    (document.layout.template as keyof ResumeLayout['template'] | string) ||
    'classic';
  const TemplateComponent =
    (TEMPLATE_MAP as any)[templateId] || ClassicTemplate;

  return (
    <div
      ref={containerRef}
      className={`overflow-x-hidden overflow-y-auto flex items-start justify-center ${className}`}
    >
      <div
        ref={contentRef}
        className="transition-transform duration-300 ease-out flex-shrink-0 bg-white"
        style={{
          width: RESUME_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderRadius: '4px',
        }}
      >
        <TemplateComponent
          document={document}
          highlightSectionId={activeSectionId}
        />
      </div>
    </div>
  );
}
