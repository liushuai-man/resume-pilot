import { useState, useCallback } from 'react';
import { aiApi } from '@/api/ai.api';
import { notification } from '@/components/common/Notification';

interface UseAIOptions {
  onSuccess?: (content: string) => void;
  onError?: (error: Error) => void;
  targetField?: string;
  sessionId?: string;
  resumeId?: string;
}

interface UseAIReturn {
  isLoading: boolean;
  complete: (text: string, context?: string) => Promise<string | null>;
  polish: (text: string) => Promise<string | null>;
  chat: (
    messages: { role: 'user' | 'assistant'; content: string }[],
    resumeContent?: any
  ) => Promise<string | null>;
  chatStream: (
    messages: { role: 'user' | 'assistant'; content: string }[],
    resumeContent: any,
    onDelta: (delta: string) => void
  ) => Promise<string | null>;
}

// 判断是否是网络超时错误
function isTimeoutError(error: any): boolean {
  return (
    error?.message?.includes('timeout') ||
    error?.message?.includes('超时') ||
    error?.code === 'ECONNABORTED'
  );
}

export function useAI(options: UseAIOptions = {}): UseAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const { onSuccess, onError, targetField, sessionId, resumeId } = options;

  const handleError = useCallback(
    (error: any, operation: string) => {
      let errorMessage = `${operation}失败，请稍后重试`;

      if (isTimeoutError(error)) {
        errorMessage = `${operation}请求超时，请检查网络连接后重试`;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      console.error(`AI ${operation} 失败:`, error);

      // 显示友好的错误通知
      notification.error(errorMessage);
      onError?.(new Error(errorMessage));
    },
    [onError]
  );

  const complete = useCallback(
    async (text: string, context?: string): Promise<string | null> => {
      if (!text.trim()) {
        return null;
      }

      setIsLoading(true);
      try {
        const response = await aiApi.complete({
          text,
          context,
          targetField,
        });

        if (response.code === 200 && response.data?.content) {
          const content = response.data.content;
          onSuccess?.(content);
          return content;
        }

        throw new Error(response.message || 'AI 补全失败');
      } catch (error: any) {
        handleError(error, 'AI 补全');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [targetField, onSuccess, handleError]
  );

  const polish = useCallback(
    async (text: string): Promise<string | null> => {
      if (!text.trim()) {
        return null;
      }

      setIsLoading(true);
      try {
        const response = await aiApi.polish({
          text,
          targetField,
          tone: 'professional',
        });

        if (response.code === 200 && response.data?.content) {
          const content = response.data.content;
          onSuccess?.(content);
          return content;
        }

        throw new Error(response.message || 'AI 润色失败');
      } catch (error: any) {
        handleError(error, 'AI 润色');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [targetField, onSuccess, handleError]
  );

  const chat = useCallback(
    async (
      messages: { role: 'user' | 'assistant'; content: string }[],
      resumeContent?: any
    ): Promise<string | null> => {
      setIsLoading(true);
      try {
        const response = await aiApi.chat({
          sessionId,
          resumeId,
          messages,
          resumeContent,
          currentField: targetField,
        });

        if (response.code === 200 && response.data?.content) {
          const content = response.data.content;
          onSuccess?.(content);
          return content;
        }

        throw new Error(response.message || 'AI 对话失败');
      } catch (error: any) {
        handleError(error, 'AI 对话');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [targetField, sessionId, resumeId, onSuccess, handleError]
  );

  const chatStream = useCallback(
    async (
      messages: { role: 'user' | 'assistant'; content: string }[],
      resumeContent: any,
      onDelta: (delta: string) => void
    ): Promise<string | null> => {
      setIsLoading(true);
      try {
        const content = await aiApi.chatStream(
          {
            sessionId,
            resumeId,
            messages,
            resumeContent,
            currentField: targetField,
          },
          { onDelta }
        );
        onSuccess?.(content);
        return content;
      } catch (error: any) {
        handleError(error, 'AI 流式对话');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [targetField, sessionId, resumeId, onSuccess, handleError]
  );

  return {
    isLoading,
    complete,
    polish,
    chat,
    chatStream,
  };
}
