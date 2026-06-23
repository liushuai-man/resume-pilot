import { Card } from '@mantine/core';
import { Target } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';
import type { ResumeContent } from '@/types/resume';

interface CareerObjectiveBlockProps {
  data: ResumeContent['careerObjective'];
  onChange: (data: ResumeContent['careerObjective']) => void;
}

export default function CareerObjectiveBlock({
  data,
  onChange,
}: CareerObjectiveBlockProps) {
  return (
    <Card className="mb-3 border-none shadow-sm p-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-md bg-yellow-50 flex items-center justify-center">
          <Target size={14} className="text-yellow-600" />
        </div>
        <span className="font-medium text-gray-800">职业目标</span>
      </div>

      <RichTextEditor
        value={data || ''}
        onChange={onChange}
        placeholder="描述你的职业目标和期望..."
      />
    </Card>
  );
}
