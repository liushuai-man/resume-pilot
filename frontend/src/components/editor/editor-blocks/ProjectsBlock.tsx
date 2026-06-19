import { useState } from 'react';
import { Card, Input, Textarea, Button, Badge } from '@mantine/core';
import {
  FolderKanban,
  Plus,
  Trash2,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronUp,
  Tag,
} from 'lucide-react';
import type { Project } from '@/types/resume';

interface ProjectsBlockProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

export default function ProjectsBlock({ data, onChange }: ProjectsBlockProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    data.length > 0 ? data[0].id : null
  );

  const handleAdd = () => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      role: '',
      techStack: [],
      achievements: [],
    };
    onChange([...data, newProject]);
    setOpenAccordion(newProject.id);
  };

  const handleRemove = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  const handleChange = (id: string, field: keyof Project, value: string) => {
    onChange(
      data.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddTech = (id: string) => {
    onChange(
      data.map((item) =>
        item.id === id
          ? { ...item, techStack: [...(item.techStack || []), ''] }
          : item
      )
    );
  };

  const handleRemoveTech = (id: string, index: number) => {
    onChange(
      data.map((item) =>
        item.id === id
          ? {
              ...item,
              techStack: (item.techStack || []).filter((_, i) => i !== index),
            }
          : item
      )
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
              achievements: (item.achievements || []).map(
                (achievement: string, i: number) =>
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
                (_: string, i: number) => i !== index
              ),
            }
          : item
      )
    );
  };

  const techStack = (item: Project) => item.techStack || [];
  const achievements = (item: Project) => item.achievements || [];

  return (
    <Card className="mb-4 border-none shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <FolderKanban size={18} className="text-purple-600" />
          </div>
          <span className="font-medium text-gray-800">项目经验</span>
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
                <FolderKanban size={16} className="text-gray-400" />
                <div className="text-left">
                  <span className="font-medium text-gray-800">
                    {item.name || '未填写项目名称'}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    {item.role || '未填写角色'}
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
                        项目名称
                      </label>
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          handleChange(item.id, 'name', e.target.value)
                        }
                        size="sm"
                        placeholder="请输入项目名称"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        角色
                      </label>
                      <Input
                        value={item.role}
                        onChange={(e) =>
                          handleChange(item.id, 'role', e.target.value)
                        }
                        size="sm"
                        placeholder="如：前端开发"
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
                      项目描述
                    </label>
                    <Textarea
                      value={item.description}
                      onChange={(e) =>
                        handleChange(item.id, 'description', e.target.value)
                      }
                      size="sm"
                      placeholder="描述项目背景和目标..."
                      rows={3}
                    />
                  </div>

                  {/* 技术栈 */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Tag size={14} className="mr-1" />
                      技术栈
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {techStack(item).map((tech, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full"
                        >
                          <span className="font-medium text-sm">
                            {tech || '添加技术'}
                          </span>
                          <button
                            onClick={() => handleRemoveTech(item.id, index)}
                            className="ml-1 p-0.5 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <Trash2 size={12} className="text-gray-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-dashed border-gray-300 text-gray-500"
                      onClick={() => handleAddTech(item.id)}
                    >
                      <Plus size={14} className="mr-1" />
                      添加技术
                    </Button>
                  </div>

                  {/* 成就列表 */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      主要成果
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
                            placeholder="输入一项成果..."
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
                        添加成果
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
        添加项目经验
      </Button>
    </Card>
  );
}
