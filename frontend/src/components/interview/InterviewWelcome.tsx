import { Text } from '@mantine/core';
import { Bot } from 'lucide-react';

export default function InterviewWelcome() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Bot size={64} className="text-blue-400 mb-4" />
      <Text size="xl" fw={600} mb="sm">
        AI 模拟面试
      </Text>
      <Text c="dimmed" size="sm" className="max-w-md">
        基于你的简历内容，AI 面试官将提出针对性的问题，帮助你准备真实面试。
        请在顶部导航栏选择简历和设置，然后点击"开始面试"。
      </Text>
    </div>
  );
}
