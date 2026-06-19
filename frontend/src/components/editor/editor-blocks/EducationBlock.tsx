import { useState } from 'react';
import { Card, Input, Textarea, Button, Badge } from '@mantine/core';
import {
  GraduationCap,
  Plus,
  Trash2,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Education } from '@/types/resume';

interface EducationBlockProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export default function EducationBlock({
  data,
  onChange,
}: EducationBlockProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    data.length > 0 ? data[0].id : null
  );

  const handleAdd = () => {
    const newEducation: Education = {
      id: `edu-${Date.now()}`,
      school: '',
      degree: '',
      major: '',
      startDate: '',
      endDate: '',
      description: '',
      gpa: '',
    };
    onChange([...data, newEducation]);
    setOpenAccordion(newEducation.id);
  };

  const handleRemove = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  const handleChange = (id: string, field: keyof Education, value: string) => {
    onChange(
      data.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <Card className="mb-4 border-none shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <GraduationCap size={18} className="text-green-600" />
          </div>
          <span className="font-medium text-gray-800">教育经历</span>
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
                <GraduationCap size={16} className="text-gray-400" />
                <div className="text-left">
                  <span className="font-medium text-gray-800">
                    {item.school || '未填写学校'}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    {item.major || '未填写专业'}
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
                        学校名称
                      </label>
                      <Input
                        value={item.school}
                        onChange={(e) =>
                          handleChange(item.id, 'school', e.target.value)
                        }
                        size="sm"
                        placeholder="请输入学校名称"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        学历
                      </label>
                      <Input
                        value={item.degree}
                        onChange={(e) =>
                          handleChange(item.id, 'degree', e.target.value)
                        }
                        size="sm"
                        placeholder="如：本科"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      专业
                    </label>
                    <Input
                      value={item.major}
                      onChange={(e) =>
                        handleChange(item.id, 'major', e.target.value)
                      }
                      size="sm"
                      placeholder="请输入专业"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
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
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        GPA
                      </label>
                      <Input
                        value={item.gpa}
                        onChange={(e) =>
                          handleChange(item.id, 'gpa', e.target.value)
                        }
                        size="sm"
                        placeholder="如：3.8/4.0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      专业描述
                    </label>
                    <Textarea
                      value={item.description}
                      onChange={(e) =>
                        handleChange(item.id, 'description', e.target.value)
                      }
                      size="sm"
                      placeholder="描述你的专业学习情况..."
                      rows={3}
                    />
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
        添加教育经历
      </Button>
    </Card>
  );
}
