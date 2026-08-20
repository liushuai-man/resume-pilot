import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, Input, Button, Avatar, Text } from '@mantine/core';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { ChatMessage } from '@/api/ai.api';
import { useResumeStore } from '@/store/useResumeStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { documentToContent } from '@/utils/resume-migration';
import { notification } from '@/components/common/Notification';
import { useAI } from '@/hooks/useAI';
import MarkdownContent from '@/components/common/MarkdownContent';
import StreamingDots from '@/components/common/StreamingDots';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestedAction?: 'copy' | 'regenerate';
}

interface AIConversationProps {
  currentField?: string;
  onApplyToResume?: (content: string, field: string) => void;
}

export default function AIConversation({
  currentField = '',
  onApplyToResume,
}: AIConversationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { content, resume } = useResumeStore();
  const document = useDocumentStore((state) => state.document);
  const [sessionId] = useState(() =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `resume-chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
  const currentResumeContent = useMemo(
    () => (document ? documentToContent(document) : content),
    [document, content]
  );

  const { isLoading, chatStream } = useAI({
    targetField: currentField,
    sessionId,
    resumeId: resume?.id,
    onError: (error) => {
      notification.error(error.message || 'AI 对话失败，请稍后重试');
    },
  });

  // 初始欢迎消息
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          type: 'ai',
          content: `你好！我是你的 AI 助手 🚀\n\n我可以帮你：\n• 优化简历内容与表达\n• 补全缺失的经历描述\n• 量化工作成果\n• 提升 ATS 通过率\n• 翻译简历为英文\n\n请告诉我你需要什么帮助？`,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // 添加用户消息到历史
    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', content: inputValue },
    ];

    const aiMessageId = `msg-${Date.now()}-ai`;
    setStreamingMessageId(aiMessageId);
    setMessages((prev) => [
      ...prev,
      {
        id: aiMessageId,
        type: 'ai',
        content: '',
        timestamp: new Date(),
      },
    ]);

    const aiResponse = await chatStream(newHistory, currentResumeContent, (delta) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === aiMessageId
            ? { ...message, content: message.content + delta }
            : message
        )
      );
    });

    if (aiResponse) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === aiMessageId
            ? { ...message, content: aiResponse, suggestedAction: aiResponse.length > 50 ? 'copy' : undefined }
            : message
        )
      );
      setChatHistory([
        ...newHistory,
        { role: 'assistant', content: aiResponse },
      ]);
    } else {
      setMessages((prev) => prev.filter((message) => message.id !== aiMessageId));
    }
    setStreamingMessageId(null);
  }, [inputValue, isLoading, chatHistory, currentResumeContent, chatStream]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAction = (messageId: string, action: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    if (action === 'copy') {
      navigator.clipboard.writeText(message.content);
      notification.success('已复制到剪贴板！');
    } else if (action === 'apply' && onApplyToResume) {
      // 提取主要内容（去除可能的解释性文字）
      const mainContent = extractMainContent(message.content);
      onApplyToResume(mainContent, currentField);
    } else if (action === 'regenerate') {
      // 重新生成：重新发送上一条用户消息
      setInputValue('请重新生成上面的回答');
    }
  };

  const extractMainContent = (text: string): string => {
    // 尝试提取实际内容（去除分析说明）
    const lines = text.split('\n');
    const mainLines: string[] = [];

    for (const line of lines) {
      // 跳过分析性文字
      if (
        line.includes('分析') ||
        line.includes('根据') ||
        line.includes('建议')
      ) {
        if (mainLines.length === 0) continue;
      }
      mainLines.push(line);
    }

    return mainLines.join('\n').trim();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 头部 */}
      <Card className="hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <span className="font-medium text-gray-800">AI 助手</span>
            <Text size="xs" className="text-gray-400">
              {isLoading ? '正在思考...' : '在线'}
            </Text>
          </div>
        </div>
      </Card>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 pt-12 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <Avatar
              size="sm"
              className={`flex-shrink-0 ${
                msg.type === 'user'
                  ? '!bg-[#176B52] !text-white'
                  : '!bg-[#E4F1EC] !text-[#176B52]'
              }`}
            >
              {msg.type === 'user' ? (
                <span className="font-semibold text-white">U</span>
              ) : (
                <Sparkles size={14} />
              )}
            </Avatar>
            <div
              className={`min-w-0 max-w-[92%] ${msg.type === 'user' ? 'text-right' : ''}`}
            >
              <div
                className={`min-w-0 max-w-full px-4 py-3 rounded-2xl text-sm ${
                  msg.type === 'user'
                    ? 'inline-block bg-[#176B52] text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}
              >
                {msg.type === 'ai' ? (
                  <>
                    {msg.content && <MarkdownContent content={msg.content} />}
                    {streamingMessageId === msg.id && (
                      <div className={msg.content ? 'mt-2' : ''}>
                        <StreamingDots />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="whitespace-pre-wrap break-words leading-6">
                    {msg.content}
                  </p>
                )}
              </div>

              {/* 操作按钮 */}
              {msg.type === 'ai' && msg.suggestedAction && (
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="subtle"
                    color="teal"
                    radius="md"
                    size="xs"
                    onClick={() => handleAction(msg.id, 'copy')}
                  >
                    复制
                  </Button>
                  <Button
                    variant="subtle"
                    color="teal"
                    radius="md"
                    size="xs"
                    onClick={() => handleAction(msg.id, 'regenerate')}
                  >
                    重新生成
                  </Button>
                </div>
              )}

              <div className="mt-1 text-xs text-gray-400">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && !streamingMessageId && (
          <div className="flex gap-3">
            <Avatar
              size="sm"
              className="flex-shrink-0 !bg-[#E4F1EC] !text-[#176B52]"
            >
              <Sparkles size={14} />
            </Avatar>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
              <StreamingDots />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <Card className="border-t border-gray-200 border-x-0 border-b-0 rounded-none">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            size="md"
            placeholder="输入你的问题或指令..."
            className="flex-1"
            disabled={isLoading}
            radius="md"
            styles={{ input: { borderColor: '#D8E1DD', backgroundColor: '#F7F9F8' } }}
          />
          <Button
            variant="filled"
            color="teal"
            radius="md"
            size="md"
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
        <Text size="xs" className="text-gray-400 mt-2 text-center">
          按 Enter 发送，Shift + Enter 换行
        </Text>
      </Card>
    </div>
  );
}
