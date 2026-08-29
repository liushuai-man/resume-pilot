# 模拟面试 Multi-Agent + LangGraph 优化架构

> 状态：目标设计，尚未实现
>
> 设计日期：2026-08-29
>
> 原则：贴合现有代码、低复杂度演进、按需协作、证据优先
> 当前实现见 [模拟面试 Agent 当前真实架构](./interview-agent.md)

## 1. 目标与边界

目标是在保留现有会话、冻结快照、批量评价、确定性报告与失败恢复的基础上，让 Multi-Agent 与 LangGraph 形成真实结合：

> LangGraph 负责显式状态、条件路由、并行专家分析和恢复；多个 Agent 以独立目标和结构化契约协作，共同决定下一步面试行为。

面试过程、正式报告和用户画像统一围绕四个维度：

1. 技术深度 `technical_depth`
2. 项目阐述 `project_articulation`
3. 表达沟通 `communication`
4. 问题解决 `problem_solving`

在线只保留一个面试官 Agent，并按需调用四维专家；结束后保留一个独立批量评价 Agent。数据库写入、结束硬规则、校验、报告与画像聚合继续使用普通代码。

本期不做每轮正式评分、不让所有专家固定串行、不引入自由 Agent 对话、不把向量数据库作为前置依赖，也不推翻现有 API 和 SSE。

## 2. 最终产品体验

用户选择岗位和简历后，只需要完成一次连续流程：

```text
选择岗位与简历
  ↓ 点击“开始面试”
正在创建面试
  ├─ 冻结岗位、简历和 Rubric
  ├─ 读取已有用户画像
  └─ 生成本场证据计划
  ↓
面试官自然开场，请用户自我介绍
  ↓
连续面试
  ├─ 理解刚才的回答
  ├─ 承接回答追问或自然转场
  ├─ 补齐四维画像所缺证据
  └─ 动态判断用户达到的程度
  ↓
证据充分 / 达到用户指定题数 / 达到硬上限
  ↓
面试官自然结束本场面试
  ↓
正在生成报告
  ↓
报告生成完成 → 页面提示 + 全局通知 → 查看报告
```

从点击“开始面试”到报告发布成功，才算一次面试流程完成。面试问答结束只代表进入报告阶段，不代表任务已经完成。

### 2.1 用户可感知的状态

| 状态 | 页面表现 | 是否允许离开后恢复 |
| --- | --- | --- |
| `creating` | “正在创建面试”，展示读取材料、生成计划等稳定阶段文案 | 是 |
| `ready` | 面试官自然开场，并给出自我介绍题 | 是 |
| `interviewing` | 展示连续对话、输入区和当前进度，不暴露内部 Agent | 是 |
| `ending` | 面试官输出结束语，锁定本场 transcript | 是 |
| `report_generating` | “正在生成报告”，展示校验、评价、画像更新、报告发布进度 | 是 |
| `completed` | 展示报告入口，并发送“面试报告已生成”通知 | 不需要恢复 |
| `failed_recoverable` | 明确失败阶段，保留问答，提供从失败节点重试 | 是 |

页面刷新或临时离开后，应恢复到同一阶段、同一问题或同一个报告任务，不能重新创建面试或重复生成下一题。

### 2.2 题数控制

准备阶段提供两种互斥方式：

- `adaptive`（默认）：用户不选择题数，由面试官根据四维证据充分度决定结束；设置最低题数和安全硬上限，避免过早判断或无限面试。
- `fixed`：用户明确选择题数，面试官在该题数内安排覆盖和追问；达到题数后结束，不擅自加题。

自适应模式不是随机题数。面试官只有在四维关键证据达到可判断状态后才能建议结束，最终仍由 Completion Guard 校验。

### 2.3 连贯性是核心约束

下一题不能只从题库挑选，而应优先承接上一轮：

1. 先判断上一题是否已回答、还缺什么证据；
2. 有高价值缺口时，以用户刚才的原话作为追问锚点；
3. 当前主题证据足够时，用一句短转场切换维度；
4. 避免重复询问用户已经明确说明的事实；
5. 专家 Agent 只在幕后提供判断，所有问题统一由 Interviewer Agent 以同一口吻输出。

问题输出应增加对话承接字段：

```typescript
interface InterviewerMessage {
  acknowledgement?: string; // 简短自然回应，不做即时评分
  transition?: string;      // 换主题时使用
  question: QuestionDraft;
}
```

`acknowledgement` 只能确认已听到的事实，例如“了解，你刚才提到主要负责缓存改造”，不能在面试中提前给出“回答得很好”或具体分数。

## 3. 总体结构

```text
用户回答
   ↓
Application Service（权限 / 幂等 / 快照 / 持久化 / SSE）
   ↓
LangGraph Turn Graph
   ↓
Interviewer Agent 分析回答与证据缺口
   ├─ 无需专家会诊，由面试官直接决策下一题
   ├─ 按需委派 1～2 个专家（可并行）
   │    ├─ Technical Depth Specialist
   │    ├─ Project Articulation Specialist
   │    ├─ Communication Specialist
   │    └─ Problem Solving Specialist
   │             ↓
   │      Interviewer Agent 综合意见
   └─ 建议结束 → 确定性 Completion Guard
   ↓
校验 → 保存下一题或结束

面试结束
   ↓
LangGraph Report Graph
Transcript Validator → Batch Evaluation Agent → Validator
   → Deterministic Report Builder → Profile Observation Builder → 发布
```

真实协作发生在“观察 → 委派 → 独立专家判断 → 综合 → 行动”链路。专家意见改变后续问题，LangGraph 的条件边负责选择和汇合这些角色。

## 4. Agent 职责

### Interviewer Agent

唯一控制对话节奏的 Agent。它读取当前题答、最近两轮摘要、剩余计划、四维证据状态、相关简历/JD 片段和历史画像摘要，决定：

- `probe`：围绕当前回答追问；
- `switch_dimension`：切换到尚缺证据的维度；
- `adjust_difficulty`：调整难度；
- `finish_recommended`：建议结束，仍需规则确认；
- 是否需要一个或两个专家意见。

Interviewer Agent 同时负责一致的人设与措辞。专家不能直接把问题发送给用户；即使采用专家建议，也必须由 Interviewer Agent 结合上一轮内容重新表述，保证整场面试听起来始终是同一位面试官。

它不生成正式分数、不写数据库、不修改冻结事实、不负责最终报告。

### 四维 Specialist Agents

四个专家共享一个实现框架，只配置不同 prompt、观察标准和 schema，避免复制四套 class。

| Agent | 独立目标 | 主要观察 | 追问方向 |
| --- | --- | --- | --- |
| 技术深度 | 验证技术理解是否深入正确 | 原理、边界、取舍、故障模式、指标 | 为什么、替代方案、极端场景 |
| 项目阐述 | 验证叙述能否证明个人贡献 | 背景、职责、行动、结果、量化证据、简历一致性 | 你做了什么、结果如何验证 |
| 表达沟通 | 观察信息是否清晰有效 | 结构、直接性、重点、术语解释、受众适配 | 简洁重述、面向非技术方说明 |
| 问题解决 | 验证方法是否可执行 | 定义、假设、排查顺序、验证、决策、复盘 | 第一步验证什么、如何缩小范围 |

专家只输出观察与追问建议，必须引用回答片段；不直接生成最终用户问题，不给录用结论，不更新长期画像。

### Batch Evaluation Agent

结束后读取完整 transcript 和冻结 Rubric，独立执行正式评价。在线专家意见只用于控制追问，不作为最终分数输入，避免确认偏差。

## 5. 非 Agent 组件

| 能力 | 实现 | 原因 |
| --- | --- | --- |
| 面试计划 | `InterviewPlanBuilder` | 配额和优先级需稳定可测 |
| Agent 路由 | LangGraph 条件边 | 显式、可恢复、可审计 |
| 结束硬条件 | `CompletionGuard` 纯函数 | 防止提前结束或无限追问 |
| 输出校验 | Schema + 规则 | 不用另一个模型验证模型 |
| 状态/记忆存取 | Repository | 存取不是自主决策 |
| 报告与画像聚合 | 确定性服务 | 可复现、可回算 |
| SSE | Publisher | 只负责传输 |

不再创建 Strategy、Question Planner、FollowUp、Memory 或 Summary Agent。

## 6. Session Graph 与 Turn Graph

完整面试使用一个外层 Session Graph 管理生命周期，内部每轮复用 Turn Graph：

```text
START
  → create_session
  → load_frozen_context
  → load_profile_summary
  → build_evidence_plan
  → interviewer_opening
  → wait_for_answer
  → Turn Graph ─┐
       ↑        │ 下一题
       └────────┘
       │ 结束
       → interviewer_closing
       → lock_transcript
       → dispatch_report_graph
       → END
```

`interviewer_opening` 生成自然开场，但自我介绍仍是稳定的第一考察环节。开场失败时可使用经过产品确认的固定文案，不能阻塞整场面试。

### 6.1 单轮 Turn Graph

```text
START → record_answer → load_relevant_context → completion_guard_before_llm
  ├─ hard_finish → mark_finished → END
  └─ continue → interviewer_analyze
       ├─ interviewer_decide_without_consultation → validate_question
       ├─ consult_one → specialist → interviewer_synthesize
       ├─ consult_two → specialist_a ┐
       │               specialist_b ┴→ interviewer_synthesize
       └─ finish_recommended → completion_guard_after_llm
                                ├─ finish → mark_finished
                                └─ continue → interviewer_synthesize

interviewer_synthesize → validate_question
  ├─ valid → commit_question → END
  └─ invalid/timeout → fallback_question → commit_question → END
```

回答必须在任何模型调用前保存，延续现有 `submissionId` 幂等。普通回答不调用专家；单一明显缺口调用一个；只有跨两个高权重维度且确有价值时并行调用两个。每轮禁止调用全部专家。

这里的 `direct` 不是“不分析回答就随便生成问题”，也不是直接从题库抽题。它表示：Interviewer Agent 已经完成本轮回答分析，并判断不需要额外的 Specialist 意见，于是在同一次结构化输出中给出下一步决策与 `directQuestion`。典型情况包括：

- 当前回答已经充分，可以自然切换到尚未覆盖的维度；
- 回答存在明显且低风险的证据缺口，面试官自己即可追问；
- 当前内容不涉及需要技术正确性或项目事实一致性复核的判断；
- 快速模式下，面试官置信度已经达到直接决策阈值。

`direct` 路径仍必须读取当前题答、最近上下文、四维证据状态和剩余题数，并经过问题校验、去重和持久化。为减少命名歧义，代码中建议将路由名改为 `interviewer_decide_without_consultation`，而不是简单的 `direct`。

### 6.2 连贯上下文

每轮给 Interviewer Agent 的上下文控制为：

- 当前问题与当前回答原文；
- 最近 2～3 轮的题答或摘要；
- 本场已经确认的事实与不得重复的问题主题；
- 四维 `missing / partial / sufficient` 证据状态；
- 当前主题相关的简历、JD 和历史画像证据；
- 剩余题数预算。

不传无限增长的完整 prompt。完整 transcript 只在报告阶段使用。

## 7. Report Graph

```text
transcript_validate
  → load_or_run_batch_evaluation
  → evaluation_validate
  → report_compose
  → profile_observation_build
  → save_checkpoint
  → publish_result
```

- 输入哈希命中时复用现有评价 checkpoint；
- 四维评价必须包含合法 key、题目覆盖、整数分、依据和置信度；
- `report_compose` 沿用确定性加权；
- `profile_observation_build` 生成结构化观察，不直接覆盖长期画像；
- 失败时保留现有节点级重试，不生成伪评分。

报告生成应作为后台可恢复任务执行，并持久化 `reportRunId`。用户停留在页面时通过 SSE 接收阶段事件；离开页面后仍继续执行，完成时发送应用内通知。若未来接入浏览器系统通知或邮件，需要用户单独授权，不作为首期依赖。

### 7.1 LangGraph Checkpoint 与失败重连

Checkpoint 是首版核心能力，不再作为后期可选优化。现有 `ChatSession.summary` 只能保存业务状态快照，无法完整表达 LangGraph 当前节点、待执行任务、并行分支和恢复位置；目标架构应接入持久化 checkpointer，并以数据库作为生产环境存储。

需要在以下边界提交 checkpoint：

| Checkpoint 边界 | 已保证持久化的事实 | 失败后恢复行为 |
| --- | --- | --- |
| `create_session` 后 | session、冻结快照、运行模式 | 从加载画像/生成计划继续 |
| `record_answer` 后 | 回答与 `submissionId` | 不重复保存回答，从分析节点继续 |
| `interviewer_analyze` 后 | 面试官结构化决策、咨询请求 | 不重复调用面试官分析，继续专家分支 |
| 每个 Specialist 后 | 对应专家意见 | 只补跑未完成的并行分支 |
| `interviewer_synthesize` 后 | 最终问题草稿 | 从校验和提交继续，不重复生成问题 |
| `commit_question` 后 | 下一题及 turn 完成状态 | 重连时返回同一题，不重新执行本轮 |
| `lock_transcript` 后 | 不可变问答记录与输入哈希 | 从报告图继续 |
| Batch Evaluation 后 | 正式评价结果 | 报告组合失败时不重复调用模型 |
| `publish_result` 后 | 报告、画像观察和完成状态 | 重连时直接返回已完成结果 |

每场面试使用稳定的 `thread_id = sessionId`，每次图执行使用唯一 `runId`，每轮使用稳定 `turnId`。API 重试和 SSE 重连必须携带这些标识，服务端从 checkpointer 读取最新成功 checkpoint，而不是依赖前端告诉服务端“执行到哪里”。

恢复规则：

1. 先查询数据库中的 session 生命周期和最新 checkpoint；
2. 如果当前节点已经提交业务副作用，使用幂等键确认结果并跳过重复写入；
3. 从最后一个成功 checkpoint 的下一节点继续；
4. 并行专家分支只执行缺失分支，已完成意见直接复用；
5. 前端重新订阅状态事件，收到当前快照后继续接收新事件；
6. 如果进程在“模型返回成功、checkpoint 尚未提交”之间崩溃，允许重新调用该模型节点，但依靠下游幂等保证不产生重复问题或报告。

Checkpoint 不替代业务幂等。回答提交、问题提交、报告发布和通知写入仍要分别使用 `submissionId`、`turnId`、`evaluationInputHash`、`reportRunId` 等唯一约束。SSE 也不承担恢复事实，只负责实时传输。

## 8. 最小共享状态

```typescript
type DimensionKey =
  | 'technical_depth'
  | 'project_articulation'
  | 'communication'
  | 'problem_solving';

interface InterviewGraphState {
  sessionId: string;
  userId: string;
  mode: 'fast' | 'deep';
  lifecycle: 'creating' | 'ready' | 'interviewing' | 'ending' | 'report_generating' | 'completed' | 'failed_recoverable';
  questionCountMode: 'adaptive' | 'fixed';
  requestedQuestionCount: number | null;
  resumeSnapshot: ResumeSnapshot;
  jobProfileSnapshot: JobProfileSnapshot | null;
  rubricSnapshot: RubricSnapshot;
  plan: InterviewPlanItem[];
  questions: Question[];
  answers: Answer[];
  coverage: Record<DimensionKey, CoverageState>;
  interviewerDecision: InterviewerDecision | null;
  consultationRequests: ConsultationRequest[];
  specialistOpinions: SpecialistOpinion[];
  nextQuestion: QuestionDraft | null;
  conversationSummary: string;
  establishedFacts: string[];
  coveredTopics: string[];
  turnAudit: TurnAudit[];
  isFinished: boolean;
  finishReason: string | null;
  reportRunId: string | null;
  error: NodeError | null;
}
```

遗留字段建议收敛：删除 `strategy`、`memoryResult`；`profile` 改为 `sessionSkillObservations`；`askedQuestionTypes` 改为派生值；`resumeAnalysis` 改为按当前维度取得的 `relevantContext`。

## 9. Agent 契约

```typescript
interface InterviewerDecision {
  action: 'probe' | 'switch_dimension' | 'adjust_difficulty' | 'finish_recommended';
  observedDimensions: DimensionKey[];
  missingEvidence: Array<{
    dimension: DimensionKey;
    code: 'TOO_SHALLOW' | 'NO_PERSONAL_ACTION' | 'UNCLEAR' | 'NO_METHOD' | 'CONTRADICTION';
    answerExcerpt: string;
  }>;
  consultations: Array<{ dimension: DimensionKey; focus: string }>;
  directQuestion?: QuestionDraft;
  confidence: number;
}

interface SpecialistOpinion {
  dimension: DimensionKey;
  findings: Array<{
    code: 'STRENGTH' | 'OMISSION' | 'ERROR' | 'EVIDENCE_GAP' | 'CONTRADICTION';
    claim: string;
    answerExcerpt: string;
  }>;
  suggestedProbe: string | null;
  enoughEvidenceToMoveOn: boolean;
  confidence: number;
}

interface QuestionDraft {
  content: string;
  type: 'technical' | 'project' | 'followup';
  primaryDimension: DimensionKey;
  secondaryDimensions: DimensionKey[];
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  followUpFrom?: string;
  expectedEvidence: string[];
  rationaleCode: 'PROBE_GAP' | 'COVER_PLAN' | 'VERIFY_CONTRADICTION' | 'ADJUST_DIFFICULTY';
  continuity: {
    relation: 'follow_up' | 'deepen' | 'transition' | 'new_topic';
    anchorAnswerExcerpt?: string;
    avoidsTopics: string[];
  };
}
```

程序只使用枚举和数值路由，不解析自由文本理由。所有新数据只允许 canonical 四维 key。

## 10. 四维计划与结束规则

确定性计划从“维度 + 题数”增强为“维度 + 证据目标”：

```typescript
interface InterviewPlanItem {
  id: string;
  dimension: DimensionKey;
  topic: string;
  priority: number;
  targetEvidence: string[];
  minQuestions: number;
  maxQuestions: number;
  askedCount: number;
  evidenceStatus: 'missing' | 'partial' | 'sufficient';
}
```

| 维度 | 最低证据目标 |
| --- | --- |
| 技术深度 | 原理/机制 + 取舍或边界 + 实践验证 |
| 项目阐述 | 场景 + 个人职责 + 关键行动 + 可验证结果 |
| 表达沟通 | 结构清楚 + 回答直接 + 术语说明 |
| 问题解决 | 问题定义 + 假设/排查 + 验证 + 复盘 |

题目可以覆盖多个维度，但必须有一个主维度。Completion Guard 同时检查硬题数、最低题数和证据状态，不再只按题目标签判断覆盖。

面试官的“具体判断”不是保存一个不可解释的主观结论，而是四维 `CoverageState`：每个维度记录当前证据是否充分、用户表现区间、置信度和仍缺证据。在线区间只用于决定是否继续追问，不展示给用户，也不直接写入最终报告。最终分数仍由结束后的独立评价产生。

结束原因必须明确记录：

- `USER_FIXED_COUNT_REACHED`：达到用户指定题数；
- `EVIDENCE_SUFFICIENT`：自适应模式下四维核心证据充分；
- `HARD_LIMIT_REACHED`：达到安全硬上限；
- `USER_ENDED`：用户主动结束；
- `SYSTEM_RECOVERY_END`：异常恢复后无法继续，但 transcript 可评价。

## 11. 用户画像

画像不是一段 Agent 总结，而是可审计的结构化数据。每场正式报告生成 `CapabilityObservation`：

```typescript
interface CapabilityObservation {
  userId: string;
  interviewId: string;
  jobProfileId: string | null;
  dimension: DimensionKey;
  score: number;
  confidence: number;
  evidenceCount: number;
  evidenceRefs: Array<{
    questionId: string;
    answerExcerpt: string;
    rationale: string;
  }>;
  rubricVersion: string;
  evaluationVersion: string;
  observedAt: string;
}
```

全局画像和岗位画像分别聚合：

- 只使用完成且校验通过的正式面试；
- 权重为 `confidence × min(evidenceCount, 3) × recencyFactor`，替代简单平均；
- 展示样本数、证据数、时间范围、趋势和置信度；
- 少于 2 场只标记“初步观察”；
- Rubric 版本不兼容时先迁移或分组，不直接混算；
- 任何分数都能回溯到面试、题目和回答片段。

第一阶段不需要向量数据库。未来只有在大量历史证据检索成为真实需求时，再为 `evidenceRefs` 建 embedding；召回内容只提供上下文，不能直接成为评分事实。

## 12. 延迟与降级

| 模式 | 行为 |
| --- | --- |
| `fast` | Interviewer 一次；仅低置信度或核心缺口时调用一个专家，作为默认模式 |
| `deep` | Interviewer + 最多两个并行专家 + synthesis，由用户主动选择 |

模式存入会话快照，不再用环境变量隐藏产品行为。在线总预算建议快速模式约 3 秒、深度模式约 6 秒。超时不重跑整图：Interviewer 失败走计划模板题；专家失败则跳过该专家；综合失败优先采用合法专家追问，否则走模板；批量评价失败则保留 checkpoint 并显式重试。

## 13. 通知、恢复与完成语义

报告完成提醒分两层：

- 页面内：状态切换到 `completed` 后立即显示成功提示和“查看报告”入口；
- 应用内：写入一条持久化通知，用户在其他页面也能看到“面试报告已生成”。

SSE 只负责实时体验，不作为完成事实来源。刷新后前端通过 `sessionId` / `reportRunId` 查询服务端状态。报告发布与通知写入使用同一事务或 outbox，避免报告已完成但没有提醒。

一次流程的完成条件是：

```text
InterviewResult.status = completed
AND report 已持久化
AND CapabilityObservation 已持久化
AND completion notification 已入库
```

若报告失败，状态为 `failed_recoverable`，完整问答必须保留，用户可从报告页或历史记录重试失败节点。

## 14. 审计与持久化

首版使用持久化 LangGraph checkpointer 保存图执行状态，同时保留 `ChatSession.summary` 作为对外业务快照和旧会话兼容层。每轮还需保存 `TurnAudit`：问题与 submission ID、面试官决策、专家意见、最终问题、模型与 prompt 版本、输入哈希、各节点延迟和降级原因。

界面只展示产品级解释，例如“因项目结果证据不足而追问”，不保存或暴露 chain-of-thought。`InterviewTurn` / `AgentRun` 是否独立建表可按查询与审计需要决定，但不能因此推迟 checkpointer；首版可以先使用 checkpointer 表加现有业务表。

## 15. 现有代码映射

| 现有模块 | 演进 |
| --- | --- |
| `interview.service.ts` | 保留应用服务职责，调用 Turn Graph / Report Graph |
| `interview.graph.ts` | 拆成 `interview-turn.graph.ts`、`interview-report.graph.ts` |
| `InterviewDecisionAgent` | 重构为 `InterviewerAgent` 的 Analyze / Synthesize |
| `InterviewSupervisorAgent` | 删除或改名 `InterviewWorkflowFacade`，路由交给 LangGraph |
| `EvaluationAgent` | 保留并收紧为四维 Batch Evaluation Agent |
| `MemoryAgent` | 删除，技能 observation 与画像聚合进入普通服务 |
| `completion-policy.ts` | 升级为题数 + 证据状态的 Completion Guard |
| `report-builder.ts` | 保留，输入统一为 canonical 四维评价 |
| `profile.service.ts` | 从简单平均升级为 observation 加权聚合 |
| Repository | 增加状态 schema 版本，并接入持久化 LangGraph checkpointer；`summary` 保留为业务快照 |
| SSE | 增加 `analyzing`、`consulting`、`synthesizing`，不透传 prompt |
| `useInterviewSession` | 改为消费统一生命周期状态，不在前端自行推断自适应结束 |
| 面试页面 | 增加创建中、自然开场、结束语、报告生成中和恢复态 |
| 通知模块 | 增加持久化的报告完成通知与报告链接 |

## 16. 分阶段落地

### 阶段 0：统一数据基础

- 全链路统一四个 canonical key；
- 对旧 `technical` / `project` 数据提供显式兼容或迁移；
- 会话状态增加 `schemaVersion`；
- 接入数据库持久化 checkpointer，确定 `thread_id`、`runId`、`turnId` 与幂等键；
- 增加节点级中断、进程重启、SSE 断线重连测试；
- 补齐四维题目、评价和报告契约测试。

### 阶段 1：建立真实协作路径

- 合并 answer 与 next-question 为可恢复 Turn Graph；
- 实现 Interviewer Analyze / Synthesize；
- 先接技术深度、项目阐述两个专家；
- 保存 TurnAudit，保留模板降级。
- 由 Session Graph 统一负责自然开场、连续轮次与结束语；
- 前端接入统一生命周期状态。

验收标准：存在可审计的“面试官委派 → 专家意见 → 面试官综合 → 下一题”路径。

### 阶段 2：补齐四维

- 加入表达沟通、问题解决专家配置；
- 支持最多两个专家并行；
- 计划改为证据目标；
- Completion Guard 使用证据状态。

### 阶段 3：画像结构化

- 从报告生成 `CapabilityObservation`；
- 按置信度、证据数和时间加权；
- 分离全局画像与岗位画像；
- 前端展示样本与证据来源。
- 报告生成改为可恢复后台任务，加入完成通知。

### 阶段 4：按运行数据增强

- 观察专家触发率、P50/P95 延迟、降级率、重复问题率；
- 按状态规模和审计查询需求决定是否引入独立 AgentRun 表；
- 只有出现真实跨会话检索需求后才评估 pgvector。

## 17. 验收指标

- 0、1、2 个专家路径均有测试，两专家可并行汇合；
- 新会话维度 key 一致率 100%；
- 回答提交丢失率 0；
- 普通轮专家调用率建议 20%～40%，每轮平均专家数不高于 0.6；
- 在线降级率低于 5%；
- 重复或近似重复问题率低于 3%；
- 四维有效证据覆盖率不低于 90%；
- Batch Evaluation 失败绝不发布伪报告；
- 画像能够从 observation 完整重算并回溯证据。
- 任意 checkpoint 边界中断后均能从最后成功节点继续；
- 并行专家中单分支失败时只重跑失败分支；
- 重连不会重复保存回答、生成问题、发布报告或发送通知；
- 创建中、面试中、报告生成中均可刷新恢复且不重复执行；
- 自适应模式只在四维证据充分或达到硬上限后结束；
- 固定题数模式严格遵守用户选择；
- 每个追问能关联上一轮回答片段，每次换主题有自然转场；
- 报告完成后页面提示与应用内通知均可达。

## 18. 最终推荐

最适合当前项目的目标是：

> 一个面试官 Agent + 四个按需维度专家 + 一个结束后独立评价 Agent；LangGraph 负责真实条件路由、并行汇合、状态恢复和失败降级，其余确定性能力留在普通服务。

这能在不推翻现有基础的前提下形成真实 Multi-Agent 协作，并让面试过程、报告和用户画像统一围绕技术深度、项目阐述、表达沟通、问题解决四个维度。
