import { useState } from 'react';
import { TextInput } from './EditorCommon';
import type { SectionEditorProps } from './EditorCommon';

function generateItemId() {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

export function SkillEditor({ data, onChange }: SectionEditorProps) {
  const items = data || [];
  const [newSkill, setNewSkill] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const newItem = {
      id: generateItemId(),
      name: newSkill.trim(),
      level: 'intermediate' as const,
      category: newCategory.trim() || undefined,
    };
    onChange([...items, newItem]);
    setNewSkill('');
    setNewCategory('');
  };

  const updateSkill = (index: number, updates: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange(newItems);
  };

  const removeSkill = (index: number) => {
    onChange(items.filter((_: any, i: number) => i !== index));
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <TextInput
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="技能名称"
            style={{ flex: 1 }}
          />
          <TextInput
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="分类（选填）"
            style={{ width: '120px' }}
          />
          <button
            onClick={addSkill}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              whiteSpace: 'nowrap',
            }}
          >
            添加
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
          按回车快速添加
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item: any, index: number) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
            }}
          >
            <span style={{ flex: 1, fontSize: '14px', color: '#374151' }}>
              {item.name}
            </span>
            {item.category && (
              <span
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  backgroundColor: '#e5e7eb',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {item.category}
              </span>
            )}
            <select
              value={item.level || 'intermediate'}
              onChange={(e) => updateSkill(index, { level: e.target.value })}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px',
                backgroundColor: 'white',
              }}
            >
              <option value="beginner">入门</option>
              <option value="intermediate">熟练</option>
              <option value="advanced">精通</option>
              <option value="expert">专家</option>
            </select>
            <button
              onClick={() => removeSkill(index)}
              style={{
                color: '#ef4444',
                fontSize: '18px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                lineHeight: 1,
                padding: '0 4px',
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '24px',
            color: '#9ca3af',
            fontSize: '13px',
          }}
        >
          暂无技能，添加你的第一个技能吧
        </div>
      )}
    </div>
  );
}
