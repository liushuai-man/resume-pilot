import { useRef, useEffect, useState, type ReactNode } from 'react';
import { Text, Paper, Loader } from '@mantine/core';
import { Send, User, Bot, X, Play } from 'lucide-react';
import type { Question, Answer } from '@/api/interview.api';
import MarkdownContent from '@/components/common/MarkdownContent';
import StreamingDots from '@/components/common/StreamingDots';

interface InterviewChatProps {
  questions: Question[];
  answers: Answer[];
  currentQuestion: Question | null;
  currentAnswer: string;
  submitting: boolean;
  isThinking: boolean;
  streamStage?: string | null;
  onAnswerChange: (value: string) => void;
  onSubmitAnswer: () => void;
  getSectionName: (sectionKey: string) => string;
  sessionStarted?: boolean;
  nextQuestionFailed?: boolean;
  onRetryNextQuestion?: () => void;
  controls?: ReactNode;
  onStart?: () => void;
  starting?: boolean;
  canStart?: boolean;
}

export default function InterviewChat({
  questions,
  answers,
  currentQuestion,
  currentAnswer,
  submitting,
  isThinking,
  streamStage,
  onAnswerChange,
  onSubmitAnswer,
  getSectionName,
  sessionStarted,
  nextQuestionFailed,
  onRetryNextQuestion,
  controls,
  onStart,
  starting,
  canStart,
}: InterviewChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(!sessionStarted);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [questions, answers, isThinking]);

  useEffect(() => {
    if (!sessionStarted) {
      setShowHint(true);
    }
  }, [sessionStarted]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F7F9F8]">
      <div className="flex-1 overflow-y-auto px-4 pb-44 pt-8 sm:px-8">
        <div className="mx-auto max-w-[820px]">
          {showHint && (
            <Paper
              p="sm"
              radius="md"
              className="mb-6 flex items-center justify-between border border-[#CFE0D8] bg-[#EDF5F1]"
            >
              <div className="flex items-center gap-2">
                <Bot size={14} className="text-[#176B52]" />
                <Text size="xs" className="text-[#285F4E]">
                  {sessionStarted
                    ? 'AI 面试官已就位，正在生成问题...'
                    : 'AI 面试官已就绪，请选择简历并点击"开始面试"'}
                </Text>
              </div>
              <button
                onClick={() => setShowHint(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            </Paper>
          )}

          {questions.map((question) => {
            const answer = answers.find((a) => a.questionId === question.id);
            return (
              <div key={question.id} className="mb-4">
                <div className="flex gap-3 mb-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#DDEDE6]">
                    <Bot size={16} className="text-[#176B52]" />
                  </div>
                  <div className="flex-1">
                    <Text size="xs" c="dimmed" mb={4}>
                      AI 面试官 · {getSectionName(question.sectionKey)}
                    </Text>
                    <Paper p="md" radius="lg" bg="white" withBorder className="border-[#DDE5E1] shadow-[0_1px_2px_rgba(23,33,29,0.04)]">
                      <MarkdownContent content={question.content} />
                    </Paper>
                  </div>
                </div>
                {answer && (
                  <div className="flex gap-3 mb-3 justify-end">
                    <div className="flex-1 flex flex-col items-end">
                      <Text size="xs" c="dimmed" mb={4}>
                        你的回答
                      </Text>
                      <Paper
                        p="md"
                        radius="md"
                        bg="#E4F0EB"
                        withBorder
                        className="max-w-[80%]"
                      >
                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
                          {answer.content}
                        </p>
                      </Paper>
                    </div>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#176B52]">
                      <User size={16} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isThinking && (
            <div className="mb-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot size={16} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <Text size="xs" c="dimmed" mb={4}>
                    AI 面试官
                  </Text>
                  <Paper p="md" radius="md" bg="gray.0" withBorder className="border-[#DDE5E1]">
                    <div>
                      <Text size="sm" c="dimmed">
                        {streamStage ? stageLabels[streamStage] || '正在处理...' : '正在思考...'}
                      </Text>
                      <div className="mt-3">
                        <StreamingDots />
                      </div>
                    </div>
                  </Paper>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
          {nextQuestionFailed && (
            <Paper p="md" radius="md" className="mb-4 border border-red-200 bg-red-50 text-center">
              <Text size="sm" fw={600} c="red">回答已保存，但下一题尚未生成</Text>
              <button type="button" onClick={onRetryNextQuestion} className="mt-3 rounded-md bg-[#176B52] px-4 py-2 text-xs font-medium text-white hover:bg-[#115640] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B52]/40">
                重新生成下一题
              </button>
            </Paper>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#F7F9F8] via-[#F7F9F8] to-transparent px-4 pb-5 pt-10 sm:px-8">
        <div className="pointer-events-auto mx-auto max-w-[820px]">
          <div className="relative flex min-h-[148px] flex-col rounded-2xl border border-[#CCD7D2] bg-white p-4 shadow-[0_14px_40px_rgba(31,49,42,0.14)] transition focus-within:border-[#176B52] focus-within:shadow-[0_16px_44px_rgba(23,107,82,0.14)]">
            <textarea
              placeholder={
                sessionStarted ? '请输入你的回答...' : '请先选择简历并开始面试'
              }
              value={currentAnswer}
              onChange={(e) => onAnswerChange(e.target.value)}
              rows={3}
              disabled={!sessionStarted || !currentQuestion || isThinking || nextQuestionFailed}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmitAnswer();
                }
              }}
              className="min-h-[68px] w-full flex-1 resize-none border-none bg-transparent text-sm leading-relaxed text-[#24312C] outline-none placeholder:text-[#98A49F] disabled:cursor-not-allowed"
            />
            {controls}
            <div className="absolute bottom-3 right-3 flex justify-end">
              <button
                onClick={sessionStarted ? onSubmitAnswer : onStart}
                disabled={sessionStarted ? (!currentQuestion || isThinking || !currentAnswer.trim()) : (!canStart || starting)}
                title={sessionStarted ? '发送回答' : '开始面试'}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#176B52] text-white transition hover:bg-[#10563F] disabled:cursor-not-allowed disabled:bg-[#CBD3CF]"
              >
                {submitting || starting ? <Loader size="xs" /> : sessionStarted ? <Send size={14} /> : <Play size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const stageLabels: Record<string, string> = {
  queued: '正在排队...',
  loading_context: '正在读取简历和岗位上下文...',
  planning: '正在规划面试路径...',
  generating: '正在生成问题...',
  validating: '正在校验结果...',
  saving: '正在保存结果...',
  evaluating_answers: '正在批量评估回答...',
  building_report: '正在生成面试报告...',
  completed: '已完成',
};
