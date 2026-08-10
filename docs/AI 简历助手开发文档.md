# AI 简历助手开发文档

**文档版本：**V2.0

**文档用途：**全栈开发、测试、验收标准依据

# 1. 产品概述

## 1.1 产品定位

ResumePilot 是一款以目标岗位 JD 为评价基准的智能求职辅助平台。系统通过统一的岗位画像连接简历编辑、ATS 分析、岗位定制优化与在线模拟面试，形成“岗位分析—简历优化—版本验证—面试训练”的完整求职闭环。

用户可以：

- 创建简历
- 编辑简历
- 使用模板快速生成简历
- AI辅助补全简历内容
- AI优化简历表达
- AI分析岗位匹配度
- AI模拟面试

V2.0 的核心设计原则：

- JD 只解析一次，生成统一的结构化岗位画像（JobProfile）
- 简历编辑以 ATS 规则和岗位匹配结果作为优化依据
- 在线面试以 JobProfile 生成的岗位评价量表（EvaluationRubric）作为出题与评分标准
- AI 负责语义理解、证据提取和修改建议，确定性规则负责分数计算与边界控制
- 每次关键优化创建简历版本，支持评分对比、恢复和结果追踪
- 当前版本以用户粘贴 JD 为主要输入方式，暂不建设 Python 爬虫服务

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
| AI面试赋能   | 根据目标 JD、岗位职级和行业要求生成面试计划及评价量表，辅助用户进行针对性训练                       |
| 岗位适配优化 | 解析目标 JD，识别能力要求和证据缺口，以 ATS 与岗位匹配结果驱动简历优化                              |
| 优化效果验证 | 通过简历版本、ATS 分数和岗位匹配度对比，验证每次修改是否有效                                        |

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
| 8    | AI模拟面试 | 用户选择已确认的岗位画像后，系统按岗位Rubric生成面试计划并动态出题，结束后输出带回答证据、覆盖率和置信度的评价报告                          | P1     |
| 9    | 简历模板   | 分类展示多行业、多场景简历模板，支持模板预览、一键套用，模板持续迭代更新，适配校招、社招、转行等不同场景                                     | P1     |
| 10   | JD岗位画像 | 支持粘贴岗位JD，提取岗位族、职级、行业、职责、必备能力、加分项和原文证据；用户确认后供简历与面试模块统一使用                                | P0     |
| 11   | ATS分析    | 从文档可解析性、结构完整性、格式规范、关键词覆盖、内容可读性和证据强度等维度给出分项评分与定位建议                                         | P0     |
| 12   | JD匹配分析 | 将岗位画像与简历内容比对，区分已匹配能力、证据不足和真实能力缺口，生成可解释的岗位匹配度和修改优先级                                       | P0     |
| 13   | 岗位定制优化 | 根据JD权重、ATS问题和能力证据生成局部修改建议；禁止编造经历，缺少事实时向用户追问，用户确认后再写入简历                                  | P0     |
| 14   | 历史版本   | 在AI优化等关键操作前自动保存简历快照，支持版本对比、评分变化展示和一键恢复                                                                  | P1     |
| 15   | JD定向面试 | 基于岗位画像生成固定版本的评价量表，根据能力权重、覆盖率和回答置信度动态出题并生成证据化报告                                                | P1     |
| 16   | 多语言简历 | 支持中文简历一键生成英文简历，精准翻译职场专业术语，适配海外求职、外企面试场景，保障语句地道、专业合规                                       | P2     |

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
| 顶部导航栏模块                   | 普通页面统一展示“我的简历、目标岗位、模拟面试、历史记录”四个一级入口；头像进入个人中心，右侧保留模型配置和退出登录。简历编辑器与正在进行的面试使用精简任务工具栏，不显示完整导航                                                                 | 顶部     |
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
| 岗位诊断模块   | 展示当前目标JD、ATS分项得分、岗位匹配度和按优先级排列的问题；每个问题关联JD依据与简历位置                                      | 右侧诊断区域               |
| 版本管理模块   | AI修改前自动创建版本，展示修改摘要、ATS/匹配度变化，支持版本对比和恢复                                                         | 页面顶部和版本抽屉         |

简历编辑遵循“诊断—定位—修改—验证”的闭环：

```plaintext
选择目标JD
   ↓
运行ATS与岗位匹配分析
   ↓
定位到具体简历Section/Item/Field
   ↓
用户接受AI建议或手动修改
   ↓
创建简历版本并重新评分
```

ATS评分与岗位匹配度必须分开：

| 指标 | 回答的问题 | 主要评价维度 |
| ---- | ---------- | ------------ |
| ATS评分 | 简历能否被招聘系统正确解析和检索 | 可解析性、结构、格式、关键词覆盖、可读性 |
| 岗位匹配度 | 候选人的经历与目标岗位是否匹配 | 必备能力、项目证据、职责、职级、加分项 |

ATS建议必须包含问题等级、评分依据、简历定位、修改建议和预期影响。AI不得直接覆盖原文，用户确认后才能应用修改。

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

点击在线面试，可以从AI会话模式切换为在线面试模式。V2.0 在线面试必须关联已确认的 JobProfile；只有岗位名称而没有完整 JD 时，系统可使用内置岗位模板，但需要明确标记为“通用岗位标准”。

| 阶段       | 描述                     |
| ---------- | ------------------------ |
| 选择岗位   | 选择已解析JD，或输入JD生成并确认岗位画像 |
| 生成标准   | 根据岗位、职级、行业和JD要求生成本场面试固定版本的评价量表 |
| AI生成题库 | 根据岗位能力权重和候选人简历生成面试计划 |
| 模拟问答   | AI作为面试官发问，面试过程中只保存问题与回答，不展示即时评论 |
| 动态追问   | 根据面试计划、尚未覆盖的能力维度和回答内容决定下一题，不在过程中生成正式评价 |
| 统一评价   | 结束后使用完整问答记录和固定Rubric批量提取证据、生成分项评价 |
| 面试总结   | 后端按固定权重计算结果，输出可解释的岗位胜任度报告 |
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

面试评分原则：

- 岗位决定考察能力，职级决定回答深度，行业决定风险约束，具体JD决定最终权重
- 大模型负责理解回答、提取证据、识别知识缺口；后端根据Rubric权重计算分数
- “未考察”不等于“能力为0”，报告单独展示能力覆盖率和评价置信度
- 每场面试保存EvaluationRubric快照，保证历史结果可解释、可复现
- 面试过程中不向用户返回逐题评分、评论或改进建议，提交回答后直接进入下一题
- 结束后的评价失败时保留完整问答记录并允许重试，不返回未经校验的临时分数

## 3.4 个人中心

个人中心通过顶部导航栏头像进入，用于聚合展示用户长期求职数据，不替代历史记录中的单次原始报告。

| 模块 | 功能 |
| ---- | ---- |
| 数据总览 | 展示面试次数、平均分、最近得分、ATS分数、岗位匹配度和优化前后变化 |
| 趋势分析 | 按时间和岗位方向展示面试、ATS及匹配评分变化 |
| 用户画像 | 聚合技术能力、表达能力、项目深度和岗位适配等维度，标注样本数、置信度、数据来源和更新时间 |
| 近期活动 | 展示最近的面试、ATS分析和简历优化，并可跳转到对应原始记录 |
| 账户设置 | 展示基础账户信息，提供模型配置、隐私说明和数据管理入口 |

个人中心只使用用户明确填写的信息和系统正式评价结果。样本不足时显示“数据不足”，不从一次面试推断稳定能力，也不推断性格、健康或身份等敏感属性。不同岗位方向分别统计；删除原始评价后必须重新计算聚合结果。

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
| Vector DB | pgvector   | 基于PostgreSQL实现可选向量存储，主要支撑长期对话记忆与大规模历史数据语义召回 |
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
| 向量存储     | pgvector                 | 存储长期对话记忆；单份JD与简历匹配优先使用结构化数据                     |
| Embedding    | 独立Embedding模型        | 为需要跨大量历史数据召回的场景提供语义检索，并支持关键词降级             |
| 工作流       | LangGraph StateGraph     | 搭建状态化AI工作流，实现简历分析-优化-点评-复盘全流程自动化              |

## 5.3 系统架构图

| 层级       | 模块                                              | 描述                                                                                                                                 |
| ---------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 前端层     | Web App                                           | 用户交互入口，包含首页、简历管理、简历编辑器、AI优化、岗位匹配、模拟面试、个人中心等页面，负责页面渲染、状态管理、用户交互与结果展示 |
| 网关层     | API Gateway                                       | 系统统一入口，负责请求路由、JWT鉴权、权限控制、接口限流、参数校验、日志记录、统一异常处理                                            |
| 业务层     | User Service / Resume Service / Interview Service | 负责用户管理、简历管理、模板管理、版本管理、岗位匹配、模拟面试、PDF导出等核心业务逻辑处理                                            |
| Agent层    | LangGraph Orchestrator                            | AI工作流调度中心，根据用户请求选择对应Agent执行任务，管理Agent状态流转、任务编排、上下文传递与结果聚合                               |
| AI能力层   | JD Parser / Resume Agent / Evaluation Engine / Interview Agent | JD Parser生成统一岗位画像；Resume Agent生成局部建议；Evaluation Engine执行ATS与匹配分析；Interview Agent按岗位Rubric动态面试 |
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
- 根据ATS与岗位匹配问题生成局部优化建议

工作流：

```plaintext
用户请求
    ↓
Resume Parser
    ↓
ATS与Match Evaluation
    ↓
Issue Locator
    ↓
Content Optimizer
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

## 5.6 V2.0核心能力设计

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

- 用户长期对话记忆
- 多份岗位或多份经历的大规模语义召回数据（按需启用）

单份JD与单份简历的匹配优先使用结构化JobProfile和ResumeDocument，不依赖向量检索。向量能力仅用于需要跨大量历史数据召回的场景，并提供关键词降级。

### 5.6.2 JD Intelligence（V2.0核心）

JD Intelligence 是简历优化与在线面试共享的岗位标准中心，职责包括：

- 接收用户粘贴的JD并保存原文
- 提取岗位名称、岗位族、职级、行业、职责、必备能力和加分项
- 为每项能力保留JD原文证据、权重和期望等级
- 对模糊或冲突信息提示用户确认
- 生成版本化JobProfile，供ATS、匹配、优化和面试模块共同使用

当前版本不建设Python爬虫服务，不抓取招聘平台。JD输入以用户粘贴为主，后续可按公开URL解析、浏览器插件的顺序扩展。

```plaintext
JD输入
   ↓
JD Parser（LLM结构化抽取）
   ↓
Schema Validator（字段与范围校验）
   ↓
Normalizer（岗位、技能与职级归一化）
   ↓
用户确认
   ↓
生成JobProfile版本
   ├── ATS与匹配分析
   ├── 岗位定制优化
   └── 面试Rubric与面试计划
```

JobProfile核心结构：

```typescript
interface JobProfile {
  title: string;
  jobFamily: string;
  seniority: 'intern' | 'junior' | 'middle' | 'senior' | 'expert';
  industry?: string;
  responsibilities: string[];
  competencies: Array<{
    id: string;
    name: string;
    category: 'technical' | 'project' | 'behavioral' | 'domain';
    importance: 'must' | 'important' | 'bonus';
    weight: number;
    expectedLevel: number;
    evidence: string[];
  }>;
  constraints: Array<{
    name: string;
    type: string;
    required: boolean;
    source: string;
  }>;
  ambiguities: string[];
}
```

### 5.6.3 ATS与岗位匹配引擎

ATS评分采用“规则为主、AI为辅”的混合方案：

- 规则引擎负责文档可解析性、栏目完整性、格式规范、日期格式、关键词覆盖和重复率
- AI负责判断经历与岗位职责的语义相关性、技能证据强度、空泛表达和改写建议
- 后端负责分项权重、总分计算、范围校验和评分版本管理

岗位匹配输出不只包含总分，还必须区分：

- 已匹配：简历中存在明确能力证据
- 证据不足：提到技能但没有场景、职责或结果支撑
- 能力缺口：简历中没有对应信息，AI不得自动编造
- 未确认：系统无法从现有简历判断，需要用户补充

### 5.6.4 动态面试评价量表

面试开始时，根据以下层级合并生成EvaluationRubric：

```plaintext
通用评价标准
   ↓
岗位族模板
   ↓
职级模板
   ↓
行业模板
   ↓
具体JD要求
```

合并优先级为“具体JD > 行业 > 职级 > 岗位族 > 通用”。生成后保存快照，整场面试不再改变评分口径。

```typescript
interface EvaluationRubric {
  version: number;
  dimensions: Array<{
    id: string;
    name: string;
    weight: number;
    expectedLevel: number;
    anchors: Record<string, string>;
    requiredEvidence: string[];
    critical: boolean;
  }>;
  scoringPolicy: {
    passingScore: number;
    minimumCoverage: number;
    lowConfidenceThreshold: number;
  };
}
```

下一题优先级由岗位权重、预设面试计划、尚未覆盖程度、回答内容和追问价值共同决定。面试过程中不执行正式评分；结束后 Evaluation Agent 使用完整问答记录和固定 Rubric 批量评价，最终报告分别展示岗位胜任度、能力覆盖率和评价置信度。

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

### Job_descriptions（JD原文表）

| 字段         | 类型      | 说明                         |
| ------------ | --------- | ---------------------------- |
| id           | UUID      | 记录ID                       |
| user_id      | UUID      | 用户ID                       |
| title        | varchar   | 用户填写或解析出的岗位名称   |
| raw_content  | text      | 用户粘贴的JD原文             |
| source_type  | varchar   | 当前固定为paste              |
| content_hash | varchar   | 内容哈希，用于去重           |
| created_at   | timestamp | 创建时间                     |
| updated_at   | timestamp | 更新时间                     |
| is_deleted   | boolean   | 是否删除                     |

### Job_profiles（结构化岗位画像表）

| 字段            | 类型      | 说明                                  |
| --------------- | --------- | ------------------------------------- |
| id              | UUID      | 记录ID                                |
| user_id         | UUID      | 用户ID                                |
| job_description_id | UUID   | JD原文ID                              |
| version         | int       | 岗位画像版本                          |
| job_family      | varchar   | 岗位族                                |
| seniority       | varchar   | 职级                                  |
| industry        | varchar   | 行业                                  |
| parsed_data     | jsonb     | 职责、能力、权重、证据和约束          |
| parser_version  | varchar   | 解析器/Prompt版本                     |
| is_confirmed    | boolean   | 是否经用户确认                        |
| created_at      | timestamp | 创建时间                              |

### Resume_versions（简历版本表）

| 字段           | 类型      | 说明                                  |
| -------------- | --------- | ------------------------------------- |
| id             | UUID      | 记录ID                                |
| resume_id      | UUID      | 简历ID                                |
| job_profile_id | UUID      | 关联目标岗位，可为空                  |
| version        | int       | 版本号                                |
| content        | jsonb     | 简历内容快照                          |
| source         | varchar   | manual/ai_optimization/template_change |
| change_summary | jsonb     | 修改摘要                              |
| ats_score      | int       | 当前版本ATS分数                       |
| match_score    | int       | 当前版本岗位匹配度                    |
| created_at     | timestamp | 创建时间                              |

### Resume_evaluations（简历评价记录表）

| 字段           | 类型      | 说明                                  |
| -------------- | --------- | ------------------------------------- |
| id             | UUID      | 记录ID                                |
| resume_version_id | UUID   | 被评价的简历版本                      |
| job_profile_id | UUID      | 使用的岗位画像版本                    |
| ats_score      | int       | ATS总分                               |
| match_score    | int       | 岗位匹配度                            |
| dimension_scores | jsonb   | ATS与匹配分项得分                     |
| issues         | jsonb     | 问题、证据、定位和修改建议            |
| evaluator_version | varchar | 规则及Prompt版本                     |
| created_at     | timestamp | 创建时间                              |

### Interview_rubrics（面试评价量表快照）

| 字段           | 类型      | 说明                                  |
| -------------- | --------- | ------------------------------------- |
| id             | UUID      | 记录ID                                |
| interview_id   | UUID      | 面试会话ID                            |
| job_profile_id | UUID      | 使用的岗位画像版本                    |
| version        | int       | Rubric版本                            |
| rubric_snapshot | jsonb    | 维度、权重、行为锚点和评分策略        |
| created_at     | timestamp | 创建时间                              |

### Answer_evaluations（面试结束后生成的回答评价记录表）

| 字段             | 类型      | 说明                               |
| ---------------- | --------- | ---------------------------------- |
| id               | UUID      | 记录ID                             |
| interview_id     | UUID      | 面试会话ID                         |
| question_id      | varchar   | 问题ID                             |
| dimension_scores | jsonb     | 按Rubric维度评分                   |
| evidence         | jsonb     | 回答中的评分证据                   |
| confidence       | decimal   | 评价置信度                         |
| knowledge_gaps   | jsonb     | 知识缺口                           |
| evaluator_model  | varchar   | 使用的模型                         |
| rubric_version   | int       | 使用的Rubric版本                   |
| created_at       | timestamp | 创建时间                           |

该表只在面试结束后的统一评价任务成功时批量写入。提交单个回答时只保存问答记录，不创建正式评价；评价失败时保留会话并允许重新生成报告。

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

## Resume Version

| Method | Path                              | 描述             |
| ------ | --------------------------------- | ---------------- |
| GET    | /resume/:id/versions              | 获取简历版本列表 |
| POST   | /resume/:id/versions              | 创建版本快照     |
| GET    | /resume/:id/versions/:versionId   | 获取指定版本     |
| POST   | /resume/:id/versions/:versionId/restore | 恢复指定版本 |
| GET    | /resume/:id/versions/compare      | 对比两个版本     |

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

| Method | Path                       | 描述                         |
| ------ | -------------------------- | ---------------------------- |
| POST   | /interview/start           | 使用JobProfile启动面试       |
| POST   | /interview/message         | 保存回答并获取下一题，不返回评分或评论 |
| POST   | /interview/end             | 结束面试并基于完整记录执行统一评价 |
| GET    | /interview/history         | 获取历史面试                 |
| GET    | /interview/:id             | 获取面试详情                 |
| GET    | /interview/:id/rubric      | 获取本场面试评价量表快照     |
| GET    | /interview/:id/evaluations | 获取问题证据与分项评价       |

---

## Job Description / Job Profile

| Method | Path                        | 描述                    |
| ------ | --------------------------- | ----------------------- |
| POST   | /jobs                       | 保存用户粘贴的JD        |
| GET    | /jobs                       | 获取用户JD列表          |
| GET    | /jobs/:id                   | 获取JD详情              |
| POST   | /jobs/:id/parse             | 解析并生成岗位画像      |
| PUT    | /job-profiles/:id           | 用户修正岗位画像        |
| POST   | /job-profiles/:id/confirm   | 确认岗位画像版本        |
| GET    | /job-profiles/:id           | 获取岗位画像            |

---

## Resume Evaluation

| Method | Path                                  | 描述                       |
| ------ | ------------------------------------- | -------------------------- |
| POST   | /resume/:id/evaluations               | 运行ATS与岗位匹配分析      |
| GET    | /resume/:id/evaluations/latest        | 获取最新评价               |
| POST   | /resume/:id/optimize                  | 生成岗位定制局部修改建议   |
| POST   | /resume/:id/optimize/:suggestion/apply | 确认建议并创建新版本      |

---

## Analytics

| Method | Path                 |
| ------ | -------------------- |
| GET    | /analytics/token     |
| GET    | /analytics/usage     |
| GET    | /analytics/dashboard |

# 8. 产品版本与范围

本章只定义各产品版本的目标、功能边界和验收标准，不记录具体开发顺序。

V2.0 的阶段拆分、优先级假设、验证结果和下一步计划统一维护在 [V2.0 开发路线图](./V2.0开发路线图.md) 中。路线图属于动态文档，可以根据用户反馈、实现成本和评测数据频繁调整；本产品文档只在产品目标或范围发生变化时更新。

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

目标：以JD为统一评价标准，构建“岗位分析—简历优化—版本验证—面试训练”的完整求职辅助闭环。

| 产品域       | 模块       | 功能                                                         | 优先级 |
| ------------ | ---------- | ------------------------------------------------------------ | ------ |
| 岗位中心     | JD管理     | 粘贴、保存和复用目标JD                                       | P0     |
| 岗位中心     | 岗位画像   | 解析岗位、职级、行业、职责、必备能力、加分项和原文证据       | P0     |
| 简历投递中心 | ATS分析    | 分项评分、问题定位、关键词覆盖和可解析性检测                 | P0     |
| 简历投递中心 | 岗位匹配   | 已匹配、证据不足、能力缺口和未确认信息分析                   | P0     |
| 简历投递中心 | 定制优化   | 基于JD与ATS问题生成可确认的局部修改建议                      | P0     |
| 简历投递中心 | 历史版本   | 自动快照、版本对比、评分变化和版本恢复                       | P1     |
| 简历投递中心 | 模板与排序 | 多模板切换、拖拽排序以及根据JD推荐内容顺序                   | P1     |
| 面试训练中心 | 面试Rubric | 根据岗位、职级、行业和具体JD生成固定版本评价标准             | P1     |
| 面试训练中心 | 动态面试   | 根据能力权重、覆盖率、知识缺口和置信度动态出题               | P1     |
| 面试训练中心 | 证据化报告 | 展示岗位胜任度、能力覆盖率、评价置信度和回答证据             | P1     |
| 个人中心     | 数据总览   | 聚合面试、ATS、岗位匹配和简历优化数据，展示评分趋势与近期活动 | P1     |
| 个人中心     | 用户画像   | 按岗位方向聚合能力维度，展示样本数、置信度、来源和更新时间     | P1     |

V2.0范围边界：

- 支持用户粘贴JD，暂不提供Python爬虫或招聘平台自动抓取
- ATS评分用于指导简历结构与内容优化，不代表招聘平台官方通过率
- 岗位匹配度与ATS评分独立计算和展示
- AI不得编造用户经历，缺少事实时必须提示用户补充
- 面试评分以版本化Rubric为依据，不能由大模型直接自由生成总分

### V2.0验收标准

| 能力 | 验收标准 |
| ---- | -------- |
| JD岗位画像 | 能从用户粘贴的JD中生成岗位、职级、行业、职责和能力要求；每项核心能力保留原文证据，用户可修正并确认 |
| 标准复用 | 同一JobProfile版本被ATS、匹配、岗位优化和在线面试共同引用，不允许各模块独立重复解析JD |
| ATS评分 | 相同简历版本与评分器版本重复执行得到相同的规则分；问题能够定位到具体Section/Item/Field |
| 岗位匹配 | 单独展示匹配度，并区分已匹配、证据不足、能力缺口和未确认，不与ATS总分混合 |
| 岗位优化 | AI输出修改前文本、建议文本、理由和依据；未经用户确认不得覆盖简历；缺少事实时不生成虚假经历 |
| 历史版本 | 应用AI建议前自动创建快照；能够展示修改摘要、ATS/匹配度变化并恢复任意历史版本 |
| 面试Rubric | 面试开始时保存评价量表快照，权重合法且整场不变；每道题关联至少一个岗位能力维度 |
| 面试评价 | 面试过程中只进行问答且不展示即时评论；结束后基于完整记录批量生成逐题证据、分项评价与最终岗位胜任度报告 |
| 个人中心 | 能聚合正式评价结果并展示趋势和岗位维度用户画像；数据标明来源、样本数与更新时间，数据不足时不生成确定性结论 |
| 异常降级 | 模型结构化输出校验失败时不写入正式评价；Embedding不可用时不影响JD结构化分析和基础面试流程 |

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
