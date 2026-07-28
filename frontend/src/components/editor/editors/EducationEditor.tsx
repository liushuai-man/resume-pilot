import { FormGroup, TextInput } from './EditorCommon';
import type { SectionEditorProps } from './EditorCommon';
import { AIFieldActions } from '../AIFieldActions';
import { MarkdownTextarea } from '../MarkdownTextarea';

function generateItemId() {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

export function EducationEditor({
  sectionId,
  data,
  onChange,
}: SectionEditorProps) {
  const items = data || [];

  const addItem = () => {
    const newItem = {
      id: generateItemId(),
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: '',
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
          + 添加教育经历
        </button>
      </div>

      {items.map((item: any, index: number) => (
        <div
          key={item.id}
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
            <span
              style={{ fontWeight: 500, fontSize: '14px', color: '#374151' }}
            >
              教育经历 {index + 1}
            </span>
            <button
              onClick={() => removeItem(index)}
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

          <FormGroup label="学校名称">
            <TextInput
              value={item.school}
              onChange={(e) => updateItem(index, { school: e.target.value })}
              placeholder="例如：清华大学"
            />
          </FormGroup>

          <div style={{ display: 'flex', gap: '12px' }}>
            <FormGroup label="专业">
              <TextInput
                value={item.major}
                onChange={(e) => updateItem(index, { major: e.target.value })}
                placeholder="例如：计算机科学"
              />
            </FormGroup>
            <FormGroup label="学位">
              <TextInput
                value={item.degree}
                onChange={(e) => updateItem(index, { degree: e.target.value })}
                placeholder="例如：本科"
              />
            </FormGroup>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <FormGroup label="开始时间">
              <TextInput
                type="month"
                value={item.startDate}
                onChange={(e) =>
                  updateItem(index, { startDate: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup label="结束时间">
              <TextInput
                type="month"
                value={item.endDate}
                onChange={(e) => updateItem(index, { endDate: e.target.value })}
              />
            </FormGroup>
          </div>

          <FormGroup label="GPA（选填）">
            <TextInput
              value={item.gpa || ''}
              onChange={(e) => updateItem(index, { gpa: e.target.value })}
              placeholder="例如：3.8/4.0"
            />
          </FormGroup>

          <FormGroup
            label="描述（选填）"
            labelExtra={
              <AIFieldActions
                sectionId={sectionId}
                fieldPath={`items.${index}.description`}
                content={item.description || ''}
                onPolish={(result) =>
                  updateItem(index, { description: result })
                }
                onComplete={(result) =>
                  updateItem(index, { description: result })
                }
              />
            }
          >
            <MarkdownTextarea
              value={item.description || ''}
              onChange={(val) => updateItem(index, { description: val })}
              placeholder="相关课程、荣誉等..."
              rows={3}
            />
          </FormGroup>
        </div>
      ))}
    </div>
  );
}
