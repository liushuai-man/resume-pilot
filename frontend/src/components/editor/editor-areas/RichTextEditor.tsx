import { Sparkles, CheckCircle2 } from 'lucide-react';
import TextareaToolbar from './TextareaToolbar';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const handleFormat = (format: string) => {
    console.log('Format action:', format);
    // TODO: 实现格式化逻辑
  };

  const handleAIComplete = () => {
    console.log('AI补全');
    // TODO: 实现AI补全逻辑
  };

  const handleAIPolish = () => {
    console.log('AI润色');
    // TODO: 实现AI润色逻辑
  };

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* 工具栏 - 常驻显示 */}
      <TextareaToolbar onFormat={handleFormat} />

      {/* 编辑区域 */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-white text-gray-800 p-4 resize-none outline-none placeholder-gray-400 min-h-[150px]"
      />

      {/* 底部按钮 */}
      <div className="flex gap-2 p-3 border-t border-gray-200">
        <button
          onClick={handleAIComplete}
          className="flex-1 flex items-center justify-center gap-2 h-10 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
        >
          <Sparkles size={16} />
          <span>AI补全</span>
        </button>
        <button
          onClick={handleAIPolish}
          className="flex-1 flex items-center justify-center gap-2 h-10 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
        >
          <CheckCircle2 size={16} />
          <span>AI润色</span>
        </button>
      </div>
    </div>
  );
}
