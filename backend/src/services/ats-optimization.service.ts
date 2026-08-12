import type { AtsIssue } from './ats-analysis.service';
import { extractResumeQualityFields } from './content-quality.service';

const sectionAliases: Record<string, string> = { profile: 'basic', project: 'projects', skill: 'skills' };

export function resolveAtsOptimizationField(content: unknown, issue: AtsIssue) {
  const section = sectionAliases[issue.section] || issue.section;
  if (!['basic', 'education', 'skills', 'objective'].includes(section)) throw new Error('该 ATS 问题需要结构化编辑，不支持 AI 自动改写');
  if (!issue.itemId && !['basic', 'objective'].includes(section)) throw new Error('该 ATS 问题没有唯一字段落点');
  const fieldId = `${section}:${issue.itemId || 'root'}:${issue.field}`;
  const field = extractResumeQualityFields(content).find((item) => item.fieldId === fieldId);
  if (!field) throw new Error('目标字段为空、已变化或无法定位');
  return field;
}
