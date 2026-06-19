import { useState } from 'react';
import { Card, Input, Textarea, Button, Badge } from '@mantine/core';
import {
  Briefcase,
  Plus,
  Trash2,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Experience } from '@/types/resume';

interface ExperienceBlockProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export default function ExperienceBlock({
  data,
  onChange,
}: ExperienceBlockProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    data.length > 0 ? data[0].id : null
  );

  const handleAdd = () => {
    const newExperience: Experience = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      achievements: [],
    };
    onChange([...data, newExperience]);
    setOpenAccordion(newExperience.id);
  };

  const handleRemove = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  const handleChange = (id: string, field: keyof Experience, value: string) => {
    onChange(
      data.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddAchievement = (id: string) => {
    onChange(
      data.map((item) =>
        item.id === id
          ? { ...item, achievements: [...(item.achievements || []), ''] }
          : item
      )
    );
  };

  const handleAchievementChange = (
    id: string,
    index: number,
    value: string
  ) => {
    onChange(
      data.map((item) =>
        item.id === id
          ? {
              ...item,
              achievements: (item.achievements || []).map((achievement, i) =>
                i === index ? value : achievement
              ),
            }
          : item
      )
    );
  };

  const handleRemoveAchievement = (id: string, index: number) => {
    onChange(
      data.map((item) =>
        item.id === id
          ? {
              ...item,
              achievements: (item.achievements || []).filter(
                (_, i) => i !== index
              ),
            }
          : item
      )
    );
  };

  const achievements = (item: Experience) => item.achievements || [];

  return (
    <Card className="mb-4 border-none shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <Briefcase size={18} className="text-orange-600" />
          </div>
          <span className="font-medium text-gray-800">工作经历</span>
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

      <div className="space-y-2">
        {data.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
              onClick={() =>
                setOpenAccordion(openAccordion === item.id ? null : item.id)
              }
            >
              <div className="flex items-center gap-3">
                <Briefcase size={16} className="text-gray-400" />
                <div className="text-left">
                  <span className="font-medium text-gray-800">
                    {item.company || '未填写公司'}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    {item.position || '未填写职位'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">
                  {item.startDate} - {item.endDate || '至今'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.id);
                  }}
                >
                  <Trash2 size={14} />
                </Button>
                {openAccordion === item.id ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            </button>

            {openAccordion === item.id && (
              <div className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        公司名称
                      </label>
                      <Input
                        value={item.company}
                        onChange={(e) =>
                          handleChange(item.id, 'company', e.target.value)
                        }
                        size="sm"
                        placeholder="请输入公司名称"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        职位
                      </label>
                      <Input
                        value={item.position}
                        onChange={(e) =>
                          handleChange(item.id, 'position', e.target.value)
                        }
                        size="sm"
                        placeholder="请输入职位"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        开始时间
                      </label>
                      <Input
                        value={item.startDate}
                        onChange={(e) =>
                          handleChange(item.id, 'startDate', e.target.value)
                        }
                        size="sm"
                        placeholder="YYYY-MM"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        结束时间
                      </label>
                      <Input
                        value={item.endDate}
                        onChange={(e) =>
                          handleChange(item.id, 'endDate', e.target.value)
                        }
                        size="sm"
                        placeholder="YYYY-MM"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      工作职责
                    </label>
                    <Textarea
                      value={item.description}
                      onChange={(e) =>
                        handleChange(item.id, 'description', e.target.value)
                      }
                      size="sm"
                      placeholder="描述你的主要工作职责..."
                      rows={3}
                    />
                  </div>

                  {/* 成就列表 */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      主要成就
                    </label>
                    <div className="space-y-2">
                      {achievements(item).map((achievement, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={achievement}
                            onChange={(e) =>
                              handleAchievementChange(
                                item.id,
                                index,
                                e.target.value
                              )
                            }
                            size="sm"
                            placeholder="输入一项成就..."
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            color="red"
                            onClick={() =>
                              handleRemoveAchievement(item.id, index)
                            }
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed border-gray-300 text-gray-500"
                        onClick={() => handleAddAchievement(item.id)}
                      >
                        <Plus size={14} className="mr-1" />
                        添加成就
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full mt-3 border-dashed border-gray-300 text-gray-500 hover:bg-gray-50"
        onClick={handleAdd}
      >
        <Plus size={14} className="mr-1" />
        添加工作经历
      </Button>
    </Card>
  );
}
