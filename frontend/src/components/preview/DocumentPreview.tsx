import { useDocumentStore } from '@/store/useDocumentStore';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { SidebarTemplate } from './templates/SidebarTemplate';
import type { ResumeLayout } from '@/types/resume-document';

const TEMPLATE_MAP = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  sidebar: SidebarTemplate,
};

export function DocumentPreview() {
  const { document, activeSectionId, setActiveSection } = useDocumentStore();

  if (!document) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#9ca3af',
        }}
      >
        <p>暂无简历内容</p>
      </div>
    );
  }

  const templateId = document.layout.template as
    | keyof ResumeLayout['template']
    | string;
  const TemplateComponent =
    (TEMPLATE_MAP as any)[templateId] || ClassicTemplate;

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 0,
        overflow: 'visible',
      }}
    >
      <div
        className="resume-preview-container"
        style={{
          width: '210mm',
          minHeight: '297mm',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          flexShrink: 0,
        }}
      >
        <TemplateComponent
          document={document}
          highlightSectionId={activeSectionId || undefined}
          onSectionClick={(id: string) => setActiveSection(id)}
        />
      </div>
    </div>
  );
}
