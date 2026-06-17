# AI 简历助手开发文档

**文档版本：**V1.0

**文档用途：**全栈开发、测试、验收标准依据

# 1. 产品概述

## 1.1 产品定位

ResumePilot 是一款基于 AI Agent 的智能简历平台。

用户可以：

- 创建简历
- 编辑简历
- 使用模板快速生成简历
- AI辅助补全简历内容
- AI优化简历表达
- AI分析岗位匹配度
- AI模拟面试

帮助求职者快速获得高质量简历并提升面试通过率。

## 1.2 目标用户

| 身份       | 特点                                                      | 需求                                                           |
| ---------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| 应届毕业生 | _ 无项目经验<br> <br>_ 不会写简历<br> <br>\* 缺乏面试经验 | _ AI帮助生成简历<br> <br>_ AI模拟面试                          |
| 社招求职者 | _ 有工作经验<br> <br>_ 简历内容繁杂                       | _ 优化表达<br> <br>_ 提升ATS通过率<br> <br>\* 针对岗位定制简历 |
| 转行用户   | \* 缺少目标岗位经验                                       | _ AI帮助重构经历<br> <br>_ 分析技能差距                        |

# 2. 需求分析

## 2.1 用户需求分析

结合用户画像，从核心需求、次要需求、潜在需求三个维度，明确用户对产品的核心诉求，确保需求与产品功能精准匹配，具体如下：

### 2.1.1 核心需求（P0）

| 核心需求类型 | 核心诉求 & 落地价值                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------- |
| 简历快速制作 | 零门槛依托模板、AI补全能力快速生成合规简历，解决用户不会写、撰写效率低的核心问题                   |
| 简历提质优化 | 通过AI会话给出建议，对简历进行润色、内容纠错、成果量化，标准化职场简历表达，突出个人核心竞争优势。 |
| 简历留存导出 | 支持保存、数据留存、标准化PDF导出，满足求职投递、简历存档复用需求                                  |
| AI面试赋能   | 模拟岗位真实面试场景，辅助用户打磨答题思路，提升面试应答能力与通过率                               |

### 2.1.2 潜在需求（P2）

| 潜在需求类型 | 核心诉求 & 落地价值                                            |
| ------------ | -------------------------------------------------------------- |
| 技能提升指导 | 基于岗位匹配结果，精准定位技能短板，输出针对性学习提升建议     |
| 求职数据复盘 | 整合简历优化、岗位匹配、模拟面试数据，生成个人求职能力复盘报告 |

## 2.2 需求列表

需求列表按“功能需求+非功能需求”划分，明确需求优先级（P0核心必做、P1重要优化、P2可选迭代），对应后续功能模块设计，确保需求可落地、可追溯：

### 2.2.1 功能需求

| 编号 | 功能       | 功能描述                                                                                                                                     | 优先级 |
| ---- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1    | 用户登录   | githu登录                                                                                                                                    | P0     |
| 2    | 创建简历   | 支持两种创建方式：空白简历新建、模板一键创建，创建后自动生成标准化简历基础框架，包含个人信息、教育经历、工作经历等通用模块                   | P0     |
| 3    | 编辑简历   | 支持简历全模块可视化编辑，可新增、删除、修改内容，调整文本格式、段落布局，自定义模块顺序，操作实时生效                                       | P0     |
| 4    | 保存简历   | 支持手动保存、自动保存双重机制，实时同步简历内容至云端，防止内容丢失，关联用户账号实现多端数据同步                                           | P0     |
| 5    | PDF导出    | 支持一键导出高清PDF简历，保留原排版格式，无水印、无格式错乱，适配各大招聘平台投递要求                                                        | P0     |
| 6    | AI内容补全 | 针对简历空白模块、内容匮乏段落，结合用户岗位方向，智能生成合规、专业的履历内容，支持自定义生成字数、风格                                     | P1     |
| 7    | AI简历优化 | 对现有简历内容进行润色、纠错、话术优化，量化工作成果，剔除冗余内容，优化逻辑结构，提升简历专业度和可读性；或者生成修改建议，用户自行判断修改 | P1     |
| 8    | AI模拟面试 | 用户输入目标岗位后，系统自动生成岗位专属面试题库，支持实时对话模拟面试，面试结束后输出答题点评、优化建议、得分报告                           | P1     |
| 9    | 简历模板   | 分类展示多行业、多场景简历模板，支持模板预览、一键套用，模板持续迭代更新，适配校招、社招、转行等不同场景                                     | P1     |
| 10   | JD匹配分析 | 支持粘贴岗位JD，系统智能拆解岗位核心要求，与简历内容比对，生成匹配得分、优势项、短板项，输出针对性简历修改方案                               | P2     |
| 11   | 多语言简历 | 支持中文简历一键生成英文简历，精准翻译职场专业术语，适配海外求职、外企面试场景，保障语句地道、专业合规                                       | P2     |

### 2.2.2 非功能需求

| 类型         | 具体要求                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------- |
| 页面响应时间 | 所有前端页面加载、跳转响应时间≤2秒，无明显卡顿、白屏                                      |
| AI响应时间   | AI补全、优化、匹配分析、面试问答响应时间≤10秒，复杂场景最长不超过15秒                     |
| 可用性       | 系统全年可用性≥99%，排除计划性维护、不可抗力因素，保障用户随时使用                        |
| 安全性       | 采用JWT身份认证机制，用户账号、简历数据加密存储，禁止数据泄露、非法篡改，保障用户隐私安全 |
| 并发能力     | 支持同时100+用户在线操作，高峰期无接口超时、数据错乱、功能异常                            |
| 数据备份     | 系统每日自动全量数据备份，保留近30天备份记录，支持故障数据恢复                            |

# 3. 功能模块

明确各模块功能、关联关系，确保功能覆盖需求，模块划分清晰，便于全栈开发与测试。

## 3.1 首页页面

用户进入首页页面

| **子模块**                       | **功能**                                                                                                                                                                                                                 | **位置** |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 简历数据模块                     | 提供「新建空白简历」快捷入口，一键跳转编辑页面；2. 展示用户所有已保存的历史简历数据，包含简历名称、更新时间、预览、编辑、删除、导出操作；3. 支持简历搜索、时间排序，方便用户快速查找目标简历，后面则是用户保存的历史数据 | 上方     |
| 模板子模块                       | 1.展示精品简历模板；2. 支持模板悬浮预览，查看完整排版样式；3. 点击对应模板可一键基于模板新建简历，自动初始化模板内容与格式                                                                                               | 下方     |
| 底部信息模块                     | 简单展示开发者信息和联系方式，只在首页出现                                                                                                                                                                               | 底部     |
| 顶部导航栏模块                   | 显示项目logo。登录信息，点击github头像是的时候，会弹出弹窗，展示头像，用户名。退出登录                                                                                                                                   | 顶部     |
| **功能：**展示数据，提供快速入口 |                                                                                                                                                                                                                          |          |

## 3.2 核心业务页面

左边是编辑区域，中间是简历预览区域，右边是ai会话，

### 3.2.1 编辑简历

进入简历编辑界面，简历的模块固定，其中部分可以让ai辅助完成，关于内容的布局调整需要灵活一点

| 子模块         | 核心功能                                                                                                                       | 页面位置                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| 基础信息模块   | 支持编辑姓名、电话、邮箱、住址、求职意向等个人基础信息，支持信息删除、修改、实时预览                                           | 编辑区域顶部               |
| 简历内容模块   | 包含教育经历、工作经历、项目经历、技能证书、自我评价等固定板块；支持新增、删除、排序模块，自定义内容；支持AI一键补全单模块内容 | 编辑区域主体区域           |
| 简历渲染模块   | 将简历进行实时渲染展示                                                                                                         | 简历预览区域               |
| 排版布局模块   | 支持调整字体、字号、行间距、边距、配色方案；支持模块拖拽排序、版式切换，灵活调整简历整体布局                                   | 页面顶部工具栏，中间       |
| AI辅助编辑模块 | 特定简历内容，可触发AI优化、AI润色、成果量化功能；空白区域可一键AI生成对应内容                                                 | 对应内容块旁边             |
| 保存导出模块   | 支持手动保存、自动保存，一键导出PDF文件，实时查看保存状态                                                                      | 页面顶部导航栏操作栏，右边 |

### 3.2.2 AI会话

点击编辑页右上角的按钮，ai会话页面会从右侧展开，默认为ai会话模式

| 子模块     | 核心功能                                                   | 页面位置     |
| ---------- | ---------------------------------------------------------- | ------------ |
| AI聊天窗口 | 与AI进行自然语言对话，支持提问、追问、多轮交互             | 右侧会话区域 |
| 上下文感知 | 自动读取当前简历内容作为上下文，结合简历数据生成更精准回答 | 后台自动完成 |
| 快捷指令区 | 提供常用快捷操作入口（优化建议、翻译等）                   | 会话顶部     |
| AI建议卡片 | AI生成优化建议，支持一键应用到简历                         | 会话消息区域 |
| 历史会话   | 保存当前简历相关会话记录                                   | 会话底部     |
| Token状态  | 展示当前AI生成状态、消耗情况                               | 会话顶部     |

支持指令示例

| 类型     | 示例                   |
| -------- | ---------------------- |
| 内容优化 | 优化我的项目经历       |
| 内容补全 | 帮我补充工作经历       |
| 成果量化 | 将这段经历量化         |
| ATS优化  | 提高ATS通过率          |
| 翻译     | 翻译成英文             |
| 岗位定制 | 针对前端工程师岗位优化 |

### 3.2.3 在线面试

点击在线面试，可以从ai会话模式切换为在线面试模式

| 阶段       | 描述                     |
| ---------- | ------------------------ |
| 选择岗位   | 输入目标岗位JD或岗位名称 |
| AI生成题库 | 自动生成岗位相关问题     |
| 模拟问答   | AI作为面试官发问         |
| 实时评分   | 根据回答实时评分         |
| 面试总结   | 输出整体评价             |
| 学习建议   | 输出后续提升方案         |

在面试结束后ai会根据面试生成面试报告

| 项目         | 内容         |
| ------------ | ------------ |
| 综合评分     | 0~100分      |
| 专业能力     | 技术能力评价 |
| 表达能力     | 沟通逻辑评价 |
| 项目深度     | 项目理解程度 |
| 优势总结     | AI分析亮点   |
| 待改进项     | AI分析不足   |
| 推荐学习方向 | 后续学习建议 |

## 3.5 登录页面

采用github登录

| 模块           | 功能               |
| -------------- | ------------------ |
| Logo展示       | 项目标识           |
| 项目介绍       | 产品价值说明       |
| Github登录按钮 | OAuth授权登录      |
| 登录状态检测   | 已登录自动跳转首页 |
| 用户协议入口   | 查看协议与隐私政策 |

# 4. UI设计

## 4.1 风格设计

1.  设计风格：极简、商务、轻量化，适配求职类产品专业属性，界面干净整洁，重点功能突出，降低用户操作成本。
2.  主色调：以黑、灰、白为主色调（专业、沉稳），搭配浅灰辅助色、深色文字，适配职场求职场景，视觉舒适不刺眼。
3.  布局规范：采用顶部导航+工具栏+主体内容经典布局，页面层级清晰，功能分区明确，适配PC端操作习惯。
4.  交互规范：所有操作有状态反馈（保存成功、AI生成中、导出完成等），关键操作增加二次确认，避免误操作。

## 4.2 UI图

![ChatGPT Image 2026年6月10日 18_13_19.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4j6OJ5jaDo51bq3p/img/de738bc2-393c-4f27-90da-40e9c06e9adc.png)

![ChatGPT Image 2026年6月10日 18_16_55.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4j6OJ5jaDo51bq3p/img/ddb2fab5-4d66-4e6c-b779-4d77ad52d8bf.png)

# 5. 系统架构设计

## 5.1 前端技术栈

| 维度     | 技术            | 说明                                                                                                  |
| -------- | --------------- | ----------------------------------------------------------------------------------------------------- |
| 框架     | React + Vite    | Vite实现极速启动、热更新，React构建组件化前端页面，提升开发与迭代效率                                 |
| UI组件库 | Mantine         | 提供高质量、适配性强的通用组件，支撑页面快速搭建，保障UI统一性                                        |
| 样式     | TailwindCSS     | 原子化样式开发，灵活自定义页面样式，减少冗余代码，提升样式开发效率                                    |
| 状态管理 | Zustand         | 轻量高效的状态管理方案，管理用户登录状态、简历全局数据、页面状态                                      |
| 路由     | React Router    | 实现页面路由跳转、路由权限控制、页面嵌套路由管理                                                      |
| 编辑器   | TipTap          | 基于 ProseMirror 的可扩展富文本编辑器，支持简历内容编辑、模块化内容管理、自定义节点扩展及实时预览能力 |
| 请求     | Axios           | 统一封装前后端接口请求，处理请求拦截、响应拦截、异常报错                                              |
| 表单     | React Hook Form | 高效处理登录、信息编辑等表单逻辑，简化表单开发                                                        |
| 校验     | Zod             | 统一前后端数据格式校验，规避非法数据录入，保障数据规范性                                              |
| 图标库   | lucide-react    | 提供高质量的开源图标组件，支持自定义颜色和大小，用于页面图标展示                                      |
| 图标库   | react-icons     | 提供丰富的第三方图标集合，包含多种风格图标，作为 lucide-react 的补充                                  |
| 导出PDF  | Puppeteer       | 基于无头浏览器实现服务端 PDF 生成，将简历 HTML 页面精准渲染为 PDF，保证导出效果与页面预览一致         |

## 5.2 后端技术栈

| 维度      | 技术       |                                                                            |
| --------- | ---------- | -------------------------------------------------------------------------- |
| Runtime   | Node.js    | 后端运行环境，轻量高效，适配接口开发、AI服务调度场景                       |
| Framework | Express    | 快速搭建后端服务接口，轻量灵活，适配本项目业务场景                         |
| ORM       | Prisma     | 数据库对象映射框架，简化数据库操作，规范数据模型，提升开发效率             |
| DB        | PostgreSQL | 核心业务数据库，存储用户信息、简历数据、模板数据、面试记录等核心数据       |
| Vector DB | pgvector   | 基于PostgreSQL实现向量存储，支撑JD匹配、简历相似度分析、AI语义检索         |
| Cache     | Redis      | 缓存热点数据、用户登录态、临时AI请求数据，提升接口响应速度，降低数据库压力 |
| Auth      | JWT        | 实现用户身份认证、权限校验，无状态登录验证，保障接口访问安全               |
| Log       | Winston    | 统一日志收集、分级存储，记录接口请求、AI调用、异常报错，便于问题排查       |

## 5.3 AI技术栈

| 模块         | 技术                     | 说明                                                                     |
| ------------ | ------------------------ | ------------------------------------------------------------------------ |
| 大模型       | OpenAI GPT / DeepSeek    | 提供核心AI能力，支撑简历补全、优化、JD匹配、面试问答等智能场景           |
| Agent框架    | LangGraph                | 构建AI智能代理工作流，实现多步骤、复杂求职场景的智能决策与执行           |
| LLM编排      | LangChain                | 统一编排大模型调用流程，整合各类AI工具，标准化AI请求链路                 |
| Prompt管理   | LangChain PromptTemplate | 标准化管理各类场景Prompt，支持模板复用、动态参数替换，保证AI输出质量统一 |
| Memory       | LangChain Memory         | 存储对话上下文、简历编辑历史、面试对话记录，实现AI连续交互               |
| Tool Calling | LangChain Tools          | 调度向量检索、数据查询、内容生成等工具，完成复杂AI任务闭环               |
| 向量存储     | pgvector                 | 存储简历、JD向量数据，实现高效语义匹配、相似度计算                       |
| Embedding    | OpenAI Embedding         | 将简历、JD文本转化为向量数据，支撑语义分析与匹配功能                     |
| 工作流       | LangGraph StateGraph     | 搭建状态化AI工作流，实现简历分析-优化-点评-复盘全流程自动化              |

## 5.3 系统架构图

| 层级       | 模块                                              | 描述                                                                                                                                 |
| ---------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 前端层     | Web App                                           | 用户交互入口，包含首页、简历管理、简历编辑器、AI优化、岗位匹配、模拟面试、个人中心等页面，负责页面渲染、状态管理、用户交互与结果展示 |
| 网关层     | API Gateway                                       | 系统统一入口，负责请求路由、JWT鉴权、权限控制、接口限流、参数校验、日志记录、统一异常处理                                            |
| 业务层     | User Service / Resume Service / Interview Service | 负责用户管理、简历管理、模板管理、版本管理、岗位匹配、模拟面试、PDF导出等核心业务逻辑处理                                            |
| Agent层    | LangGraph Orchestrator                            | AI工作流调度中心，根据用户请求选择对应Agent执行任务，管理Agent状态流转、任务编排、上下文传递与结果聚合                               |
| AI能力层   | Resume Agent / Match Agent / Interview Agent      | Resume Agent负责简历优化与补全；Match Agent负责JD匹配分析；Interview Agent负责模拟面试与评分反馈                                     |
| Prompt层   | Prompt Template Center                            | 管理所有场景Prompt模板，包括简历优化、经历润色、ATS检测、岗位匹配、面试提问等Prompt配置                                              |
| 模型层     | OpenAI / DeepSeek / Claude                        | 统一封装大模型调用接口，实现模型切换、重试机制、Token统计、调用监控                                                                  |
| 数据层     | PostgreSQL + Redis + pgvector                     | PostgreSQL存储业务数据；Redis缓存登录态、热点数据、AI上下文；pgvector存储向量数据，实现长期记忆与语义检索                            |
| 基础设施层 | BullMQ + Storage                                  | BullMQ处理异步任务（PDF导出、AI长任务）；对象存储负责模板预览图、导出文件等资源管理                                                  |

```yaml
┌─────────────────────────────┐
│          Web App            │
│ React + Vite + Mantine      │
└──────────────┬──────────────┘
│
▼
┌─────────────────────────────┐
│         API Gateway         │
│ JWT / RBAC / Rate Limit     │
└──────────────┬──────────────┘
│
▼
┌─────────────────────────────┐
│        Business Layer       │
│ User / Resume / Interview   │
└──────────────┬──────────────┘
│
▼
┌─────────────────────────────┐
│    LangGraph Orchestrator   │
│      Agent Workflow         │
└───────┬─────────┬───────────┘
│         │
▼         ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Resume   │ │ Match    │ │Interview │
│ Agent    │ │ Agent    │ │ Agent    │
└────┬─────┘ └────┬─────┘ └────┬─────┘
│            │            │
▼            ▼            ▼
┌─────────────────────────────┐
│      Prompt Center          │
│ Resume / ATS / Interview    │
└──────────────┬──────────────┘
│
▼
┌─────────────────────────────┐
│      Model Provider         │
│ OpenAI / DeepSeek / Claude  │
└──────────────┬──────────────┘
│
▼
┌─────────────────────────────┐
│ PostgreSQL + Redis          │
│ pgvector + BullMQ           │
└─────────────────────────────┘
```

## 5.4 项目目录结构

```yaml
resume-pilot
│
├── frontend
│
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── .env
│
│   └── src
│
│       ├── pages
│       │
│       │   ├── LoginPage.tsx
│       │   ├── HomePage.tsx
│       │   ├── ResumeEditorPage.tsx
│       │   ├── InterviewPage.tsx
│       │   └── NotFoundPage.tsx
│       │
│
│       ├── components
│       │
│       │   ├── common
│       │   │
│       │   ├── Button.tsx
│       │   ├── Modal.tsx
│       │   ├── Loading.tsx
│       │   ├── Empty.tsx
│       │   └── ConfirmDialog.tsx
│       │
│       │
│       │   ├── resume
│       │   │
│       │   ├── ResumeEditor.tsx
│       │   ├── ResumePreview.tsx
│       │   ├── ResumeToolbar.tsx
│       │   ├── ResumeBlock.tsx
│       │   └── TemplateSelector.tsx
│       │
│       │
│       │   ├── chat
│       │   │
│       │   ├── ChatWindow.tsx
│       │   ├── ChatInput.tsx
│       │   ├── MessageItem.tsx
│       │   └── SuggestionCard.tsx
│       │
│       │
│       │   └── interview
│       │
│       │       ├── InterviewPanel.tsx
│       │       ├── QuestionCard.tsx
│       │       ├── ScoreCard.tsx
│       │       └── ReportPanel.tsx
│       │
│
│       ├── layouts
│       │
│       │   ├── MainLayout.tsx
│       │   └── AuthLayout.tsx
│       │
│
│       ├── routes
│       │
│       │   ├── index.tsx
│       │   └── ProtectedRoute.tsx
│       │
│
│       ├── api
│       │   ├── auth.ts
│       │   ├── resume.ts
│       │   ├── chat.ts
│       │   └── interview.ts
│       │
│
│       ├── store
│       │
│       │   ├── auth.store.ts
│       │   ├── resume.store.ts
│       │   ├── chat.store.ts
│       │   └── interview.store.ts
│       │
│
│       ├── hooks
│       │
│       │   ├── useAuth.ts
│       │   ├── useResume.ts
│       │   ├── useChat.ts
│       │   └── useInterview.ts
│       │
│
│       ├── types
│       │
│       │   ├── auth.ts
│       │   ├── resume.ts
│       │   ├── chat.ts
│       │   ├── interview.ts
│       │   └── common.ts
│       │
│
│       ├── constants
│       │
│       │   ├── routes.ts
│       │   ├── resume.ts
│       │   └── prompt.ts
│       │
│
│       ├── utils
│       │
│       │   ├── format.ts
│       │   ├── storage.ts
│       │   ├── download.ts
│       │   └── validator.ts
│       │
│
│       ├── assets
│       │
│       │   ├── images
│       │   ├── icons
│       │   └── logo.svg
│       │
│
│       ├── styles
│       │
│       │   ├── global.css
│       │   └── editor.css
│       │
│
│       ├── App.tsx
│       └── main.tsx
│
│
├── backend
│
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── .env
│
│
│   ├── prisma
│   │
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations
│
│
│   └── src
│
│       ├── controllers
│       │
│       │   ├── auth.controller.ts
│       │   ├── resume.controller.ts
│       │   ├── chat.controller.ts
│       │   ├── interview.controller.ts
│       │   └── template.controller.ts
│       │
│
│       ├── services
│       │
│       │   ├── auth.service.ts
│       │   ├── resume.service.ts
│       │   ├── chat.service.ts
│       │   ├── interview.service.ts
│       │   ├── template.service.ts
│       │   └── pdf.service.ts
│       │
│
│       ├── repositories
│       │
│       │   ├── user.repository.ts
│       │   ├── resume.repository.ts
│       │   ├── session.repository.ts
│       │   ├── message.repository.ts
│       │   ├── interview.repository.ts
│       │   └── template.repository.ts
│       │
│
│       ├── routes
│       │
│       │   ├── auth.routes.ts
│       │   ├── resume.routes.ts
│       │   ├── chat.routes.ts
│       │   ├── interview.routes.ts
│       │   ├── template.routes.ts
│       │   └── index.ts
│       │
│
│       ├── ai
│       │
│       │   ├── agents
│       │   │
│       │   ├── resume.agent.ts
│       │   └── interview.agent.ts
│       │
│       │
│       │   ├── prompts
│       │   │
│       │   ├── resume
│       │   │   ├── optimize.prompt.ts
│       │   │   ├── complete.prompt.ts
│       │   │   └── rewrite.prompt.ts
│       │   │
│       │   ├── interview
│       │   │   ├── generate.prompt.ts
│       │   │   ├── evaluate.prompt.ts
│       │   │   └── report.prompt.ts
│       │   │
│       │   └── common
│       │
│       │
│       │   ├── providers
│       │   │
│       │   ├── openai.provider.ts
│       │   ├── deepseek.provider.ts
│       │   └── provider.factory.ts
│       │
│       │
│       │   └── tools
│       │
│       │       ├── resume.tool.ts
│       │       ├── interview.tool.ts
│       │       └── user.tool.ts
│       │
│
│       ├── middleware
│       │
│       │   ├── auth.middleware.ts
│       │   ├── error.middleware.ts
│       │   ├── logger.middleware.ts
│       │   └── rate-limit.middleware.ts
│       │
│
│       ├── config
│       │
│       │   ├── env.ts
│       │   ├── auth.ts
│       │   ├── ai.ts
│       │   ├── database.ts
│       │   └── storage.ts
│       │
│
│       ├── database
│       │
│       │   └── prisma.ts
│       │
│
│       ├── dto
│       │
│       │   ├── auth
│       │   ├── resume
│       │   ├── chat
│       │   └── interview
│       │
│
│       ├── types
│       │
│       │   ├── auth.ts
│       │   ├── resume.ts
│       │   ├── chat.ts
│       │   └── interview.ts
│       │
│
│       ├── constants
│       │
│       │   ├── prompt.ts
│       │   ├── auth.ts
│       │   └── common.ts
│       │
│
│       ├── utils
│       │
│       │   ├── jwt.ts
│       │   ├── response.ts
│       │   ├── logger.ts
│       │   └── pdf.ts
│       │
│
│       ├── app.ts
│       └── server.ts
│
│
├── docker
│
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── nginx.conf
│
│
├── docker-compose.yml
│
├── .gitignore
├── .env.example
└── README.md
```

## 5.5 Ai Agent架构设计

### 5.5.1 Resume Agent

职责：

- 简历分析
- 内容优化
- 成果量化
- ATS优化

工作流：

```plaintext
用户请求
    ↓
Resume Parser
    ↓
Resume Analyzer
    ↓
Content Optimizer
    ↓
ATS Checker
    ↓
返回优化建议
```

```yaml
获取当前简历
↓
发送给AI
↓
返回优化结果
↓
用户确认
↓
覆盖保存到resumes.content
```

#### State

```plaintext
{
 resumeContent,
 targetPosition,
 optimizeType,
 result
}
```

---

### 5.5.2 Interview Agent

职责：

- 生成面试题
- 追问
- 评分
- 生成报告

工作流：

```plaintext
岗位输入
    ↓
Question Generator
    ↓
Interview Loop
    ↓
Answer Evaluator
    ↓
Score Generator
    ↓
Report Generator
```

---

### 5.5.3 Tool Calling

Agent可调用：

| Tool         | 功能         |
| ------------ | ------------ |
| ResumeTool   | 获取简历内容 |
| JDTool       | 获取JD信息   |
| SearchTool   | 查询岗位技能 |
| VectorTool   | 向量检索     |
| TemplateTool | 获取模板     |
| UserTool     | 获取用户信息 |

---

## 5.6 后期方向

### 5.6.1 Memory设计(2.0)

短期记忆

```plaintext
Redis
```

保存：

- 当前会话上下文

- 当前简历

---

长期记忆

```plaintext
PostgreSQL
```

- 聊天记录
- 面试记录

语义记忆

```yaml
pgvector
```

保存：

- JD Embedding

- Resume Embedding

### 5.6.2 JD Match Agent （2.0）

职责：

- JD解析
- 技能提取
- 简历匹配

工作流：

```plaintext
JD输入
   ↓
JD Parser
   ↓
Skill Extractor
   ↓
Resume Retriever
   ↓
Match Evaluator
   ↓
生成匹配报告
```

输出：

```plaintext
{
  score:85,
  strengths:[],
  weaknesses:[],
  suggestions:[]
}
```

---

# 6. 数据库设计

## 6.1 核心数据模型

### User（用户表）

存储 Github 登录用户信息。

| 字段          | 类型         | 说明           |
| ------------- | ------------ | -------------- |
| id            | UUID         | 用户ID         |
| github_id     | varchar(100) | Github用户ID   |
| github_login  | varchar(100) | Github用户名   |
| github_avatar | text         | Github头像地址 |
| created_at    | timestamp    | 创建时间       |
| updated_at    | timestamp    | 更新时间       |
| is_deleted    | boolean      | 是否删除       |

约束：

```plaintext
github_id UNIQUE
```

---

### Resume（简历表）

存储当前最新版本简历。

| 字段        | 类型         | 说明     |
| ----------- | ------------ | -------- |
| id          | UUID         | 简历ID   |
| user_id     | UUID         | 用户ID   |
| template_id | UUID         | 模板ID   |
| title       | varchar(255) | 简历名称 |
| content     | jsonb        | 简历内容 |
| created_at  | timestamp    | 创建时间 |
| updated_at  | timestamp    | 更新时间 |
| is_deleted  | boolean      | 是否删除 |

---

#### content结构

```plaintext
{
  "blocks":[
    {
      "id":"xxx",
      "type":"education",
      "data":{}
    }
  ]
}
```

---

### Templates（模板表）

简历模板库。

| 字段          | 类型         | 说明     |
| ------------- | ------------ | -------- |
| id            | UUID         | 模板ID   |
| name          | varchar(100) | 模板名称 |
| category      | varchar(50)  | 模板分类 |
| thumbnail     | text         | 缩略图   |
| preview_image | text         | 预览图   |
| schema        | jsonb        | 模板结构 |
| style_config  | jsonb        | 模板样式 |
| created_at    | timestamp    | 创建时间 |
| updated_at    | timestamp    | 更新时间 |
| is_deleted    | boolean      | 是否删除 |

---

### Chat_sessions（AI会话表）

一个简历对应多个会话，简历优化/面试。

| 字段         | 类型         | 说明     |
| ------------ | ------------ | -------- |
| id           | UUID         | 会话ID   |
| user_id      | UUID         | 用户ID   |
| resume_id    | UUID         | 简历ID   |
| title        | varchar(255) | 会话标题 |
| session_type | varchar(20)  | 会话类型 |
| summary      | text         | 会话摘要 |
| created_at   | timestamp    | 创建时间 |
| updated_at   | timestamp    | 更新时间 |
| is_deleted   | boolean      | 是否删除 |

---

### Chat_messages（聊天消息表）

记录 AI 和用户的聊天消息，一个会话对应多个消息

| 字段       | 类型        | 说明           |
| ---------- | ----------- | -------------- |
| id         | UUID        | 消息ID         |
| session_id | UUID        | 会话ID         |
| role       | varchar(20) | user/assistant |
| content    | jsonb       | 消息内容       |
| token      | int         | Token消耗      |
| created_at | timestamp   | 创建时间       |
| updated_at | timestamp   | 更新时间       |
| is_deleted | boolean     | 是否删除       |

```json
{
  "type": "text",
  "content": "优化后的内容"
}
```

---

### Interview_results（面试结果表）

模拟面试的结果记录。

| 字段       | 类型         | 说明     |
| ---------- | ------------ | -------- |
| id         | UUID         | 面试ID   |
| user_id    | UUID         | 用户ID   |
| session_id | UUID         | 会话ID   |
| resume_id  | uuid         | 简历ID   |
| position   | varchar(255) | 面试岗位 |
| score      | int          | 综合评分 |
| report     | jsonb        | 面试报告 |
| created_at | timestamp    | 创建时间 |
| updated_at | timestamp    | 更新时间 |
| is_deleted | boolean      | 是否删除 |

---

#### report结构

```plaintext
{
  "overall_score": 85,
  "technical_score": 90,
  "communication_score": 80,
  "project_score": 88,
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}
```

---

## 6.2 ER图

![ChatGPT Image 2026年6月11日 15_28_16.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4j6OJ5jaDo51bq3p/img/ef04467e-061a-423c-af88-a4cc49bc654b.png)

## 6.3 后续优化

### Ai_usage_logs（AI调用记录表）

统计 Token 消耗。

| 字段              | 类型          | 说明                    |
| ----------------- | ------------- | ----------------------- |
| id                | UUID          | 记录ID                  |
| user_id           | UUID          | 用户ID                  |
| model_name        | varchar(100)  | GPT-4o、DeepSeek等      |
| feature_type      | varchar(50)   | optimize/chat/interview |
| prompt_tokens     | int           | 输入Token               |
| completion_tokens | int           | 输出Token               |
| total_tokens      | int           | 总Token                 |
| cost              | decimal(10,4) | 调用成本                |
| created_at        | timestamp     | 创建时间                |
| updated_at        | timestamp     | 更新时间                |
| is_deleted        | boolean       | 是否删除                |

### ai_quotas（AI配额表）

表说明：管理用户AI调用额度与限流策略。

| 字段名                | 类型         | 说明             |
| --------------------- | ------------ | ---------------- |
| id                    | uuid         | 主键             |
| user_id               | uuid         | 用户ID           |
| daily_request_limit   | int          | 每日最大请求次数 |
| daily_request_used    | int          | 今日已使用次数   |
| monthly_request_limit | int          | 每月最大请求次数 |
| monthly_request_used  | int          | 本月已使用次数   |
| daily_token_limit     | int          | 每日Token额度    |
| daily_token_used      | int          | 今日已消耗Token  |
| monthly_token_limit   | int          | 每月Token额度    |
| monthly_token_used    | int          | 本月已消耗Token  |
| is_blocked            | boolean      | 是否禁止调用AI   |
| blocked_reason        | varchar(255) | 封禁原因         |
| last_reset_daily_at   | timestamp    | 上次每日重置时间 |
| last_reset_monthly_at | timestamp    | 上次月度重置时间 |
| created_at            | timestamp    | 创建时间         |
| updated_at            | timestamp    | 更新时间         |
| is_deleted            | boolean      | 软删除           |

### Resume_match_records（JD匹配记录表）

| 字段        | 类型      | 说明     |
| ----------- | --------- | -------- |
| id          | UUID      | 记录ID   |
| user_id     | UUID      | 用户ID   |
| resume_id   | UUID      | 简历ID   |
| jd_content  | text      | JD内容   |
| match_score | int       | 匹配度   |
| result      | jsonb     | 分析结果 |
| created_at  | timestamp | 创建时间 |
| updated_at  | timestamp | 更新时间 |
| is_deleted  | boolean   | 是否删除 |

# 7.接口设计

## API返回结构

```json
{
  code: 0,
  message: "success",
  data?: {}
}
```

## Auth

| Method | Path                  | 描述       |
| ------ | --------------------- | ---------- |
| GET    | /auth/github          | Github登录 |
| GET    | /auth/github/callback | Github回调 |
| GET    | /auth/me              | 当前用户   |
| POST   | /auth/logout          | 退出登录   |

github登录流程流程补充

```yaml
Github OAuth
↓
callback
↓
查询用户
↓
不存在则创建
↓
JWT签发
↓
返回前端
```

---

## Resume

| Method | Path                   |
| ------ | ---------------------- |
| GET    | /resume                |
| GET    | /resume/:id            |
| POST   | /resume                |
| PUT    | /resume/:id            |
| DELETE | /resume/:id            |
| POST   | /resume/:id/duplicate  |
| POST   | /resume/:id/export-pdf |

---

## Template

| Method | Path              |
| ------ | ----------------- |
| GET    | /template         |
| GET    | /template/:id     |
| POST   | /template/:id/use |

---

## AI Resume

| Method | Path                 |
| ------ | -------------------- |
| POST   | /ai/resume/complete  |
| POST   | /ai/resume/optimize  |
| POST   | /ai/resume/translate |

---

## AI Chat

| Method | Path                          |
| ------ | ----------------------------- |
| POST   | /ai/chat                      |
| GET    | /ai/chat/session/:id          |
| GET    | /ai/chat/session/:id/messages |

---

## Interview

| Method | Path               |
| ------ | ------------------ |
| POST   | /interview/start   |
| POST   | /interview/message |
| POST   | /interview/end     |
| GET    | /interview/history |
| GET    | /interview/:id     |

---

## Analytics

| Method | Path                 |
| ------ | -------------------- |
| GET    | /analytics/token     |
| GET    | /analytics/usage     |
| GET    | /analytics/dashboard |

# 8. MVP

##  V1.0

| 模块     | 功能         |
| -------- | ------------ |
| 登录     | Github OAuth |
| 简历     | 创建简历     |
| 简历     | 编辑简历     |
| 简历     | 保存         |
| 简历     | PDF导出      |
| 模板系统 | 模板选择     |

## V1.5（MVP版本）

| 模块   | 功能       |
| ------ | ---------- |
| AI     | AI优化     |
| AI会话 | AI会话聊天 |
| AI会话 | 模拟面试   |
| AI     | AI补全     |

## V2.0

目标：构建完整求职辅助闭环。

| 模块     | 功能         |
| -------- | ------------ |
| 简历     | 多模板切换   |
| 简历     | 拖拽排序     |
| JD分析   | 匹配度       |
| ATS分析  | ATS评分      |
| 历史版本 | 版本恢复     |
| AI       | 岗位定制优化 |

## V3.0+（后续增强方案）

目标：支持全球求职场景。

| 模块   | 功能           |
| ------ | -------------- |
| 国际化 | 中英文简历互转 |
| 国际化 | 多语言模板     |
| 国际化 | 海外岗位JD分析 |
| 国际化 | 海外面试模拟   |
| AI能力 | 多语言对话     |

# 9. 风险与应对

| 风险项        | 风险描述               | 应对措施                     |
| ------------- | ---------------------- | ---------------------------- |
| AI幻觉        | AI生成虚假内容         | 增加提示词约束，人工确认机制 |
| Token成本     | 用户频繁调用AI         | 设置调用额度和频率限制       |
| 简历数据丢失  | 网络异常导致数据丢失   | 保存                         |
| PDF导出兼容性 | 不同浏览器排版差异     | 统一服务端导出方案           |
| Prompt失效    | 大模型升级导致效果下降 | Prompt版本管理               |
| 高并发压力    | AI请求集中爆发         | Redis队列+限流               |
| 数据安全      | 用户隐私泄露           | JWT + HTTPS + 数据加密       |
| 第三方API故障 | OpenAI或DeepSeek不可用 | 多模型降级切换机制           |
