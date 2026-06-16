import { Card, Text } from '@mantine/core';
import { Template } from '@/types/index';

interface ResumeTemplateProps {
  templates: Template[];
  onSelect?: (template_id: string) => void;
}

export default function ResumeTemplate({
  templates,
  onSelect,
}: ResumeTemplateProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {templates.map((template) => (
        <Card
          key={template.id}
          className="aspect-[3/4] cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelect?.(template.id)}
        >
          <div
            className={`flex-1 rounded-lg m-3 flex items-center justify-center ${
              template.color === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
            }`}
          >
            <Text size="sm">{template.name}</Text>
          </div>
          <div className="p-3 border-t">
            <Text size="sm" fw="medium" className="text-gray-800 mb-2">
              {template.name}
            </Text>
            <div className="flex flex-wrap gap-1">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
