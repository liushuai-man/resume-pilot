# Resume Pilot - 智能简历领航

基于 AI 的智能简历优化平台，帮助求职者快速创建、润色和优化专业简历。

## 功能特性

- **AI 润色** - 一键优化简历内容表达，提升专业度
- **AI 补全** - 智能补全工作经历、项目描述等内容
- **AI 对话** - 多轮对话式简历优化助手
- **AI 模拟面试** - 基于简历内容生成针对性面试题，评估回答并生成报告
- **在线编辑** - 基于 Tiptap 富文本编辑器，支持格式工具栏、拖拽排序、动态增删模块
- **实时预览** - 编辑区与预览区同步，等比缩放适配不同屏幕
- **PDF 导出** - 跨屏幕一致的简历 PDF 导出
- **简历模板** - 多套预设模板，支持缩略图预览
- **面试历史** - 查看过往面试报告与评分

## 技术栈

**前端**

| 技术                  | 用途         |
| --------------------- | ------------ |
| React 18 + TypeScript | UI 框架      |
| Vite                  | 构建工具     |
| Zustand               | 状态管理     |
| Tiptap                | 富文本编辑器 |
| Tailwind CSS          | 样式         |
| Mantine               | UI 组件库    |
| React Router          | 路由         |
| html2canvas + jsPDF   | PDF 导出     |

**后端**

| 技术                  | 用途              |
| --------------------- | ----------------- |
| Express + TypeScript  | Web 框架          |
| Prisma ORM            | 数据库 ORM        |
| PostgreSQL + pgvector | 数据库 + 向量检索 |
| LangChain + LangGraph | AI 工作流         |
| JWT                   | 身份认证          |

**AI 模型**

支持多模型切换（基于 OpenAI 兼容协议）：

- DeepSeek
- MIMO (小米)

## 项目结构

```
ResumePilot/
├── frontend/                # 前端
│   └── src/
│       ├── api/             # API 封装
│       ├── components/      # 组件
│       │   ├── editor/      # 编辑器组件
│       │   └── home/        # 首页组件
│       ├── hooks/           # 自定义 Hooks
│       ├── layouts/         # 布局组件
│       ├── pages/           # 页面
│       ├── store/           # Zustand 状态管理
│       ├── styles/          # 全局样式
│       ├── types/           # 类型定义
│       └── utils/           # 工具函数
├── backend/                 # 后端
│   └── src/
│       ├── ai/              # AI 模块
│       │   ├── agents/      # LangChain 智能体
│       │   ├── prompts/     # Prompt 模板
│       │   ├── providers/   # LLM Provider
│       │   └── types/       # AI 类型
│       ├── config/          # 配置
│       ├── controllers/     # 控制器
│       ├── middlewares/     # 中间件
│       ├── routes/          # 路由
│       ├── services/        # 业务服务
│       └── utils/           # 工具函数
├── docker/                  # Docker 配置
└── docker-compose.yml       # Docker Compose
```

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8
- PostgreSQL >= 14 (with pgvector)
- Redis (可选)

### 1. 克隆项目

```bash
git clone <repo-url>
cd ResumePilot
```

### 2. 启动数据库

```bash
docker-compose up -d
```

这会启动 PostgreSQL (pgvector) 和 Redis。

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接和 AI 模型 API Key。

### 4. 安装依赖

```bash
# 后端
cd backend
pnpm install

# 前端
cd ../frontend
pnpm install
```

### 5. 数据库迁移

```bash
cd backend
pnpm prisma migrate dev
```

### 6. 启动开发服务器

```bash
# 后端 (端口 3001)
cd backend
pnpm dev

# 前端 (端口 5173)
cd frontend
pnpm dev
```

访问 http://localhost:5173

## API 接口

| 方法   | 路径                     | 说明         |
| ------ | ------------------------ | ------------ |
| POST   | `/api/auth/register`     | 注册         |
| POST   | `/api/auth/login`        | 登录         |
| GET    | `/api/auth/me`           | 获取当前用户 |
| GET    | `/api/resumes`           | 获取简历列表 |
| POST   | `/api/resumes`           | 创建简历     |
| PUT    | `/api/resumes/:id`       | 更新简历     |
| DELETE | `/api/resumes/:id`       | 删除简历     |
| POST   | `/api/ai/polish`         | AI 润色      |
| POST   | `/api/ai/complete`       | AI 补全      |
| POST   | `/api/ai/chat`           | AI 对话      |
| POST   | `/api/interview/start`   | 开始面试     |
| POST   | `/api/interview/answer`  | 提交面试答案 |
| POST   | `/api/interview/finish`  | 完成面试     |
| GET    | `/api/interview/results` | 面试结果列表 |

## License

MIT
