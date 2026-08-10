export const JOB_PROFILE_PROMPT_VERSION = 'job-profile-v1';
export const JOB_PROFILE_PARSER_VERSION = '1.0.0';

export const buildJobProfilePrompt = (rawText: string) => `
你是招聘岗位分析器。请仅根据给定 JD 提取岗位画像，不得补充 JD 中不存在的要求。

输出严格 JSON，不要输出 Markdown 或解释。格式：
{
  "jobTitle": "岗位名称",
  "seniority": "职级或年限要求，不明确则为空字符串",
  "industry": "行业，不明确则为空字符串",
  "responsibilities": [{"name":"职责摘要","evidence":"JD原文短句","confidence":0.0}],
  "requiredSkills": [{"name":"必备能力","evidence":"JD原文短句","confidence":0.0}],
  "preferredSkills": [{"name":"加分能力","evidence":"JD原文短句","confidence":0.0}],
  "keywords": ["用于简历匹配的原文关键词"],
  "confidence": 0.0
}

要求：
1. confidence 在 0 到 1 之间。
2. evidence 必须逐字复制 JD 中一段连续原文，不得改写、概括、拼接或使用省略号。
3. 区分必备能力与“优先、加分、熟悉更佳”等加分项。
4. 合并语义重复项，关键词最多 20 个。

<job_description>
${rawText}
</job_description>
`;
