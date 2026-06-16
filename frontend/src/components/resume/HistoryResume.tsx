import { Card, Text, Button, Group } from '@mantine/core';
import { Eye, Edit3, Download, Trash2 } from 'lucide-react';
import { Resume } from '@/types/index';
export default function HistoryResume({ 
  resume, 
}: { resume: Resume }) {
  const { id, title, createTime } = resume;




  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="aspect-[3/4] flex flex-col">
          <div className="flex-1 bg-gray-50 rounded-lg m-3 flex items-center justify-center">
            <Text size="sm" color="dimmed">简历预览区域</Text>
          </div>
          <div className="p-3 border-t">
            <Text size="sm" fw="medium" className="text-gray-800 mb-1">{resume.title}</Text>
            <Text size="xs" className="text-gray-400 mb-3">更新时间: {resume.updateTime}</Text>
            <Group gap={1} className="justify-center">
              <Button 
                variant="ghost" 
                size="xs" 
                className="text-gray-500 hover:text-blue-500"
                onClick={() => onPreview(resume.id)}
              >
                <Eye size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="xs" 
                className="text-gray-500 hover:text-blue-500"
                onClick={() => onEdit(resume.id)}
              >
                <Edit3 size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="xs" 
                className="text-gray-500 hover:text-blue-500"
                onClick={() => onExport(resume.id)}
              >
                <Download size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="xs" 
                className="text-gray-500 hover:text-red-500"
                onClick={() => onDelete(resume.id)}
              >
                <Trash2 size={14} />
              </Button>
            </Group>
          </div>
        </Card>
      ))}
    </div>
  );
}