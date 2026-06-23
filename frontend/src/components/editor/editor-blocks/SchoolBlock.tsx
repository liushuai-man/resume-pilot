import { useState } from 'react';
import { Card, Input, Textarea, Button } from '@mantine/core';
import {
  GraduationCap,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { CampusExperience } from '@/types/resume';

interface CampusExperienceBlockProps {
  data: CampusExperience[];
  onChange: (data: CampusExperience[]) => void;
}

export default function CampusExperienceBlock({
  data = [],
  onChange,
}: CampusExperienceBlockProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    data.length > 0 ? data[0].id : null
  );

  const handleAdd = () => {
    const newCampusExperience: CampusExperience = {
      id: `campus-${Date.now()}`,
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    onChange([...data, newCampusExperience]);
    setOpenAccordion(newCampusExperience.id);
  };

  const handleRemove = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  const handleChange = (
    id: string,
    field: keyof CampusExperience,
    value: string
  ) => {
    onChange(
      data.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAchievementChange = (
    id: string,
    index: number,
    value: string
  ) => {
    onChange(
      data.map((item) => {
        if (item.id === id) {
          const achievements = [...(item.achievements || [])];
          achievements[index] = value;
          return { ...item, achievements };
        }
        return item;
      })
    );
  };

  const handleAddAchievement = (id: string) => {
    onChange(
      data.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            achievements: [...(item.achievements || []), ''],
          };
        }
        return item;
      })
    );
  };

  const handleRemoveAchievement = (id: string, index: number) => {
    onChange(
      data.map((item) => {
        if (item.id === id) {
          const achievements = [...(item.achievements || [])];
          achievements.splice(index, 1);
          return { ...item, achievements };
        }
        return item;
      })
    );
  };

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
                <GraduationCap size={16} className="text-gray-400" />
                <div className="text-left">
                  <span className="font-medium text-gray-800">
                    {item.name || '未填写校园经历名称'}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    {item.role || '未填写职位'}
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
                      经历名称
                    </label>
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        handleChange(item.id, 'name', e.target.value)
                      }
                      size="sm"
                      placeholder="请输入经历名称"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      担任职位
                    </label>
                    <Input
                      value={item.role}
                      onChange={(e) =>
                        handleChange(item.id, 'role', e.target.value)
                      }
                      size="sm"
                      placeholder="如：部长"
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
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-xs font-medium text-gray-600">
                      职责描述
                    </label>
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
                    value={item.description}
                    onChange={(e) =>
                      handleChange(item.id, 'description', e.target.value)
                    }
                    size="sm"
                    placeholder="描述你的职责和贡献..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    主要贡献
                  </label>
                  <div className="space-y-2">
                    {(item.achievements || []).map((achievement, index) => (
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
                          placeholder={`贡献 ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="xs"
                          className="p-1.5 bg-white text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
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
                      className="w-full border-dashed border-gray-300 text-gray-500 hover:bg-gray-50"
                      onClick={() => handleAddAchievement(item.id)}
                    >
                      <Plus size={14} className="mr-1" />
                      添加贡献
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
        添加校园经历
      </Button>
    </Card>
  );
}
