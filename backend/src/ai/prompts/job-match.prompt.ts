import type { ResumeQualityField } from './content-quality.prompt';

export const JOB_MATCH_PROMPT_VERSION = 'job-match-v2';
export const JOB_MATCH_EVALUATOR_VERSION = '1.0.0';

export interface MatchRequirement { id: string; category: 'responsibility' | 'required_skill' | 'preferred_skill'; name: string; jdEvidence: string }

export const buildJobMatchPrompt = (profile: unknown, requirements: MatchRequirement[], fields: ResumeQualityField[]) => `
你是岗位匹配评价器。只能依据已确认岗位画像与简历原文判断匹配，不得补充事实，不评价实体真实性。
严格输出 JSON，不要 Markdown：
{"dimensions":[{"key":"skillCoverage","score":0,"confidence":0,"reason":""},{"key":"responsibilityRelevance","score":0,"confidence":0,"reason":""},{"key":"keywordEvidence","score":0,"confidence":0,"reason":""},{"key":"seniorityFit","score":0,"confidence":0,"reason":""}],"requirements":[{"requirementId":"输入 id","status":"matched|insufficient_evidence|gap|needs_confirmation","resumeFieldId":"存在证据时填写，否则为 null","resumeEvidence":"对应字段的连续原文，无证据时为 null","reason":"","confidence":0}],"overallConfidence":0}
满分：skillCoverage 35、responsibilityRelevance 30、keywordEvidence 20、seniorityFit 15。每个输入 requirement 必须恰好输出一次。
状态判定必须遵守：
1. matched 不等于关键词出现。required_skill 或 preferred_skill 只有在经历/项目描述中出现真实使用场景、任务或行动时才能 matched；只在技能栏、自我介绍或关键词列表中出现时必须是 insufficient_evidence。
2. responsibility 只有在经历/项目中存在对应任务或行动语境时才能 matched；“参与相关工作、完成各项任务”等空泛描述必须是 insufficient_evidence。
3. 相关表述存在但缺少使用场景、行动或结果时用 insufficient_evidence；简历完全未体现用 gap。
4. needs_confirmation 只用于输入信息确实含糊、无法稳定归类的情况，不能用它替代明确的 insufficient_evidence 或 gap。
5. 只有简历有可定位的连续原文证据才能标记 matched 或 insufficient_evidence。低于 0.7 置信度必须使用 needs_confirmation，且不直接形成确定性缺口。
<confirmed_job_profile>${JSON.stringify(profile)}</confirmed_job_profile>
<requirements>${JSON.stringify(requirements)}</requirements>
<resume_fields>${JSON.stringify(fields)}</resume_fields>`;
