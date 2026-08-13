import { useRef, useEffect, useState } from 'react';
import { Text, Paper, Loader } from '@mantine/core';
import { Send, User, Bot, X } from 'lucide-react';
import type { Question, Answer } from '@/api/interview.api';
import MarkdownContent from '@/components/common/MarkdownContent';

interface InterviewChatProps {
  questions: Question[];
  answers: Answer[];
  currentQuestion: Question | null;
  currentAnswer: string;
  submitting: boolean;
  isThinking: boolean;
  onAnswerChange: (value: string) => void;
  onSubmitAnswer: () => void;
  getSectionName: (sectionKey: string) => string;
  sessionStarted?: boolean;
}

export default function InterviewChat({
  questions,
  answers,
  currentQuestion,
  currentAnswer,
  submitting,
  isThinking,
  onAnswerChange,
  onSubmitAnswer,
  getSectionName,
  sessionStarted,
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
    <div className="flex flex-col h-full  ">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-3xl mx-auto">
          {showHint && (
            <Paper
              p="sm"
              radius="md"
              className="flex items-center justify-between bg-blue-50 border border-blue-200 mb-4"
            >
              <div className="flex items-center gap-2">
                <Bot size={14} className="text-blue-600" />
                <Text size="xs" className="text-blue-700">
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
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <Text size="xs" c="dimmed" mb={4}>
                      AI 面试官 · {getSectionName(question.sectionKey)}
                    </Text>
                    <Paper p="md" radius="md" bg="gray.0" withBorder>
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
                        bg="blue.1"
                        withBorder
                        className="max-w-[80%]"
                      >
                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
                          {answer.content}
                        </p>
                      </Paper>
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
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
                  <Paper p="md" radius="md" bg="gray.0" withBorder>
                    <div className="flex items-center gap-2">
                      <Loader size="xs" />
                      <Text size="sm" c="dimmed">
                        正在思考...
                      </Text>
                    </div>
                  </Paper>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex flex-col min-h-[140px] border border-gray-300 rounded-xl bg-gray-50 p-4 focus-within:border-blue-500 focus-within:bg-white transition-colors">
            <textarea
              placeholder={
                sessionStarted ? '请输入你的回答...' : '请先选择简历并开始面试'
              }
              value={currentAnswer}
              onChange={(e) => onAnswerChange(e.target.value)}
              rows={4}
              disabled={!sessionStarted || !currentQuestion || isThinking}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmitAnswer();
                }
              }}
              className="flex-1 w-full resize-none border-none outline-none bg-transparent text-sm text-gray-800 placeholder-gray-400 disabled:cursor-not-allowed leading-relaxed"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={onSubmitAnswer}
                disabled={
                  !sessionStarted ||
                  !currentQuestion ||
                  isThinking ||
                  !currentAnswer.trim()
                }
                className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? <Loader size="xs" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
