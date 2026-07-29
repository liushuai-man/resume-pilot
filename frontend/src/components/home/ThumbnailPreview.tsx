import { useRef, useEffect, useState, useMemo } from 'react';
import { ClassicTemplate } from '@/components/preview/templates/ClassicTemplate';
import { ModernTemplate } from '@/components/preview/templates/ModernTemplate';
import { MinimalTemplate } from '@/components/preview/templates/MinimalTemplate';
import { SidebarTemplate } from '@/components/preview/templates/SidebarTemplate';
import { contentToDocument } from '@/utils/resume-migration';
import type { ResumeContent, StyleConfig } from '@/types/resume';
import type { ResumeDocument } from '@/types/resume-document';

const TEMPLATE_MAP: Record<
  string,
  React.ComponentType<{ document: ResumeDocument }>
> = {
  classic: ClassicTemplate as any,
  modern: ModernTemplate as any,
  minimal: MinimalTemplate as any,
  sidebar: SidebarTemplate as any,
};

interface ThumbnailPreviewProps {
  content: ResumeContent;
  templateStyle?: StyleConfig | null;
  templateLayout?: string;
  scale?: number;
}

/**
 * CSS 缩放缩略图预览组件
 * 使用与编辑器相同的 DocumentPreview 渲染器，确保预览一致。
 * 核心思路：转换数据 → 渲染新模板组件 → CSS transform: scale() 缩小。
 * 容器高度跟随实际内容高度，不使用固定 A4 高度，避免下方空白。
 */
export default function ThumbnailPreview({
  content,
  templateStyle,
  templateLayout,
  scale: propScale,
}: ThumbnailPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [calculatedScale, setCalculatedScale] = useState(propScale || 0.3);
  const [contentHeight, setContentHeight] = useState(1123);

  // 将旧 ResumeContent 转换为新 ResumeDocument（与编辑器使用相同转换逻辑）
  const document = useMemo(
    () =>
      contentToDocument(
        content,
        templateStyle || null,
        templateLayout || 'classic'
      ),
    [content, templateStyle, templateLayout]
  );

  const layout = templateLayout || document.layout.template || 'classic';
  const TemplateComponent = TEMPLATE_MAP[layout] || ClassicTemplate;

  useEffect(() => {
    if (propScale) {
      setCalculatedScale(propScale);
      return;
    }

    const calculateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const previewWidth = 794; // A4 @ 96dpi
      const scale = containerWidth / previewWidth;
      setCalculatedScale(scale);
    };

    calculateScale();
    const observer = new ResizeObserver(calculateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [propScale]);

  // 测量真实内容高度（使用不可见的未缩放幽灵元素）
  useEffect(() => {
    if (!measureRef.current) return;

    const measureHeight = () => {
      if (!measureRef.current) return;
      const height = measureRef.current.scrollHeight;
      setContentHeight(height);
    };

    measureHeight();
    const observer = new ResizeObserver(measureHeight);
    observer.observe(measureRef.current);
    return () => observer.disconnect();
  }, [document, layout]);

  const previewWidth = 794;
  const scaledHeight = contentHeight * calculatedScale;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: `${scaledHeight}px`,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f9fafb',
      }}
    >
      {/* 可见的缩放后内容 */}
      <div
        style={{
          transform: `scale(${calculatedScale})`,
          transformOrigin: 'top left',
          width: `${previewWidth}px`,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <TemplateComponent document={document} />
      </div>

      {/* 不可见测量元素：与缩放容器同尺寸，用于获取真实内容高度 */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${previewWidth}px`,
          visibility: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <TemplateComponent document={document} />
      </div>
    </div>
  );
}
