import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Gauge,
  Layers3,
  MessageSquareText,
  ShieldCheck,
  Target,
} from 'lucide-react';

const capabilities = [
  {
    icon: Layers3,
    title: '简历创建与模板',
    text: '从空白简历或成熟模板开始，按基本信息、教育、经历、项目、技能等模块编辑，右侧实时预览最终版式。',
    detail: '适合先整理经历，再逐步沉淀为可投递版本。',
  },
  {
    icon: Gauge,
    title: '内容质量体检',
    text: '检查表达是否空泛、结果是否量化、段落是否重复，并把建议落到具体字段，减少整篇重写的负担。',
    detail: '重点不是替你编故事，而是帮你把真实经历说清楚。',
  },
  {
    icon: Target,
    title: '岗位匹配分析',
    text: '基于目标岗位画像识别职责、技能和关键词，把简历内容与岗位要求逐项对齐，提示缺口和优先优化项。',
    detail: '用于投递前判断这份简历是否真的在回应岗位。',
  },
  {
    icon: MessageSquareText,
    title: '模拟面试',
    text: '围绕简历项目和目标岗位生成追问，保存完整问答，并在结束后生成批量评价报告。',
    detail: '面试中不即时打分，避免打断练习节奏。',
  },
];

const workflow = [
  '导入或创建一份简历',
  '补齐项目证据和关键成果',
  '选择目标岗位并生成画像',
  '按建议优化后进行模拟面试',
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#F4F7F6] text-[#17211D]">
      <section className="mx-auto flex min-h-[92vh] w-full max-w-[1440px] flex-col px-6 py-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-[#D8E1DD] pb-5">
          <button type="button" className="flex items-center gap-3 text-left" onClick={() => navigate('/')}>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#176B52] text-white">
              <FileCheck2 size={21} strokeWidth={1.9} />
            </span>
            <span>
              <span className="block text-sm font-bold">AI 简历助手</span>
              <span className="block text-xs text-[#7A8782]">求职证据工作台</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/auth/login', { state: { from: '/resumes' } })}
            className="flex h-10 items-center gap-2 rounded-lg bg-[#176B52] px-4 text-sm font-semibold text-white transition hover:bg-[#10563F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176B52]"
          >
            进入项目
            <ArrowRight size={16} />
          </button>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)]">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A5A26]">Resume evidence lab</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-[#17211D] sm:text-6xl">
              把简历从经历清单，整理成可验证的求职证据。
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#56635E]">
              ResumePilot 面向正在准备投递和面试的人：先把真实经历结构化，再检查表达质量，随后对照岗位要求补齐证据，最后用模拟面试验证自己能不能讲清楚。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/auth/login', { state: { from: '/resumes' } })}
                className="flex h-11 items-center gap-2 rounded-lg bg-[#176B52] px-5 text-sm font-semibold text-white transition hover:bg-[#10563F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176B52]"
              >
                登录后进入
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/auth/login', { state: { from: '/resumes', mode: 'preview' } })}
                className="h-11 rounded-lg border border-[#C5D1CC] bg-white px-5 text-sm font-semibold text-[#176B52] transition hover:border-[#176B52]"
              >
                跳过登录预览
              </button>
            </div>
          </div>

          <div className="rounded-[8px] border border-[#D8E1DD] bg-white p-4 shadow-sm">
            <div className="grid gap-4 border-b border-[#E3EAE7] pb-4 md:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[8px] bg-[#17211D] p-5 text-white">
                <p className="text-xs uppercase tracking-[0.14em] text-[#9AB9AD]">Evidence score</p>
                <div className="mt-8 flex items-end gap-3">
                  <span className="text-6xl font-semibold">86</span>
                  <span className="pb-3 text-sm text-[#C9D8D2]">岗位匹配</span>
                </div>
                <div className="mt-8 h-2 rounded-full bg-white/15">
                  <div className="h-2 w-[86%] rounded-full bg-[#A9D8C4]" />
                </div>
                <p className="mt-6 text-sm leading-6 text-[#D9E7E1]">
                  系统会把泛泛描述、缺少结果、岗位关键词缺口和面试追问风险拆开呈现，方便逐项处理。
                </p>
              </div>
              <div className="space-y-3">
                {[
                  ['项目证据', '3 条经历需要补充量化结果'],
                  ['表达质量', '建议压缩 2 处重复描述'],
                  ['面试准备', '已生成 5 题追问路线'],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-[8px] border border-[#E3EAE7] p-4">
                    <p className="text-sm font-semibold text-[#17211D]">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-[#66736D]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 pt-4 sm:grid-cols-2">
              {workflow.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-[8px] bg-[#F4F7F6] p-4 text-sm font-semibold text-[#17211D]">
                  <CheckCircle2 size={18} className="text-[#176B52]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#D8E1DD] bg-white">
        <div className="mx-auto grid w-full max-w-[1440px] gap-4 px-6 py-10 lg:grid-cols-4 lg:px-10">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-[8px] border border-[#E3EAE7] p-5">
                <Icon size={22} className="text-[#176B52]" />
                <h2 className="mt-4 text-base font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#56635E]">{item.text}</p>
                <p className="mt-4 border-t border-[#E3EAE7] pt-4 text-xs leading-5 text-[#7A8782]">{item.detail}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1440px] gap-6 px-6 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <div>
          <ShieldCheck size={24} className="text-[#176B52]" />
          <h2 className="mt-4 text-2xl font-semibold">登录与展示模式的区别</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[8px] border border-[#D8E1DD] bg-white p-5">
            <p className="font-semibold">登录后</p>
            <p className="mt-2 text-sm leading-6 text-[#56635E]">可以创建和保存简历，上传文件，调用 AI 优化、岗位分析和模拟面试，并保留历史记录。</p>
          </div>
          <div className="rounded-[8px] border border-[#D8E1DD] bg-white p-5">
            <p className="font-semibold">跳过登录</p>
            <p className="mt-2 text-sm leading-6 text-[#56635E]">只进入界面预览。涉及数据保存、上传和 AI 调用的操作会被拦截，适合先了解信息架构。</p>
          </div>
        </div>
      </section>
    </main>
  );
}
