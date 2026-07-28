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
      <FormGroup
        label="职业目标"
        labelExtra={
          <AIFieldActions
            sectionId={sectionId}
            fieldPath="content"
            content={content}
            onPolish={(result) => onChange({ ...data, content: result })}
            onComplete={(result) => onChange({ ...data, content: result })}
          />
        }
      >
        <MarkdownTextarea
          value={content}
          onChange={(val) => onChange({ ...data, content: val })}
          placeholder="描述你的职业目标和期望..."
          rows={5}
        />
      </FormGroup>
    </div>
  );
}
