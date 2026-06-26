import { useCallback } from 'react';
import { Input, Button } from '@mantine/core';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { notification } from '@/components/common/Notification';

interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  targetField?: string;
  context?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function AIInput({
  value,
  onChange,
  placeholder = '请输入内容...',
  targetField,
  context,
  size = 'sm',
  className = '',
}: AIInputProps) {
  const { isLoading, complete, polish } = useAI({
    targetField,
    onError: (error) => {
      notification.error(error.message || 'AI 功能执行失败，请稍后重试');
    },
  });

  const handleAIComplete = useCallback(async () => {
    const result = await complete(value, context);
    if (result) {
      onChange(value ? `${value} ${result}` : result);
      notification.success('AI 补全成功！');
    }
  }, [complete, value, onChange, context]);

  const handleAIPolish = useCallback(async () => {
    const result = await polish(value);
    if (result) {
      onChange(result);
      notification.success('AI 润色成功！');
    }
  }, [polish, value, onChange]);

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        size={size}
        className={`flex-1 ${className}`}
      />
      <Button
        variant="light"
        size={size}
        onClick={handleAIComplete}
        disabled={isLoading}
        color="blue"
        title="AI 补全"
      >
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
      </Button>
      <Button
        variant="light"
        size={size}
        onClick={handleAIPolish}
        disabled={isLoading || !value.trim()}
        color="green"
        title="AI 润色"
      >
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
      </Button>
    </div>
  );
}
