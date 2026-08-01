import { useLayoutEffect, useRef, useState } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { SidebarTemplate } from './templates/SidebarTemplate';
import type { ResumeLayout } from '@/types/resume-document';

const TEMPLATE_MAP = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  sidebar: SidebarTemplate,
};

export function DocumentPreview() {
  const { document, activeSectionId, setActiveSection } = useDocumentStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);

  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const updatePageCount = () => {
      const pageWidth = element.clientWidth;
      if (!pageWidth) return;
      const pageHeight = pageWidth * (297 / 210);
      setPageCount(Math.max(1, Math.ceil(element.scrollHeight / pageHeight)));
    };

    updatePageCount();
    const observer = new ResizeObserver(updatePageCount);
    observer.observe(element);
    return () => observer.disconnect();
  }, [document]);

  if (!document) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#9ca3af',
        }}
      >
        <p>暂无简历内容</p>
      </div>
    );
  }

  const templateId = document.layout.template as
    | keyof ResumeLayout['template']
    | string;
  const TemplateComponent =
    (TEMPLATE_MAP as any)[templateId] || ClassicTemplate;

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 0,
        overflow: 'visible',
      }}
    >
      <div
        className="resume-preview-container"
        style={{
          width: '210mm',
          minHeight: `${pageCount * 297}mm`,
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <div ref={contentRef} style={{ position: 'relative', zIndex: 1 }}>
          <TemplateComponent
            document={document}
            highlightSectionId={activeSectionId || undefined}
            onSectionClick={(id: string) => setActiveSection(id)}
          />
        </div>

        {Array.from({ length: pageCount }).map((_, index) => (
          <div
            key={index}
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: `${index * 297}mm`,
              left: 0,
              width: '100%',
              height: '297mm',
              borderTop: index === 0 ? undefined : '1px dashed #cbd5e1',
              borderBottom:
                index === pageCount - 1 ? undefined : '1px dashed #cbd5e1',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            <span
              style={{
                position: 'absolute',
                right: '8px',
                bottom: '6px',
                padding: '2px 6px',
                borderRadius: '999px',
                background: 'rgba(241, 245, 249, 0.9)',
                color: '#64748b',
                fontSize: '10px',
              }}
            >
              {index + 1} / {pageCount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
