# 模拟面试 Agent 当前真实架构

> 最后核对：2026-08-29
>
> 文档性质：已实现架构基线，不包含目标方案
> 事实来源：`backend/src/ai/agents/interview`、`backend/src/ai/graphs/interview.graph.ts`、`backend/src/services/interview.service.ts`、`backend/src/services/profile.service.ts`、`backend/src/repositories/interview-session.repository.ts`

## 1. 结论

当前模拟面试不是 Supervisor 动态调度多个专家的 Multi-Agent 系统，而是：

> 规则驱动的在线面试流程 + 可选 LLM 出题 + 结束后单 Agent 批量评价 + 确定性报告聚合。

现有 `InterviewSupervisorAgent` 只是调用门面；`MemoryAgent` 是内存 reducer。LangGraph 将流程拆成几个短节点，但没有技术、项目、沟通、问题解决专家之间的协作或条件路由。

## 2. 运行流程

```text
开始面试
  ↓
校验简历、可选 JobProfile、默认模型配置
  ↓
冻结 Resume / JobProfile / Rubric，规则生成 InterviewPlan
  ↓
创建 ChatSession，状态序列化到 summary，返回固定自我介绍题
  ↓
提交回答 → submissionId 幂等检查 → record_answer → 规则判断结束
  ├─ 未结束：generate_question → append_question → 保存下一题与覆盖度
  └─ 已结束：批量评价完整问答 → 合并本场技能画像 → 确定性报告聚合
                 → 保存 checkpoint、审计信息与 InterviewResult
```

面试过程中只保存问答，不做正式评分或即时反馈。正式评价只在结束后执行。

## 3. LangGraph 的实际职责

图的外层状态持有完整 `LangGraphInterviewState`、本次 `operation` 和临时结果。当前图没有持续运行的完整面试循环，而是三条独立路径：

| Operation | 节点 | 行为 |
| --- | --- | --- |
| `submit_answer` | `record_answer` → `complete_answer/END` | 追加回答并用纯规则判断是否结束 |
| `next_question` | `generate_question` → `append_question` | 生成下一题，更新计划与维度覆盖 |
| `generate_report` | `generate_report` | 批量评价、合并画像并生成报告 |

状态没有使用 LangGraph checkpointer，而是由 Repository 序列化到 `ChatSession.summary`。LangGraph 当前主要提供统一状态传递和节点边界，没有承担多 Agent 条件路由。

## 4. 组件职责

| 组件 | 真实职责 | LLM | 实际属性 |
| --- | --- | --- | --- |
| `interview.service` | 生命周期、快照、计划、持久化、发布与恢复 | 否 | Application Service |
| `InterviewSupervisorAgent` | 转发出题、结束、评价与报告调用 | 间接 | Facade，不是真实 Supervisor |
| `InterviewDecisionAgent` | 结束判断、选择计划项、生成下一题 | 默认否，详细模式是 | 单一决策 Agent |
| `EvaluationAgent` | 结束后对完整问答执行一次正式评价 | 是 | 独立评价 Agent |
| `MemoryAgent` | 按置信度合并 `profileUpdate` | 否 | Reducer，无长期记忆 |
| `completion-policy` | 按题数、覆盖度、回答长度判断结束 | 否 | 纯函数 |
| `buildInterviewReport` | 聚合分数、证据、优缺点和建议 | 否 | 确定性领域函数 |
| Repository / Prisma | 保存状态、checkpoint 和结果 | 否 | 持久化基础设施 |
| SSE Publisher | 阶段、心跳、结果和错误事件 | 否 | 传输基础设施 |

## 5. 计划、出题与结束

`InterviewPlan` 由 `startInterview()` 中的普通 TypeScript 代码根据固定 Rubric 权重、JobProfile 技能与职责、练习主题和题数生成。计划项只记录维度、主题、优先级、计划题数和已出题数，不是 Strategy Agent 的输出。

第一题固定为自我介绍，标记 `communication`。后续题目：

- 默认模式选择尚未完成的高优先级计划项，根据简历项目或技能套用模板；
- `INTERVIEW_DETAILED_NEXT_QUESTION=true` 时，Decision Agent 将目标岗位、截断简历、进度、计划和历史问答交给 LLM；
- 详细模式失败时退回固定综合技术题；
- 即使开启详细模式，也只有一个 Agent，不存在专家协作。

固定题数模式达到 `maxQuestions` 时结束。自适应模式至少 5 题、最多 10 题；四维均被题目覆盖、计划完成且至少 60% 回答达到 40 字时可结束，回答 8 题后也允许结束。当前“覆盖”仅代表题目标签覆盖，不代表证据质量足够。

## 6. 四维评价现状

新会话使用以下冻结 Rubric：

| key | 名称 | 权重 |
| --- | --- | ---: |
| `technical_depth` | 技术深度 | 30% |
| `project_articulation` | 项目阐述 | 25% |
| `communication` | 表达沟通 | 20% |
| `problem_solving` | 问题解决 | 25% |

`EvaluationAgent` 一次读取完整问答、简历摘要、岗位和 Rubric，返回逐题分数、反馈、优缺点、知识缺口、训练建议、可选技能更新，以及带回答事实依据的四维评价。后端校验题目完整性、ID 唯一性、分数范围、固定维度 key 和评价依据。

当前仍存在兼容债务：部分出题降级和旧会话使用 `technical`、`project` 等旧 key。报告与画像服务做了部分映射，但 canonical key 尚未全链路统一。

## 7. 报告与用户画像

### 单场报告

`buildInterviewReport()` 不调用 LLM。它优先使用四维明细；旧评价则按题目维度与题目分数降级归属。相关题目取平均转换为百分制，只对有有效评价的维度按冻结权重归一化计算总分，并保存回答片段和评价理由。

### 本场技能画像

当前 `CandidateProfile` 是技能到 `{ level, confidence }` 的 Map，不是四维用户画像。它仅在报告生成时由 `MemoryAgent` 从 `profileUpdate` 合并。`retrieveSemanticMemory()` 固定返回空数组，没有跨会话向量检索或长期 Agent Memory。

### 跨场四维画像

`profile.service` 在查询时从已完成报告的 `dimensionScores` 聚合：

- 按维度计算历次面试简单平均；
- 记录面试样本数、题目证据数和最近证据；
- 按 1～2、3～4、5 场及以上标记低、中、高置信度；
- 按 JobProfile 分组形成岗位画像，岗位维度画像至少 2 场才展示。

它是普通查询服务的实时聚合，不是 LangGraph 节点或 Memory Agent 的持久化结果。

## 8. 已有可靠性措施

- `submissionId` 保证回答幂等；
- 响应丢失时复用已保存的下一题；
- Resume、JobProfile、Rubric 在开场冻结；
- 评价输入哈希防止复用过期 checkpoint；
- 评价成功后先保存 checkpoint；
- 失败节点可单步重试，条件更新防止并发重跑；
- SSE 提供阶段事件和 15 秒心跳；
- 完成后清空活动会话状态。

## 9. 明确未实现

| 能力 | 状态 |
| --- | --- |
| Supervisor 自主选择下一个 Agent | 未实现 |
| 四维专家 Agent | 未实现 |
| Agent 共享中间结论并共同决定下一题 | 未实现 |
| 基于回答证据缺口的默认实时追问 | 未实现 |
| LangGraph 内完整面试循环与 checkpointer | 未实现 |
| 跨面试长期语义记忆 / pgvector | 未实现 |
| 持久化逐轮 Agent 决策审计 | 未实现 |
| 四维 key 全链路统一 | 部分完成 |

目标架构与迁移方案见 [模拟面试 Multi-Agent + LangGraph 优化架构](./interview-agent-multi-agent-langgraph.md)。
