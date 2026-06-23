import { useState } from 'react';
import { Select, Tooltip } from '@mantine/core';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Layout,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';

export default function FormatToolbar() {
  const [fontSize, setFontSize] = useState<string | null>('12');
  const [zoom, setZoom] = useState(100);
  const [template, setTemplate] = useState<string | null>('简约专业');
  const [layout, setLayout] = useState<string | null>('两栏');

  const handleZoomIn = () => {
    if (zoom < 150) setZoom(zoom + 10);
  };

  const handleZoomOut = () => {
    if (zoom > 50) setZoom(zoom - 10);
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

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
    <Tooltip label={label}>
      <button
        onClick={onClick}
        className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
          active
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`}
      >
        {children}
      </button>
    </Tooltip>
  );

  const ToolbarDivider = () => <div className="w-px h-5 bg-gray-200 mx-1" />;

  return (
    <div className="flex items-center gap-1">
      {/* 模板选择 */}
      <Select
        value={template}
        onChange={setTemplate}
        data={['简约专业', '创意黑体', '经典商务']}
        size="xs"
        className="w-24"
        radius="sm"
      />
      <ToolbarDivider />

      {/* 布局选择 */}
      <Select
        value={layout}
        onChange={setLayout}
        data={['两栏', '一栏', '三栏']}
        size="xs"
        className="w-20"
        radius="sm"
      />
      <ToolbarDivider />

      {/* 字号选择 */}
      <Select
        value={fontSize}
        onChange={setFontSize}
        data={['10', '11', '12', '13', '14', '15', '16']}
        size="xs"
        className="w-16"
        radius="sm"
      />
      <ToolbarDivider />

      {/* 文字格式 */}
      <ToolbarButton label="加粗">
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton label="斜体">
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarButton label="下划线">
        <Underline size={14} />
      </ToolbarButton>
      <ToolbarButton label="删除线">
        <Strikethrough size={14} />
      </ToolbarButton>
      <ToolbarDivider />

      {/* 对齐方式 */}
      <ToolbarButton label="左对齐">
        <AlignLeft size={14} />
      </ToolbarButton>
      <ToolbarButton label="居中对齐">
        <AlignCenter size={14} />
      </ToolbarButton>
      <ToolbarButton label="右对齐">
        <AlignRight size={14} />
      </ToolbarButton>
      <ToolbarButton label="两端对齐">
        <AlignJustify size={14} />
      </ToolbarButton>
      <ToolbarDivider />

      {/* 撤销/重做 */}
      <ToolbarButton label="撤销">
        <Undo size={14} />
      </ToolbarButton>
      <ToolbarButton label="重做">
        <Redo size={14} />
      </ToolbarButton>
      <ToolbarDivider />

      {/* 布局设置 */}
      <ToolbarButton label="布局设置">
        <Layout size={14} />
      </ToolbarButton>
      <ToolbarDivider />

      {/* 缩放控制 */}
      <ToolbarButton label="缩小" onClick={handleZoomOut}>
        <ZoomOut size={14} />
      </ToolbarButton>
      <span className="text-xs text-gray-500 w-10 text-center">{zoom}%</span>
      <ToolbarButton label="放大" onClick={handleZoomIn}>
        <ZoomIn size={14} />
      </ToolbarButton>
      <ToolbarButton label="重置缩放" onClick={handleResetZoom}>
        <RotateCcw size={14} />
      </ToolbarButton>
      <ToolbarDivider />
    </div>
  );
}
