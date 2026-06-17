import { Card, Text, Button, Group, Image } from '@mantine/core';
import { Eye, Plus } from 'lucide-react';
import type { Template } from '@/types/resume';

interface ResumeTemplateProps {
  templates: Template[];
  onSelect: (id: string) => void;
}

export default function ResumeTemplate({
  templates,
  onSelect,
}: ResumeTemplateProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {templates.map((template) => (
        <Card
          key={template.id}
          className="aspect-[3/4] flex flex-col overflow-hidden border-2 border-gray-200 rounded-md hover:shadow-md transition-all hover:border-blue-400"
        >
          {/* 缩略图区域 */}
          <div className="flex-1 bg-gray-50 flex items-center justify-center overflow-hidden">
            {template.thumbnail ? (
              <Image
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover"
                fit="cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Text size="sm">{template.name}</Text>
              </div>
            )}
          </div>

          {/* 信息区域 */}
          <div className="p-3 border-t bg-white">
            <Text size="sm" fw="medium" className="text-gray-800 mb-1 truncate">
              {template.name}
            </Text>
            <Text size="xs" className="text-gray-400 mb-3">
              {template.category}
            </Text>
            <Group gap={2} className="justify-around items-center">
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 border-2 rounded-full border-gray-500 text-gray-500 bg-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('预览模板:', template.id);
                }}
                title="预览"
              >
                <Eye size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 border-2 rounded-full border-gray-500 text-gray-500 bg-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(template.id);
                }}
                title="使用模板"
              >
                <Plus size={14} />
              </Button>
            </Group>
          </div>
        </Card>
      ))}
    </div>
  );
}
