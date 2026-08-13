import test from 'node:test';
import assert from 'node:assert/strict';
import { paginateSections, type SectionMeasure } from './pagination';

const section = (id: string, ids: string[] = []) => ({ id, type: 'experience', title: id, visible: true, data: ids.map((itemId) => ({ id: itemId })) }) as any;
const measure = (totalHeight: number, entries: Array<[string, number]> = [], baseHeight = 20, itemGap = 10): SectionMeasure => ({ totalHeight, itemHeights: new Map(entries), baseHeight, itemGap });

test('完整模块空间不足时整体移动到下一页', () => {
  const sections = [section('a'), section('b')];
  const pages = paginateSections(sections, new Map([['a', measure(70)], ['b', measure(50)]]), 100);
  assert.deepEqual(pages.map((page) => page.map((item) => item.sectionId)), [['a'], ['b']]);
});

test('列表模块按条目跨页拆分并保持顺序和唯一性', () => {
  const pages = paginateSections([section('experience', ['a', 'b', 'c'])], new Map([['experience', measure(200, [['a', 35], ['b', 35], ['c', 35]])]]), 100);
  assert.equal(pages.length, 2);
  assert.deepEqual(pages.flatMap((page) => page.flatMap((fragment) => fragment.itemIds || [])), ['a', 'b', 'c']);
});

test('单个超高条目仍被保留且不会产生空白页', () => {
  const pages = paginateSections([section('project', ['large'])], new Map([['project', measure(160, [['large', 140]])]]), 100);
  assert.equal(pages.length, 1);
  assert.deepEqual(pages[0][0].itemIds, ['large']);
});
