import { useMemo } from 'react';
import { DocumentPreview } from '@/components/preview/DocumentPreview';
import { contentToDocument } from '@/utils/resume-migration';
import type { ResumeContent, StyleConfig } from '@/types/resume';

interface ThumbnailPreviewProps {
  content: ResumeContent;
  templateStyle?: StyleConfig | null;
  templateLayout?: string;
  scale?: number;
}

/** 首页缩略图复用编辑器分页预览，仅展示第一页。 */
export default function ThumbnailPreview({
  content,
  templateStyle,
  templateLayout,
  scale,
}: ThumbnailPreviewProps) {
  const document = useMemo(
    () =>
      contentToDocument(
        content,
        templateStyle || null,
        templateLayout || 'classic'
      ),
    [content, templateStyle, templateLayout]
  );

  return (
    <DocumentPreview
      document={document}
      maxPages={1}
      showPageNumbers={false}
      scale={scale}
      pageGap={0}
    />
  );
}
