import {
  Undo,
  Redo,
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Eraser,
} from 'lucide-react';

interface TextareaToolbarProps {
  onFormat?: (format: string) => void;
}

export default function TextareaToolbar({ onFormat }: TextareaToolbarProps) {
  const ToolbarButton = ({
    children,
    label,
    onClick,
    active = false,
  }: {
    children: React.ReactNode;
    label: string;
    onClick?: () => void;
    active?: boolean;
  }) => (
    <button
      onClick={onClick}
      title={label}
      className={`w-8 h-7 rounded flex items-center justify-center transition-colors ${
        active
          ? 'bg-blue-100 text-blue-600'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => <div className="w-px h-5 bg-gray-200 mx-1" />;

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
      {/* 撤销/重做 */}
      <ToolbarButton label="撤销" onClick={() => onFormat?.('undo')}>
        <Undo size={14} />
      </ToolbarButton>
      <ToolbarButton label="重做" onClick={() => onFormat?.('redo')}>
        <Redo size={14} />
      </ToolbarButton>
      <ToolbarDivider />

      {/* 文字格式 */}
      <ToolbarButton label="加粗" onClick={() => onFormat?.('bold')}>
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton label="斜体" onClick={() => onFormat?.('italic')}>
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarDivider />

      {/* 列表 */}
      <ToolbarButton
        label="无序列表"
        onClick={() => onFormat?.('bulletList')}
        active
      >
        <List size={14} />
      </ToolbarButton>
      <ToolbarButton label="有序列表" onClick={() => onFormat?.('orderedList')}>
        <ListOrdered size={14} />
      </ToolbarButton>
      <ToolbarDivider />

      {/* 对齐方式 */}
      <ToolbarButton label="左对齐" onClick={() => onFormat?.('alignLeft')}>
        <AlignLeft size={14} />
      </ToolbarButton>
      <ToolbarButton label="居中对齐" onClick={() => onFormat?.('alignCenter')}>
        <AlignCenter size={14} />
      </ToolbarButton>
      <ToolbarButton label="右对齐" onClick={() => onFormat?.('alignRight')}>
        <AlignRight size={14} />
      </ToolbarButton>
      <ToolbarDivider />

      {/* 链接和清除格式 */}
      <ToolbarButton label="插入链接" onClick={() => onFormat?.('link')}>
        <Link2 size={14} />
      </ToolbarButton>
      <ToolbarButton label="清除格式" onClick={() => onFormat?.('clearFormat')}>
        <Eraser size={14} />
      </ToolbarButton>
    </div>
  );
}
