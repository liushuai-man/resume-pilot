import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EditorLayout from '@/layouts/EditorLayout';
import EditorToolbar from '@/components/editor/EditorHeaderToolbar';
import { SectionList } from '@/components/editor/SectionList';
import { SectionEditorModal } from '@/components/editor/SectionEditorModal';
import { DocumentPreview } from '@/components/preview/DocumentPreview';
import { TemplateSettings } from '@/components/editor/TemplateSettings';
import AIConversation from '@/components/editor/AIConversation';
import { exportToPdf } from '@/utils/pdfExport';
import { notification } from '@/components/common/Notification';
import { useResumeStore } from '@/store/useResumeStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { contentToDocument, documentToContent } from '@/utils/resume-migration';
import { resumeApi } from '@/api/home.api';
import { useAutoSave } from '@/hooks/useAutoSave';

export default function ResumeEditorPage() {
  const { id: resumeId } = useParams<{ id: string }>();
  const { resume, template, loadResume, initStore, loadTemplate } =
    useResumeStore();
  const {
    document,
    loadDocument,
    isSaving,
    lastSaved,
    setSaving,
    setLastSaved,
    setActiveSection,
    reset,
  } = useDocumentStore();
  const [manualSaving, setManualSaving] = useState(false);
  const [showTemplateSettings, setShowTemplateSettings] = useState(false);
  const [editorModalOpen, setEditorModalOpen] = useState(false);

  useAutoSave(resumeId || '');

  useEffect(() => {
    if (resumeId) {
      localStorage.removeItem('resume-storage');
      localStorage.removeItem('document-storage');
      reset();
    }

    initStore();

    if (resumeId) {
      loadResume(resumeId)
        .then(async () => {
          const currentResume = useResumeStore.getState().resume;
          if (currentResume?.template_id) {
            await loadTemplate(currentResume.template_id);
          }
        })
        .catch((error) => {
          console.error('简历加载失败:', error);
        });
    }
  }, [resumeId, loadResume, initStore, loadTemplate, reset]);

  useEffect(() => {
    if (resume && template && !document) {
      const doc = contentToDocument(
        resume.content,
        template.style_config,
        template.style_config.layout || 'classic'
      );
      doc.id = resume.id;
      doc.title = resume.title;
      loadDocument(doc);
    }
  }, [resume, template, document, loadDocument]);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setEditorModalOpen(true);
  };

  const handleSave = async () => {
    if (!resumeId || !document) return;
    if (manualSaving || isSaving) return;

    setManualSaving(true);
    setSaving(true);
    try {
      const content = documentToContent(document);
      const response = await resumeApi.updateResume(resumeId, {
        title: document.title,
        content: content as any,
      });
      if (response.code === 200) {
        setLastSaved(new Date());
        notification.success('简历保存成功');
      } else {
        notification.error(response.message || '保存失败');
      }
    } catch (error) {
      console.error('保存简历失败:', error);
      notification.error('保存失败，请稍后重试');
    } finally {
      setSaving(false);
      setManualSaving(false);
    }
  };

  const handleExport = () => {
    notification.info('正在生成PDF简历...');
    const resumeElement = window.document.querySelector(
      '.resume-preview-container'
    ) as HTMLElement;
    if (resumeElement) {
      const exportName = document?.title || '我的简历';
      exportToPdf(resumeElement, exportName)
        .then(() => {
          notification.success('PDF简历导出成功');
        })
        .catch(() => {
          notification.error('PDF导出失败');
        });
    }
  };

  const handleTitleChange = (_title: string) => {};

  const formatLastSaved = (date: Date | null | string) => {
    if (!date) return '';
    const lastSavedDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - lastSavedDate.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    return lastSavedDate.toLocaleDateString();
  };

  const leftPanelContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 选项卡头部 */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
        }}
      >
        <button
          onClick={() => setShowTemplateSettings(false)}
          style={{
            flex: 1,
            padding: '12px 8px',
            border: 'none',
            backgroundColor: 'transparent',
            fontSize: '13px',
            fontWeight: !showTemplateSettings ? 600 : 400,
            color: !showTemplateSettings ? '#4338ca' : '#6b7280',
            cursor: 'pointer',
            borderBottom: !showTemplateSettings
              ? '2px solid #4f46e5'
              : '2px solid transparent',
            marginBottom: '-1px',
            transition: 'all 0.15s',
          }}
        >
          内容模块
        </button>
        <button
          onClick={() => setShowTemplateSettings(true)}
          style={{
            flex: 1,
            padding: '12px 8px',
            border: 'none',
            backgroundColor: 'transparent',
            fontSize: '13px',
            fontWeight: showTemplateSettings ? 600 : 400,
            color: showTemplateSettings ? '#4338ca' : '#6b7280',
            cursor: 'pointer',
            borderBottom: showTemplateSettings
              ? '2px solid #4f46e5'
              : '2px solid transparent',
            marginBottom: '-1px',
            transition: 'all 0.15s',
          }}
        >
          模板设置
        </button>
      </div>

      {/* 选项卡内容 */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {showTemplateSettings ? (
          <TemplateSettings />
        ) : (
          <SectionList onSectionClick={handleSectionClick} />
        )}
      </div>
    </div>
  );

  return (
    <>
      <EditorLayout
        toolbar={
          <EditorToolbar
            title={document?.title || resume?.title || '新建简历'}
            resumeId={resumeId || ''}
            onSave={handleSave}
            onExport={handleExport}
            lastModified={formatLastSaved(lastSaved)}
            isSaving={isSaving}
            onTitleChange={handleTitleChange}
          />
        }
        leftPanel={leftPanelContent}
        rightPanel={
          <AIConversation currentField="" onApplyToResume={() => {}} />
        }
      >
        <DocumentPreview />
      </EditorLayout>

      <SectionEditorModal
        isOpen={editorModalOpen}
        onClose={() => setEditorModalOpen(false)}
      />
    </>
  );
}
