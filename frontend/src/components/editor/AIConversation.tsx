import { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Avatar, Text, Switch } from '@mantine/core';
import {
  Sparkles,
  Wand2,
  Type,
  Palette,
  TrendingUp,
  FileCheck,
  RefreshCw,
  Send,
  MessageCircle,
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  action?: { type: 'apply' | 'copy' | 'regenerate'; label: string };
}

export default function AIConversation() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content:
        '你好！我是你的 AI 简历助手，我可以帮你：\n\n• 优化简历内容与表达\n• 补全经历项目\n• 量化工作成果\n• 提升 ATS 通过率\n\n有任何需要，随时告诉我 😊',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'ai',
      content: '请帮我优化一下工作经历中的第一段',
      timestamp: new Date(),
      action: { type: 'regenerate', label: '重新生成' },
    },
    {
      id: '3',
      type: 'ai',
      content:
        '优化建议如下：\n\n负责公司内部中台系统的前端开发与维护，支撑日均 10w+ 用户使用。\n\n• 使用 React + TypeScript + Ant Design 开发并维护多个核心业务组件\n• 优化页面加载速度提升 30%，用户页面停留时长提升 20%。',
      timestamp: new Date(),
      action: { type: 'apply', label: '应用到简历' },
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [interviewMode, setInterviewMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickCommands = [
    { icon: Wand2, label: '优化简历', color: 'blue' },
    { icon: FileCheck, label: '内容补全', color: 'green' },
    { icon: Type, label: '润色表达', color: 'purple' },
    { icon: Palette, label: '成果量化', color: 'orange' },
    { icon: TrendingUp, label: '提ATS', color: 'cyan' },
    { icon: RefreshCw, label: '翻译英文', color: 'pink' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: `msg-${Date.now()}-ai`,
        type: 'ai',
        content:
          '感谢你的提问！我来分析一下...\n\n根据你的需求，这里是我的建议：\n\n1. 首先检查简历结构是否完整\n2. 优化关键词以提升 ATS 通过率\n3. 量化工作成果\n\n需要我帮你具体修改某一部分吗？',
        timestamp: new Date(),
        action: { type: 'apply', label: '应用到简历' },
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickCommand = (label: string) => {
    setInputValue(`请帮我${label}`);
  };

  const handleAction = (action: {
    type: 'apply' | 'copy' | 'regenerate';
    label: string;
  }) => {
    if (action.type === 'copy') {
      // 复制逻辑
    } else if (action.type === 'apply') {
      // 应用到简历逻辑
    } else if (action.type === 'regenerate') {
      // 重新生成逻辑
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 头部 */}
      <Card className="border-b border-gray-200 border-x-0 border-t-0 rounded-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-blue-500" />
            <span className="font-medium text-gray-800">AI 会话</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">面试模式</span>
            <Switch
              checked={interviewMode}
              onChange={(e) => setInterviewMode(e.currentTarget.checked)}
              size="sm"
            />
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600"
            >
              <MessageCircle size={16} />
            </Button>
          </div>
        </div>
      </Card>

      {/* 快捷指令 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <Text size="xs" className="text-gray-400 mb-2">
          快捷指令
        </Text>
        <div className="grid grid-cols-3 gap-2">
          {quickCommands.map((cmd) => (
            <Button
              key={cmd.label}
              variant="outline"
              size="sm"
              className={`border-gray-200 hover:bg-${cmd.color}-50 hover:text-${cmd.color}-600 hover:border-${cmd.color}-300`}
              onClick={() => handleQuickCommand(cmd.label)}
            >
              <cmd.icon size={14} className="mr-1" />
              {cmd.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <Avatar
              size="sm"
              className={
                msg.type === 'user'
                  ? 'bg-blue-500'
                  : 'bg-gradient-to-br from-blue-400 to-purple-500'
              }
            >
              {msg.type === 'user' ? 'U' : <Sparkles size={14} />}
            </Avatar>
            <div
              className={`max-w-[85%] ${msg.type === 'user' ? 'text-right' : ''}`}
            >
              <div
                className={`inline-block px-3 py-2 rounded-lg text-sm ${
                  msg.type === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-1' : ''}>
                    {line}
                  </p>
                ))}
              </div>
              {msg.action && (
                <div
                  className={`mt-1 ${msg.type === 'user' ? '' : 'flex gap-2'}`}
                >
                  <Button
                    variant="outline"
                    size="xs"
                    color={msg.action.type === 'apply' ? 'blue' : 'gray'}
                    onClick={() => handleAction(msg.action!)}
                  >
                    {msg.action.label}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2">
            <Avatar
              size="sm"
              className="bg-gradient-to-br from-blue-400 to-purple-500"
            >
              <Sparkles size={14} />
            </Avatar>
            <div className="bg-gray-100 px-3 py-2 rounded-lg rounded-tl-none">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></span>
              </div>
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
            size="sm"
            placeholder="输入你的问题或指令..."
            className="flex-1"
          />
          <Button variant="filled" size="sm" onClick={handleSend}>
            <Send size={14} />
          </Button>
        </div>
        <Text size="xs" className="text-gray-400 mt-2 text-center">
          当前剩余 Tokens: 1,250
        </Text>
      </Card>
    </div>
  );
}
