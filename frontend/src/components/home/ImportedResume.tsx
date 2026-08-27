import { useState } from 'react';
import { Button, Loader, Modal } from '@mantine/core';
import { ChevronLeft, ChevronRight, Eye, FileImage, FileText, MoreHorizontal, Trash2 } from 'lucide-react';
import { Menu } from '@mantine/core';
import type { Resume } from '@/types/resume';
import { resumeApi } from '@/api/home.api';
import { notification } from '@/components/common/Notification';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatDateTime } from '@/utils/format';

interface ImportedResumeProps {
  resume: Resume;
  onDelete?: (id: string) => void;
}

const filePreviewUrl = (resume: Resume, page: number) => {
  const base = `${import.meta.env.VITE_API_BASE_URL}/api/upload/resume/${resume.id}`;
  return resume.content.fileType === 'pdf' ? `${base}/preview?page=${page}` : `${base}/file`;
};

export default function ImportedResume({ resume, onDelete }: ImportedResumeProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);
  const pageCount = Math.max(1, resume.content.pageCount || 1);
  const isPdf = resume.content.fileType === 'pdf';

  const openPreview = () => {
    setPage(1);
    setLoading(true);
    setPreviewError(false);
    setPreviewOpen(true);
  };

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    setLoading(true);
    setPreviewError(false);
  };

  const confirmDelete = async () => {
    try {
      const result = await resumeApi.deleteResume(resume.id);
      if (result.code !== 200) throw new Error(result.message);
      notification.success('导入简历已删除');
      onDelete?.(resume.id);
    } catch {
      notification.error('删除失败，请稍后重试');
    } finally {
      setDeleteOpen(false);
    }
  };

  return <>
    <article className="group relative overflow-hidden rounded-[10px] border border-[#C9D2E3] bg-[#F7F8FC] transition duration-200 hover:-translate-y-0.5 hover:border-[#8799BE] hover:shadow-[0_14px_34px_rgba(55,72,112,0.12)]">
      <span aria-hidden="true" className="absolute inset-y-0 left-0 z-20 w-1 bg-[#526A9E]" />
      <button type="button" onClick={openPreview} className="relative block h-[238px] w-full overflow-hidden border-b border-[#D7DDEA] bg-[#E4E9F3] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#526A9E]">
        <div aria-hidden="true" className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(82,106,158,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(82,106,158,0.07)_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute inset-x-8 top-7 flex h-[285px] items-start justify-center overflow-hidden rounded-[4px] border border-[#BCC7DC] bg-white shadow-[7px_9px_0_rgba(82,106,158,0.12),0_12px_26px_rgba(48,62,92,0.10)] transition duration-300 group-hover:-translate-y-1 group-hover:rotate-[-0.4deg] motion-reduce:transform-none">
          <img src={filePreviewUrl(resume, 1)} alt={`${resume.title}缩略图`} className="h-full w-full object-contain object-top" />
        </div>
        <span className="absolute left-4 top-3 flex items-center gap-1.5 rounded-full border border-[#AEBBD3] bg-[#F8FAFF]/95 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#435B8E] shadow-sm">{isPdf ? <FileText size={12} /> : <FileImage size={12} />}外部文件 · 只读</span>
        <span className="absolute right-3 top-3 rounded-full bg-[#526A9E] px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">查看</span>
      </button>

      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-[16px] font-semibold text-[#20283A]">{resume.title}</h2>
            <p className="mt-1 truncate text-xs text-[#73809A]">{resume.content.fileName || `${isPdf ? 'PDF' : '图片'}文件`} · 归档于 {formatDateTime(resume.created_at)}</p>
          </div>
          <Menu position="bottom-end" shadow="md" width={164}>
            <Menu.Target><button type="button" aria-label={`${resume.title}更多操作`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#687690] hover:bg-[#E9EDF5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#526A9E]"><MoreHorizontal size={19} /></button></Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<Eye size={15} />} onClick={openPreview}>查看简历</Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<Trash2 size={15} />} onClick={() => setDeleteOpen(true)}>删除简历</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
        <button type="button" onClick={openPreview} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#AEBBD3] bg-[#EDF1F8] px-4 text-sm font-semibold text-[#435B8E] transition hover:border-[#526A9E] hover:bg-[#E4EAF5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526A9E]">
          <Eye size={15} />查看原简历
        </button>
      </div>
    </article>

    <Modal opened={previewOpen} onClose={() => setPreviewOpen(false)} title={resume.title} size="xl" centered>
      <div className="border-t border-[#D8E1DD]">
        <div className="relative flex h-[68vh] items-center justify-center overflow-hidden bg-[#EDF2F0] p-4">
          {loading && !previewError && <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#EDF2F0]"><Loader size="sm" color="#176B52" /></div>}
          {previewError ? <div className="max-w-sm rounded-xl border border-amber-200 bg-white p-6 text-center"><FileText size={28} className="mx-auto text-amber-500" /><p className="mt-3 text-sm font-semibold text-[#17211D]">原文件暂时无法预览</p><p className="mt-1 text-xs leading-5 text-[#7A8782]">文件可能已失效，可以删除记录后重新导入。</p></div>
            : <img key={page} src={filePreviewUrl(resume, page)} alt={`${resume.title}第 ${page} 页`} onLoad={() => setLoading(false)} onError={() => { setLoading(false); setPreviewError(true); }} className="h-full w-full object-contain" />}
        </div>
        <div className="flex items-center justify-between border-t border-[#D8E1DD] bg-white p-4">
          <span className="text-xs text-[#66736D]">导入文件仅供查看，不支持编辑</span>
          {isPdf && pageCount > 1 && <div className="flex items-center gap-2">
            <Button variant="default" size="xs" aria-label="上一页" disabled={page <= 1} onClick={() => changePage(page - 1)}><ChevronLeft size={15} /></Button>
            <span className="min-w-16 text-center text-xs text-[#52615B]">{page} / {pageCount}</span>
            <Button variant="default" size="xs" aria-label="下一页" disabled={page >= pageCount} onClick={() => changePage(page + 1)}><ChevronRight size={15} /></Button>
          </div>}
        </div>
      </div>
    </Modal>
    <ConfirmModal opened={deleteOpen} onClose={() => setDeleteOpen(false)} title="删除这份导入简历？" message="删除后无法恢复，使用这份简历创建的关联记录可能会受到影响。" onConfirm={() => void confirmDelete()} confirmText="删除简历" type="warning" />
  </>;
}
