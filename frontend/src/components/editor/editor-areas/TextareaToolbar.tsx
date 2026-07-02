import {
  Undo,
  Redo,
  Bold,
  Italic,
  List,
  ListOrdered,
  Eraser,
  IndentDecrease,
  IndentIncrease,
  Underline,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';
import { Tooltip } from '@mantine/core';

interface TextareaToolbarProps {
  onFormat?: (format: string) => void;
  isActive?: (format: string) => boolean;
}

export default function TextareaToolbar({
  onFormat,
  isActive = () => false,
}: TextareaToolbarProps) {
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
    <Tooltip label={label} position="top">
      <button
        tabIndex={-1}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onClick?.()}
        type="button"
        className={`w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 ${
          active
            ? 'bg-blue-100 text-blue-600 border border-blue-300 shadow-sm'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-transparent'
        }`}
      >
        {children}
      </button>
    </Tooltip>
  );

  const ToolbarDivider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
      {/* 撤销/重做 */}
      <ToolbarButton label="撤销 (Ctrl+Z)" onClick={() => onFormat?.('undo')}>
        <Undo size={14} />
      </ToolbarButton>
      <ToolbarButton label="重做 (Ctrl+Y)" onClick={() => onFormat?.('redo')}>
        <Redo size={14} />
      </ToolbarButton>
      <ToolbarDivider />

      {/* 标题 */}
      <ToolbarButton label="标题 1" onClick={() => onFormat?.('heading1')}>
        <Heading1 size={14} />
      </ToolbarButton>
      <ToolbarButton label="标题 2" onClick={() => onFormat?.('heading2')}>
        <Heading2 size={14} />
      </ToolbarButton>
      <ToolbarButton label="标题 3" onClick={() => onFormat?.('heading3')}>
        <Heading3 size={14} />
      </ToolbarButton>
      <ToolbarDivider />

      {/* 文字格式 */}
      <ToolbarButton
        label="加粗 (Ctrl+B)"
        onClick={() => onFormat?.('bold')}
        active={isActive('bold')}
      >
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton
        label="斜体 (Ctrl+I)"
        onClick={() => onFormat?.('italic')}
        active={isActive('italic')}
      >
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarButton
        label="下划线 (Ctrl+U)"
        onClick={() => onFormat?.('underline')}
        active={isActive('underline')}
      >
        <Underline size={14} />
      </ToolbarButton>
      <ToolbarDivider />

      {/* 列表 */}
      <ToolbarButton
        label="无序列表"
        onClick={() => onFormat?.('bulletList')}
        active={isActive('bulletList')}
      >
        <List size={14} />
      </ToolbarButton>
      <ToolbarButton
        label="有序列表"
        onClick={() => onFormat?.('orderedList')}
        active={isActive('orderedList')}
      >
        <ListOrdered size={14} />
      </ToolbarButton>
      <ToolbarDivider />

      {/* 缩进 */}
      <ToolbarButton
        label="减少缩进"
        onClick={() => onFormat?.('indentDecrease')}
      >
        <IndentDecrease size={14} />
      </ToolbarButton>
      <ToolbarButton
        label="增加缩进"
        onClick={() => onFormat?.('indentIncrease')}
      >
        <IndentIncrease size={14} />
      </ToolbarButton>
      <ToolbarDivider />

      {/* 清除格式 */}
      <ToolbarButton label="清除格式" onClick={() => onFormat?.('clearFormat')}>
        <Eraser size={14} />
      </ToolbarButton>
    </div>
  );
}
