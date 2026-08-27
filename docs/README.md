# ResumePilot 文档中心

本目录按文档职责组织。开发前先从本索引进入，不把历史归档或方案草稿当作当前事实来源。

## 权威范围

| 目录 | 职责 | 当前入口 |
| --- | --- | --- |
| `product/` | 产品定位、版本范围与验收基线 | [3.0 产品设计与范围基线](./product/v3-product-spec.md) · [V2.0 产品基线](./product/product-baseline.md) |
| `modules/` | 单个业务模块的行为、边界与实现方案 | [模块索引](./modules/README.md) |
| `architecture/` | 跨模块技术架构、Agent 和数据流 | [架构索引](./architecture/README.md) |
| `design/` | 信息架构、导航、页面和交互规范 | [信息架构](./design/information-architecture.md) · [游客体验与权限边界](./design/guest-experience.md) · [UI 设计系统（待审核）](./design/ui-design-system.md) |
| `roadmap/` | 阶段顺序、当前状态、实施记录和候选池 | [3.0 实施路线图](./roadmap/v3-roadmap.md) · [V2.0 路线图](./roadmap/v2-roadmap.md) |
| `evals/` | 固定样本、指标、校准和验收记录 | [评测索引](./evals/README.md) |
| `decisions/` | 已确认的重要产品或技术取舍（ADR） | [决策索引](./decisions/README.md) |
| `operations/` | 部署、CI/CD 和运行维护 | [运维索引](./operations/README.md) |
| `archive/` | 历史会话与失效文档，仅供追溯 | [归档索引](./archive/README.md) |

当前 3.0 集中发布门禁见 [3.0 验收清单](./testing/v3-acceptance-checklist.md)。3.0 尚未完成验收前，V2.0 文档仍是已实现行为的事实来源；3.0 文档描述目标状态和实施约束。

## 维护规则

- 产品文档回答“做什么、为什么、如何验收”，路线图只回答“何时做、当前做到哪里”。
- 一个业务模块只有一个主要事实来源；跨模块约束写入架构或 ADR，并由模块文档链接引用。
- 评分规则、Prompt、模型、JobProfile 和 Rubric 必须保留版本号。
- 历史方案与当前实现冲突时，以产品基线、ADR、模块文档和当前路线图为准。
- 不为单个按钮、接口或数据库表单独创建文档；按可独立理解和验收的业务能力拆分。
