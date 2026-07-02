import { Select, Tooltip } from '@mantine/core';
import {
  Palette,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';

export default function FormatToolbar() {
  const { formatConfig, updateFormatConfig } = useResumeStore();

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
        className={`h-8 px-2 rounded flex items-center justify-center transition-all duration-200 cursor-pointer ${
          active
            ? 'bg-blue-100 text-blue-600 border border-blue-300'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-transparent'
        }`}
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
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
        {title}
      </span>
      <Tooltip label={label}>
        <Select
          value={value}
          onChange={onChange}
          data={options}
          size="xs"
          className={`${width} min-w-0`}
          radius="sm"
          rightSection={<ChevronDown size={12} className="text-gray-400" />}
          styles={{
            input: {
              fontSize: '12px',
              color: '#333',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              minHeight: '28px',
              height: '28px',
            },
            dropdown: {
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              borderRadius: '6px',
            },
            option: {
              color: '#374151',
              fontSize: '13px',
              padding: '6px 10px',
              cursor: 'pointer',
            },
          }}
        />
      </Tooltip>
    </div>
  );

  const ToolbarDivider = () => <div className="w-px h-5 bg-gray-200 mx-2" />;

  return (
    <div className="flex items-center gap-3">
      {/* 字体 */}
      <DropdownButton
        title="字体"
        label="字体"
        value={formatConfig.fontFamily}
        onChange={(val) =>
          updateFormatConfig({ fontFamily: val || '微软雅黑' })
        }
        options={[
          '微软雅黑',
          '宋体',
          '黑体',
          '楷体',
          'Arial',
          'Times New Roman',
        ]}
        width="w-28"
      />
      <ToolbarDivider />

      {/* 字号 */}
      <DropdownButton
        title="字号"
        label="字号"
        value={formatConfig.fontSize}
        onChange={(val) => updateFormatConfig({ fontSize: val || '16' })}
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
        width="w-20"
      />
      <ToolbarDivider />

      {/* 行距 */}
      <DropdownButton
        title="行距"
        label="行距"
        value={formatConfig.lineHeight}
        onChange={(val) => updateFormatConfig({ lineHeight: val || '1.5' })}
        options={['1.0', '1.2', '1.3', '1.4', '1.5', '1.6', '1.8', '2.0']}
        width="w-24"
      />
      <ToolbarDivider />

      {/* 页边距 */}
      <DropdownButton
        title="页边距"
        label="页边距"
        value={formatConfig.margin}
        onChange={(val) => updateFormatConfig({ margin: val || '20' })}
        options={['10', '15', '20', '25', '30', '35', '40']}
        width="w-20"
      />
      <ToolbarDivider />

      {/* 对齐方式 */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 font-medium">对齐</span>
        <div className="flex items-center bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
          <ToolbarButton
            label="左对齐"
            onClick={() => updateFormatConfig({ textAlign: 'left' })}
            active={formatConfig.textAlign === 'left'}
          >
            <AlignLeft size={14} />
          </ToolbarButton>
          <ToolbarButton
            label="居中对齐"
            onClick={() => updateFormatConfig({ textAlign: 'center' })}
            active={formatConfig.textAlign === 'center'}
          >
            <AlignCenter size={14} />
          </ToolbarButton>
          <ToolbarButton
            label="右对齐"
            onClick={() => updateFormatConfig({ textAlign: 'right' })}
            active={formatConfig.textAlign === 'right'}
          >
            <AlignRight size={14} />
          </ToolbarButton>
        </div>
      </div>
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
