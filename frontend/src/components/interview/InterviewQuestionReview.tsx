import { Group, Paper, Text } from '@mantine/core';
import { HelpCircle } from 'lucide-react';
import type { Answer, Question, QuestionEvaluation } from '@/api/interview.api';
import MarkdownContent from '@/components/common/MarkdownContent';

export default function InterviewQuestionReview({ questions, answers, evaluations }: { questions: Question[]; answers: Answer[]; evaluations: QuestionEvaluation[] }) {
  const evaluationByQuestion = new Map(evaluations.map((item) => [item.questionId, item]));
  return <Paper shadow="sm" p="lg" radius="md" withBorder mb="md"><Group mb="md"><HelpCircle size={18} className="text-[#176B52]"/><Text fw={600}>逐题回顾</Text><Text size="xs" c="dimmed">共 {answers.length} 题</Text></Group>
    <div className="space-y-5">{answers.map((answer, index) => { const question = questions.find((item) => item.id === answer.questionId); if (!question) return null; const evaluation = evaluationByQuestion.get(question.id); return <section key={question.id} className="border-b border-[#E1E7E4] pb-5 last:border-0 last:pb-0">
      <div className="mb-2 flex items-center justify-between"><Text size="xs" c="dimmed">问题 {index + 1} · {question.isIntroduction ? '自我介绍' : question.section || '综合'}</Text>{evaluation && <Text size="xs" fw={700} c="teal">正式评价 {evaluation.score}/10</Text>}</div>
      <div className="mb-2 rounded-lg bg-[#F4F7F6] p-3"><MarkdownContent content={question.content}/></div>
      <div className="mb-2 rounded-lg border-l-3 border-blue-400 bg-blue-50 p-3"><Text size="xs" c="dimmed" mb={2}>你的回答</Text><p className="whitespace-pre-wrap break-words text-sm leading-6">{answer.content}</p></div>
      {evaluation?.feedback ? <div className="rounded-lg border-l-3 border-emerald-500 bg-emerald-50 p-3"><Text size="xs" c="dimmed" mb={2}>批量评价结果</Text><MarkdownContent content={evaluation.feedback}/></div> : <Text size="xs" c="dimmed">该题暂无正式评价结果。</Text>}
    </section>; })}</div>
  </Paper>;
}
