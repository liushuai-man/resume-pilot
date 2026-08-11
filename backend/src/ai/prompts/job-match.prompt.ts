import type { ResumeQualityField } from './content-quality.prompt';

export const JOB_MATCH_PROMPT_VERSION = 'job-match-v1';
export const JOB_MATCH_EVALUATOR_VERSION = '1.0.0';

export interface MatchRequirement { id: string; category: 'responsibility' | 'required_skill' | 'preferred_skill'; name: string; jdEvidence: string }

export const buildJobMatchPrompt = (profile: unknown, requirements: MatchRequirement[], fields: ResumeQualityField[]) => `
你是岗位匹配评价器。只能依据已确认岗位画像与简历原文判断匹配，不得补充事实，不评价实体真实性。
严格输出 JSON，不要 Markdown：
{"dimensions":[{"key":"skillCoverage","score":0,"confidence":0,"reason":""},{"key":"responsibilityRelevance","score":0,"confidence":0,"reason":""},{"key":"keywordEvidence","score":0,"confidence":0,"reason":""},{"key":"seniorityFit","score":0,"confidence":0,"reason":""}],"requirements":[{"requirementId":"输入 id","status":"matched|insufficient_evidence|gap|needs_confirmation","resumeFieldId":"存在证据时填写，否则为 null","resumeEvidence":"对应字段的连续原文，无证据时为 null","reason":"","confidence":0}],"overallConfidence":0}
满分：skillCoverage 35、responsibilityRelevance 30、keywordEvidence 20、seniorityFit 15。每个输入 requirement 必须恰好输出一次。只有简历有明确连续原文证据才可标记 matched；相关表述但证据不具体用 insufficient_evidence；简历未体现用 gap；无法可靠判断用 needs_confirmation。低于 0.7 置信度必须使用 needs_confirmation，且不直接形成确定性缺口。
<confirmed_job_profile>${JSON.stringify(profile)}</confirmed_job_profile>
<requirements>${JSON.stringify(requirements)}</requirements>
<resume_fields>${JSON.stringify(fields)}</resume_fields>`;
