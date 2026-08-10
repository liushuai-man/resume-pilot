import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Loader, Text, Title } from '@mantine/core';
import { ArrowLeft, CheckCircle2, CircleAlert, Lightbulb, Trophy } from 'lucide-react';
import { interviewApi, InterviewResult } from '@/api/interview.api';
import { formatDateTime } from '@/utils/format';
import { notifications } from '@mantine/notifications';
import MarkdownContent from '@/components/common/MarkdownContent';

const clamp = (value: number) => Math.max(0, Math.min(100, value));

const radarPoint = (value: number, angle: number) => {
  const radius = (value / 100) * 42;
  const radians = (angle * Math.PI) / 180;
  return `${50 + Math.cos(radians) * radius},${50 + Math.sin(radians) * radius}`;
};

const InterviewResultPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<InterviewResult | null>(null);

  useEffect(() => {
    if (!id) return;
    interviewApi.getInterviewResult(id)
      .then(setResult)
      .catch(() => notifications.show({ title: '错误', message: '获取面试结果失败', color: 'red' }))
      .finally(() => setLoading(false));
  }, [id]);

  const metrics = useMemo(() => {
    const score = result?.score || result?.report?.overallScore || 0;
    const normalized = score > 10 ? Math.round(score / 10) : score;
    const report = result?.report || {};
    const strengths = Array.isArray(report.strengths) ? report.strengths.length : 0;
    const weaknesses = Array.isArray(report.weaknesses) ? report.weaknesses.length : 0;
    return {
      score: normalized,
      overall: clamp(normalized * 10),
      depth: clamp(42 + strengths * 16 + normalized * 4),
      expression: clamp(68 + normalized * 3 - weaknesses * 5),
    };
  }, [result]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader size="xl" /></div>;
  if (!result) return <div className="flex h-screen flex-col items-center justify-center gap-4"><Text c="dimmed">未找到面试结果</Text><Button variant="outline" onClick={() => navigate(-1)}>返回</Button></div>;

  const report = result.report || {};
  const points = [
    radarPoint(metrics.depth, -90),
    radarPoint(metrics.expression, 30),
    radarPoint(metrics.overall, 150),
  ].join(' ');
  const sections = [
    { title: '表现亮点', icon: CheckCircle2, tone: 'text-emerald-600', items: report.strengths || [] },
    { title: '需要加强', icon: CircleAlert, tone: 'text-amber-600', items: report.weaknesses || [] },
    { title: '下一步建议', icon: Lightbulb, tone: 'text-indigo-600', items: report.suggestions || [] },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <Button variant="subtle" size="xs" leftSection={<ArrowLeft size={14} />} onClick={() => navigate(-1)}>返回</Button>
          <Title order={4}>面试报告</Title>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10">
        <section className="border-b border-slate-200 pb-8">
          <div className="grid gap-8 md:grid-cols-[1fr_220px] md:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-indigo-600"><Trophy size={18} /><span className="text-sm font-semibold">INTERVIEW REVIEW</span></div>
              <Title order={1} className="!text-3xl">{result.position || '综合面试评估'}</Title>
              <Text c="dimmed" mt="sm">{formatDateTime(result.created_at)} · 基于本次回答的即时分析</Text>
              {report.introductionEvaluation && (
                <div className="mt-5 max-w-xl text-slate-700">
                  <MarkdownContent content={report.introductionEvaluation} />
                </div>
              )}
            </div>
            <div className="flex items-center justify-center">
              <div
                className="flex shrink-0 items-center justify-center"
                style={{
                  width: 152,
                  height: 152,
                  aspectRatio: '1 / 1',
                  borderRadius: '50%',
                  background: `conic-gradient(#818cf8 ${metrics.overall}%, #e2e8f0 0)`,
                }}
              >
                <div
                  className="flex flex-col items-center justify-center"
                  style={{ width: 124, height: 124, borderRadius: '50%', background: '#ffffff' }}
                >
                  <span className="text-4xl font-bold tracking-tight text-slate-800">{metrics.score}</span>
                  <span className="mt-1 text-xs text-slate-500">总评分 / 10</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 border-b border-slate-200 py-8 md:grid-cols-[220px_1fr]">
          <div>
            <Text fw={700}>能力图谱</Text>
            <Text size="sm" c="dimmed" mt={4}>综合回答内容、案例深度和表达结构。</Text>
            <svg viewBox="0 0 100 100" className="mt-4" style={{ width: 192, height: 192, maxWidth: '100%' }} preserveAspectRatio="xMidYMid meet" aria-label="能力雷达图">
              <path d="M50 8 L92 80 L8 80 Z" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="1" />
              <path d="M50 24 L77 70 L23 70 Z" fill="none" stroke="#c7d2fe" strokeWidth="1" />
              <path d="M50 50 L50 8 M50 50 L92 80 M50 50 L8 80" fill="none" stroke="#c7d2fe" strokeWidth="0.8" strokeDasharray="2 2" />
              <polygon points={points} fill="#6366f1" fillOpacity="0.26" stroke="#4f46e5" strokeWidth="2" />
              <text x="50" y="6" textAnchor="middle" fontSize="7" fill="#475569">深度</text>
              <text x="93" y="83" textAnchor="end" fontSize="7" fill="#475569">表达</text>
              <text x="7" y="83" fontSize="7" fill="#475569">综合</text>
            </svg>
          </div>
          <div className="space-y-5 self-center">
            {[['综合掌握', metrics.overall, 'bg-indigo-500'], ['案例深度', metrics.depth, 'bg-cyan-500'], ['表达结构', metrics.expression, 'bg-emerald-500']].map(([label, value, color]) => (
              <div key={String(label)}>
                <div className="mb-2 flex justify-between text-sm"><span>{label}</span><span className="font-semibold">{value}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-8">
          {sections.map(({ title, icon: Icon, tone, items }, index) => (
            <div key={title} className={`grid gap-4 py-6 md:grid-cols-[180px_1fr] ${index ? 'border-t border-slate-200' : ''}`}>
              <div className={`flex items-center gap-2 font-semibold ${tone}`}><Icon size={18} />{title}</div>
              <ol className="space-y-3">
                {items.length ? items.map((item: string, itemIndex: number) => <li key={itemIndex} className="flex gap-3 leading-7"><span className="mt-1 text-xs text-slate-400">0{itemIndex + 1}</span><MarkdownContent content={item} className="flex-1" /></li>) : <li className="text-sm text-slate-500">暂无可展示内容</li>}
              </ol>
            </div>
          ))}
        </section>

        <div className="flex justify-center gap-3 border-t border-slate-200 pt-8"><Button variant="outline" onClick={() => navigate('/interviews')}>重新面试</Button><Button onClick={() => navigate('/resumes')}>返回我的简历</Button></div>
      </main>
    </div>
  );
};

export default InterviewResultPage;
