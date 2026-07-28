import { FormGroup, TextInput } from './EditorCommon';
import type { SectionEditorProps } from './EditorCommon';
import { AIFieldActions } from '../AIFieldActions';
import { MarkdownTextarea } from '../MarkdownTextarea';

function generateItemId() {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

export function ExperienceEditor({
  sectionId,
  data,
  onChange,
}: SectionEditorProps) {
  const items = data || [];

  const addItem = () => {
    const newItem = {
      id: generateItemId(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      achievements: [] as string[],
      location: '',
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
          + 添加工作经历
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
              工作经历 {index + 1}
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

          <div style={{ display: 'flex', gap: '12px' }}>
            <FormGroup label="公司名称">
              <TextInput
                value={item.company}
                onChange={(e) => updateItem(index, { company: e.target.value })}
                placeholder="公司名称"
              />
            </FormGroup>
            <FormGroup label="职位">
              <TextInput
                value={item.position}
                onChange={(e) =>
                  updateItem(index, { position: e.target.value })
                }
                placeholder="例如：前端工程师"
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
                placeholder="至今"
              />
            </FormGroup>
          </div>

          <FormGroup
            label="工作描述"
            labelExtra={
              <AIFieldActions
                sectionId={sectionId}
                fieldPath={`items.${index}.description`}
                content={item.description}
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
              value={item.description}
              onChange={(val) => updateItem(index, { description: val })}
              placeholder="描述你的职责和工作内容..."
              rows={4}
            />
          </FormGroup>
        </div>
      ))}
    </div>
  );
}
