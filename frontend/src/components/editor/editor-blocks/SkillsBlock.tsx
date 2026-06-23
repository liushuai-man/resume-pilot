import { Card, Input, Button } from '@mantine/core';
import { Wrench, Plus, Trash2 } from 'lucide-react';
import type { Skill } from '@/types/resume';

interface SkillsBlockProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

export default function SkillsBlock({ data = [], onChange }: SkillsBlockProps) {
  const handleAdd = () => {
    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      name: '',
    };
    onChange([...data, newSkill]);
  };

  const handleRemove = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  const handleChange = (id: string, value: string) => {
    onChange(
      data.map((item) => (item.id === id ? { ...item, name: value } : item))
    );
  };

  return (
    <Card className="mb-3 border-none shadow-sm p-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-md bg-cyan-50 flex items-center justify-center">
          <Wrench size={14} className="text-cyan-600" />
        </div>
        <span className="font-medium text-gray-800">专业技能</span>
      </div>

      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <span className="text-gray-400">•</span>
            <Input
              value={item.name}
              onChange={(e) => handleChange(item.id, e.target.value)}
              size="sm"
              placeholder="请输入技能"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="xs"
              className="p-1.5 bg-white text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
              onClick={() => handleRemove(item.id)}
            >
              <Trash2 size={12} />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full mt-2 border-dashed border-gray-300 text-gray-500 hover:bg-gray-50"
        onClick={handleAdd}
      >
        <Plus size={14} className="mr-1" />
        添加技能
      </Button>
    </Card>
  );
}