import { useMemo, useState } from 'react';
import { Button, Menu, Modal } from '@mantine/core';
import { Download, Edit3, Eye, History, MoreHorizontal, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Resume, StyleConfig } from '@/types/resume';
import { notification } from '@/components/common/Notification';
import ThumbnailPreview from '@/components/home/ThumbnailPreview';
import { DocumentPreview } from '@/components/preview/DocumentPreview';
import { contentToDocument } from '@/utils/resume-migration';
import { resumeApi } from '@/api/home.api';
import { downloadPdf } from '@/utils/downloadPdf';
import { formatDateTime } from '@/utils/format';
import ConfirmModal from '@/components/common/ConfirmModal';

interface HistoryResumeProps {
  resume: Resume;
  onDelete?: (id: string) => void;
  templateStyle?: StyleConfig | null;
  templateLayout?: string;
}

export default function HistoryResume({ resume, onDelete, templateStyle, templateLayout }: HistoryResumeProps) {
  const { id, title, content, updated_at } = resume;
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const layout = templateLayout || 'classic';
  const document = useMemo(() => contentToDocument(content, templateStyle || null, layout), [content, templateStyle, layout]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      notification.info('正在生成 PDF 简历…');
      downloadPdf(await resumeApi.exportResumePdf(id), title);
      notification.success('PDF 简历导出成功');
    } catch { notification.error('PDF 导出失败，请稍后重试'); }
    finally { setIsExporting(false); }
  };

  const confirmDelete = async () => {
    try {
      const result = await resumeApi.deleteResume(id);
      if (result.code !== 200) throw new Error(result.message);
      notification.success('简历已删除');
      onDelete?.(id);
    } catch { notification.error('删除失败，请稍后重试'); }
    finally { setDeleteOpen(false); }
  };

  return <>
    <article className="group overflow-hidden rounded-[10px] border border-[#D8E1DD] bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#9BB6AA] hover:shadow-[0_14px_34px_rgba(23,58,45,0.08)]">
      <button type="button" onClick={() => setPreviewOpen(true)} className="relative block h-[238px] w-full overflow-hidden border-b border-[#E3EAE7] bg-[#EDF2F0] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#176B52]">
        <div className="absolute inset-x-5 top-5 h-[295px] overflow-hidden rounded-t-[3px] border border-[#D8E1DD] bg-white shadow-[0_8px_24px_rgba(31,54,45,0.08)] transition duration-300 group-hover:translate-y-[-3px]">
          <ThumbnailPreview content={content} templateStyle={templateStyle} templateLayout={layout} />
        </div>
        <span className="absolute right-3 top-3 rounded-md border border-white/80 bg-white/90 px-2 py-1 text-[11px] font-medium text-[#52615B] shadow-sm">预览</span>
      </button>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-[16px] font-semibold text-[#17211D]">{title}</h2>
            <p className="mt-1 text-xs text-[#7A8782]">更新于 {formatDateTime(updated_at)}</p>
          </div>
          <Menu position="bottom-end" shadow="md" width={176}>
            <Menu.Target><button type="button" aria-label={`${title}更多操作`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#66736D] hover:bg-[#F1F5F3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#176B52]"><MoreHorizontal size={19} /></button></Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<Eye size={15} />} onClick={() => setPreviewOpen(true)}>预览简历</Menu.Item>
              <Menu.Item leftSection={<History size={15} />} onClick={() => navigate(`/resumes/${id}/optimizations`)}>优化历史</Menu.Item>
              <Menu.Item leftSection={<Download size={15} />} onClick={() => void handleExport()} disabled={isExporting}>{isExporting ? '导出中…' : '导出 PDF'}</Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<Trash2 size={15} />} onClick={() => setDeleteOpen(true)}>删除简历</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
        <button type="button" onClick={() => navigate(`/resumes/${id}/edit`)} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#176B52] px-4 text-sm font-semibold text-white transition hover:bg-[#10563F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176B52]">
          <Edit3 size={15} />继续编辑
        </button>
      </div>
    </article>

    <Modal opened={previewOpen} onClose={() => setPreviewOpen(false)} title={title} size="xl" centered>
      <div className="overflow-hidden border-t border-[#D8E1DD]">
        <div className="max-h-[70vh] overflow-auto bg-[#EDF2F0]"><DocumentPreview document={document} className="min-h-full" /></div>
        <div className="flex justify-end gap-3 border-t border-[#D8E1DD] bg-white p-4">
          <Button variant="outline" color="teal" onClick={() => { setPreviewOpen(false); navigate(`/resumes/${id}/edit`); }}>编辑简历</Button>
          <Button color="teal" loading={isExporting} onClick={() => void handleExport()}>导出 PDF</Button>
        </div>
      </div>
    </Modal>
    <ConfirmModal opened={deleteOpen} onClose={() => setDeleteOpen(false)} title="删除这份简历？" message="删除后无法恢复，相关的优化历史也会一并移除。" onConfirm={() => void confirmDelete()} confirmText="删除简历" type="warning" />
  </>;
}
