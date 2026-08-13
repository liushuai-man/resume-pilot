import { Group, Paper, Text } from '@mantine/core';
import { AlertCircle, CheckCircle, Lightbulb, MessageSquare } from 'lucide-react';
import type { InterviewReportData } from '@/api/interview.api';
import MarkdownContent from '@/components/common/MarkdownContent';

const sections = [
  { key: 'strengths' as const, label: '优势证据', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-500' },
  { key: 'weaknesses' as const, label: '需要改进', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-500' },
  { key: 'suggestions' as const, label: '训练建议', icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-500' },
];

export default function InterviewReportSummary({ report }: { report: InterviewReportData }) {
  return <Paper shadow="sm" p="lg" radius="md" withBorder mb="md">
    {report.introductionEvaluation && <div className="mb-5"><Group mb="sm"><MessageSquare size={16} className="text-violet-600"/><Text fw={600} size="sm">自我介绍评估</Text></Group><div className="rounded-lg border-l-3 border-violet-500 bg-violet-50 p-3"><MarkdownContent content={report.introductionEvaluation}/></div></div>}
    {sections.map(({ key, label, icon: Icon, color, bg, border }) => <section key={key} className="mb-5 last:mb-0"><Group mb="sm"><Icon size={16} className={color}/><Text fw={600} size="sm">{label}</Text></Group><div className="space-y-2">{report[key].length ? report[key].map((item, index) => <div key={`${key}-${index}`} className={`rounded-lg border-l-3 p-3 ${bg} ${border}`}><MarkdownContent content={item}/></div>) : <Text size="sm" c="dimmed">本场没有形成可验证的{label}。</Text>}</div></section>)}
  </Paper>;
}
