import { useState, useMemo } from 'react';
import { Card, Text, Button, Group, Modal } from '@mantine/core';
import { Eye, Edit3, Download, Trash2, History } from 'lucide-react';
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

export default function HistoryResume({
  resume,
  onDelete,
  templateStyle,
  templateLayout,
}: HistoryResumeProps) {
  const { id, title, content, updated_at } = resume;
  const navigate = useNavigate();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const layout = templateLayout || 'classic';

  // 转换为新数据模型（与编辑器一致）
  const document = useMemo(
    () => contentToDocument(content, templateStyle || null, layout),
    [content, templateStyle, layout]
  );

  const handlePreview = () => {
    setPreviewModalOpen(true);
  };

  const handleEdit = () => {
    navigate(`/resumes/${id}/edit`);
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      notification.info('正在生成 PDF 简历…');
      const pdf = await resumeApi.exportResumePdf(id);
      downloadPdf(pdf, title);
      notification.success('PDF 简历导出成功');
    } catch (error) {
      notification.error('PDF导出失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const result = await resumeApi.deleteResume(id);

      if (result.code === 200) {
        notification.success(result.message);
        if (onDelete) {
          onDelete(id);
        }
      } else {
        notification.error(result.message || '删除失败');
      }
    } catch (error) {
      notification.error('删除失败，请稍后重试');
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  const handleEditFromPreview = () => {
    setPreviewModalOpen(false);
    navigate(`/resumes/${id}/edit`);
  };

  return (
    <>
      <Card className="aspect-[5/6] flex flex-col overflow-hidden border border-gray-200 rounded-xl p-0 shadow-none transition hover:border-blue-200 hover:shadow-sm">
        {/* 标题栏 */}
        <div className="px-3 py-2 bg-white">
          <Text size="sm" fw="medium" className="text-gray-800 mb-1 truncate">
            {title}
          </Text>
          <Text size="xs" className="text-gray-400">
            更新时间: {formatDateTime(updated_at)}
          </Text>
        </div>

        {/* CSS 缩放缩略图 */}
        <div className="flex-1 mx-3 mb-0 overflow-hidden rounded-md border border-gray-100">
          <ThumbnailPreview
            content={content}
            templateStyle={templateStyle}
            templateLayout={layout}
          />
        </div>

        {/* 操作栏 */}
        <div className="p-3 bg-white">
          <Group gap={2} className="justify-around items-center">
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 border-2 rounded-full border-gray-300 text-gray-500 bg-white hover:bg-violet-500 hover:text-white hover:border-violet-500"
              onClick={() => navigate(`/resumes/${id}/optimizations`)}
              title="优化历史"
            >
              <History size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 border-2 rounded-full border-gray-300 text-gray-500 bg-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
              onClick={handlePreview}
              title="预览"
            >
              <Eye size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 border-2 rounded-full border-gray-300 text-gray-500 bg-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
              onClick={handleEdit}
              title="编辑"
            >
              <Edit3 size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 border-2 rounded-full border-gray-300 text-gray-500 bg-white hover:bg-green-500 hover:text-white hover:border-green-500"
              onClick={handleExportPdf}
              title="下载"
              disabled={isExporting}
            >
              <Download size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 border-2 rounded-full border-gray-300 text-gray-500 bg-white hover:bg-orange-500 hover:text-white hover:border-orange-500"
              onClick={handleDelete}
              title="删除"
            >
              <Trash2 size={14} />
            </Button>
          </Group>
        </div>
      </Card>

      {/* 预览弹窗 */}
      <Modal
        opened={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={title}
        size="xl"
        className="max-w-5xl"
        centered
      >
        <div className="bg-white border-t-2 border-gray-200 overflow-hidden p-0">
          <div
            className="overflow-auto bg-gray-100"
            style={{ maxHeight: '70vh' }}
          >
            <DocumentPreview document={document} className="min-h-full" />
          </div>

          <div className="p-4 border-t-2 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleEditFromPreview}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
              size="md"
            >
              <Edit3 size={14} className="mr-2" />
              编辑简历
            </Button>
            <Button
              variant="filled"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="md"
            >
              <Download size={14} className="mr-2" />
              {isExporting ? '导出中...' : '下载PDF'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 删除确认弹窗 */}
      <ConfirmModal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="确认删除"
        message="确定要删除这份简历吗？此操作无法撤销。"
        onConfirm={confirmDelete}
        confirmText="确认删除"
        type="warning"
      />
    </>
  );
}
