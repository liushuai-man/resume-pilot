import { FormGroup, TextInput } from './EditorCommon';
import type { SectionEditorProps } from './EditorCommon';
import { MarkdownTextarea } from '../MarkdownTextarea';

export function ProfileEditor({ data, onChange }: SectionEditorProps) {
  const handleChange = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
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
        <FormGroup label="邮箱">
          <TextInput
            value={data.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="example@email.com"
          />
        </FormGroup>
        <FormGroup label="电话">
          <TextInput
            value={data.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="138-xxxx-xxxx"
          />
        </FormGroup>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <FormGroup label="所在城市">
          <TextInput
            value={data.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="例如：北京"
          />
        </FormGroup>
        <FormGroup label="个人网站">
          <TextInput
            value={data.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://..."
          />
        </FormGroup>
      </div>

      <FormGroup label="个人简介">
        <MarkdownTextarea
          value={data.summary || ''}
          onChange={(val) => handleChange('summary', val)}
          placeholder="用几句话介绍自己...支持 Markdown 语法"
          rows={4}
        />
      </FormGroup>
    </div>
  );
}
