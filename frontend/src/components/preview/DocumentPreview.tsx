import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { SidebarTemplate } from './templates/SidebarTemplate';
import type { ResumeDocument, ResumeLayout } from '@/types/resume-document';

const TEMPLATE_MAP = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  sidebar: SidebarTemplate,
};

const A4_RATIO = 297 / 210;
const PAGE_GAP = 28;
const SIDEBAR_TYPES = new Set(['profile', 'skill', 'certification', 'objective']);

function packSections(
  sectionIds: string[],
  heights: Map<string, number>,
  availableHeight: number
): string[][] {
  if (sectionIds.length === 0) return [];

  const pages: string[][] = [[]];
  let usedHeight = 0;

  for (const id of sectionIds) {
    const height = Math.max(heights.get(id) || 0, 1);
    const currentPage = pages[pages.length - 1];

    if (currentPage.length > 0 && usedHeight + height > availableHeight) {
      pages.push([]);
      usedHeight = 0;
    }

    pages[pages.length - 1].push(id);
    usedHeight += height;
  }

  return pages;
}

function samePages(left: string[][], right: string[][]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function DocumentPreview() {
  const { document, activeSectionId, setActiveSection } = useDocumentStore();
  const measureRef = useRef<HTMLDivElement>(null);
  const [pageSectionIds, setPageSectionIds] = useState<string[][]>([]);

  const templateId = (document?.layout.template || 'classic') as
    | keyof ResumeLayout['template']
    | string;
  const TemplateComponent =
    (TEMPLATE_MAP as any)[templateId] || ClassicTemplate;

  useLayoutEffect(() => {
    const element = measureRef.current;
    if (!element || !document) return;

    const updatePagination = () => {
      const pageWidth = element.clientWidth;
      if (!pageWidth) return;

      const pageHeight = pageWidth * A4_RATIO;
      const heights = new Map<string, number>();

      element
        .querySelectorAll<HTMLElement>('[data-resume-section-id]')
        .forEach((wrapper) => {
          const section = wrapper.firstElementChild as HTMLElement | null;
          const measured = section || wrapper;
          const computed = window.getComputedStyle(measured);
          const marginTop = Number.parseFloat(computed.marginTop) || 0;
          const marginBottom = Number.parseFloat(computed.marginBottom) || 0;
          heights.set(
            wrapper.dataset.resumeSectionId || '',
            measured.getBoundingClientRect().height + marginTop + marginBottom
          );
        });

      const visibleSections = document.sections.filter((section) => section.visible);
      let nextPages: string[][];

      if (templateId === 'sidebar') {
        const sidebarIds = visibleSections
          .filter((section) => SIDEBAR_TYPES.has(section.type))
          .map((section) => section.id);
        const mainIds = visibleSections
          .filter((section) => !SIDEBAR_TYPES.has(section.type))
          .map((section) => section.id);

        const sidebarPages = packSections(sidebarIds, heights, pageHeight - 40);
        const mainPages = packSections(
          mainIds,
          heights,
          pageHeight - document.style.margin * 2
        );
        const count = Math.max(sidebarPages.length, mainPages.length, 1);

        nextPages = Array.from({ length: count }, (_, index) => {
          const ids = new Set([
            ...(sidebarPages[index] || []),
            ...(mainPages[index] || []),
          ]);
          return visibleSections
            .filter((section) => ids.has(section.id))
            .map((section) => section.id);
        });
      } else {
        nextPages = packSections(
          visibleSections.map((section) => section.id),
          heights,
          pageHeight - document.style.margin * 2
        );
      }

      if (nextPages.length === 0) nextPages = [[]];
      setPageSectionIds((current) =>
        samePages(current, nextPages) ? current : nextPages
      );
    };

    updatePagination();
    const observer = new ResizeObserver(updatePagination);
    observer.observe(element);
    return () => observer.disconnect();
  }, [document, templateId]);

  const pages = useMemo(() => {
    if (!document) return [];
    const visibleIds = new Set(
      document.sections.filter((section) => section.visible).map((section) => section.id)
    );
    const measuredIds = pageSectionIds.flat().filter((id) => visibleIds.has(id));
    const effectivePages =
      measuredIds.length === visibleIds.size
        ? pageSectionIds
        : [Array.from(visibleIds)];

    return effectivePages.map((ids) => {
      const idSet = new Set(ids);
      return {
        ...document,
        sections: document.sections.filter(
          (section) => section.visible && idSet.has(section.id)
        ),
      } as ResumeDocument;
    });
  }, [document, pageSectionIds]);

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

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 0 24px',
        overflow: 'visible',
      }}
    >
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          width: '210mm',
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <TemplateComponent document={document} />
      </div>

      {pages.map((pageDocument, index) => (
        <div key={`${pageDocument.id || 'resume'}-page-${index}`}>
          {index > 0 && (
            <div
              aria-hidden="true"
              style={{
                height: `${PAGE_GAP}px`,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div style={{ width: '210mm', borderTop: '1px solid #cbd5e1' }} />
            </div>
          )}

          <div
            className="resume-preview-page"
            style={{
              width: '210mm',
              height: '297mm',
              backgroundColor: '#ffffff',
              boxShadow: '0 3px 14px rgba(15, 23, 42, 0.12)',
              flexShrink: 0,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ width: '100%', height: '100%' }}>
              <TemplateComponent
                document={pageDocument}
                highlightSectionId={activeSectionId || undefined}
                onSectionClick={(id: string) => setActiveSection(id)}
              />
            </div>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                right: '10px',
                bottom: '7px',
                color: '#94a3b8',
                fontSize: '10px',
              }}
            >
              {index + 1} / {pages.length}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
