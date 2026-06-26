import { useState } from 'react';
import { Card, Input, Button } from '@mantine/core';
import { Briefcase, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';
import AIInput from '../AIInput';
import type { Experience } from '@/types/resume';

interface ExperienceBlockProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export default function ExperienceBlock({
  data = [],
  onChange,
}: ExperienceBlockProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    data.length > 0 ? data[0].id : null
  );

  const getContextForItem = (item: Experience) => {
    return `公司: ${item.company || '未知'}, 职位: ${item.position || '未知'}`;
  };

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
    <Card className="mb-3 border-none shadow-sm p-2">
      <div className="space-y-2">
        {data.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors"
              onClick={() =>
                setOpenAccordion(openAccordion === item.id ? null : item.id)
              }
            >
              <div className="flex items-center gap-2">
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
                {openAccordion === item.id ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            </button>

            {openAccordion === item.id && (
              <div className="px-3 pb-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
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
                <div className="grid grid-cols-2 gap-2">
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
                  <label className="text-xs font-medium text-gray-600 mb-2 block">
                    工作职责
                  </label>
                  <RichTextEditor
                    value={item.description || ''}
                    onChange={(value) =>
                      handleChange(item.id, 'description', value)
                    }
                    placeholder="描述你的主要工作职责..."
                    targetField="工作经历描述"
                    context={`公司: ${item.company || '未知'}, 职位: ${item.position || '未知'}`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    主要成就
                  </label>
                  <div className="space-y-2">
                    {achievements(item).map((achievement, index) => (
                      <div key={index} className="flex gap-2">
                        <AIInput
                          value={achievement}
                          onChange={(value) =>
                            handleAchievementChange(item.id, index, value)
                          }
                          placeholder="输入一项成就..."
                          targetField="工作经历成就"
                          context={getContextForItem(item)}
                          size="sm"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="xs"
                          className="p-1.5 bg-white text-blue-500 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                          onClick={() =>
                            handleRemoveAchievement(item.id, index)
                          }
                        >
                          <Trash2 size={12} />
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

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="xs"
                    className="p-1.5 bg-white text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 size={12} className="mr-1" />
                    删除
                  </Button>
                </div>
              </div>
            )}
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
        添加工作经历
      </Button>
    </Card>
  );
}
