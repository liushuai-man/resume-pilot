import { useRef, useEffect } from "react";
import {
  Button,
  Textarea,
  Text,
  Paper,
  Group,
  Progress,
  Loader,
} from "@mantine/core";
import { Send, User, Bot } from "lucide-react";
import type { Question, Answer } from "@/api/interview.api";

interface InterviewChatProps {
  questions: Question[];
  answers: Answer[];
  feedbacks: Record<string, string>;
  currentQuestion: Question | null;
  currentAnswer: string;
  questionCount: number;
  submitting: boolean;
  isThinking: boolean;
  onAnswerChange: (value: string) => void;
  onSubmitAnswer: () => void;
  getSectionName: (sectionKey: string) => string;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .trim();
}

export default function InterviewChat({
  questions,
  answers,
  feedbacks,
  currentQuestion,
  currentAnswer,
  questionCount,
  submitting,
  isThinking,
  onAnswerChange,
  onSubmitAnswer,
  getSectionName,
}: InterviewChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [questions, answers, feedbacks, isThinking]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Paper p="sm" radius="md" bg="gray.0" withBorder mb="4">
            <Group justify="space-between" mb={4}>
              <Text size="xs" c="dimmed">面试进度</Text>
              <Text size="xs" c="dimmed">{answers.length} / {questionCount} 题</Text>
            </Group>
            <Progress value={questionCount > 0 ? (answers.length / questionCount) * 100 : 0} size="sm" radius="xl" />
          </Paper>

          {questions.map((question) => {
            const answer = answers.find((a) => a.questionId === question.id);
            const questionFeedback = feedbacks[question.id];
            return (
              <div key={question.id} className="mb-4">
                <div className="flex gap-3 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <Text size="xs" c="dimmed" mb={4}>AI 面试官 · {getSectionName(question.sectionKey)}</Text>
                    <Paper p="md" radius="md" bg="gray.0" withBorder><Text>{question.content}</Text></Paper>
                  </div>
                </div>
                {answer && (
                  <div className="flex gap-3 mb-3 justify-end">
                    <div className="flex-1 flex flex-col items-end">
                      <Text size="xs" c="dimmed" mb={4}>你的回答</Text>
                      <Paper p="md" radius="md" bg="blue.1" withBorder className="max-w-[80%]"><Text size="sm">{answer.content}</Text></Paper>
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"><User size={16} className="text-white" /></div>
                  </div>
                )}
                {questionFeedback && (
                  <div className="flex gap-3 mb-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><Bot size={16} className="text-green-600" /></div>
                    <div className="flex-1">
                      <Text size="xs" c="dimmed" mb={4}>AI 反馈</Text>
                      <Paper p="md" radius="md" bg="green.1" withBorder><Text size="sm" c="green.7">{stripMarkdown(questionFeedback)}</Text></Paper>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isThinking && (
            <div className="mb-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><Bot size={16} className="text-blue-600" /></div>
                <div className="flex-1">
                  <Text size="xs" c="dimmed" mb={4}>AI 面试官</Text>
                  <Paper p="md" radius="md" bg="gray.0" withBorder>
                    <div className="flex items-center gap-2"><Loader size="xs" /><Text size="sm" c="dimmed">正在思考...</Text></div>
                  </Paper>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {currentQuestion && !isThinking && (
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"><User size={16} className="text-white" /></div>
              <div className="flex-1">
                <Textarea placeholder="请输入你的回答..." value={currentAnswer} onChange={(e) => onAnswerChange(e.target.value)} minRows={2} autosize size="sm" mb="sm" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmitAnswer(); } }} />
                <Group justify="flex-end">
                  <Button size="xs" leftSection={<Send size={14} />} onClick={onSubmitAnswer} loading={submitting} disabled={!currentAnswer.trim()}>提交答案</Button>
                </Group>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
