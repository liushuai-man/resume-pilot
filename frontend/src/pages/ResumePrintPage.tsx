import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { resumeApi } from '@/api/home.api';
import { DocumentPreview } from '@/components/preview/DocumentPreview';
import type { Resume, StyleConfig } from '@/types/resume';
import { contentToDocument } from '@/utils/resume-migration';

export default function ResumePrintPage() {
  const { id = '' } = useParams();
  const [resume, setResume] = useState<Resume | null>(null);
  const [templateStyle, setTemplateStyle] = useState<StyleConfig | null>(null);
  const [templateLayout, setTemplateLayout] = useState('classic');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await resumeApi.getResumeById(id);
        if (!active) return;
        const loadedResume = response.data;
        setResume(loadedResume);

        if (loadedResume.template_id) {
          const templateResponse = await resumeApi.getTemplateById(
            loadedResume.template_id
          );
          if (!active) return;
          setTemplateStyle(templateResponse.data.style_config || null);
          setTemplateLayout(
            templateResponse.data.schema?.layout ||
              templateResponse.data.style_config?.layout ||
              'classic'
          );
        }
      } catch (loadError) {
        console.error('加载打印简历失败:', loadError);
        if (active) setError('简历加载失败');
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [id]);

  const document = useMemo(() => {
    if (!resume) return null;
    return {
      ...contentToDocument(resume.content, templateStyle, templateLayout),
      id: resume.id,
      title: resume.title,
    };
  }, [resume, templateStyle, templateLayout]);

  if (error) {
    return <main data-resume-print-error>{error}</main>;
  }

  if (!document) {
    return <main>正在准备简历...</main>;
  }

  return (
    <main
      style={{
        width: '794px',
        margin: 0,
        padding: 0,
        background: '#ffffff',
      }}
    >
      <DocumentPreview
        document={document}
        scale={1}
        pageGap={0}
        showPageNumbers={false}
        printMode
      />
    </main>
  );
}
