import { Card, Text, Button, Modal, Badge } from '@mantine/core';
import { Eye, Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { LAYOUT_TEMPLATES } from '@/utils/template-demo-data';
import ThumbnailPreview from '@/components/home/ThumbnailPreview';
import { DocumentPreview } from '@/components/preview/DocumentPreview';
import { contentToDocument } from '@/utils/resume-migration';

interface ResumeTemplateProps {
  onSelect: (layout: string) => void;
  loading?: boolean;
}

export default function ResumeTemplate({
  onSelect,
  loading = false,
}: ResumeTemplateProps) {
  const [previewTemplate, setPreviewTemplate] = useState<
    (typeof LAYOUT_TEMPLATES)[0] | null
  >(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (template: (typeof LAYOUT_TEMPLATES)[0]) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewTemplate(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {LAYOUT_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className={`group relative flex flex-col h-full overflow-hidden border border-gray-200 transition-all duration-300 cursor-pointer hover:shadow-md ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            p={0}
          >
            {/* CSS 缩放缩略图 */}
            <div className="flex-1 min-h-0 overflow-hidden bg-white">
              <ThumbnailPreview
                content={template.demoContent}
                templateStyle={template.styleConfig}
                templateLayout={template.layout}
              />
            </div>

            {/* 模板信息 */}
            <div className="px-3 py-2 bg-white border-t border-gray-100">
              <Text
                size="sm"
                fw="semibold"
                className="text-gray-800 mb-1 truncate"
              >
                {template.name}
              </Text>
              <Text size="xs" className="text-gray-400 truncate">
                {template.description}
              </Text>
            </div>

            {/* Hover 操作层 */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
              <Button
                variant="filled"
                size="xs"
                className="bg-white text-gray-700 hover:bg-gray-100 h-8 px-4"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(template);
                }}
                disabled={loading}
              >
                <Eye size={13} className="mr-1" />
                预览
              </Button>
              <Button
                variant="filled"
                size="xs"
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-4"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(template.layout);
                }}
                disabled={loading}
              >
                <Plus size={13} className="mr-1" />
                新建
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* 预览弹窗 */}
      <Modal
        opened={isPreviewOpen}
        onClose={handleClosePreview}
        size="xl"
        title={
          <div className="flex items-center gap-2">
            <Badge variant="light" className="bg-blue-50 text-blue-600">
              {previewTemplate?.name}
            </Badge>
          </div>
        }
        centered
        className="max-w-4xl"
      >
        {previewTemplate && (
          <TemplatePreviewModal
            template={previewTemplate}
            onSelect={() => {
              onSelect(previewTemplate.layout);
              handleClosePreview();
            }}
          />
        )}
      </Modal>
    </>
  );
}

/** 模板预览弹窗内容 - 使用新渲染器 */
function TemplatePreviewModal({
  template,
  onSelect,
}: {
  template: (typeof LAYOUT_TEMPLATES)[0];
  onSelect: () => void;
}) {
  const document = useMemo(
    () =>
      contentToDocument(
        template.demoContent,
        template.styleConfig,
        template.layout
      ),
    [template]
  );

  return (
    <div className="bg-white border-t-2 border-gray-200 overflow-hidden">
      <div
        className="overflow-auto"
        style={{
          maxHeight: '70vh',
        }}
      >
        <DocumentPreview document={document} />
      </div>

      <div className="p-4 border-t-2 flex justify-end">
        <Button
          onClick={onSelect}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-10"
          size="md"
        >
          使用此模板
        </Button>
      </div>
    </div>
  );
}
