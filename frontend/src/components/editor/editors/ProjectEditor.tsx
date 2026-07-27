import { useState } from 'react';
import { FormGroup, TextInput } from './EditorCommon';
import type { SectionEditorProps } from './EditorCommon';
import { AIFieldActions } from '../AIFieldActions';
import { MarkdownTextarea } from '../MarkdownTextarea';

function generateItemId() {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

export function ProjectEditor({
  sectionId,
  data,
  onChange,
}: SectionEditorProps) {
  const items = data || [];

  const addItem = () => {
    const newItem = {
      id: generateItemId(),
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
      techStack: [] as string[],
      achievements: [] as string[],
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, updates: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_: any, i: number) => i !== index));
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={addItem}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px dashed #d1d5db',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          + 添加项目经验
        </button>
      </div>

      {items.map((item: any, index: number) => (
        <ProjectItemEditor
          key={item.id}
          item={item}
          index={index}
          sectionId={sectionId}
          onUpdate={(updates) => updateItem(index, updates)}
          onRemove={() => removeItem(index)}
        />
      ))}
    </div>
  );
}

function ProjectItemEditor({
  item,
  index,
  sectionId,
  onUpdate,
  onRemove,
}: {
  item: any;
  index: number;
  sectionId: string;
  onUpdate: (updates: any) => void;
  onRemove: () => void;
}) {
  const [techInput, setTechInput] = useState('');

  const addTech = () => {
    if (!techInput.trim()) return;
    const newStack = [...(item.techStack || []), techInput.trim()];
    onUpdate({ techStack: newStack });
    setTechInput('');
  };

  const removeTech = (techIndex: number) => {
    const newStack = (item.techStack || []).filter(
      (_: string, i: number) => i !== techIndex
    );
    onUpdate({ techStack: newStack });
  };

  return (
    <div
      style={{
        marginBottom: '20px',
        padding: '12px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <span style={{ fontWeight: 500, fontSize: '14px', color: '#374151' }}>
          项目 {index + 1}
        </span>
        <button
          onClick={onRemove}
          style={{
            color: '#ef4444',
            fontSize: '12px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          删除
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <FormGroup label="项目名称">
          <TextInput
            value={item.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="项目名称"
          />
        </FormGroup>
        <FormGroup label="担任角色">
          <TextInput
            value={item.role}
            onChange={(e) => onUpdate({ role: e.target.value })}
            placeholder="例如：前端负责人"
          />
        </FormGroup>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <FormGroup label="开始时间">
          <TextInput
            type="month"
            value={item.startDate}
            onChange={(e) => onUpdate({ startDate: e.target.value })}
          />
        </FormGroup>
        <FormGroup label="结束时间">
          <TextInput
            type="month"
            value={item.endDate}
            onChange={(e) => onUpdate({ endDate: e.target.value })}
          />
        </FormGroup>
      </div>

      <FormGroup label="技术栈">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '8px',
          }}
        >
          {(item.techStack || []).map((tech: string, i: number) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                backgroundColor: '#e0e7ff',
                color: '#4f46e5',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            >
              {tech}
              <button
                onClick={() => removeTech(i)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4f46e5',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: 0,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <TextInput
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTech();
              }
            }}
            placeholder="输入技术栈，按回车添加"
            style={{ flex: 1 }}
          />
          <button
            onClick={addTech}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            添加
          </button>
        </div>
      </FormGroup>

      <FormGroup label="项目描述">
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              zIndex: 10,
            }}
          >
            <AIFieldActions
              sectionId={sectionId}
              fieldPath={`items.${index}.description`}
              content={item.description}
              onPolish={(result) => onUpdate({ description: result })}
              onComplete={(result) => onUpdate({ description: result })}
            />
          </div>
          <MarkdownTextarea
            value={item.description}
            onChange={(val) => onUpdate({ description: val })}
            placeholder="描述项目背景、你的职责和主要成果...支持 Markdown 语法"
            rows={4}
          />
        </div>
      </FormGroup>
    </div>
  );
}
