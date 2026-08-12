export const JOB_MATCH_OPTIMIZATION_PROMPT_VERSION = 'job-match-optimization-v1';
export const JOB_MATCH_OPTIMIZATION_EVALUATOR_VERSION = '1.0.0';

export const buildJobMatchOptimizationPrompt = (input: {
  originalText: string;
  requirementName: string;
  jdEvidence: string;
  reason: string;
  userFacts: string;
}) => `
你是简历岗位匹配局部优化助手。岗位要求和 JD 证据只用于确定表达重点，不能被当作候选人已经具备的经历。
只能使用简历字段原文和用户补充事实，不得添加不存在的公司、项目、职责、技术、数字、时间或成果。
严格输出 JSON：{"suggestedText":"","reason":"","usedUserFacts":[]}
要求：suggestedText 保留原意并强化与岗位要求有关的真实证据；reason 说明修改点；usedUserFacts 只能逐字引用用户补充事实中的连续片段。不要输出 Markdown。
<original_text>${JSON.stringify(input.originalText)}</original_text>
<requirement>${JSON.stringify(input.requirementName)}</requirement>
<jd_evidence>${JSON.stringify(input.jdEvidence)}</jd_evidence>
<match_reason>${JSON.stringify(input.reason)}</match_reason>
<user_facts>${JSON.stringify(input.userFacts)}</user_facts>`;
