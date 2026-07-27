import { FormGroup, TextInput, TextArea } from './EditorCommon';
import type { SectionEditorProps } from './EditorCommon';

function generateItemId() {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

export function CertificationEditor({ data, onChange }: SectionEditorProps) {
  const items = data || [];

  const addItem = () => {
    const newItem = {
      id: generateItemId(),
      name: '',
      issuer: '',
      date: '',
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
          + 添加证书荣誉
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
            <span style={{ fontWeight: 500, fontSize: '14px', color: '#374151' }}>
              证书 {index + 1}
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

          <FormGroup label="证书名称">
            <TextInput
              value={item.name}
              onChange={(e) => updateItem(index, { name: e.target.value })}
              placeholder="例如：AWS认证"
            />
          </FormGroup>

          <div style={{ display: 'flex', gap: '12px' }}>
            <FormGroup label="颁发机构">
              <TextInput
                value={item.issuer || ''}
                onChange={(e) => updateItem(index, { issuer: e.target.value })}
                placeholder="例如：Amazon"
              />
            </FormGroup>
            <FormGroup label="获得时间">
              <TextInput
                type="month"
                value={item.date || ''}
                onChange={(e) => updateItem(index, { date: e.target.value })}
              />
            </FormGroup>
          </div>

          <FormGroup label="描述（选填）">
            <TextArea
              value={item.description || ''}
              onChange={(e) => updateItem(index, { description: e.target.value })}
              placeholder="证书相关描述..."
              rows={2}
            />
          </FormGroup>
        </div>
      ))}
    </div>
  );
}
