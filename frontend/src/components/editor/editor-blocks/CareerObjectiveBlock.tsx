import { Card, Textarea, Button } from '@mantine/core';
import { Target, Sparkles, Settings } from 'lucide-react';
import type { ResumeContent } from '@/types/resume';

interface CareerObjectiveBlockProps {
  data: ResumeContent['careerObjective'];
  onChange: (data: ResumeContent['careerObjective']) => void;
}

export default function CareerObjectiveBlock({ data, onChange }: CareerObjectiveBlockProps) {
  return (
    <Card className="mb-4 border-none shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
            <Target size={18} className="text-yellow-600" />
          </div>
          <span className="font-medium text-gray-800">职业目标</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="AI优化"
          >
            <Sparkles size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
            title="设置"
          >
            <Settings size={14} />
          </Button>
        </div>
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
