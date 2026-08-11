export const CONTENT_QUALITY_PROMPT_VERSION = 'content-quality-v1';
export const CONTENT_QUALITY_EVALUATOR_VERSION = '1.1.0';

export interface ResumeQualityField {
  fieldId: string;
  section: string;
  itemId: string | null;
  field: string;
  content: string;
}

export const buildContentQualityPrompt = (fields: ResumeQualityField[]) => `
你是简历内容质量评价器。只评价给定文本的语言与求职信息质量，不判断学校、公司、项目或经历是否真实，不补充原文中不存在的事实。

请严格输出 JSON，不要输出 Markdown 或额外解释：
{
  "dimensions": [
    {"key":"coherence","score":0,"confidence":0.0,"reason":""},
    {"key":"informationValue","score":0,"confidence":0.0,"reason":""},
    {"key":"evidenceSpecificity","score":0,"confidence":0.0,"reason":""},
    {"key":"consistency","score":0,"confidence":0.0,"reason":""},
    {"key":"professionalism","score":0,"confidence":0.0,"reason":""}
  ],
  "issues": [
    {
      "fieldId":"必须复制输入中的 fieldId",
      "evidence":"必须逐字复制该字段中的连续原文",
      "dimension":"coherence",
      "severity":"error",
      "reason":"为什么影响求职表达",
      "suggestion":"只说明修改方向，不编造内容",
      "confidence":0.0
    }
  ],
  "overallConfidence": 0.0
}

维度满分：coherence 25，informationValue 25，evidenceSpecificity 25，consistency 15，professionalism 10。score 必须是 0 到对应满分的整数。

评价要求：
1. coherence：文本是否为完整、连贯、可理解的自然语言。
2. informationValue：是否包含有效求职信息，而不是字符堆叠、空泛自评或无意义填充。
3. evidenceSpecificity：是否说明任务、行动、技能使用场景和结果；缺少事实时只能建议用户补充。
4. consistency：仅根据输入字段判断职业目标、技能、教育和经历是否明显矛盾；信息不足时降低 confidence，不得猜测。
5. professionalism：是否简洁专业，是否存在大段重复、口语占位和夸张表达。
6. 每个问题必须绑定一个真实 fieldId，evidence 必须是对应 content 的连续原文。
7. confidence 在 0 到 1 之间。低置信度问题仍可输出，但不得使用确定性措辞。
8. 不评价实体真实性，不得声称某学校或公司不存在。

<resume_fields>
${JSON.stringify(fields)}
</resume_fields>
`;
