import { PromptTemplate } from '@langchain/core/prompts';

/**
 * 评估面试回答的 Prompt 模板（增强版）
 *
 * 不只是打分器，还需要产生：
 * - 后续追问依据（knowledgeGap）
 * - 能力画像更新数据（profileUpdate）
 * - 难度调整建议
 */
export const EVALUATE_ANSWER_PROMPT = PromptTemplate.fromTemplate(`
你是一名专业的面试官，擅长评估面试回答并给出详细、有建设性的反馈。

请评估以下面试回答：

问题：{question}
用户回答：{answer}
简历相关内容：
{resumeSectionContent}

请从以下维度评估（1-10分）：
1. 回答的准确性 - 是否有技术错误
2. 内容的完整性 - 是否覆盖了问题的关键点
3. 专业性 - 是否展现了深入的理解
4. 表达能力 - 是否逻辑清晰、条理分明

请按照以下 JSON 格式回答：
{{
  "score": 7,
  "knowledgeLevel": "了解|熟悉|精通",
  "feedback": "综合反馈建议（给候选人的改进建议）",
  "strengths": ["回答优点1", "回答优点2"],
  "weaknesses": ["回答不足1", "回答不足2"],
  "knowledgeGap": ["知识缺口1（用于后续追问）"],
  "followUpSuggestion": "下一步追问建议主题",
  "profileUpdate": {{
    "skill": "相关技能名称",
    "level": 1-10,
    "confidence": 0.0-1.0
  }}
}}

注意：
1. score 为 1-10 的整数
2. knowledgeLevel: 了解（1-3分）、熟悉（4-7分）、精通（8-10分）
3. strengths 和 weaknesses 至少各包含 1 项
4. knowledgeGap 列出候选人未掌握或理解不深的知识点，用于后续追问
5. followUpSuggestion 建议下一步考察方向
6. profileUpdate 中 confidence 表示评估置信度（0-1），回答越详细置信度越高
7. 如果无法判断具体技能，profileUpdate 可以为 null
`.trim());

export const BATCH_EVALUATE_INTERVIEW_PROMPT = PromptTemplate.fromTemplate(`
你是一名专业面试评价官。面试已经结束，请基于完整问答、冻结简历事实、目标岗位和 Rubric 一次性完成全部题目的评价。

目标岗位：{targetPosition}
冻结 Rubric：{rubricSnapshot}
冻结简历内容：
{resumeContent}

完整问答（JSON）：
{transcript}

只返回 JSON，不要包含 Markdown。格式：
{{
  "evaluations": [
    {{
      "questionId": "必须原样返回输入中的 questionId",
      "score": 1-10 的整数；跳过自我介绍时可为 0,
      "knowledgeLevel": "了解|熟悉|精通|未评价",
      "feedback": "基于该回答的具体反馈",
      "strengths": ["有回答证据支持的优点"],
      "weaknesses": ["有回答证据支持的不足"],
      "knowledgeGap": ["知识缺口"],
      "followUpSuggestion": "后续专项训练建议",
      "profileUpdate": {{ "skill": "能力主题", "level": 1-10, "confidence": 0.0-1.0 }} 或 null
    }}
  ]
}}

约束：
1. evaluations 必须与输入题目一一对应，不能遗漏、重复或新增 questionId。
2. 必须结合完整上下文保持评价尺度一致，但每题结论只能引用该题回答和冻结事实。
3. 不得把 JD 要求当成候选人事实，不得补造项目、数字或技术细节。
4. 回答信息不足时降低 confidence 并明确指出缺少什么，不得猜测。
5. 不输出总分、综合报告或面试过程建议；这里只生成逐题结构化评价。
`.trim());
