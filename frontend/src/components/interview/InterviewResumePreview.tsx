import { Button, Loader, Text } from '@mantine/core';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import ResizableResumePreview from '@/components/editor/ResizableResumePreview';

interface Props {
  resume: any;
  highlightSection?: string;
  pdfPage: number;
  loading: boolean;
  error: boolean;
  onPageChange: (page: number) => void;
  onLoad: () => void;
  onError: () => void;
}

export default function InterviewResumePreview({ resume, highlightSection, pdfPage, loading, error, onPageChange, onLoad, onError }: Props) {
  if (!resume?.content?.isUploadedFile || !resume.content.fileUrl) {
    return <div className="h-full overflow-hidden p-4"><ResizableResumePreview content={resume?.content || null} highlightSection={highlightSection} className="h-full w-full" /></div>;
  }
  const pageCount = resume.content.pageCount || 1;
  return <div className="relative flex h-full flex-col bg-slate-100 p-4">
    <div className="relative min-h-0 flex-1 overflow-hidden">
{loading && !error && <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100"><div className="flex items-center gap-2 text-sm text-slate-500"><Loader size="sm" color="#176B52" />正在加载简历预览…</div></div>}
      {error ? <div className="flex h-full items-center justify-center"><div className="max-w-sm rounded-xl border border-amber-200 bg-white p-6 text-center shadow-sm"><FileText size={28} className="mx-auto mb-3 text-amber-500"/><Text fw={600} size="sm">导入简历原文件不可用</Text><Text size="xs" c="dimmed" mt={6}>文件可能由旧版本保存到了临时容器中，请删除这条导入记录后重新上传。</Text></div></div>
        : <img key={`${resume.id}-${pdfPage}`} src={resume.content.fileType === 'pdf' ? `${import.meta.env.VITE_API_BASE_URL}/api/upload/resume/${resume.id}/preview?page=${pdfPage}` : `${import.meta.env.VITE_API_BASE_URL}/api/upload/resume/${resume.id}/file`} alt={`${resume.title}预览`} className="h-full w-full object-contain shadow-sm" onLoad={onLoad} onError={onError} />}
    </div>
    {resume.content.fileType === 'pdf' && !error && pageCount > 1 && <div className="mt-3 flex items-center justify-center gap-3">
      <Button variant="subtle" size="xs" leftSection={<ChevronLeft size={15}/>} disabled={pdfPage <= 1} onClick={() => onPageChange(Math.max(1, pdfPage - 1))}>上一页</Button>
      <Text size="sm" c="dimmed">{pdfPage} / {pageCount}</Text>
      <Button variant="subtle" size="xs" rightSection={<ChevronRight size={15}/>} disabled={pdfPage >= pageCount} onClick={() => onPageChange(Math.min(pageCount, pdfPage + 1))}>下一页</Button>
    </div>}
  </div>;
}
