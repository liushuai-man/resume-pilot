# ResumePilot V2.0 集中验收清单

## 1. 环境与数据准备

- 启动 PostgreSQL、Redis、后端 `:4000` 与前端 `:5173`。
- 应用全部 Prisma migration，确认 `interview_results` 包含报告状态、流水线与 evaluation checkpoint 字段。
- 使用专门测试账户，配置可用聊天模型；真实 JD、简历和回答必须是允许发送到该模型的数据。
- 准备：3 份不同岗位 JD、1 份优秀简历、1 份语义填充简历、1 份包含乱码/占位文本的简历、1 份两页以上长简历。

## 2. 简历基础与 PDF

- 四种模板分别检查编辑器预览、面试预览、打印页内容一致。
- 单页与多页简历分别导出 PDF；用 `pdfinfo` 核对页数，用 `pdftoppm` 渲染全部页面。
- 逐页确认无裁切、重叠、空白中间页、条目丢失、重复条目和跨页顺序错误。
- 修改模板字号、边距和颜色后再次导出，确认浏览器预览与 PDF 同步。

## 3. JD 与 JobProfile

- 分别分析初级、中级、高级岗位 JD，检查岗位名、职级、行业、职责、必备项、加分项和关键词。
- 随机抽查每条 evidence 能在 JD 原文连续定位；篡改或虚构 evidence 必须被拒绝。
- 修改低置信度项目并确认；重新分析后旧版本只读，当前确认版本唯一。
- 确认模型、Prompt、Parser 和画像版本均被保存。

## 4. ATS、内容质量与岗位匹配

- 空白/空壳简历不得因字段存在获得高 ATS 分；乱码、重复字符和占位词必须命中。
- 内容质量、ATS、岗位匹配分独立展示，不合并为来源不明总分。
- 低置信度语义结论进入待确认；模型失败时不得生成替代语义分。
- 技能栏裸关键词只能判为证据不足；项目或经历中的真实使用场景才可判为已匹配。
- 修改简历或确认新画像后，旧报告必须标记过期。

## 5. 定向优化与恢复

- 从内容质量、岗位匹配、ATS 三类问题进入对应字段优化。
- 缺少事实时先追问；建议不得引入用户未提供的数字、技术或经历。
- 测试编辑建议、恢复 AI 原文、拒绝、采纳与应用；应用前必须创建快照。
- 应用后独立重评，展示前后分数与问题是否解决；重评失败不回滚内容且可单独重试。
- 在优化历史中检查来源、字段、前后文本、理由、证据、状态和分数变化。
- 测试撤销、重复撤销与后续编辑冲突保护。

## 6. 模拟面试 Agent

- 分别使用通用岗位与 confirmed JobProfile 开始面试，确认冻结简历、画像、Rubric 与计划。
- 回答过程中不显示评分或评价；完成全部回答后只发生一次批量评价模型调用。
- 刷新页面后恢复问题、回答、当前题位和下一题待生成状态。
- 模拟回答保存失败、下一题生成失败、批量评价失败、汇总失败和发布失败；验证草稿/问答不丢失、具体节点可单步重试、重复点击幂等。
- 报告检查正式维度分、未覆盖维度、证据题数、逐题评价、模型/Prompt/Rubric/调用次数/耗时。
- 从薄弱题分别进入简历模块补证据和专项训练；专项主题必须优先进入新面试计划。
- 临时笔记按场次隔离、刷新保留，且后端请求和报告中不出现笔记内容。

## 7. 历史、个人中心与数据一致性

- 生成中报告在历史页自动刷新；页面不可见时不持续轮询。
- 删除正式报告后，个人中心面试次数、平均分、趋势和能力画像重新计算。
- 少于两场面试时不生成长期能力画像；达到阈值后展示面试样本、题目证据与置信度。
- 不同 JobProfile 分组统计，通用岗位不混入定向画像。
- 检查近期活动跳转、模型配置入口、隐私边界说明和闭环完成量。

## 8. 自动检查

```powershell
cd frontend
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\vite.cmd build

cd ..\backend
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\esbuild.cmd src/server.ts --bundle --platform=node --format=esm --target=node20 --packages=external --sourcemap --outfile=dist/server.js
.\node_modules\.bin\tsx.cmd --test src/ai/agents/interview/evaluation.agent.test.ts
.\node_modules\.bin\tsx.cmd --test src/ai/agents/interview/report-builder.test.ts
```

当前机器若出现 `uv_os_get_passwd ENOMEM`，需要更换正常 Node 20 环境运行 `tsx` 固定集；这属于运行环境失败，不能记为测试通过。
