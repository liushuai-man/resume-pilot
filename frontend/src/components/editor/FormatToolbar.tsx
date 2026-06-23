import { useState } from 'react';
import { Select, Tooltip } from '@mantine/core';
import { Palette, ChevronDown } from 'lucide-react';

export default function FormatToolbar() {
  const [fontFamily, setFontFamily] = useState<string | null>('微软雅黑');
  const [fontSize, setFontSize] = useState<string | null>('16');
  const [lineHeight, setLineHeight] = useState<string | null>('1.5');
  const [margin, setMargin] = useState<string | null>('20');

  const ToolbarButton = ({
    children,
    label,
    onClick,
  }: {
    children: React.ReactNode;
    label: string;
    onClick?: () => void;
  }) => (
    <Tooltip label={label}>
      <button
        onClick={onClick}
        className="h-8 px-2 rounded flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        {children}
      </button>
    </Tooltip>
  );

  const DropdownButton = ({
    title,
    label,
    value,
    onChange,
    options,
    width = 'w-16',
  }: {
    title: string;
    label: string;
    value: string | null;
    onChange: (value: string | null) => void;
    options: string[];
    width?: string;
  }) => (
    <Tooltip label={label}>
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 font-medium">{title}</span>
        <Select
          value={value}
          onChange={onChange}
          data={options}
          size="xs"
          className={`h-8 ${width} min-w-0`}
          radius="sm"
          rightSection={<ChevronDown size={12} className="text-gray-400" />}
          styles={{
            input: {
              paddingLeft: '8px',
              paddingRight: '20px',
              fontSize: '12px',
            },
            dropdown: {
              backgroundColor: '#1a1a1a',
              borderColor: '#333',
            },
            option: {
              color: '#fff',
              fontSize: '13px',
              padding: '8px 12px',
              '&[data-selected]': {
                backgroundColor: '#ff6b35',
                color: '#fff',
              },
              '&:hover': {
                backgroundColor: '#333',
              },
            },
          }}
        />
      </div>
    </Tooltip>
  );

  const ToolbarDivider = () => <div className="w-px h-5 bg-gray-200 mx-2" />;

  return (
    <div className="flex items-center gap-3">
      {/* 字体 */}
      <DropdownButton
        title="字体"
        label="字体"
        value={fontFamily}
        onChange={setFontFamily}
        options={[
          '微软雅黑',
          '宋体',
          '黑体',
          '楷体',
          'Arial',
          'Times New Roman',
        ]}
        width="w-20"
      />
      <ToolbarDivider />

      {/* 字号 */}
      <DropdownButton
        title="字号"
        label="字号"
        value={fontSize}
        onChange={setFontSize}
        options={[
          '10',
          '11',
          '12',
          '13',
          '14',
          '15',
          '16',
          '18',
          '20',
          '22',
          '24',
        ]}
        width="w-14"
      />
      <ToolbarDivider />

      {/* 行距 */}
      <DropdownButton
        title="行距"
        label="行距"
        value={lineHeight}
        onChange={setLineHeight}
        options={['1.0', '1.2', '1.3', '1.4', '1.5', '1.6', '1.8', '2.0']}
        width="w-14"
      />
      <ToolbarDivider />

      {/* 页边距 */}
      <DropdownButton
        title="页边距"
        label="页边距"
        value={margin}
        onChange={setMargin}
        options={['10', '15', '20', '25', '30', '35', '40']}
        width="w-14"
      />
      <ToolbarDivider />

      {/* 主题色 */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 font-medium">主题色</span>
        <ToolbarButton label="主题色">
          <Palette size={16} />
        </ToolbarButton>
      </div>
    </div>
  );
}
