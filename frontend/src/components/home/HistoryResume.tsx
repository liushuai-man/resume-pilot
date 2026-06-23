import { useState, useRef } from 'react';
import { Card, Text, Button, Group, Image, Modal } from '@mantine/core';
import { Eye, Edit3, Download, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Resume } from '@/types/resume';
import { notification } from '@/components/common/Notification';
import ResumePreview from '@/components/home/ResumePreview';
import { resumeApi } from '@/api/home.api';
import { exportToPdf } from '@/utils/pdfExport';
import ConfirmModal from '@/components/common/ConfirmModal';

interface HistoryResumeProps {
  resume: Resume;
  thumbnail?: string;
  onDelete?: (id: string) => void;
}

export default function HistoryResume({
  resume,
  thumbnail,
  onDelete,
}: HistoryResumeProps) {
  const { id, title, content, updated_at } = resume;
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement>(null);
  const hiddenExportRef = useRef<HTMLDivElement>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
        <ResumePreview content={content} />
      </div>

      <Card className="aspect-[5/6] flex flex-col overflow-hidden border-2 border-gray-200 rounded-md p-0">
        <div className="px-3 py-1  bg-white">
          <Text size="sm" fw="medium" className="text-gray-800 mb-1 truncate">
            {title}
          </Text>
          <Text size="xs" className="text-gray-400 ">
            更新时间: {new Date(updated_at).toLocaleDateString('zh-CN')}
          </Text>
        </div>
        <div className="flex-1 mx-3 border-2 border-gray-200 rounded-md overflow-hidden bg-white">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
              fit="cover"
            />
          ) : (
            <div className="p-2 h-full overflow-hidden">
              <ResumePreview content={content} />
            </div>
          )}
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
        <div className="bg-white border-t-2 border-gray-200 overflow-hidden">
          <div
            ref={previewRef}
            className="rounded-lg overflow-auto"
            style={{ maxHeight: '70vh' }}
          >
            <ResumePreview content={content} />
          </div>

          <div className="p-4 border-t-2 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setPreviewModalOpen(false)}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
              size="md"
            >
              关闭
            </Button>
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
