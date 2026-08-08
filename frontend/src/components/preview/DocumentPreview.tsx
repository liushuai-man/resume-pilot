import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { SidebarTemplate } from './templates/SidebarTemplate';
import type {
  ResumeDocument,
  ResumeLayout,
  ResumeSection,
} from '@/types/resume-document';

const TEMPLATE_MAP = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  sidebar: SidebarTemplate,
};

export const A4_PAGE_WIDTH = 794;
export const A4_PAGE_HEIGHT = 1123;
const DEFAULT_PAGE_GAP = 28;
const MIN_SCALE = 0.2;
const SIDEBAR_TYPES = new Set(['profile', 'skill', 'certification', 'objective']);

interface DocumentPreviewProps {
  document?: ResumeDocument | null;
  highlightSectionId?: string;
  onSectionClick?: (sectionId: string) => void;
  className?: string;
  emptyText?: string;
  maxPages?: number;
  showPageNumbers?: boolean;
  scale?: number;
  pageGap?: number;
  printMode?: boolean;
}

interface PageFragment {
  sectionId: string;
  itemIds?: string[];
}

interface SectionMeasure {
  totalHeight: number;
  itemHeights: Map<string, number>;
  itemGap: number;
  baseHeight: number;
}

function getSectionItemIds(section: ResumeSection): string[] {
  if (!Array.isArray(section.data)) return [];
  return section.data
    .map((item: any) => item?.id)
    .filter((id): id is string => typeof id === 'string');
}

function fragmentHeight(measure: SectionMeasure, itemIds: string[]): number {
  if (itemIds.length === 0 || measure.itemHeights.size === 0) {
    return measure.totalHeight;
  }
  const itemsHeight = itemIds.reduce(
    (total, id) => total + (measure.itemHeights.get(id) || 0),
    0
  );
  return (
    measure.baseHeight +
    itemsHeight +
    Math.max(0, itemIds.length - 1) * measure.itemGap
  );
}

function paginateSections(
  sections: ResumeSection[],
  measures: Map<string, SectionMeasure>,
  availableHeight: number
): PageFragment[][] {
  if (sections.length === 0) return [];

  const pages: PageFragment[][] = [[]];
  let usedHeight = 0;

  const startPage = () => {
    pages.push([]);
    usedHeight = 0;
  };

  for (const section of sections) {
    const measure = measures.get(section.id);
    if (!measure) {
      pages[pages.length - 1].push({ sectionId: section.id });
      continue;
    }

    const itemIds = getSectionItemIds(section).filter((id) =>
      measure.itemHeights.has(id)
    );
    const currentPage = () => pages[pages.length - 1];
    const fullHeight = fragmentHeight(measure, itemIds);

    if (itemIds.length === 0 || fullHeight <= availableHeight - usedHeight) {
      if (
        currentPage().length > 0 &&
        usedHeight + fullHeight > availableHeight
      ) {
        startPage();
      }
      currentPage().push({
        sectionId: section.id,
        itemIds: itemIds.length > 0 ? itemIds : undefined,
      });
      usedHeight += fullHeight;
      continue;
    }

    let itemIndex = 0;
    while (itemIndex < itemIds.length) {
      const remainingHeight = availableHeight - usedHeight;
      const firstItemHeight = measure.itemHeights.get(itemIds[itemIndex]) || 0;

      if (
        currentPage().length > 0 &&
        measure.baseHeight + firstItemHeight > remainingHeight
      ) {
        startPage();
      }

      const chunk: string[] = [];
      let chunkHeight = measure.baseHeight;
      const pageRemaining = availableHeight - usedHeight;

      while (itemIndex < itemIds.length) {
        const id = itemIds[itemIndex];
        const itemHeight = measure.itemHeights.get(id) || 0;
        const nextHeight =
          chunkHeight + (chunk.length > 0 ? measure.itemGap : 0) + itemHeight;

        if (chunk.length > 0 && nextHeight > pageRemaining) break;
        chunk.push(id);
        chunkHeight = nextHeight;
        itemIndex += 1;

        if (chunkHeight > pageRemaining) break;
      }

      currentPage().push({ sectionId: section.id, itemIds: chunk });
      usedHeight += chunkHeight;
      if (itemIndex < itemIds.length) startPage();
    }
  }

  return pages;
}

function samePages(left: PageFragment[][], right: PageFragment[][]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function DocumentPreview({
  document: documentProp,
  highlightSectionId,
  onSectionClick,
  className = '',
  emptyText = '暂无简历内容',
  maxPages,
  showPageNumbers = true,
  scale: scaleProp,
  pageGap = DEFAULT_PAGE_GAP,
  printMode = false,
}: DocumentPreviewProps = {}) {
  const store = useDocumentStore();
  const usesDocumentStore = documentProp === undefined;
  const document = usesDocumentStore ? store.document : documentProp;
  const activeSectionId = usesDocumentStore
    ? highlightSectionId ?? store.activeSectionId
    : highlightSectionId;
  const handleSectionClick = usesDocumentStore
    ? onSectionClick || store.setActiveSection
    : onSectionClick;

  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [calculatedScale, setCalculatedScale] = useState(scaleProp || 1);
  const [pageFragments, setPageFragments] = useState<PageFragment[][]>([]);

  const templateId = (document?.layout.template || 'classic') as
    | keyof ResumeLayout['template']
    | string;
  const TemplateComponent =
    (TEMPLATE_MAP as any)[templateId] || ClassicTemplate;

  useLayoutEffect(() => {
    if (scaleProp !== undefined) {
      setCalculatedScale(scaleProp);
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateScale = () => {
      const availableWidth = Math.max(viewport.clientWidth - 16, 1);
      setCalculatedScale(
        Math.min(1, Math.max(MIN_SCALE, availableWidth / A4_PAGE_WIDTH))
      );
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [scaleProp]);

  useLayoutEffect(() => {
    const element = measureRef.current;
    if (!element || !document) return;

    const updatePagination = () => {
      const measures = new Map<string, SectionMeasure>();

      element
        .querySelectorAll<HTMLElement>('[data-resume-section-id]')
        .forEach((wrapper) => {
          const section = wrapper.firstElementChild as HTMLElement | null;
          const measured = section || wrapper;
          const computed = window.getComputedStyle(measured);
          const marginTop = Number.parseFloat(computed.marginTop) || 0;
          const marginBottom = Number.parseFloat(computed.marginBottom) || 0;
          const id = wrapper.dataset.resumeSectionId;
          if (id) {
            const itemElements = Array.from(
              wrapper.querySelectorAll<HTMLElement>('[data-resume-item-id]')
            );
            const itemHeights = new Map<string, number>();
            for (const item of itemElements) {
              const itemId = item.dataset.resumeItemId;
              if (itemId) {
                itemHeights.set(itemId, item.getBoundingClientRect().height);
              }
            }
            const itemGap = itemElements[0]?.parentElement
              ? Number.parseFloat(
                  window.getComputedStyle(itemElements[0].parentElement).rowGap
                ) || 0
              : 0;
            const totalHeight =
              measured.getBoundingClientRect().height + marginTop + marginBottom;
            const itemsHeight = Array.from(itemHeights.values()).reduce(
              (total, height) => total + height,
              0
            );
            const baseHeight = Math.max(
              0,
              totalHeight -
                itemsHeight -
                Math.max(0, itemHeights.size - 1) * itemGap
            );
            measures.set(id, {
              totalHeight,
              itemHeights,
              itemGap,
              baseHeight,
            });
          }
        });

      const visibleSections = document.sections.filter((section) => section.visible);
      let nextPages: PageFragment[][];

      if (templateId === 'sidebar') {
        const sidebarSections = visibleSections.filter((section) =>
          SIDEBAR_TYPES.has(section.type)
        );
        const mainSections = visibleSections.filter(
          (section) => !SIDEBAR_TYPES.has(section.type)
        );
        const sidebarPages = paginateSections(
          sidebarSections,
          measures,
          A4_PAGE_HEIGHT - 40
        );
        const mainPages = paginateSections(
          mainSections,
          measures,
          A4_PAGE_HEIGHT - document.style.margin * 2
        );
        const count = Math.max(sidebarPages.length, mainPages.length, 1);
        const order = new Map(
          visibleSections.map((section, index) => [section.id, index])
        );

        nextPages = Array.from({ length: count }, (_, index) => {
          return [
            ...(sidebarPages[index] || []),
            ...(mainPages[index] || []),
          ].sort(
            (left, right) =>
              (order.get(left.sectionId) || 0) -
              (order.get(right.sectionId) || 0)
          );
        });
      } else {
        nextPages = paginateSections(
          visibleSections,
          measures,
          A4_PAGE_HEIGHT - document.style.margin * 2
        );
      }

      if (nextPages.length === 0) nextPages = [[]];
      setPageFragments((current) =>
        samePages(current, nextPages) ? current : nextPages
      );
    };

    updatePagination();
    const observer = new ResizeObserver(updatePagination);
    observer.observe(element);
    return () => observer.disconnect();
  }, [document, templateId]);

  const allPages = useMemo(() => {
    if (!document) return [];
    const visibleSections = document.sections.filter((section) => section.visible);
    const visibleIds = new Set(visibleSections.map((section) => section.id));
    const measuredIds = new Set(
      pageFragments
        .flat()
        .map((fragment) => fragment.sectionId)
        .filter((id) => visibleIds.has(id))
    );
    const effectivePages: PageFragment[][] =
      measuredIds.size === visibleIds.size
        ? pageFragments
        : [visibleSections.map((section) => ({ sectionId: section.id }))];

    return effectivePages.map((fragments) => {
      const sections = fragments
        .map((fragment) => {
          const section = document.sections.find(
            (candidate) => candidate.id === fragment.sectionId
          );
          if (!section) return null;
          if (!fragment.itemIds || !Array.isArray(section.data)) return section;
          const itemIds = new Set(fragment.itemIds);
          return {
            ...section,
            data: section.data.filter((item: any) => itemIds.has(item?.id)),
          } as ResumeSection;
        })
        .filter((section): section is ResumeSection => section !== null);

      return {
        ...document,
        sections,
      } as ResumeDocument;
    });
  }, [document, pageFragments]);

  const pages = maxPages ? allPages.slice(0, maxPages) : allPages;
  const unscaledHeight =
    pages.length * A4_PAGE_HEIGHT + Math.max(0, pages.length - 1) * pageGap;
  const stageWidth = A4_PAGE_WIDTH * calculatedScale;
  const stageHeight = unscaledHeight * calculatedScale;

  if (!document) {
    return (
      <div
        ref={viewportRef}
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#9ca3af',
        }}
      >
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className={className}
      data-resume-preview-ready={pageFragments.length > 0 ? 'true' : 'false'}
      style={{
        width: '100%',
        minHeight: '100%',
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          width: `${A4_PAGE_WIDTH}px`,
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <TemplateComponent document={document} />
      </div>

      <div
        style={{
          width: `${stageWidth}px`,
          height: `${stageHeight}px`,
          margin: printMode ? '0' : '8px auto 24px',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${A4_PAGE_WIDTH}px`,
            transform: `scale(${calculatedScale})`,
            transformOrigin: 'top left',
          }}
        >
          {pages.map((pageDocument, index) => (
            <div key={`${pageDocument.id || 'resume'}-page-${index}`}>
              {index > 0 && (
                <div
                  aria-hidden="true"
                  style={{
                    height: `${pageGap}px`,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: `${A4_PAGE_WIDTH}px`,
                      borderTop: '1px solid #cbd5e1',
                    }}
                  />
                </div>
              )}

              <div
                className="resume-preview-page"
                style={{
                  width: `${A4_PAGE_WIDTH}px`,
                  height: `${A4_PAGE_HEIGHT}px`,
                  backgroundColor: '#ffffff',
                  boxShadow: printMode
                    ? 'none'
                    : '0 3px 14px rgba(15, 23, 42, 0.12)',
                  position: 'relative',
                  overflow: 'hidden',
                  breakAfter:
                    printMode && index < pages.length - 1 ? 'page' : 'auto',
                }}
              >
                <div style={{ width: '100%', height: '100%' }}>
                  <TemplateComponent
                    document={pageDocument}
                    highlightSectionId={activeSectionId || undefined}
                    onSectionClick={handleSectionClick}
                  />
                </div>
                {showPageNumbers && !printMode && (
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
                    {index + 1} / {allPages.length}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
