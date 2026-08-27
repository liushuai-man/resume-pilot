import type { ResumeSection } from '@/types/resume-document';

export interface PageFragment { sectionId: string; itemIds?: string[]; showTitle?: boolean }
export interface SectionMeasure { totalHeight: number; itemHeights: Map<string, number>; itemGap: number; baseHeight: number; titleHeight?: number }

const itemIds = (section: ResumeSection) => Array.isArray(section.data)
  ? section.data.map((item: any) => item?.id).filter((id): id is string => typeof id === 'string') : [];
const height = (measure: SectionMeasure, ids: string[], showTitle = true) => ids.length && measure.itemHeights.size
  ? Math.max(0, measure.baseHeight - (showTitle ? 0 : measure.titleHeight || 0)) + ids.reduce((sum, id) => sum + (measure.itemHeights.get(id) || 0), 0) + Math.max(0, ids.length - 1) * measure.itemGap
  : measure.totalHeight;

export function paginateSections(sections: ResumeSection[], measures: Map<string, SectionMeasure>, availableHeight: number): PageFragment[][] {
  if (!sections.length) return [];
  const pages: PageFragment[][] = [[]]; let used = 0;
  const nextPage = () => { pages.push([]); used = 0; };
  for (const section of sections) {
    const measure = measures.get(section.id);
    if (!measure) { pages[pages.length - 1].push({ sectionId: section.id }); continue; }
    const ids = itemIds(section).filter((id) => measure.itemHeights.has(id));
    const full = height(measure, ids);
    if (!ids.length || full <= availableHeight - used) {
      if (pages[pages.length - 1].length && used + full > availableHeight) nextPage();
      pages[pages.length - 1].push({ sectionId: section.id, itemIds: ids.length ? ids : undefined }); used += full; continue;
    }
    let index = 0;
    let firstFragment = true;
    while (index < ids.length) {
      const showTitle = firstFragment;
      const fragmentBaseHeight = Math.max(0, measure.baseHeight - (showTitle ? 0 : measure.titleHeight || 0));
      const first = measure.itemHeights.get(ids[index]) || 0;
      if (pages[pages.length - 1].length && fragmentBaseHeight + first > availableHeight - used) nextPage();
      const chunk: string[] = []; let chunkHeight = fragmentBaseHeight; const remaining = availableHeight - used;
      while (index < ids.length) { const id = ids[index]; const next = chunkHeight + (chunk.length ? measure.itemGap : 0) + (measure.itemHeights.get(id) || 0); if (chunk.length && next > remaining) break; chunk.push(id); chunkHeight = next; index += 1; if (chunkHeight > remaining) break; }
      pages[pages.length - 1].push({ sectionId: section.id, itemIds: chunk, showTitle }); used += chunkHeight; firstFragment = false; if (index < ids.length) nextPage();
    }
  }
  return pages;
}
