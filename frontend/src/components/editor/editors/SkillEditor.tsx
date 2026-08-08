import { TextArea, TextInput } from './EditorCommon';
import type { SectionEditorProps } from './EditorCommon';

interface SkillDraft {
  id: string;
  name: string;
  category?: string;
}

const CATEGORY_OPTIONS = [
  '编程语言',
  '前端开发',
  '后端开发',
  '数据存储',
  '工程化',
  '测试与质量',
  '工具与平台',
  '语言能力',
];

function generateItemId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const buttonStyle = {
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  fontSize: '13px',
} as const;

export function SkillEditor({ data, onChange }: SectionEditorProps) {
  const items: SkillDraft[] = Array.isArray(data) ? data : [];

  const updateItem = (id: string, updates: Partial<SkillDraft>) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    onChange([...items, { id: generateItemId(), name: '', category: '' }]);
  };

  return (
    <div>
      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 14px' }}>
        每项由“分类小标题（可选）”和“技能正文”组成。分类可从常用选项中选择，也可以自行填写。
      </p>

      <datalist id="skill-category-options">
        {CATEGORY_OPTIONS.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              padding: '14px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                技能项 {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                style={{
                  ...buttonStyle,
                  padding: '4px 10px',
                  color: '#dc2626',
                  borderColor: '#fecaca',
                }}
              >
                删除
              </button>
            </div>

            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '4px',
              }}
            >
              分类小标题（可选）
            </label>
            <TextInput
              list="skill-category-options"
              value={item.category || ''}
              onChange={(event) =>
                updateItem(item.id, { category: event.target.value })
              }
              placeholder="选择常用分类或自行输入"
              style={{ marginBottom: '10px', fontWeight: 600 }}
            />

            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '4px',
              }}
            >
              技能正文
            </label>
            <TextArea
              value={item.name}
              onChange={(event) =>
                updateItem(item.id, { name: event.target.value })
              }
              placeholder="例如：熟悉 Spring Boot，能够独立完成 RESTful API 设计与开发。"
              rows={2}
              style={{ minHeight: '64px' }}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        style={{
          ...buttonStyle,
          width: '100%',
          marginTop: items.length > 0 ? '12px' : 0,
          padding: '9px',
          color: '#4f46e5',
          borderColor: '#a5b4fc',
          borderStyle: 'dashed',
        }}
      >
        + 添加技能项
      </button>

      {items.length === 0 && (
        <p
          style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '12px',
            margin: '12px 0 0',
          }}
        >
          分类可以留空，只填写技能正文即可
        </p>
      )}
    </div>
  );
}
