import { Button, Group, Loader, Text } from '@mantine/core';
import type { Answer, InterviewResult, Question } from '@/api/interview.api';
import { formatDateTime } from '@/utils/format';
import InterviewQuestionReview from './InterviewQuestionReview';
import InterviewReportOverview from './InterviewReportOverview';
import InterviewReportSummary from './InterviewReportSummary';

interface Props { result: InterviewResult | null; questions: Question[]; answers: Answer[]; generating?: boolean; onRestart: () => void; onBackHome: () => void; onImproveResume?: (question: Question) => void; onPractice?: (question: Question, topic: string) => void; }

export default function InterviewReport({ result, questions, answers, generating = false, onRestart, onBackHome, onImproveResume, onPractice }: Props) {
  if (generating || !result?.report) return <div className="flex h-full flex-col items-center justify-center"><Loader size="lg" mb="md"/><Text size="lg" fw={500}>正在生成面试报告...</Text><Text size="sm" c="dimmed" mt={4}>正在批量评价完整问答，请稍候</Text></div>;
  return <div className="mx-auto max-w-2xl py-6">
    <InterviewReportOverview report={result.report} position={result.position} date={formatDateTime(result.created_at)}/>
    <InterviewReportSummary report={result.report}/>
    <InterviewQuestionReview questions={questions} answers={answers} evaluations={result.report.questionEvaluations || []} onImproveResume={onImproveResume} onPractice={(question, evaluation) => onPractice?.(question, evaluation.knowledgeGap?.join('、') || evaluation.followUpSuggestion || question.content)}/>
    <Text ta="center" size="xs" c="dimmed">报告版本 {result.report.reportVersion || '未记录'} · Rubric {result.report.rubricVersion || '未记录'}{result.report.evaluationAudit && ` · 模型 ${result.report.evaluationAudit.modelVersion} · 调用 ${result.report.evaluationAudit.modelCallCount} 次 · ${(result.report.evaluationAudit.durationMs / 1000).toFixed(1)} 秒`}</Text>
    <Group justify="center" mt="xl"><Button variant="outline" onClick={onRestart}>重新面试</Button><Button onClick={onBackHome}>返回首页</Button></Group>
  </div>;
}
