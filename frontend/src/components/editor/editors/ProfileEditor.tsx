import { useState, type CSSProperties } from 'react';
import { FormGroup, TextInput } from './EditorCommon';
import type { SectionEditorProps } from './EditorCommon';
import { MarkdownTextarea } from '../MarkdownTextarea';
import { AIFieldActions } from '../AIFieldActions';
import { getIconComponent, ICON_OPTIONS } from '@/utils/section-icons';

const FIELD_ICON_CONFIGS: { key: string; defaultIcon: string }[] = [
  { key: 'email', defaultIcon: 'Mail' },
  { key: 'phone', defaultIcon: 'Phone' },
  { key: 'location', defaultIcon: 'MapPin' },
  { key: 'website', defaultIcon: 'Globe' },
];

export function ProfileEditor({
  sectionId,
  data,
  onChange,
}: SectionEditorProps) {
  const [pickerField, setPickerField] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  const handleIconChange = (field: string, iconName: string | null) => {
    const iconKey = `${field}Icon`;
    onChange({ ...data, [iconKey]: iconName });
    setPickerField(null);
  };

  const getFieldIcon = (field: string): string | null => {
    const iconKey = `${field}Icon`;
    const custom = (data as any)?.[iconKey];
    if (custom !== undefined && custom !== null) return custom;
    const config = FIELD_ICON_CONFIGS.find((c) => c.key === field);
    return config?.defaultIcon || null;
  };

  const summary = data.summary || '';

  const renderFieldWithIcon = (
    field: string,
    label: string,
    placeholder: string,
    value: string,
    extraStyle?: CSSProperties
  ) => {
    const iconName = getFieldIcon(field);
    const IconComponent = iconName ? getIconComponent(iconName) : null;
    const isPickerOpen = pickerField === field;

    return (
      <FormGroup label={label}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPickerField(isPickerOpen ? null : field);
            }}
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              padding: 0,
              color: '#6b7280',
              zIndex: 5,
            }}
            title="点击更换图标"
          >
            {IconComponent ? (
              <IconComponent size={14} />
            ) : (
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>+</span>
            )}
          </button>
          <TextInput
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={placeholder}
            style={{ paddingLeft: '40px', ...extraStyle }}
          />

          {isPickerOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                padding: '8px',
                zIndex: 400,
                width: '220px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  marginBottom: '6px',
                  fontWeight: 500,
                }}
              >
                选择图标
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '4px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  marginBottom: '6px',
                }}
              >
                {ICON_OPTIONS.map((name) => {
                  const Icon = getIconComponent(name);
                  if (!Icon) return null;
                  return (
                    <button
                      key={name}
                      onClick={() => handleIconChange(field, name)}
                      style={{
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        backgroundColor:
                          iconName === name ? '#eef2ff' : '#ffffff',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      title={name}
                    >
                      <Icon size={14} />
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handleIconChange(field, null)}
                style={{
                  width: '100%',
                  padding: '4px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  backgroundColor: '#f9fafb',
                  color: '#6b7280',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                移除图标
              </button>
            </div>
          )}
        </div>
      </FormGroup>
    );
  };

  return (
    <div>
      <FormGroup label="姓名">
        <TextInput
          value={data.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="请输入姓名"
        />
      </FormGroup>

      <FormGroup label="求职意向 / 职位">
        <TextInput
          value={data.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="例如：前端工程师"
        />
      </FormGroup>

      <div style={{ display: 'flex', gap: '12px' }}>
        {renderFieldWithIcon(
          'email',
          '邮箱',
          'example@email.com',
          data.email || ''
        )}
        {renderFieldWithIcon(
          'phone',
          '电话',
          '138-xxxx-xxxx',
          data.phone || ''
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        {renderFieldWithIcon(
          'location',
          '所在城市',
          '例如：北京',
          data.location || ''
        )}
        {renderFieldWithIcon(
          'website',
          '个人网站',
          'https://...',
          data.website || ''
        )}
      </div>

      <FormGroup
        label="个人简介"
        labelExtra={
          <AIFieldActions
            sectionId={sectionId}
            fieldPath="summary"
            content={summary}
            onPolish={(result) => handleChange('summary', result)}
            onComplete={(result) => handleChange('summary', result)}
          />
        }
      >
        <MarkdownTextarea
          value={summary}
          onChange={(val) => handleChange('summary', val)}
          placeholder="用几句话介绍自己..."
          rows={4}
        />
      </FormGroup>
    </div>
  );
}
