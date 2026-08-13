# AI 模拟面试 Agent 架构优化设计方案

> **状态说明（2026-08-13）：历史探索稿。** 本文后半部分保留了早期“每题回答后立即 Evaluation / Memory / 动态追问”的方案，不再作为 V2.0 当前实施依据。当前产品要求面试过程中只保存问答、不评分不评论；Evaluation、报告汇总、校验与发布在结束后批量执行。现行节点流程、失败处理、前端状态和单步重试协议以 [V2.0 路线图阶段 5](../roadmap/v2-roadmap.md#阶段-5基于-jd-的在线面试) 为准。后续实现不得把本文早期即时评价流程重新接回面试主循环。
> 当前正常报告路径仅调用一次 Batch Evaluation Agent；报告总分、维度分和摘要列表由后端基于冻结 Rubric 确定性聚合，不再调用独立 Summary/Report Agent。

---

## 一、背景

当前项目基于 LangGraph 实现 AI 模拟面试 Agent，存在以下架构问题：

| 问题                      | 当前状态                     | 影响                         |
| ------------------------- | ---------------------------- | ---------------------------- |
| Question Agent 职责过重   | 同时负责问题决策和问题生成   | 难以维护和扩展               |
| FollowUp Agent 层级不清晰 | 作为 Question Agent 的子模块 | 无法基于 Evaluation 动态触发 |
| Strategy Agent 功能单一   | 只负责下一题选择             | 缺乏整体面试规划能力         |
| Memory 系统薄弱           | 仅支持基础结构化存储         | 无法实现跨会话长期记忆       |

本方案旨在将当前简单的 Multi-Agent 问答系统，升级为基于 LangGraph 的动态 AI 面试 Agent Workflow。

---

## 二、目标架构

```
                         用户
                          │
                          │
           ┌─────────────────────────────┐
           │  Interview Supervisor Agent │
           │     (流程控制 + Agent调度)    │
           └─────────────────┬───────────┘
                             │
                             │
           ┌─────────────────▼───────────┐
           │      Strategy Agent          │
           │   (面试规划 + 动态策略)        │
           └─────────────────┬───────────┘
                             │
                             │
           ┌─────────────────▼───────────┐
           │    Question Planner Agent    │
           │    (问题类型决策)            │
           └─────────────────┬───────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Technical Agent│   │  Project Agent│    │ FollowUp Agent│
│   八股问题      │   │   项目深挖      │    │   动态追问     │
└───────────────┘    └───────────────┘    └───────────────┘
                             │
                        用户回答
                             │
           ┌─────────────────▼───────────┐
           │      Evaluation Agent       │
           │      (回答评估)              │
           └─────────────────┬───────────┘
                             │
           ┌─────────────────▼───────────┐
           │       Memory Agent          │
           │     (记忆更新)               │
           └─────────────────┬───────────┘
                             │
           ┌──────────────────┴──────────────────┐
           ▼                                     ▼
    ┌─────────────────┐                 ┌─────────────────┐
    │ PostgreSQL Memory│                 │  Vector Memory  │
    │  结构化能力画像   │                 │  pgvector语义记忆 │
    └─────────────────┘                 └─────────────────┘
                             │
                             │
           ┌─────────────────▼───────────┐
           │    Supervisor继续控制        │
           │    (判断继续/结束)           │
           └─────────────────────────────┘
```

---

## 三、Agent 职责定义

### 3.1 Interview Supervisor Agent

**定位**：面试总控，负责流程生命周期管理

**职责**：

- 控制整个面试生命周期
- 管理面试阶段切换
- 调度 Agent 执行流程
- 判断是否结束面试

**注意**：Supervisor **不负责生成具体问题**，只负责决策"下一步应该调用哪个 Agent"。

**输入**：

```typescript
InterviewState; // 完整的面试状态
```

**输出**：

```typescript
{
  nextAgent: 'StrategyAgent' |
    'QuestionPlannerAgent' |
    'EvaluationAgent' |
    'MemoryAgent' |
    'SummaryAgent';
}
```

**决策逻辑**：

| 当前状态        | Supervisor 决策                      |
| --------------- | ------------------------------------ |
| 面试开始        | StrategyAgent（生成面试计划）        |
| 需要生成问题    | QuestionPlannerAgent（决定问题类型） |
| 用户已回答      | EvaluationAgent（评估回答）          |
| 评估完成        | MemoryAgent（更新记忆）              |
| Memory 更新完成 | StrategyAgent（动态调整策略）        |
| 达到题数限制    | SummaryAgent（生成报告）             |

---

### 3.2 Strategy Agent

**定位**：面试策略大脑

**职责**：

#### 面试开始阶段：

根据用户简历、目标岗位 JD、技术栈，生成完整的面试计划。

**输入**：

```typescript
{
  resumeContent: string;
  targetPosition: string;
  jobRequirement?: JobRequirement;
}
```

**输出**：

```typescript
{
  interviewPlan: [
    {
      topic: 'React',
      priority: 8,
      count: 3,
    },
    {
      topic: 'AI Agent',
      priority: 10,
      count: 5,
    },
  ];
}
```

#### 面试过程阶段：

根据历史评价、用户能力画像、岗位要求，动态调整下一阶段考察方向。

**输入**：

```typescript
{
  evaluationHistory: Evaluation[];
  candidateProfile: CandidateProfile;
  jobRequirement: JobRequirement;
  currentProgress: number;
}
```

**输出**：

```typescript
{
  nextTopic: "LangGraph",
  difficulty: "medium",
  reason: "AI能力不足，需要深入考察"
}
```

**决策示例**：

**能力画像**：

```typescript
{
  React: 8,
  Node: 7,
  Database: 5,
  AI_Agent: 6
}
```

**岗位需求**：AI 应用开发

**Strategy Agent 分析**：

- 发现 AI 能力评分较低（6分）
- 岗位核心技能是 AI 相关
- 决定加强 AI 方向的考察

**输出**：

```typescript
{
  nextTopic: "LangChain",
  difficulty: "medium",
  reason: "岗位核心技能不足，需要加强 AI 能力考察"
}
```

---

### 3.3 Question Planner Agent（新增）

**定位**：问题类型决策器

**职责**：
根据 Strategy Agent 输出，决定"应该调用哪个问题生成 Agent"。

**输入**：

```typescript
{
  currentStrategy: {
    nextTopic: string;
    difficulty: string;
  }
  evaluation: Evaluation;
  memoryResult: MemoryResult;
  currentStage: string;
}
```

**输出**：

```typescript
{
  agent: "TechnicalAgent" | "ProjectAgent" | "FollowUpAgent";
  topic: "Redis缓存一致性";
  difficulty: "hard";
  context: {
    currentQuestion?: Question;
    userAnswer?: string;
    evaluation?: Evaluation;
  };
}
```

**决策规则**：

| 条件                                  | 决策           |
| ------------------------------------- | -------------- |
| Evaluation 存在知识缺口，需要深入追问 | FollowUpAgent  |
| Strategy 指定技术专题，需要基础考察   | TechnicalAgent |
| Strategy 指定项目相关，需要深挖项目   | ProjectAgent   |

---

### 3.4 Technical Agent（八股 Agent）

**定位**：技术基础问题生成器

**职责**：
生成基础技术问题，覆盖：

- JavaScript / TypeScript
- React / Vue
- Node.js
- 数据库（MySQL、PostgreSQL、MongoDB）
- 计算机网络
- 工程化（Webpack、Vite、CI/CD）

**输入**：

```typescript
{
  topic: string;
  difficulty: string;
  knowledgePoint?: string;
  resumeContent?: string;
  targetPosition?: string;
}
```

**输出**：

```typescript
{
  question: "React中Fiber架构为什么需要时间切片?",
  type: "technical",
  topic: "React",
  difficulty: "hard"
}
```

**示例问题**：

- "为什么 useEffect 可能导致闭包问题？"
- "React Fiber 架构的核心设计思想是什么？"
- "HTTP 和 HTTPS 的区别是什么？"

---

### 3.5 Project Agent

**定位**：项目深度提问器

**职责**：
基于用户简历项目进行深度提问。

**输入**：

```typescript
{
  resumeContent: string;
  projectInfo: {
    name: string;
    description: string;
    techStack: string[];
  };
  topic?: string;
  difficulty?: string;
}
```

**输出**：

```typescript
{
  question: "你的AI简历项目为什么选择LangGraph，而不是普通Chain?",
  type: "project",
  reason: "考察Agent架构理解",
  projectName: "AI简历助手"
}
```

**重点原则**：

- 避免生成普通八股问题
- 深入挖掘项目细节
- 关注技术选型理由

---

### 3.6 FollowUp Agent（重点优化）

**定位**：动态追问器

**职责**：
模拟真实面试官的深度追问，不再作为普通问题生成 Agent。

**输入**：

```typescript
{
  currentQuestion: Question;
  userAnswer: string;
  evaluation: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    knowledgeGap: string[];
  };
  candidateProfile: CandidateProfile;
  semanticMemory: MemoryItem[];
}
```

**输出**：

```typescript
{
  question: "如果数据库更新成功，但是Redis删除失败，你如何解决缓存一致性问题?",
  type: "followup",
  reason: "针对'没有提到缓存一致性方案'的追问",
  followUpFrom: "Redis缓存一致性"
}
```

**追问示例**：

| 当前问题                 | 用户回答                | Evaluation                          | FollowUp 生成                                                    |
| ------------------------ | ----------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| Redis如何保证缓存一致性? | 使用Redis缓存数据库数据 | weakness:["没有提到缓存一致性方案"] | 如果数据库更新成功，但是Redis删除失败，你如何解决缓存一致性问题? |
| React Hooks 有哪些?      | useState、useEffect     | weakness:["没有深入理解依赖数组"]   | useEffect 的依赖数组是如何工作的？如果省略会怎样？               |
| 项目用了微服务架构       | 拆分了多个服务          | weakness:["没有提到一致性处理"]     | 你们如何处理服务间通信的一致性问题？                             |

---

### 3.7 Evaluation Agent

**定位**：回答评估器

**职责**：
分析用户回答，提供专业评估。

**输入**：

```typescript
{
  question: string;
  answer: string;
  expectedAnswer?: string;
  candidateLevel?: string;
  targetPosition?: string;
}
```

**输出**：

```typescript
{
  score: 8,
  knowledgeLevel: "熟悉",
  strengths: ["理解 Redis 缓存思想"],
  weaknesses: ["缺少一致性处理"],
  knowledgeGap: ["Redis缓存一致性"],
  followUpSuggestion: "继续追问缓存击穿",
  profileUpdate: {
    skill: "Redis",
    level: 6,
    confidence: 0.7
  }
}
```

**评估维度**：

| 维度                 | 说明                       |
| -------------------- | -------------------------- |
| `score`              | 1-10 分评分                |
| `knowledgeLevel`     | 掌握程度（了解/熟悉/精通） |
| `strengths`          | 回答优点                   |
| `weaknesses`         | 回答不足                   |
| `knowledgeGap`       | 知识缺口（用于 FollowUp）  |
| `followUpSuggestion` | 下一步追问建议             |
| `profileUpdate`      | 能力画像更新数据           |

**关键设计**：

Evaluation Agent **不只是打分器**，它需要产生：

- 后续追问依据（knowledgeGap）
- 能力画像更新数据（profileUpdate）
- 难度调整建议

---

### 3.8 Memory Agent（三层架构）

**定位**：记忆管理器

**职责**：
管理三层 Memory：短期、会话、长期。

#### 第一层：短期 Memory

**存储**：LangGraph State

**保存内容**：

- 当前问题
- 当前回答
- 最近几轮对话

**用途**：

- 当前面试上下文传递
- Agent 间数据共享

#### 第二层：Session Memory

**存储**：PostgreSQL

**保存内容**：

- InterviewSession（面试会话）
- InterviewMessage（面试消息）
- Evaluation（评估记录）
- SkillScore（技能评分）

**用途**：

- 一次面试完整数据记录
- 面试报告生成
- 面试回放

#### 第三层：Long Term Memory

**存储**：PostgreSQL + pgvector

**保存内容**：

- 用户长期能力信息
- 语义记忆（Embedding 向量）

**存储流程**：

```
用户回答
    │
    ▼
Evaluation Agent (分析回答，生成评估)
    │
    ▼
Memory Agent (提取关键信息)
    │
    ▼
Embedding (BGE-M3 模型生成向量)
    │
    ▼
pgvector (存储向量 + 元数据)
```

**存储示例**：

```typescript
{
  content: "用户对于LangGraph Memory设计理解不足",
  metadata: {
    topic: "LangGraph",
    score: 6,
    userId: "xxx",
    interviewId: "yyy",
    timestamp: "2024-01-01T10:00:00Z"
  },
  embedding: [0.1, 0.2, 0.3, ...]
}
```

**检索示例**：

**场景**：用户再次回答"我设计了 Agent 系统"

**Memory Agent 检索**：

```
similarity search: ["LangGraph", "Agent", "Memory"]
```

**召回结果**：

```
之前：用户不了解长期 Memory
```

**生成追问**：

```
你的 Agent Memory 如何避免上下文无限增长？
```

这就是**长期人格化面试**的核心机制。

---

## 四、LangGraph State 设计

```typescript
interface InterviewState {
  // 当前面试信息
  interviewId: string;
  resumeContent: string;
  targetPosition: string;
  stage: string;

  // 面试计划（由 Strategy Agent 生成）
  interviewPlan: {
    topic: string;
    priority: number;
    count: number;
    askedCount: number;
  }[];

  // 当前策略（由 Strategy Agent 更新）
  strategy: {
    nextTopic: string;
    difficulty: string;
    reason: string;
  };

  // 当前问题
  currentQuestion: {
    id: string;
    content: string;
    type: 'technical' | 'project' | 'followup' | 'introduction';
    topic?: string;
    difficulty?: string;
  };

  // 用户回答
  currentAnswer: string;

  // 评价结果（由 Evaluation Agent 生成）
  evaluation: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    knowledgeGap: string[];
    followUpSuggestion: string;
    profileUpdate: {
      skill: string;
      level: number;
      confidence: number;
    } | null;
  } | null;

  // 用户能力画像
  profile: CandidateProfile;

  // 面试历史
  history: QARecord[];

  // 已提问统计
  askedQuestionTypes: {
    technical: number;
    project: number;
    followup: number;
  };

  // 记忆检索结果
  memoryResult: MemoryItem[];

  // 是否结束
  isFinished: boolean;

  // 面试报告
  report: InterviewReport | null;
}
```

**State 字段说明**：

| 字段                 | 类型             | 说明                                 |
| -------------------- | ---------------- | ------------------------------------ |
| `interviewId`        | string           | 面试会话唯一标识                     |
| `resumeContent`      | string           | 简历内容（JSON 字符串）              |
| `targetPosition`     | string           | 目标岗位                             |
| `stage`              | string           | 当前面试阶段                         |
| `interviewPlan`      | array            | 面试计划（由 Strategy Agent 生成）   |
| `strategy`           | object           | 当前策略（由 Strategy Agent 更新）   |
| `currentQuestion`    | object           | 当前问题信息                         |
| `currentAnswer`      | string           | 用户当前回答                         |
| `evaluation`         | object           | 评价结果（由 Evaluation Agent 生成） |
| `profile`            | CandidateProfile | 用户能力画像                         |
| `history`            | QARecord[]       | 问答历史记录                         |
| `askedQuestionTypes` | object           | 已提问类型统计                       |
| `memoryResult`       | MemoryItem[]     | 记忆检索结果                         |
| `isFinished`         | boolean          | 是否结束                             |
| `report`             | InterviewReport  | 面试报告                             |

---

## 五、完整 LangGraph 流程

```
START
    │
    ▼
Interview Supervisor Agent
    │  nextAgent: "StrategyAgent"
    ▼
Strategy Agent
    │  生成面试计划 → 更新 interviewPlan
    ▼
Question Planner Agent
    │  决策：调用 Technical / Project / FollowUp Agent
    ▼
Technical / Project / FollowUp Agent
    │  生成问题 → 更新 currentQuestion
    ▼
用户回答
    │  用户提交回答 → 更新 currentAnswer
    ▼
Evaluation Agent
    │  评估回答 → 更新 evaluation
    ▼
Memory Agent
    │  更新三层记忆 → 更新 memoryResult, profile
    ▼
Strategy Agent
    │  动态调整策略 → 更新 strategy
    ▼
判断是否继续
    │
    ├── Yes → Question Planner Agent (生成下一题)
    │
    └── No → Summary Agent (生成面试报告)
              │
              ▼
            END
```

**详细流程图**：

```
                    ┌─────────────────────────────┐
                    │   Interview Supervisor       │
                    └─────────────┬───────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│ Strategy Agent│         │ Evaluation    │         │ Summary Agent │
│ 面试规划/策略  │         │ Agent         │         │ 生成报告       │
└───────┬───────┘         │ 回答评估      │         └───────────────┘
        │                 └───────┬───────┘
        │                         │
        ▼                         ▼
┌───────────────┐         ┌───────────────┐
│Question Planner│        │  Memory Agent │
│Agent           │        │ 记忆更新      │
│问题类型决策    │        └───────────────┘
└───────┬───────┘
        │
   ┌────┴────┬────────────┐
   ▼         ▼            ▼
┌───────────────────────────────────────┐
│ Technical / Project / FollowUp Agent  │
│     问题生成                           │
└───────────────────────────────────────┘
        │
        ▼
     用户回答
        │
        ▼
┌───────────────┐
│ Evaluation    │ ←── 循环回到评估
│ Agent         │
└───────────────┘
```

---

## 六、数据库设计

### 6.1 InterviewSession（面试会话）

| 字段       | 类型      | 说明                  |
| ---------- | --------- | --------------------- |
| id         | string    | 主键                  |
| userId     | string    | 用户 ID               |
| position   | string    | 目标岗位              |
| status     | string    | 状态（进行中/已结束） |
| createdAt  | timestamp | 创建时间              |
| finishedAt | timestamp | 结束时间（可选）      |

### 6.2 InterviewMessage（面试消息）

| 字段        | 类型      | 说明                                   |
| ----------- | --------- | -------------------------------------- |
| id          | string    | 主键                                   |
| sessionId   | string    | 关联会话 ID                            |
| role        | string    | 角色（system/user/assistant）          |
| content     | string    | 消息内容                               |
| messageType | string    | 消息类型（question/answer/evaluation） |
| createdAt   | timestamp | 创建时间                               |

### 6.3 Evaluation（评估记录）

| 字段               | 类型     | 说明         |
| ------------------ | -------- | ------------ |
| id                 | string   | 主键         |
| questionId         | string   | 关联问题 ID  |
| score              | number   | 评分（1-10） |
| feedback           | string   | 反馈内容     |
| strengths          | string[] | 优点         |
| weaknesses         | string[] | 薄弱点       |
| knowledgeGap       | string[] | 知识缺口     |
| followUpSuggestion | string   | 追问建议     |

### 6.4 CandidateSkillProfile（候选人技能画像）

| 字段        | 类型      | 说明             |
| ----------- | --------- | ---------------- |
| userId      | string    | 用户 ID（主键）  |
| skill       | string    | 技能名称（主键） |
| level       | number    | 技能水平（1-10） |
| confidence  | number    | 置信度（0-1）    |
| lastUpdated | timestamp | 最后更新时间     |

### 6.5 LongTermMemory（长期语义记忆）

| 字段        | 类型      | 说明             |
| ----------- | --------- | ---------------- |
| id          | string    | 主键             |
| userId      | string    | 用户 ID          |
| content     | string    | 记忆内容         |
| topic       | string    | 主题             |
| score       | number    | 关联评分         |
| embedding   | vector    | 向量（pgvector） |
| metadata    | json      | 元数据           |
| interviewId | string    | 关联面试 ID      |
| createdAt   | timestamp | 创建时间         |

---

## 七、技术实现

### 7.1 技术栈选择

| 类别       | 技术                        | 说明                      |
| ---------- | --------------------------- | ------------------------- |
| Agent 框架 | LangGraph                   | 状态机驱动的多 Agent 协作 |
| LLM 框架   | LangChain                   | LLM 调用和工具链          |
| LLM 模型   | GPT-4.1 / DeepSeek / Claude | 多模型支持                |
| 短期记忆   | LangGraph State             | 会话内状态管理            |
| 会话记忆   | PostgreSQL                  | 结构化数据存储            |
| 长期记忆   | PostgreSQL + pgvector       | 向量语义存储              |
| Embedding  | BGE-M3                      | 语义向量生成              |
| 缓存       | Redis                       | 提升性能                  |

### 7.2 核心设计原则

1. **状态驱动**：整个流程由 LangGraph State 驱动，状态是唯一真理来源
2. **模块化**：每个 Agent 职责单一，便于测试和扩展
3. **可观测性**：关键节点记录日志，支持调试和分析
4. **容错机制**：单个 Agent 失败不影响整体流程
5. **渐进增强**：基础功能可用，高级功能逐步添加
6. **数据传递**：Agent 之间通过 State 传递数据，不直接调用

### 7.3 开发要求

1. 保留现有 LangGraph State 驱动模式
2. 不改变已有面试接口调用方式
3. Agent 之间通过 State 传递数据
4. 每个 Agent 保持单一职责
5. FollowUp Agent 支持基于 Evaluation 的动态追问
6. Memory 支持 PostgreSQL + pgvector 长期记忆
7. 保留现有项目结构，优先增量修改

---

## 八、扩展方向

- [ ] **多轮面试**：支持跨会话的连续面试
- [ ] **多人面试**：支持多位面试官协作
- [ ] **实时反馈**：回答时实时分析和提示
- [ ] **技能图谱**：可视化展示能力画像
- [ ] **错题本**：记录答错的问题，支持复习
- [ ] **模拟练习**：针对薄弱环节的专项练习
- [ ] **岗位匹配**：基于能力画像推荐岗位
