import { useState } from 'react';
import { Card, Input, Button } from '@mantine/core';
import {
  FolderKanban,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
} from 'lucide-react';
import RichTextEditor from '../RichTextEditor';
import AIInput from '../AIInput';
import type { Project } from '@/types/resume';

interface ProjectsBlockProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

export default function ProjectsBlock({
  data = [],
  onChange,
}: ProjectsBlockProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    data.length > 0 ? data[0].id : null
  );

  const getContextForItem = (item: Project) => {
    return `项目: ${item.name || '未知'}, 角色: ${item.role || '未知'}, 技术栈: ${(item.techStack || []).join(', ') || '未知'}`;
  };

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
                {openAccordion === item.id ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            </button>

            {openAccordion === item.id && (
              <div className="px-3 pb-3 pt-1 space-y-4">
                <div className="grid grid-cols-2 gap-2">
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
                    项目描述
                  </label>
                  <RichTextEditor
                    value={item.description || ''}
                    onChange={(value) =>
                      handleChange(item.id, 'description', value)
                    }
                    placeholder="描述项目背景和目标..."
                    targetField="项目描述"
                    context={`项目: ${item.name || '未知'}, 角色: ${item.role || '未知'}`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Tag size={14} className="mr-1" />
                    技术栈
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {techStack(item).map((tech, index) => (
                      <div
                        key={index}
                        className="w-[140px] flex items-center pl-2 pr-1 py-1 bg-gray-50 border border-gray-200 rounded-full"
                      >
                        <input
                          type="text"
                          value={tech}
                          onChange={(e) => {
                            const newTechStack = [...(item.techStack || [])];
                            newTechStack[index] = e.target.value;
                            onChange(
                              data.map((d) =>
                                d.id === item.id
                                  ? { ...d, techStack: newTechStack }
                                  : d
                              )
                            );
                          }}
                          className="flex-1 min-w-0 font-medium text-sm bg-transparent outline-none truncate"
                          placeholder="技术栈"
                        />
                        <button
                          onClick={() => handleRemoveTech(item.id, index)}
                          className="flex-shrink-0 hover:bg-gray-200 rounded-full transition-colors p-0.5"
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

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    主要成果
                  </label>
                  <div className="space-y-2">
                    {achievements(item).map((achievement, index) => (
                      <div key={index} className="flex gap-2">
                        <AIInput
                          value={achievement}
                          onChange={(value) =>
                            handleAchievementChange(item.id, index, value)
                          }
                          placeholder="输入一项成果..."
                          targetField="项目成果"
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
                      添加成果
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
        添加项目经验
      </Button>
    </Card>
  );
}
