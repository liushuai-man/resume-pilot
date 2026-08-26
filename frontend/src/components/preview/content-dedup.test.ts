import assert from 'node:assert/strict';
import test from 'node:test';
import { filterDistinctAchievements } from './content-dedup';

test('描述完整包含成果时不重复展示该成果', () => {
  const result = filterDistinctAchievements(
    '参与智慧园区系统集成项目的需求调研和分析，了解客户的业务需求和技术要求。',
    ['参与智慧园区系统集成项目的需求调研和分析', '协助设计智慧园区系统的整体架构和技术方案']
  );
  assert.deepEqual(result, ['协助设计智慧园区系统的整体架构和技术方案']);
});

test('忽略标点和空格判断完全重复', () => {
  assert.deepEqual(
    filterDistinctAchievements('参与需求分析和方案设计。', ['参与需求分析 和方案设计', '负责编写技术文档']),
    ['负责编写技术文档']
  );
});

test('只去除完整包含和成果自身重复，不过滤语义相近的新信息', () => {
  assert.deepEqual(
    filterDistinctAchievements('参与项目需求分析', ['参与项目需求分析', '完成需求分析并将交付周期缩短 20%', '完成需求分析并将交付周期缩短 20%']),
    ['完成需求分析并将交付周期缩短 20%']
  );
});
