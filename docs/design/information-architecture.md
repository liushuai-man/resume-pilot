# ResumePilot V2.0 信息架构与界面规范

## 1. 设计目标

ResumePilot 的一级导航围绕用户任务设计，不按照后端表、Agent 或技术模块拆分。用户应能回答四个问题：我有哪些简历、我要投什么岗位、我要开始什么训练、我在哪里看训练结果。

## 2. 一级信息架构

| 一级入口 | 主路由 | 职责 | 不应承载 |
| --- | --- | --- | --- |
| 我的简历 | `/resumes` | 创建、导入、编辑、预览、导出、优化历史和撤销 | 岗位分析历史、面试报告 |
| 目标岗位 | `/jobs` | JD、JobProfile、ATS 结构初检、内容质量和岗位匹配 | 简历优化恢复、面试过程 |
| 模拟面试 | `/interviews` | 直接进入面试准备/进行界面，选择通用岗位或已确认 JobProfile 与简历 | 宣传式中转页 |
| 面试记录 | `/interviews/history` | 面试列表、筛选和报告入口 | ATS 分析、简历优化历史 |

全局“历史记录”暂时取消。不同结果应回到其业务上下文：

- 简历优化与版本变化：`/resumes/:resumeId/optimizations`
- 岗位分析与 ATS/JD 匹配记录：`/jobs/:jobId/analyses`
- 面试训练结果：`/interviews/history` 与 `/interviews/results/:resultId`

当未来确实存在跨模块活动检索需求时，再增加“活动中心”，但它展示事件流，不冒充每个模块的专业历史页面。

## 3. 路由设计

```text
/resumes
/resumes/:resumeId/edit
/resumes/:resumeId/print
/resumes/:resumeId/optimizations          # 阶段 4

/jobs
/jobs/:jobId                         # 可由同页选中态承载
/jobs/:jobId/analyses                # 阶段 2 完成后

/interviews                          # 直接进入准备/面试界面
/interviews/history
/interviews/results/:resultId

/profile                             # 阶段 6
```

兼容期保留旧路由重定向：`/` → `/resumes`，`/resume/:id` → `/resumes/:id/edit`，`/resume/interview` → `/interviews`，`/history` → `/interviews/history`。

## 4. 页面状态模型

模拟面试不是“中心页 → 面试页”两级结构，而是一个路由内的状态机：

```text
准备态（选择岗位、简历、模式）
  → 生成题目
进行态（只问答，不即时评价）
  → 结束面试
报告生成态
  → /interviews/results/:resultId
```

目标岗位页面保持一个工作台，在同一岗位上下文内切换：

```text
JD 与 JobProfile
ATS 结构初检
内容质量
JD 岗位匹配
分析记录
```

其中 ATS 结构分、内容质量分、事实核验状态、JD 匹配分必须独立展示。

## 5. 统一界面规范

四个管理页面共享同一骨架：

- 页面最大宽度：`1280px`，目标岗位工作台可扩展到 `1440px`
- 页面边距：桌面 `24px`，移动端 `16px`
- 标题：`30px / 700`，说明文字 `14px`
- 主卡片：白色、`12px` 圆角、`1px` 灰色边框，不混用重阴影
- 主按钮：蓝色实底；次按钮：白底灰边；危险操作只在确认后使用红色
- 页面头部顺序固定：眉题、标题、说明、右侧主操作
- 列表页固定包含：页面头部、筛选工具栏、内容区、空状态
- 加载、空状态、错误状态使用同一组件语气和尺寸

任务页面（简历编辑、面试进行中）使用精简任务工具栏，不显示管理页面 Footer；品牌统一使用 `ResumePilot / RP`，不再出现 `AI 简历助手 / RA` 两套名称。

## 6. 阶段 2 完整评价链

### 6.1 ATS 结构初检

确定性规则评价机器可读性、字段完整性、日期结构和明显输入异常。它不评价事实真假，也不把文本长度当作内容优秀。

### 6.2 内容质量 Agent

对职业目标、专业技能、教育描述、工作经历和项目经历进行字段级语义评价：

- 是否为连贯自然语言
- 是否包含有效求职信息而非无意义填充
- 是否存在前后矛盾或重复
- 是否具备任务—行动—结果结构
- 是否使用空泛、自评式或无法验证的表达

每个结论必须返回 `section / item / field`、原文、理由、严重级别、置信度和评价器版本。低置信度只能标记“待确认”。

### 6.3 事实核验

院校、专业、公司等实体通过标准库或权威数据源核验，状态仅允许：`已核验`、`未找到`、`待确认`。`未找到`不等于虚假，不允许由大模型直接判定造假。

### 6.4 JD 岗位匹配

只使用已确认 JobProfile，分别评价能力覆盖、关键词证据、职责相关性和职级匹配。结论必须绑定简历证据与 JD 证据。

## 7. 迁移顺序

1. 建立统一 `PageShell / PageHeader / Toolbar / EmptyState`。
2. 修改导航名称与新路由，添加旧路由重定向。
3. `/interviews` 直接渲染面试状态机，删除中转页入口职责。
4. 将全局“历史记录”改为“面试记录”，移除未实现的 ATS/优化假标签。
5. 统一我的简历、目标岗位、面试记录的宽度、头部、按钮、卡片和状态样式。
6. 简历编辑器品牌统一为 ResumePilot，并保留任务工具栏。

## 8. 本地基础设施

本地前后端开发使用 `docker-compose.local.yml` 仅启动 PostgreSQL（含 pgvector）和 Redis，并将端口映射到宿主机。生产环境继续使用 `docker-compose.yml`，两者不能混用。

```powershell
# 密码应与 backend/.env 的 DATABASE_URL 保持一致，不提交到仓库
$env:LOCAL_POSTGRES_PASSWORD = '<local database password>'
docker compose -f docker-compose.local.yml up -d
cd backend
pnpm prisma migrate deploy
```
