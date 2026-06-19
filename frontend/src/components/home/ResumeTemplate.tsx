import { Card, Text, Button, Group, Modal, Badge } from '@mantine/core';
import { Eye, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import type { Template } from '@/types/resume';

interface ResumeTemplateProps {
  templates: Template[];
  onSelect: (id: string) => void;
  loading?: boolean;
}

export default function ResumeTemplate({
  templates,
  onSelect,
  loading = false,
}: ResumeTemplateProps) {
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewTemplate(null);
  };

  const mockUsageCount = (id: string) => {
    const counts: Record<string, string> = {
      default: '12,345',
      professional: '8,923',
      creative: '6,542',
      modern: '4,123',
    };
    return counts[id] || '1,000';
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`group relative flex flex-col overflow-hidden border border-gray-100 rounded-lg transition-all duration-300 cursor-pointer ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            style={{ aspectRatio: '3/4.5' }}
            p={0}
          >
            <div
              className="flex-1 relative overflow-hidden"
              style={{ minHeight: '200px' }}
            >
              {template.thumbnail ? (
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-full"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'top center',
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  暂无图片
                </div>
              )}
            </div>

            <div className="px-2 pb-2 bg-white border-t border-gray-100">
              <Text
                size="xs"
                fw="semibold"
                className="text-gray-800 mb-1 truncate"
              >
                {template.name}
              </Text>
              <div className="flex items-center justify-between">
                <Badge
                  variant="light"
                  className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0"
                >
                  {template.category}
                </Badge>
                <div className="flex items-center text-gray-400 text-[10px]">
                  <Users size={10} className="mr-0.5" />
                  <span>{mockUsageCount(template.id)}</span>
                </div>
              </div>
              <div className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-12">
                <Group gap={1} className="pt-1 flex justify-between gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 h-6 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(template);
                    }}
                    disabled={loading}
                  >
                    <Eye size={11} className="mr-0.5" />
                    预览
                  </Button>
                  <Button
                    variant="filled"
                    size="xs"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-6 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(template.id);
                    }}
                    disabled={loading}
                  >
                    <Plus size={11} className="mr-0.5" />
                    新建
                  </Button>
                </Group>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>
        ))}
      </div>

      <Modal
        opened={isPreviewOpen}
        onClose={handleClosePreview}
        size="xl"
        title={
          <div className="flex items-center">
            <Badge variant="light" className="mr-2 bg-blue-50 text-blue-600">
              {previewTemplate?.category}
            </Badge>
            <Text size="lg" fw="bold">
              {previewTemplate?.name}
            </Text>
          </div>
        }
        centered
        className="max-w-4xl"
      >
        {previewTemplate && (
          <div className="bg-white border-t-2 border-gray-200  overflow-hidden">
              <div
                className="rounded-lg  overflow-auto"
                style={{
                  maxHeight: '70vh',
                  backgroundColor:
                    previewTemplate.style_config.backgroundColor || '#FFFFFF',
                }}
              >
                {previewTemplate.preview_image ? (
                  <img
                    src={previewTemplate.preview_image}
                    alt={previewTemplate.name}
                    className="w-full mt-4  border-gray-200"
                    style={{
                      objectFit: 'contain',
                      objectPosition: 'top center',
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                 暂无预览图片
                  </div>
                )}
              </div>

            <div className="p-4 border-t-2 flex justify-end">
              <Button
                onClick={() => {
                  onSelect(previewTemplate.id);
                  handleClosePreview();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-10"
                size="md"
              >
                使用此模板
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
