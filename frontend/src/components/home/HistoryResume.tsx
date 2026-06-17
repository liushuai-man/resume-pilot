import { useState } from 'react';
import { Card, Text, Button, Group, Image, Modal } from '@mantine/core';
import {
  Eye,
  Edit3,
  Download,
  Trash2,
  FileText,
  X,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Resume } from '@/types/resume';
import { notification } from '@/components/common/Notification';
import ResumePreview from '@/components/home/ResumePreview';
import { resumeApi } from '@/api/home.api';
import { generateResumeHtml } from '@/utils/resumeToHtml';

interface HistoryResumeProps {
  resume: Resume;
  thumbnail?: string;
}

export default function HistoryResume({
  resume,
  thumbnail,
}: HistoryResumeProps) {
  const { id, title, content, updated_at } = resume;
  const navigate = useNavigate();

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handlePreview = () => {
    setPreviewModalOpen(true);
  };

  const handleEdit = () => {
    navigate(`/resume/${id}`);
  };

  const handleExport = async () => {
    try {
      notification.info('正在生成简历...');
      const result = await resumeApi.getResumeById(id);

      if (result.code === 200) {
        const resumeData = result.data;
        const htmlContent = generateResumeHtml(
          resumeData.content,
          resumeData.title
        );

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        notification.success('简历导出成功');
      } else {
        notification.error(result.message || '导出失败');
      }
    } catch (error) {
      notification.error('导出失败，请稍后重试');
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
        window.location.reload();
      } else {
        notification.error(result.message || '删除失败');
      }
    } catch (error) {
      notification.error('删除失败，请稍后重试');
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <>
      <Card className="aspect-[3/4] flex flex-col overflow-hidden border-2 border-gray-200 rounded-md">
        <div className="flex-1 bg-gray-50 flex items-center justify-center overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
              fit="cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <FileText size={32} />
              <Text size="xs" mt={1}>
                暂无预览
              </Text>
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-white">
          <Text size="sm" fw="medium" className="text-gray-800 mb-1 truncate">
            {title}
          </Text>
          <Text size="xs" className="text-gray-400 mb-3">
            更新时间: {new Date(updated_at).toLocaleDateString('zh-CN')}
          </Text>
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
              className="w-8 h-8 p-0 border-2 rounded-full border-gray-500 text-gray-500 bg-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
              onClick={handleExport}
              title="导出"
            >
              <Download size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 border-2 rounded-full border-gray-500 text-gray-500 bg-white hover:bg-red-500 hover:text-white hover:border-red-500"
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
        scrollAreaProps={{ style: { maxHeight: '80vh' } }}
      >
        <div className="relative overflow-auto max-h-[75vh]">
          <ResumePreview content={content} />
        </div>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="确认删除"
        size="sm"
      >
        <div className="flex flex-col items-center text-center py-4">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <Text size="sm" className="text-gray-600 mb-6">
            确定要删除这份简历吗？此操作无法撤销。
          </Text>
          <Group gap={4} className="justify-center w-full">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              variant="filled"
              color="red"
              onClick={confirmDelete}
              className="flex-1"
            >
              确认删除
            </Button>
          </Group>
        </div>
      </Modal>
    </>
  );
}
