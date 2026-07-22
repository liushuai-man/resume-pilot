import { useState, useRef } from 'react';
import { Card, Text, Button, Group, Modal } from '@mantine/core';
import { Eye, Edit3, Download, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Resume, StyleConfig } from '@/types/resume';
import { notification } from '@/components/common/Notification';
import ResumePreview from '@/components/editor/ResumePreview';
import { resumeApi } from '@/api/home.api';
import { exportToPdf } from '@/utils/pdfExport';
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
  const previewRef = useRef<HTMLDivElement>(null);
  const hiddenExportRef = useRef<HTMLDivElement>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const previewProps = {
    templateStyle,
    templateLayout,
  };

  const handlePreview = () => {
    setPreviewModalOpen(true);
  };

  const handleEdit = () => {
    navigate(`/resume/${id}`);
  };

  const handleExportPdf = async (
    targetRef: React.RefObject<HTMLDivElement>
  ) => {
    if (!targetRef.current) {
      notification.error('无法获取预览内容');
      return;
    }

    setIsExporting(true);
    try {
      notification.info('正在生成PDF简历...');
      await exportToPdf(targetRef.current, title);
      notification.success('PDF简历导出成功');
    } catch (error) {
      notification.error('PDF导出失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportFromCard = async () => {
    if (!hiddenExportRef.current) {
      notification.error('无法获取预览内容');
      return;
    }

    setIsExporting(true);
    try {
      notification.info('正在生成PDF简历...');
      await exportToPdf(hiddenExportRef.current, title);
      notification.success('PDF简历导出成功');
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
        // 调用回调函数更新简历列表，而不是刷新页面
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
    navigate(`/resume/${id}`);
  };

  return (
    <>
      {/* 隐藏的导出容器 - 用于卡片直接下载 */}
      <div
        ref={hiddenExportRef}
        className="fixed top-0 left-0 w-[210mm] h-[297mm] opacity-0 pointer-events-none z-[-1] overflow-hidden"
        style={{
          transform: 'translate(-100%, -100%)',
        }}
      >
        <ResumePreview content={content} variant="card" {...previewProps} />
      </div>

      <Card className="aspect-[5/6] flex flex-col overflow-hidden border-2 border-gray-200 rounded-md p-0">
        <div className="px-3 py-1  bg-white">
          <Text size="sm" fw="medium" className="text-gray-800 mb-1 truncate">
            {title}
          </Text>
          <Text size="xs" className="text-gray-400 ">
            更新时间: {formatDateTime(updated_at)}
          </Text>
        </div>
        <div className="flex-1 mx-3 border-2 border-gray-200 rounded-md overflow-hidden bg-white">
          <div className="w-full h-full overflow-hidden">
            <div className="transform scale-[0.30] origin-top-left">
              <ResumePreview
                content={content}
                variant="card"
                {...previewProps}
              />
            </div>
          </div>
        </div>

        <div className="p-3  bg-white">
          <Group gap={2} className="justify-around items-center">
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 border-2 rounded-full border-gray-500 text-gray-500 bg-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
              onClick={handlePreview}
              title="预览"
            >
              <Eye size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 border-2 rounded-full border-gray-500 text-gray-500 bg-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
              onClick={handleEdit}
              title="编辑"
            >
              <Edit3 size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 border-2 rounded-full border-gray-500 text-gray-500 bg-white hover:bg-green-500 hover:text-white hover:border-green-500"
              onClick={handleExportFromCard}
              title="下载"
              disabled={isExporting}
            >
              <Download size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 border-2 rounded-full border-gray-500 text-gray-500 bg-white hover:bg-orange-500 hover:text-white hover:border-orange-500"
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
            ref={previewRef}
            className="overflow-auto bg-gray-100"
            style={{ maxHeight: '70vh' }}
          >
            <div className="min-h-full flex justify-center">
              <ResumePreview
                content={content}
                variant="card"
                {...previewProps}
              />
            </div>
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
              onClick={() => handleExportPdf(previewRef)}
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
