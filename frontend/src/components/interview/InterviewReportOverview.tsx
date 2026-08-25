import { Paper, RingProgress, Text } from '@mantine/core';
import { Trophy } from 'lucide-react';
import type { InterviewReportData } from '@/api/interview.api';

const scoreColor = (score: number) => score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
const scoreLabel = (score: number) => score >= 90 ? '优秀' : score >= 70 ? '良好' : score >= 60 ? '及格' : '需改进';

export default function InterviewReportOverview({ report, position, date }: { report: InterviewReportData; position: string; date: string }) {
  return <>
    <Paper shadow="sm" p="xl" radius="lg" mb="md" className="border border-[#D8E1DD] bg-[linear-gradient(135deg,#EAF4F0_0%,#F8FAF9_60%,#EEF4F2_100%)]">
      <div className="flex items-center justify-between gap-5">
        <div><div className="mb-2 flex items-center gap-2"><Trophy size={22} className="text-[#B7791F]"/><Text size="xl" fw={700}>面试报告</Text></div><Text c="dimmed" size="sm">{position || '面试评估'} · {date}</Text></div>
        <div className="text-center"><RingProgress size={100} thickness={10} sections={[{ value: report.overallScore, color: scoreColor(report.overallScore) }]} label={<Text ta="center" fw={700} size="xl">{report.overallScore}<Text span size="xs" c="dimmed"> /100</Text></Text>}/><Text size="sm" fw={500}>{scoreLabel(report.overallScore)}</Text></div>
      </div>
    </Paper>
    <Paper shadow="sm" p="lg" radius="lg" withBorder mb="md">
      <Text fw={700} mb="md">能力维度</Text>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{report.dimensionScores.map((item) => <div key={item.key} className="rounded-xl bg-[#F4F7F6] p-3">
        <div className="mb-2 flex items-center justify-between"><Text size="sm" fw={600}>{item.label}</Text><Text size="sm" fw={700} c={item.questionCount ? 'teal' : 'dimmed'}>{item.questionCount ? `${item.score} 分` : '未覆盖'}</Text></div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#DDE5E1]"><div className="h-full rounded-full bg-[#176B52]" style={{ width: `${item.questionCount ? item.score : 0}%` }}/></div>
        <Text mt={6} size="xs" c="dimmed">{item.questionCount ? `${item.questionCount} 道题提供评价证据` : '本场没有足够样本，不生成推断'}</Text>
        {item.evidence?.length ? <details className="mt-2"><summary className="cursor-pointer text-xs font-medium text-[#176B52]">查看评分依据</summary><div className="mt-2 space-y-2">{item.evidence.map((evidence, index) => <div key={`${evidence.questionId}-${index}`} className="rounded-lg border border-[#D8E1DD] bg-white p-2 text-xs leading-5 text-[#52615B]"><p className="font-medium text-[#26332E]">{evidence.rationale}</p>{evidence.answerExcerpt && <p className="mt-1 text-[#718079]">回答摘录：“{evidence.answerExcerpt}”</p>}</div>)}</div></details> : null}
      </div>)}</div>
    </Paper>
  </>;
}
