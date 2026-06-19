import { useState } from 'react';
import { Card, Input, Textarea, Button, Badge } from '@mantine/core';
import {
  Users,
  Plus,
  Trash2,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Club } from '@/types/resume';

interface ClubsBlockProps {
  data: Club[];
  onChange: (data: Club[]) => void;
}

export default function ClubsBlock({ data, onChange }: ClubsBlockProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    data.length > 0 ? data[0].id : null
  );

  const handleAdd = () => {
    const newClub: Club = {
      id: `club-${Date.now()}`,
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
      achievements: [],
    };
    onChange([...data, newClub]);
    setOpenAccordion(newClub.id);
  };

  const handleRemove = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  const handleChange = (id: string, field: keyof Club, value: string) => {
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

  const achievements = (item: Club) => item.achievements || [];

  return (
    <Card className="mb-4 border-none shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Users size={18} className="text-indigo-600" />
          </div>
          <span className="font-medium text-gray-800">社团经历</span>
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
                <Users size={16} className="text-gray-400" />
                <div className="text-left">
                  <span className="font-medium text-gray-800">
                    {item.name || '未填写社团名称'}
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
                        社团名称
                      </label>
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          handleChange(item.id, 'name', e.target.value)
                        }
                        size="sm"
                        placeholder="请输入社团名称"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        职位
                      </label>
                      <Input
                        value={item.role}
                        onChange={(e) =>
                          handleChange(item.id, 'role', e.target.value)
                        }
                        size="sm"
                        placeholder="如：社长"
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
                      职责描述
                    </label>
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
                            placeholder="输入一项贡献..."
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
                        添加贡献
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
        添加社团经历
      </Button>
    </Card>
  );
}
