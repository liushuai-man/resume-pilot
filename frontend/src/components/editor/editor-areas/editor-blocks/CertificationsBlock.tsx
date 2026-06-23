import { useState } from 'react';
import { Card, Input, Button, Badge } from '@mantine/core';
import { Award, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Certification } from '@/types/resume';

interface CertificationsBlockProps {
  data: Certification[];
  onChange: (data: Certification[]) => void;
}

export default function CertificationsBlock({
  data = [],
  onChange,
}: CertificationsBlockProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    data.length > 0 ? data[0].id : null
  );

  const handleAdd = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: '',
      description: '',
    };
    onChange([...data, newCert]);
    setOpenAccordion(newCert.id);
  };

  const handleRemove = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  const handleChange = (
    id: string,
    field: keyof Certification,
    value: string
  ) => {
    onChange(
      data.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <Card className="mb-4 border-none shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
            <Award size={18} className="text-pink-600" />
          </div>
          <span className="font-medium text-gray-800">证书荣誉</span>
          <Badge variant="outline" size="sm" className="text-gray-500">
            {data.length}
          </Badge>
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
                <div className="w-6 h-6 rounded-md bg-pink-50 flex items-center justify-center">
                  <Award size={14} className="text-pink-600" />
                </div>
                <div className="text-left">
                  <span className="font-medium text-gray-800">
                    {item.name || '未填写证书名称'}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    {item.issuer || '未填写颁发机构'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">{item.date}</span>
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
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      证书名称
                    </label>
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        handleChange(item.id, 'name', e.target.value)
                      }
                      size="sm"
                      placeholder="请输入证书名称"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        颁发机构
                      </label>
                      <Input
                        value={item.issuer}
                        onChange={(e) =>
                          handleChange(item.id, 'issuer', e.target.value)
                        }
                        size="sm"
                        placeholder="请输入颁发机构"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        获得时间
                      </label>
                      <Input
                        value={item.date}
                        onChange={(e) =>
                          handleChange(item.id, 'date', e.target.value)
                        }
                        size="sm"
                        placeholder="YYYY-MM"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      证书描述
                    </label>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        handleChange(item.id, 'description', e.target.value)
                      }
                      size="sm"
                      placeholder="简要描述证书内容..."
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
        添加证书荣誉
      </Button>
    </Card>
  );
}
