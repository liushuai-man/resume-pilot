import { useState } from 'react';
import { Card, Input, Button, Badge } from '@mantine/core';
import { Wrench, Plus, Trash2, Sparkles, Settings, Zap } from 'lucide-react';
import type { Skill } from '@/types/resume';

interface SkillsBlockProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

// 常用技能推荐
const commonSkills = [
  { name: 'React', category: '前端' },
  { name: 'Vue', category: '前端' },
  { name: 'TypeScript', category: '前端' },
  { name: 'JavaScript', category: '前端' },
  { name: 'Node.js', category: '后端' },
  { name: 'Python', category: '后端' },
  { name: 'Java', category: '后端' },
  { name: 'Go', category: '后端' },
  { name: 'MySQL', category: '数据库' },
  { name: 'Redis', category: '数据库' },
  { name: 'MongoDB', category: '数据库' },
  { name: 'Docker', category: '运维' },
  { name: 'Git', category: '工具' },
  { name: 'Webpack', category: '工具' },
  { name: 'Vite', category: '工具' },
];

const categories = ['前端', '后端', '数据库', '运维', '工具'];

export default function SkillsBlock({ data, onChange }: SkillsBlockProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      name: inputValue.trim(),
      level: '熟练',
      category: '前端',
    };
    onChange([...data, newSkill]);
    setInputValue('');
  };

  const handleRemove = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  const handleLevelChange = (id: string, level: string) => {
    onChange(data.map((item) => (item.id === id ? { ...item, level } : item)));
  };

  const handleAddCommonSkill = (skillName: string, category: string) => {
    if (data.find((s) => s.name === skillName)) return;
    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      name: skillName,
      level: '熟练',
      category,
    };
    onChange([...data, newSkill]);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case '精通':
        return 'green';
      case '熟练':
        return 'blue';
      case '了解':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <Card className="mb-4 border-none shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
            <Wrench size={18} className="text-cyan-600" />
          </div>
          <span className="font-medium text-gray-800">专业技能</span>
          <Badge variant="outline" size="sm" className="text-gray-500">
            {data.length}
          </Badge>
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

      {/* 添加技能输入框 */}
      <div className="flex gap-2 mb-4">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          size="sm"
          placeholder="输入技能名称..."
          className="flex-1"
        />
        <Button size="sm" onClick={handleAdd}>
          <Plus size={14} className="mr-1" />
          添加
        </Button>
      </div>

      {/* 常用技能推荐 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className="text-yellow-500" />
          <span className="text-sm text-gray-500">快速添加</span>
        </div>
        {categories.map((category) => (
          <div key={category} className="mb-2">
            <span className="text-xs text-gray-400 mb-1 block">{category}</span>
            <div className="flex flex-wrap gap-1">
              {commonSkills
                .filter((s) => s.category === category)
                .map((skill) => (
                  <Button
                    key={skill.name}
                    variant="outline"
                    size="xs"
                    className="border-gray-200 text-gray-600 hover:bg-gray-50"
                    onClick={() =>
                      handleAddCommonSkill(skill.name, skill.category)
                    }
                    disabled={data.some((s) => s.name === skill.name)}
                  >
                    {skill.name}
                  </Button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* 已添加的技能 */}
      <div className="flex flex-wrap gap-2">
        {data.map((skill) => (
          <div
            key={skill.id}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full"
          >
            <span className="font-medium text-sm">{skill.name}</span>
            <Badge
              size="xs"
              color={getLevelColor(skill.level || '熟练')}
              className="ml-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                const levels = ['了解', '熟练', '精通'];
                const currentIndex = levels.indexOf(skill.level || '熟练');
                const nextIndex = (currentIndex + 1) % levels.length;
                handleLevelChange(skill.id, levels[nextIndex]);
              }}
            >
              {skill.level}
            </Badge>
            <button
              onClick={() => handleRemove(skill.id)}
              className="ml-1 p-0.5 hover:bg-gray-200 rounded-full transition-colors"
            >
              <Trash2 size={12} className="text-gray-400" />
            </button>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Wrench size={32} className="mx-auto mb-2 opacity-50" />
          <p>暂无技能，添加一些技能吧</p>
        </div>
      )}
    </Card>
  );
}
