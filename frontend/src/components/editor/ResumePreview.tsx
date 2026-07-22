import { Card } from '@mantine/core';
import type { ResumeContent } from '@/types/resume';
import type { StyleConfig } from '@/types/resume';
import { useResumeStore } from '@/store/useResumeStore';
import {
  useTemplateStyles,
  useIsEmpty,
  useHighlightClass,
} from './resume-preview/useTemplateStyles';
import { ClassicLayout } from './resume-preview/ClassicLayout';
import { SidebarLayout } from './resume-preview/SidebarLayout';
import { MinimalLayout } from './resume-preview/MinimalLayout';

interface ResumePreviewProps {
  content: ResumeContent;
  highlightSection?: string;
  variant?: 'editor' | 'card';
  templateStyle?: StyleConfig | null;
  templateLayout?: string;
}

export default function ResumePreview({
  content,
  highlightSection,
  variant = 'editor',
  templateStyle: propStyle,
  templateLayout: propLayout,
}: ResumePreviewProps) {
  const { templateLayout: storeLayout, formatConfig } = useResumeStore();
  const hasPropStyle = propStyle !== undefined;
  const styles = useTemplateStyles(propStyle, hasPropStyle);
  const isEmpty = useIsEmpty(content);
  const highlightClass = useHighlightClass(highlightSection);

  const layout = propLayout || (hasPropStyle ? 'classic' : storeLayout) || 'classic';

  const cardClassName =
    variant === 'card'
      ? 'bg-white shadow-lg w-[794px]'
      : 'bg-white shadow-lg min-h-[calc(80vh)]';

  const layoutProps = {
    content,
    primaryColor: styles.primaryColor,
    sectionTitleColor: styles.sectionTitleColor,
    lineColor: styles.lineColor,
    sectionTitleSize: styles.sectionTitleSize,
    highlightClass,
    formatMargin: formatConfig.margin,
    cardClassName,
    fontFamily: styles.fontFamily,
    fontSize: styles.fontSize,
    backgroundColor: styles.backgroundColor,
  };

  if (isEmpty) {
    return (
      <Card
        className={cardClassName}
        style={{
          fontFamily: styles.fontFamily,
          fontSize: `${styles.fontSize}px`,
        }}
      >
        <div
          className="min-h-[calc(100vh-10rem)] flex items-center justify-center text-gray-400"
          style={{ padding: `${formatConfig.margin}px` }}
        >
          <p className="text-center">暂无简历内容，请在左侧编辑区域填写信息</p>
        </div>
      </Card>
    );
  }

  if (layout === 'sidebar') {
    return (
      <SidebarLayout
        {...layoutProps}
        sidebarColor={styles.sidebarColor}
        sidebarTextColor={styles.sidebarTextColor}
      />
    );
  }

  if (layout === 'minimal') {
    return <MinimalLayout {...layoutProps} />;
  }

  return <ClassicLayout {...layoutProps} />;
}
