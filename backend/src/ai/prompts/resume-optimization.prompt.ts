import type { ContentQualityIssue } from '../../types/content-quality.types';

export const RESUME_OPTIMIZATION_PROMPT_VERSION = 'resume-optimization-v1';
export const RESUME_OPTIMIZATION_EVALUATOR_VERSION = '1.0.0';

export const buildResumeOptimizationPrompt = (issue: ContentQualityIssue, userFacts: string) => `
你是简历局部优化助手。只能改写给定字段原文，不得添加原文和用户补充事实中不存在的公司、项目、职责、技术、数字、时间或成果。
严格输出 JSON：{"suggestedText":"","reason":"","usedUserFacts":[]}
要求：suggestedText 保留原意并只解决当前问题；reason 说明修改点；usedUserFacts 只能逐字引用用户补充事实中的连续片段，没有使用则为空数组。不要输出 Markdown。
<issue>${JSON.stringify(issue)}</issue>
<original_text>${JSON.stringify(issue.evidence)}</original_text>
<user_facts>${JSON.stringify(userFacts)}</user_facts>`;
