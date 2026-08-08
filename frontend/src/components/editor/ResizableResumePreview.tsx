import { useMemo } from 'react';
import { DocumentPreview } from '@/components/preview/DocumentPreview';
import { contentToDocument } from '@/utils/resume-migration';
import type { ResumeContent } from '@/types/resume';

interface ResizableResumePreviewProps {
  content: ResumeContent | null;
  highlightSection?: string;
  emptyText?: string;
  className?: string;
}

const sectionKeyToType: Record<string, string> = {
  basicInfo: 'profile',
  experience: 'experience',
  projects: 'project',
  skills: 'skill',
  education: 'education',
  careerObjective: 'objective',
  certifications: 'certification',
};

export default function ResizableResumePreview({
  content,
  highlightSection,
  emptyText = '请选择简历',
  className = '',
}: ResizableResumePreviewProps) {
  const document = useMemo(
    () =>
      content
        ? contentToDocument(
            content,
            (content as any)._documentStyle || null,
            (content as any)._documentLayout?.template || 'classic'
          )
        : null,
    [content]
  );

  const activeSectionId = useMemo(() => {
    if (!highlightSection || !document) return undefined;
    const type = sectionKeyToType[highlightSection];
    return document.sections.find((section) => section.type === type && section.visible)
      ?.id;
  }, [highlightSection, document]);

  return (
    <DocumentPreview
      document={document}
      highlightSectionId={activeSectionId}
      emptyText={emptyText}
      className={className}
    />
  );
}
