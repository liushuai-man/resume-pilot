import { Card } from '@mantine/core';
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
      <RichTextEditor
        value={data || ''}
        onChange={onChange}
        placeholder="描述你的职业目标和期望..."
        targetField="职业目标"
      />
    </Card>
  );
}
