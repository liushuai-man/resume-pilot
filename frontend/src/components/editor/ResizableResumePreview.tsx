import { useState, useEffect, useRef } from 'react';
import { Text } from '@mantine/core';
import ResumePreview from './ResumePreview';
import type { ResumeContent } from '@/types/resume';

const RESUME_WIDTH = 850;
const MIN_SCALE = 0.4;

interface ResizableResumePreviewProps {
  content: ResumeContent | null;
  highlightSection?: string;
  emptyText?: string;
  className?: string;
}

export default function ResizableResumePreview({
  content,
  highlightSection,
  emptyText = '请选择简历',
  className = '',
}: ResizableResumePreviewProps) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const width = container.offsetWidth;
      const newScale = Math.min(Math.max(width / RESUME_WIDTH, MIN_SCALE), 1);
      setScale(newScale);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto flex items-start justify-center ${className}`}
    >
      {/* 缩放容器 - 固定宽度850px，根据可用空间等比缩放 */}
      <div
        ref={contentRef}
        className="transition-transform duration-300 ease-out flex-shrink-0"
        style={{
          width: RESUME_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {content ? (
          <ResumePreview content={content} highlightSection={highlightSection} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Text>{emptyText}</Text>
          </div>
        )}
      </div>
    </div>
  );
}
