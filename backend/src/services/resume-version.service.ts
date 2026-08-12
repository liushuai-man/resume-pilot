import type { ContentQualityIssue } from '../types/content-quality.types';

const sectionAliases: Record<string, string[]> = {
  basic: ['basic', 'profile'],
  objective: ['objective'],
  education: ['education'],
  experience: ['experience'],
  projects: ['projects', 'project'],
  skills: ['skills', 'skill'],
};

const normalize = (value: unknown) => typeof value === 'string'
  ? value.normalize('NFKC').replace(/\s+/g, '').toLocaleLowerCase()
  : '';

const cloneJson = (value: unknown): any => JSON.parse(JSON.stringify(value));

function updateValue(target: any, issue: ContentQualityIssue, suggestedText: string) {
  if (!target || typeof target !== 'object') return false;
  const current = target[issue.field];
  if (typeof current !== 'string') return false;
  if (normalize(current) === normalize(issue.evidence)) {
    target[issue.field] = suggestedText;
    return true;
  }
  if (!current.includes(issue.evidence)) return false;
  target[issue.field] = current.replace(issue.evidence, suggestedText);
  return true;
}

function updateCanonical(content: any, issue: ContentQualityIssue, suggestedText: string) {
  if (issue.section === 'basic') return updateValue(content.basicInfo, issue, suggestedText);
  if (issue.section === 'objective') {
    if (issue.field !== 'content' || normalize(content.careerObjective) !== normalize(issue.evidence)) return false;
    content.careerObjective = suggestedText;
    return true;
  }
  const collectionKey = issue.section === 'projects' ? 'projects' : issue.section === 'skills' ? 'skills' : issue.section;
  const collection = content[collectionKey];
  if (!Array.isArray(collection)) return false;
  const item = collection.find((value: any, index: number) => String(value?.id ?? index) === issue.itemId);
  return updateValue(item, issue, suggestedText);
}

function updateDocumentSections(content: any, issue: ContentQualityIssue, suggestedText: string) {
  if (!Array.isArray(content._documentSections)) return true;
  const section = content._documentSections.find((value: any) => sectionAliases[issue.section]?.includes(value?.type));
  if (!section) return false;
  if (!issue.itemId) return updateValue(section.data, issue, suggestedText);
  if (!Array.isArray(section.data)) return false;
  const item = section.data.find((value: any, index: number) => String(value?.id ?? index) === issue.itemId);
  return updateValue(item, issue, suggestedText);
}

export function applyContentQualitySuggestion(contentInput: unknown, issue: ContentQualityIssue, suggestedText: string) {
  const content = cloneJson(contentInput);
  if (!suggestedText.trim()) throw new Error('建议文本不能为空');
  if (!updateCanonical(content, issue, suggestedText.trim())) {
    throw new Error('目标字段已变化或暂不支持自动应用');
  }
  if (!updateDocumentSections(content, issue, suggestedText.trim())) {
    throw new Error('编辑器字段与简历内容不一致，请重新保存后再试');
  }
  return content;
}
