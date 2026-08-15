# AI 助手模拟面试 Agent 流式响应升级方案

> 文档状态：提案  
> 适用范围：ResumePilot 在线模拟面试  
> 编写日期：2026-08-14

## 1. 背景与现状

当前模拟面试已经具备会话恢复、回答幂等保存、下一题独立重试，以及面试结束后的批量评价与报告 checkpoint。调用链为：

```text
前端 useInterviewSession
  -> POST /interview/start | /answer | /next-question | /finish
  -> interview.service
  -> LangGraph graph.invoke(...)
  -> 等待完整结果
  -> 一次性 JSON 响应
```

这套实现的数据安全边界清晰，但所有 AI 操作都是阻塞式响应。生成第一题、下一题或报告时，前端只能显示“正在思考”，用户无法区分排队、读取上下文、生成、持久化等阶段；长请求还容易受到网关超时、页面切换和弱网络影响。

本次升级只改变响应交付方式，不改变现有产品原则：面试过程中仅保存问答，不即时评分或点评；批量 Evaluation、确定性聚合、校验和发布仍在结束面试后执行。

## 2. 升级目标

### 2.1 用户体验目标

- 首个可见反馈 P95 小于 500 ms。
- 问题正文可以逐步呈现，避免长时间空白等待。
- 明确展示“准备上下文、生成问题、保存完成、生成报告”等可信阶段。
- 网络中断后可恢复最终状态，不因流断开而重复保存回答或生成重复题目。
- 用户可以取消当前生成；已提交并确认保存的回答不回滚。

### 2.2 工程目标

- 建立前后端共享、可版本化的流事件协议。
- 保留现有非流式接口作为兼容和降级路径。
- 将“业务执行成功”与“客户端仍保持连接”解耦。
- 支持日志追踪、耗时分段、断流率和生成质量监控。
- 不向客户端暴露模型思维链、内部 Prompt、完整简历原文或工具私有参数。

### 2.3 非目标

- 本期不引入 WebSocket 双向语音面试。
- 本期不恢复逐题 Evaluation 或基于即时评分的动态追问。
- 本期不重构现有 Rubric、报告计算规则或 LangGraph 业务节点。

## 3. 总体方案

采用 **POST + SSE 格式响应**：浏览器通过 `fetch` 发起带 JSON 请求体和 JWT 的 POST 请求，后端返回 `Content-Type: text/event-stream`，前端用 `ReadableStream` 解析事件。

不直接使用原生 `EventSource`，因为现有接口需要 POST 请求体、认证头和显式取消；也暂不使用 WebSocket，因为当前主要是服务端单向输出，SSE 的部署、调试与降级成本更低。

```text
用户提交操作
  -> POST /api/interview/streams
  -> 立即返回 run.started
  -> Interview Stream Orchestrator
       -> 读取并校验会话
       -> 执行 LangGraph / Agent
       -> 发布公开阶段事件
       -> 转换模型 chunk 为 text.delta
       -> 在事务中保存最终业务结果
  -> result.committed
  -> run.completed
  -> 前端以服务端最终对象替换临时文本
```

核心原则是“双通道语义”：流事件用于即时展示，数据库中的 session/question/result 才是业务事实。`text.delta` 永远是临时 UI，不可直接作为已提交数据；只有收到 `result.committed` 后才更新正式客户端状态。

## 4. 接口设计

### 4.1 统一流式执行接口

```http
POST /api/interview/streams
Authorization: Bearer <token>
Accept: text/event-stream
Content-Type: application/json
Idempotency-Key: <uuid>
```

请求体：

```ts
type InterviewStreamRequest =
  | {
      operation: 'start';
      resumeId: string;
      targetPosition?: string;
      questionCount: number;
      jobProfileId?: string;
      practiceTopic?: string;
    }
  | {
      operation: 'next_question';
      sessionId: string;
    }
  | {
      operation: 'finish';
      sessionId: string;
    };
```

回答保存仍建议走现有 `POST /interview/answer`：它是快速、确定性的数据库写入，不应为了“看起来流式”而延长连接。保存成功后，再启动 `next_question` 流。这样能够继续保证“回答已保存，但下一题可单独重试”。

后续若需要合并网络往返，可以增加 `operation: 'answer_and_next'`，但内部必须先提交回答事务，再启动可失败的生成任务，不能把两者放在同一个长事务中。

### 4.2 事件封装

每条 SSE 消息都使用统一 envelope：

```ts
interface InterviewStreamEvent<T = unknown> {
  version: 1;
  eventId: string;       // 单调递增或 UUID，用于去重
  runId: string;         // 本次流任务 ID
  sessionId?: string;
  operation: 'start' | 'next_question' | 'finish';
  sequence: number;      // run 内严格递增
  timestamp: string;
  type: InterviewStreamEventType;
  data: T;
}
```

事件类型：

| 事件 | 用途 | 是否允许写入正式 UI 状态 |
| --- | --- | --- |
| `run.started` | 返回 runId、sessionId、协议版本 | 是 |
| `stage.changed` | 展示公开处理阶段及提示语 | 否 |
| `text.started` | 创建临时 AI 消息 | 否 |
| `text.delta` | 追加问题或报告文本片段 | 否 |
| `text.completed` | 文本生成结束，仍待校验/保存 | 否 |
| `result.committed` | 返回已落库的 Question 或 InterviewResult | 是 |
| `run.completed` | 本次执行正常结束 | 是 |
| `run.failed` | 结构化错误与可重试性 | 是 |
| `heartbeat` | 维持连接，不触发渲染 | 否 |

SSE 示例：

```text
event: stage.changed
id: 3
data: {"version":1,"runId":"run_01","sequence":3,"operation":"next_question","type":"stage.changed","data":{"stage":"generating","label":"正在组织下一题"}}

event: text.delta
id: 4
data: {"version":1,"runId":"run_01","sequence":4,"operation":"next_question","type":"text.delta","data":{"channel":"question","delta":"请结合你的项目经历，说明"}}

event: result.committed
id: 12
data: {"version":1,"runId":"run_01","sequence":12,"operation":"next_question","type":"result.committed","data":{"question":{"id":"q_02","content":"...","sectionKey":"project"}}}
```

### 4.3 公开阶段

阶段名必须来自白名单，不把 LangGraph 内部 state、Prompt 或推理内容直接透传：

```ts
type PublicInterviewStage =
  | 'queued'
  | 'loading_context'
  | 'planning'
  | 'generating'
  | 'validating'
  | 'saving'
  | 'evaluating_answers'
  | 'building_report'
  | 'completed';
```

前端提示语由本地映射生成，服务端只发稳定的 stage key。这样既方便国际化，也避免将 Agent 内部实现当作公共 API。

### 4.4 错误模型

```ts
interface StreamFailure {
  code:
    | 'UNAUTHORIZED'
    | 'SESSION_CONFLICT'
    | 'MODEL_TIMEOUT'
    | 'MODEL_OUTPUT_INVALID'
    | 'PERSIST_FAILED'
    | 'CLIENT_CANCELLED'
    | 'INTERNAL_ERROR';
  message: string;
  retryable: boolean;
  retryFrom?: 'start' | 'next_question' | 'finish';
  committed: boolean;
}
```

`committed` 是关键字段：例如客户端在 `result.committed` 后断网，重连时不能再次生成，而应通过 session 查询恢复已经落库的问题。

## 5. 后端改造

### 5.1 新增 Stream Orchestrator

建议新增：

```text
backend/src/ai/streaming/interview-stream.events.ts
backend/src/ai/streaming/interview-stream.publisher.ts
backend/src/services/interview-stream.service.ts
backend/src/controllers/interview-stream.controllers.ts
```

职责划分：

- Controller：设置 SSE headers、关闭代理缓冲、监听客户端断开。
- Publisher：统一序列号、心跳、JSON 序列化、敏感字段过滤和写入背压。
- Stream Service：把业务阶段、LangGraph 输出和数据库提交转换成公共事件。
- 现有 Interview Service：继续负责鉴权后的业务规则、事务与仓储，不感知 HTTP。

响应头至少包括：

```http
Content-Type: text/event-stream; charset=utf-8
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no
```

每 15 秒发送一次 heartbeat。`res.write()` 返回 `false` 时等待 `drain`，避免慢客户端造成无界内存增长。

### 5.2 LangGraph 与模型流

当前 `interviewGraph.invoke()` 可先保留，第一阶段仅流式输出节点级进度。第二阶段再为问题生成和报告生成节点增加 token callback，或切换为当前 LangGraph 版本支持的 `.stream()` 能力。

节点不能直接操作 Express Response，应接收一个可选的领域事件发布器：

```ts
interface InterviewRunEmitter {
  stage(stage: PublicInterviewStage): Promise<void>;
  delta(channel: 'question' | 'report', text: string): Promise<void>;
}
```

当底层模型只支持完整 JSON 结构化输出时，不应伪造 token 流。可以先发送阶段事件，模型返回后再对最终展示字段做短分片；长期方案是把“用户可见正文生成”和“结构化元数据校验”拆开，但最终 Question 必须通过 Zod 校验后才能提交。

### 5.3 一致性与幂等

- 每次请求强制携带 `Idempotency-Key`，服务端建立 `runId` 映射。
- `(userId, operation, idempotencyKey)` 唯一；重复请求返回同一业务结果，不重复调用模型。
- `next_question` 保存时继续依赖会话版本或当前题 ID 做乐观并发控制。
- 一个 session 同一时刻只允许一个生成型 run；第二个请求返回 `SESSION_CONFLICT`。
- `result.committed` 必须在数据库事务提交后发送。
- 客户端断开只触发 `AbortController`；若已进入提交区间，提交必须完成，再由恢复接口返回事实状态。
- 流事件不作为报告或问题的数据源，避免半截文本污染数据库。

初期无需持久化每个 token。建议只持久化 run 元数据：`runId`、幂等键、状态、operation、sessionId、最后错误和最终资源 ID。断流后前端调用现有 `GET /interview/sessions/:id` 或结果接口恢复。若未来需要跨设备继续观看报告生成，再引入 Redis Stream 或数据库 event log。

### 5.4 安全

- 只允许发送白名单事件和字段，统一做 payload schema 校验。
- 不发送 chain-of-thought、Prompt、模型原始响应、简历全文、JD 全文或工具调用参数。
- 错误消息对用户友好，堆栈和供应商错误仅进入服务端日志。
- 复用现有 authMiddleware 和 rate limit，并新增“并发 run 数”和“单 run 最大持续时间”限制。
- 对 delta 设单事件大小和累计输出上限，防止异常模型输出拖垮连接。

## 6. 前端改造

### 6.1 流客户端

新增 `frontend/src/api/sse-client.ts`，使用 `fetch` + `TextDecoderStream` 解析 SSE，要求支持：

- POST body 与认证头；
- `AbortSignal` 取消；
- 跨 chunk 拼接 SSE frame；
- 按 `runId + sequence` 去重和拒绝乱序事件；
- 非 2xx、JSON 错误响应和流内 `run.failed`；
- 页面卸载时关闭 reader。

新增 `interviewApi.streamOperation(request, handlers, signal)`，不要让组件直接解析协议。

### 6.2 Hook 状态机

将多个容易组合出矛盾状态的 boolean（`isThinking`、`starting`、`submitting`、`finishing`）收敛为显式状态机：

```ts
type InterviewRunState =
  | { status: 'idle' }
  | { status: 'streaming'; runId: string; stage: PublicInterviewStage; draft: string }
  | { status: 'committing'; runId: string; draft: string }
  | { status: 'succeeded' }
  | { status: 'failed'; error: StreamFailure }
  | { status: 'cancelled' };
```

收到 `text.delta` 时只更新 `draft`；收到 `result.committed` 后，用服务端 Question/InterviewResult 替换 draft 并写入正式列表。恢复页面时仍以 `getActiveSession` 为准。

### 6.3 交互表现

- 使用稳定的阶段提示替代单一“正在思考”。
- 问题消息先展示临时光标和增量 Markdown；完成后切换成正式消息。
- 流式 Markdown 渲染需容忍未闭合代码块，并以 30–50 ms 节流刷新，避免每个 token 都触发完整 React 渲染。
- 用户主动取消后展示“已停止生成”，若回答已经保存，应继续保留回答并提供“重新生成下一题”。
- 断流时先查询 session：已存在下一题则恢复；不存在才允许使用原幂等键重试。
- `prefers-reduced-motion` 下关闭打字光标动画；阶段文案使用 `aria-live="polite"`。

## 7. 关键流程

### 7.1 提交回答并生成下一题

```text
1. POST /interview/answer（携带 submissionId）
2. 回答事务提交成功，前端立即显示自己的回答
3. POST /interview/streams，operation=next_question
4. run.started -> stage.changed -> text.delta*
5. 后端校验并保存 Question
6. result.committed -> run.completed
7. 前端以正式 Question 替换临时消息
```

如果第 3–6 步失败，回答依然安全保存，沿用现有“重新生成下一题”能力。

### 7.2 结束面试并生成报告

报告流程可能持续更久，第一版重点流式展示 `evaluating_answers`、`building_report`、`validating`、`saving` 等阶段。只有最终可展示文本适合发送 delta；确定性分数与维度聚合必须以 `result.committed` 返回的数据为准。

若 Evaluation 节点失败，继续沿用 `failed_node + evaluation_input_hash` 的单节点重试协议；流事件只负责展示失败阶段，不替代 checkpoint。

## 8. 兼容与降级

- 保留现有 `/start`、`/next-question`、`/finish` JSON 接口至少一个发布周期。
- 新能力使用 `VITE_INTERVIEW_STREAMING_ENABLED` 与服务端 feature flag 双开关。
- 流接口在首字节前失败时返回标准 JSON 错误；首字节后失败时发送 `run.failed`。
- 代理或浏览器不支持流时，前端自动回退现有阻塞接口。
- 发布期间按用户或 session 灰度，确保同一 session 固定采用同一协议，避免状态交叉。

## 9. 可观测性与验收指标

每个 run 记录：

- `traceId`、`runId`、`sessionId`、operation、模型与耗时；
- TTFE（请求到首事件）、TTFT（请求到首文本）、总耗时；
- 各 stage 耗时、delta 数量、输出字符数；
- 客户端取消、异常断流、模型失败、校验失败和持久化失败；
- 幂等命中、并发冲突和降级次数。

上线门槛：

- `result.committed` 后 session 数据与非流式路径完全一致；
- 重复请求、双击、刷新和断流不会产生重复 Question/Result；
- 流式成功率不低于原接口成功率；
- 断流恢复成功率达到 99%；
- P95 TTFE < 500 ms，heartbeat 间隔不超过 15 秒；
- 日志与前端事件中不存在 Prompt、思维链或简历敏感全文。

## 10. 测试方案

### 单元测试

- SSE 编码/解析：中文、多行 data、跨 chunk、空行、UTF-8 半字符。
- 事件 sequence、去重、乱序拒绝和 schema 校验。
- Abort、背压、heartbeat 清理和最大输出限制。
- reducer/state machine 的所有状态迁移。

### 集成测试

- start、next_question、finish 的正常事件顺序。
- 模型在首 token 前、生成中、校验阶段失败。
- 数据库提交失败时不得发送 `result.committed`。
- `result.committed` 后立即断网，刷新可恢复且不重复生成。
- 同一幂等键重放、不同键并发请求、过期 JWT 和 rate limit。

### 端到端测试

- 完整完成 5 题面试并生成报告。
- 弱网、代理缓冲、切换页面、手动取消和浏览器刷新。
- feature flag 关闭及自动降级路径。
- 流式与非流式最终 Question、Session、Report 数据契约对比。

## 11. 分阶段实施计划

### 阶段 A：协议与进度流（1–2 天）

- 定义共享事件类型、SSE Publisher、统一错误模型。
- 新增 stream 路由，底层仍调用现有 `graph.invoke()`。
- 输出 run、stage、committed、failed、heartbeat 事件。
- 接入日志指标和 feature flag。

交付价值：快速消除“无反馈等待”，风险最低。

### 阶段 B：问题正文增量输出（2–4 天）

- 为 Question 生成链路接入模型 callback 或 graph stream。
- 前端加入临时消息、节流渲染、取消与断流恢复。
- 完成幂等 run 和 session 并发锁。

交付价值：第一题与下一题具备真实可感知的流式体验。

### 阶段 C：报告阶段流与灰度（2–3 天）

- 接入批量评价公开阶段；仅对适合的报告文本做 delta。
- 复用 checkpoint 重试，补齐监控面板与 E2E 故障注入。
- 小流量灰度，对比成功率、TTFT 和用户取消率。

### 阶段 D：收敛（1–2 天）

- 达标后默认启用流式路径。
- 保留非流式降级入口，清理重复前端 loading 逻辑。
- 根据生产数据决定是否需要 Redis run/event 存储。

## 12. 风险与决策

| 风险 | 对策 |
| --- | --- |
| Nginx/CDN 缓冲导致“伪流式” | `X-Accel-Buffering: no`，部署环境逐层验证首块到达时间 |
| 结构化输出无法稳定 token 流 | 先做阶段流；正文与元数据分离后再开放真实 delta |
| 断流造成重复题目 | 幂等键、session 单 run 锁、提交后恢复查询 |
| Markdown 高频渲染卡顿 | 合并 delta，30–50 ms 批量刷新 |
| 用户取消与数据库提交竞态 | 区分可取消生成区和必须完成的提交区 |
| 内部推理泄露 | 公共阶段白名单与事件 payload schema，禁止透传原始 callback |
| 老版本 LangGraph 流能力有限 | 用自有 emitter 隔离版本差异，后续单独升级依赖 |

## 13. 最终建议

优先交付“阶段流 + 最终结果提交事件”，再逐步接入正文 token 流。该顺序能先解决等待感和可观测性问题，同时不破坏当前已经建立的回答幂等、下一题重试、批量评价与报告 checkpoint。真正的完成标准不是文字逐字出现，而是流式体验、业务一致性、断线恢复和敏感信息边界同时成立。
