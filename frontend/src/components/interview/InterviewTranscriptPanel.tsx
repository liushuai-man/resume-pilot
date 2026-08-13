import { Text } from '@mantine/core';
import type { Answer, Question } from '@/api/interview.api';

interface Props { questions: Question[]; answers: Answer[]; getSectionName: (key: string) => string; }

export default function InterviewTranscriptPanel({ questions, answers, getSectionName }: Props) {
  return <div className="h-full overflow-y-auto bg-[#F8FAF9] p-5">
    <Text size="xs" fw={700} className="tracking-[0.12em] text-[#176B52]">INTERVIEW TRANSCRIPT</Text><Text fw={700} size="lg" mt={6}>本场记录</Text>
    <div className="mt-5 space-y-4">{questions.map((question, index) => {
      const answer = answers.find((item) => item.questionId === question.id);
      return <div key={question.id} className="w-full rounded-lg border border-[#D8E1DD] bg-white p-4 text-left">
        <Text size="xs" c="dimmed">问题 {index + 1} · {getSectionName(question.sectionKey)}</Text><Text size="sm" fw={600} mt={6} lineClamp={2}>{question.content}</Text>
        <Text size="xs" mt={8} c={answer ? 'teal' : 'dimmed'}>{answer ? '已回答' : index === questions.length - 1 ? '当前问题' : '未回答'}</Text>
      </div>;
    })}</div>
  </div>;
}
