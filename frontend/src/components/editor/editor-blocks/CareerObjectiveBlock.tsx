import { Card, Textarea, Button } from '@mantine/core';
import { Target, Sparkles } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-yellow-50 flex items-center justify-center">
            <Target size={14} className="text-yellow-600" />
          </div>
          <span className="font-medium text-gray-800">职业目标</span>
        </div>
        <Button
          variant="ghost"
          size="xs"
          className="p-0.5 text-blue-500 hover:text-blue-300 hover:bg-white bg-white border-none"
          title="AI补全"
        >
          <Sparkles size={12} />
        </Button>
      </div>

      <Textarea
        value={data || ''}
        onChange={(e) => onChange(e.target.value)}
        size="sm"
        placeholder="描述你的职业目标和期望..."
        rows={4}
      />
    </Card>
  );
}