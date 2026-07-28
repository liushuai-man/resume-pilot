interface MarkdownTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  minHeight?: string;
}

export function MarkdownTextarea({
  value,
  onChange,
  placeholder = '请输入内容...',
  rows = 4,
  minHeight = '120px',
}: MarkdownTextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        outline: 'none',
        fontSize: '13px',
        lineHeight: '1.6',
        resize: 'vertical',
        minHeight,
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#4f46e5';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#d1d5db';
      }}
    />
  );
}
