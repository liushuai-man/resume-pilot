import { FormGroup } from './EditorCommon';
import type { SectionEditorProps } from './EditorCommon';
import { AIFieldActions } from '../AIFieldActions';
import { MarkdownTextarea } from '../MarkdownTextarea';

export function ObjectiveEditor({
  sectionId,
  data,
  onChange,
}: SectionEditorProps) {
  const content = data?.content || '';

  return (
    <div>
      <FormGroup label="职业目标">
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
              fieldPath="content"
              content={content}
              onPolish={(result) => onChange({ ...data, content: result })}
              onComplete={(result) => onChange({ ...data, content: result })}
            />
          </div>
          <MarkdownTextarea
            value={content}
            onChange={(val) => onChange({ ...data, content: val })}
            placeholder="描述你的职业目标和期望...支持 Markdown 语法"
            rows={5}
          />
        </div>
      </FormGroup>
    </div>
  );
}
