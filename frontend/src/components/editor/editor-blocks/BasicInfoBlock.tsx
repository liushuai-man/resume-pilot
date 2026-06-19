import { useState } from 'react';
import { Card, Input, Textarea, Button, Avatar } from '@mantine/core';
import { User, Sparkles, Settings, Plus, X } from 'lucide-react';
import type { BasicInfo } from '@/types/resume';

interface BasicInfoBlockProps {
  data: BasicInfo;
  onChange: (data: BasicInfo) => void;
}

export default function BasicInfoBlock({
  data,
  onChange,
}: BasicInfoBlockProps) {
  const [customFields, setCustomFields] = useState<
    { id: string; label: string; value: string }[]
  >([]);

  const handleChange = (field: keyof BasicInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleAddCustomField = () => {
    const newField = {
      id: `custom-${Date.now()}`,
      label: '',
      value: '',
    };
    setCustomFields([...customFields, newField]);
  };

  const handleCustomFieldChange = (
    index: number,
    field: 'label' | 'value',
    value: string
  ) => {
    const newFields = [...customFields];
    newFields[index][field] = value;
    setCustomFields(newFields);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  return (
    <Card className="mb-4 border-none shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <User size={18} className="text-blue-600" />
          </div>
          <span className="font-medium text-gray-800">基础信息</span>
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

      {/* 头像 */}
      <div className="flex items-center gap-4 mb-4">
        <Avatar size="xl" className="border-2 border-gray-200">
          {data.name?.charAt(0) || '?'}
        </Avatar>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-300 text-gray-600"
        >
          <Plus size={14} className="mr-1" />
          上传头像
        </Button>
      </div>

      {/* 表单字段 */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              姓名
            </label>
            <Input
              value={data.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              size="sm"
              placeholder="请输入姓名"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              职位
            </label>
            <Input
              value={data.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              size="sm"
              placeholder="如：前端开发工程师"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            电话
          </label>
          <Input
            value={data.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            size="sm"
            placeholder="请输入手机号"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            邮箱
          </label>
          <Input
            value={data.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            size="sm"
            placeholder="请输入邮箱"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              地址
            </label>
            <Input
              value={data.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              size="sm"
              placeholder="请输入地址"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              个人网站
            </label>
            <Input
              value={data.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              size="sm"
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            个人简介
          </label>
          <Textarea
            value={data.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            size="sm"
            placeholder="请简要介绍自己..."
            rows={3}
          />
        </div>

        {/* 自定义字段 */}
        {customFields.length > 0 && (
          <div className="space-y-2">
            {customFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  value={field.label}
                  onChange={(e) =>
                    handleCustomFieldChange(index, 'label', e.target.value)
                  }
                  size="sm"
                  placeholder="字段名"
                  className="flex-1"
                />
                <Input
                  value={field.value}
                  onChange={(e) =>
                    handleCustomFieldChange(index, 'value', e.target.value)
                  }
                  size="sm"
                  placeholder="字段值"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  color="red"
                  onClick={() => handleRemoveCustomField(index)}
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed border-gray-300 text-gray-500 hover:bg-gray-50"
          onClick={handleAddCustomField}
        >
          <Plus size={14} className="mr-1" />
          添加自定义字段
        </Button>
      </div>
    </Card>
  );
}
