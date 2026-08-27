import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/api/auth.api';
import { useUserStore } from '@/store/useUserStore';
import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  FileCheck2,
  Gauge,
  Layers3,
  MessageSquareText,
  ShieldCheck,
  Target,
  TrendingUp,
} from 'lucide-react';

const abilityDimensions = [
  { icon: Layers3, label: '结构完整', value: 92 },
  { icon: Gauge, label: '表达质量', value: 84 },
  { icon: Target, label: '岗位匹配', value: 88 },
  { icon: FileCheck2, label: '成果证据', value: 78 },
  { icon: MessageSquareText, label: '面试表达', value: 82 },
  { icon: CheckCircle2, label: '行动准备', value: 86 },
];

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
  const scrollContainerRef = useRef<HTMLElement>(null);
  const { setUser, clearUser, enterGuestMode } = useUserStore();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const response = await getCurrentUser();
        if (!active) return;

        if (response.code === 200 && response.data) {
          setUser(response.data);
          navigate('/resumes', { replace: true });
          return;
        }
      } catch (error) {
        if (!active) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearUser();
        }
      }

      if (active) setIsCheckingSession(false);
    };

    void checkSession();
    return () => {
      active = false;
    };
  }, [clearUser, navigate, setUser]);

  useEffect(() => {
    if (isCheckingSession) return;
    const container = scrollContainerRef.current;
    const usesPrecisePointer = window.matchMedia(
      '(pointer: fine) and (min-height: 700px) and (prefers-reduced-motion: no-preference)'
    );
    if (!container || !usesPrecisePointer.matches) return;

    let animationFrame = 0;
    let isAnimating = false;

    const handleWheel = (event: WheelEvent) => {
      if (isAnimating || Math.abs(event.deltaY) < 8) {
        if (isAnimating) event.preventDefault();
        return;
      }

      const sections = Array.from(container.querySelectorAll<HTMLElement>('[data-scroll-section]'));
      const currentTop = container.scrollTop;
      const currentIndex = sections.reduce((closestIndex, section, index) => {
        const currentDistance = Math.abs(sections[closestIndex].offsetTop - currentTop);
        return Math.abs(section.offsetTop - currentTop) < currentDistance ? index : closestIndex;
      }, 0);
      const targetIndex = Math.min(
        sections.length - 1,
        Math.max(0, currentIndex + (event.deltaY > 0 ? 1 : -1))
      );

      if (targetIndex === currentIndex) return;
      event.preventDefault();
      isAnimating = true;

      const startTop = currentTop;
      const targetTop = sections[targetIndex].offsetTop;
      const distance = targetTop - startTop;
      const duration = 900;
      const startTime = performance.now();

      const animate = (time: number) => {
        const progress = Math.min((time - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        container.scrollTop = startTop + distance * eased;

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          isAnimating = false;
        }
      };

      animationFrame = requestAnimationFrame(animate);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animationFrame);
    };
  }, [isCheckingSession]);

  if (isCheckingSession) {
    return <main className="h-[100svh] bg-[#F4F7F6]" aria-label="正在检查登录状态" />;
  }

  const startAsGuest = () => {
    enterGuestMode();
    navigate('/resumes');
  };

  return (
    <main
      ref={scrollContainerRef}
      className="h-[100svh] snap-y snap-proximity overflow-y-auto overscroll-y-contain scroll-smooth bg-[#F4F7F6] text-[#17211D] motion-reduce:scroll-auto"
    >
      <section data-scroll-section className="mx-auto flex min-h-[100svh] w-full max-w-[1440px] snap-start flex-col px-6 py-6 lg:px-10">
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
                登录并进入
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={startAsGuest}
                className="h-11 rounded-lg border border-[#C5D1CC] bg-white px-5 text-sm font-semibold text-[#176B52] transition hover:border-[#176B52]"
              >
                不登录，直接使用
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

      <section data-scroll-section className="flex min-h-[100svh] snap-start items-center border-y border-[#D8E1DD] bg-[#F4F7F6]">
        <div className="mx-auto grid w-full max-w-[1440px] items-center gap-10 px-6 py-14 lg:grid-cols-[0.82fr_1.18fr] lg:px-10 lg:py-20">
          <div>
            <div className="flex items-center gap-2 text-[#176B52]">
              <TrendingUp size={20} />
              <span className="text-xs font-semibold uppercase tracking-[0.16em]">Career readiness</span>
            </div>
            <h2 className="mt-4 max-w-lg text-3xl font-semibold leading-tight text-[#17211D] sm:text-4xl">
              六个维度，形成完整的求职能力闭环
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[#66736D]">
              不只修改一份简历，而是把内容、岗位与面试放在同一套能力坐标中持续校准。
            </p>

            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {abilityDimensions.map((dimension) => {
                const Icon = dimension.icon;
                return (
                  <div key={dimension.label} className="group border-l-2 border-[#D8E1DD] pl-3 transition-colors hover:border-[#176B52]">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EAF3EF] text-[#176B52]">
                        <Icon size={17} strokeWidth={1.8} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#17211D]">{dimension.label}</p>
                        <p className="mt-0.5 text-xs font-medium tabular-nums text-[#8A5A26]">{dimension.value}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-[680px] items-center justify-center overflow-hidden rounded-[8px] border border-[#D8E1DD] bg-white px-2 py-5 sm:px-8 sm:py-8">
            <svg
              viewBox="0 0 520 410"
              className="h-auto w-full max-w-[600px]"
              role="img"
              aria-labelledby="ability-radar-title ability-radar-description"
            >
              <title id="ability-radar-title">求职能力六维雷达图</title>
              <desc id="ability-radar-description">展示结构完整、表达质量、岗位匹配、成果证据、面试表达和行动准备六项能力。</desc>

              <g transform="translate(80 25)">
                {[40, 80, 120].map((radius) => {
                  const half = radius * 0.5;
                  const side = radius * 0.866;
                  return (
                    <polygon
                      key={radius}
                      points={`180,${180 - radius} ${180 + side},${180 - half} ${180 + side},${180 + half} 180,${180 + radius} ${180 - side},${180 + half} ${180 - side},${180 - half}`}
                      fill={radius === 120 ? '#EDF3F0' : 'none'}
                      stroke="#C9D7D1"
                      strokeWidth="1"
                    />
                  );
                })}

                {[
                  [180, 60], [284, 120], [284, 240],
                  [180, 300], [76, 240], [76, 120],
                ].map(([x, y]) => (
                  <line key={`${x}-${y}`} x1="180" y1="180" x2={x} y2={y} stroke="#D6E1DC" strokeWidth="1" />
                ))}

                <polygon
                  points="180,69.6 267.3,129.6 271.4,232.8 180,273.6 94.8,229.2 90.6,128.4"
                  fill="#176B52"
                  fillOpacity="0.2"
                  stroke="#176B52"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                {[
                  [180, 69.6], [267.3, 129.6], [271.4, 232.8],
                  [180, 273.6], [94.8, 229.2], [90.6, 128.4],
                ].map(([x, y]) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" fill="#F4F7F6" stroke="#176B52" strokeWidth="2.5" />
                ))}

                <g fill="#17211D" fontSize="13" fontWeight="600" textAnchor="middle">
                  <text x="180" y="38">结构完整</text>
                  <text x="321" y="112">表达质量</text>
                  <text x="329" y="255">岗位匹配</text>
                  <text x="180" y="330">成果证据</text>
                  <text x="33" y="255">面试表达</text>
                  <text x="35" y="112">行动准备</text>
                </g>
              </g>
            </svg>
          </div>
        </div>
      </section>

      <section data-scroll-section className="relative flex min-h-[100svh] snap-start items-center border-y border-[#D8E1DD] bg-[#F4F7F6] pb-20">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-10 lg:px-10">
          <div className="grid gap-4 lg:grid-cols-4">
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

          <div className="mt-8 grid gap-5 border-t border-[#D8E1DD] pt-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF3EF] text-[#176B52]">
                <ShieldCheck size={21} />
              </span>
              <div>
                <h2 className="text-lg font-semibold">选择你的体验方式</h2>
                <p className="mt-1 text-sm text-[#66736D]">登录使用完整能力，或先浏览界面。</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="border-l-2 border-[#176B52] pl-4">
                <p className="font-semibold">登录后</p>
                <p className="mt-1 text-sm leading-6 text-[#56635E]">创建、保存和上传简历，使用 AI 优化、岗位分析、模拟面试及历史记录。</p>
              </div>
              <div className="border-l-2 border-[#C5D1CC] pl-4">
                <p className="font-semibold">跳过登录</p>
                <p className="mt-1 text-sm leading-6 text-[#56635E]">浏览完整界面；数据保存、上传和 AI 操作保持不可用。</p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="absolute inset-x-0 bottom-0 flex h-16 items-center justify-center gap-2 border-t border-white/70 bg-white/60 text-sm font-semibold text-[#176B52] backdrop-blur-md transition-colors hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#176B52]"
        >
          <ArrowUp size={17} />
          返回顶部
        </button>
      </section>
    </main>
  );
}
