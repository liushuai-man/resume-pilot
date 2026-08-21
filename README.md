# Resume Pilot v2.0

智能简历领航是一套面向求职者的 AI 简历优化平台，覆盖简历创建、结构化编辑、职位匹配、ATS 分析、AI 润色、版本追踪和模拟面试等核心流程。

在线地址：http://120.55.2.225/

## v2.0 亮点

- 简历从“编辑器”升级为“优化工作台”，支持内容质量、ATS、职位匹配和优化建议闭环。
- 新增简历版本与优化历史，便于回看、比较和追踪每次修改。
- 强化 AI 面试流程，支持基于简历与目标岗位的追问、评分和报告生成。
- 支持 OpenAI 兼容模型配置，聊天模型和向量模型可分开管理。
- 长期记忆基于 PostgreSQL + pgvector，Embedding 不可用时自动降级为关键词召回。

## 功能特性

- **简历编辑**：基于 Tiptap 的富文本编辑器，支持格式工具栏、模块增删、拖拽排序和实时预览。
- **模板管理**：内置多套简历模板，支持缩略图预览和模板初始化。
- **PDF 导出**：通过独立打印页导出简历，保证跨屏幕和跨浏览器的一致性。
- **AI 润色与补全**：针对工作经历、项目经历、技能描述生成更专业的表达。
- **内容质量分析**：检查表达清晰度、量化成果、行动动词、重复内容和可读性。
- **ATS 分析**：评估关键词覆盖、结构完整性、格式风险和招聘系统可读性。
- **职位匹配**：结合目标岗位分析匹配度，给出差距和优化优先级。
- **优化建议闭环**：生成可执行建议，支持跟踪处理状态与历史记录。
- **AI 对话记忆**：短期上下文 + pgvector 长期记忆，支持跨会话语义召回。
- **模拟面试**：基于简历和岗位生成问题、评估回答并沉淀面试报告。
- **账号与认证**：JWT 鉴权，支持用户级简历、模型配置和历史数据隔离。

## 技术栈

**前端**

| 技术 | 用途 |
| --- | --- |
| React 18 + TypeScript | UI 框架 |
| Vite | 构建工具 |
| Zustand | 状态管理 |
| React Router | 路由 |
| Tiptap | 富文本编辑器 |
| Mantine + Tailwind CSS | UI 组件与样式 |
| html2canvas + jsPDF | PDF 导出 |

**后端**

| 技术 | 用途 |
| --- | --- |
| Express + TypeScript | Web 服务 |
| Prisma ORM | 数据访问 |
| PostgreSQL + pgvector | 业务数据与向量检索 |
| Redis | 缓存与扩展能力 |
| LangChain + LangGraph | AI 工作流 |
| OpenAI Compatible API | 模型接入 |
| JWT | 身份认证 |

## 项目结构

```text
ResumePilot/
├── frontend/                  # 前端应用
│   └── src/
│       ├── api/               # API 封装
│       ├── components/        # 通用与业务组件
│       ├── hooks/             # 自定义 Hooks
│       ├── layouts/           # 页面布局
│       ├── pages/             # 页面入口
│       ├── router/            # 路由配置
│       ├── store/             # Zustand 状态管理
│       ├── styles/            # 全局样式
│       ├── types/             # 类型定义
│       └── utils/             # 工具函数
├── backend/                   # 后端服务
│   └── src/
│       ├── ai/                # AI Agent、Prompt、Provider 与类型
│       ├── config/            # 环境、认证、数据库、存储配置
│       ├── controllers/       # 控制器
│       ├── middlewares/       # 中间件
│       ├── routes/            # 路由
│       ├── services/          # 业务服务
│       └── utils/             # 工具函数
├── docker/                    # Docker 相关配置
├── docs/                      # 项目文档
├── uploads/                   # 本地上传目录
├── docker-compose.yml         # 默认 Compose 配置
├── docker-compose.local.yml   # 本地开发 Compose 配置
└── docker-compose.production.yml
```

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8
- Docker / Docker Compose
- PostgreSQL >= 14，并启用 pgvector
- Redis，可选但推荐

### 1. 安装依赖

```bash
cd backend
pnpm install

cd ../frontend
pnpm install
```

### 2. 启动基础服务

```bash
docker-compose up -d
```

默认会启动 PostgreSQL、pgvector 和 Redis。也可以按环境选择：

```bash
docker-compose -f docker-compose.local.yml up -d
docker-compose -f docker-compose.production.yml up -d
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

按需配置数据库连接、JWT 密钥、模型配置加密密钥、文件存储和跨域地址。AI 模型不需要写死在环境变量里，用户登录后可在模型管理中添加兼容 OpenAI 协议的聊天模型和向量模型。

### 4. 初始化数据库

```bash
cd backend
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm init:templates
```

如需重新生成模板缩略图：

```bash
pnpm generate:thumbnails
```

### 5. 启动开发服务

```bash
cd backend
pnpm dev
```

```bash
cd frontend
pnpm dev
```

默认端口：

- 后端：http://localhost:3001
- 前端：http://localhost:5173

## 常用命令

**后端**

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm test:content-quality
pnpm test:ats
pnpm test:job-match
pnpm test:resume-optimization
pnpm test:resume-version
```

**前端**

```bash
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm test:pagination
```

## AI 与记忆机制

用户可添加兼容 OpenAI 协议的模型，并分别配置：

- **聊天模型**：用于 AI 对话、补全、润色、分析和模拟面试。
- **向量模型**：用于生成 Embedding，并通过 pgvector 召回长期会话记忆。

分层记忆流程：

1. 当前简历以结构化数据直接注入 Prompt，不进行分块或向量检索。
2. 最近消息作为短期记忆按原始顺序传入模型，保证连续追问的上下文完整。
3. 已完成问答异步持久化，避免 Embedding 延迟阻塞主响应。
4. 当前问题生成查询向量后，通过 pgvector 召回相关长期记忆。
5. 系统自动排除短期窗口中的重复消息。
6. 未配置向量模型或 Embedding 服务不可用时，自动降级为关键词上下文检索。

## 生产部署

1. 准备 `.env.production` 或生产环境变量。
2. 构建前后端：

```bash
cd backend
pnpm build

cd ../frontend
pnpm build
```

3. 使用生产 Compose 启动：

```bash
docker-compose -f docker-compose.production.yml up -d --build
```

4. 检查服务状态、数据库迁移、上传目录权限和前端 API 地址。

## 版本

当前版本：**2.0.0**

## License

仅用于学习、研究与项目展示。正式商用前请补充许可证、隐私政策和模型服务合规说明。
