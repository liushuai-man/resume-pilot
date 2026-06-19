import { useState } from 'react';
import {
  Button,
  Select,
  Tooltip,
  Text,
  Input,
  Badge,
  Divider,
} from '@mantine/core';
import {
  ArrowLeft,
  Save,
  Download,
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
  Sparkles,
  Video,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';

interface EditorToolbarProps {
  title: string;
  onSave: () => void;
  onExport: () => void;
}

export default function EditorToolbar({
  title,
  onSave,
  onExport,
}: EditorToolbarProps) {
  const navigate = useNavigate();
  const { user } = useUserStore();
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

  return (
    <div className="flex items-center justify-between w-full">
      {/* 左侧：返回按钮、标题 */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={18} />
        </Button>
        <Input
          value={title}
          onChange={() => {}}
          className="w-64"
          size="sm"
          placeholder="简历标题"
        />
        <Badge variant="outline" color="green" size="sm">
          已自动保存 10:30
        </Badge>
      </div>

      {/* 中间：格式化工具栏 */}
      <div className="flex items-center gap-1">
        <Select
          value={template}
          onChange={setTemplate}
          data={['简约专业', '创意黑体', '经典商务']}
          size="sm"
          className="w-28"
        />
        <Divider orientation="vertical" className="h-6 mx-2" />
        <Select
          value={layout}
          onChange={setLayout}
          data={['两栏', '一栏', '三栏']}
          size="sm"
          className="w-24"
        />
        <Divider orientation="vertical" className="h-6 mx-2" />
        <Select
          value={fontSize}
          onChange={setFontSize}
          data={['10', '11', '12', '13', '14', '15', '16']}
          size="sm"
          className="w-20"
        />
        <Divider orientation="vertical" className="h-6 mx-2" />
        <Tooltip label="加粗">
          <Button variant="ghost" size="sm" className="text-gray-600">
            <Bold size={16} />
          </Button>
        </Tooltip>
        <Tooltip label="斜体">
          <Button variant="ghost" size="sm" className="text-gray-600">
            <Italic size={16} />
          </Button>
        </Tooltip>
        <Tooltip label="下划线">
          <Button variant="ghost" size="sm" className="text-gray-600">
            <Underline size={16} />
          </Button>
        </Tooltip>
        <Tooltip label="删除线">
          <Button variant="ghost" size="sm" className="text-gray-600">
            <Strikethrough size={16} />
          </Button>
        </Tooltip>
        <Divider orientation="vertical" className="h-6 mx-2" />
        <Tooltip label="左对齐">
          <Button variant="ghost" size="sm" className="text-gray-600">
            <AlignLeft size={16} />
          </Button>
        </Tooltip>
        <Tooltip label="居中对齐">
          <Button variant="ghost" size="sm" className="text-gray-600">
            <AlignCenter size={16} />
          </Button>
        </Tooltip>
        <Tooltip label="右对齐">
          <Button variant="ghost" size="sm" className="text-gray-600">
            <AlignRight size={16} />
          </Button>
        </Tooltip>
        <Tooltip label="两端对齐">
          <Button variant="ghost" size="sm" className="text-gray-600">
            <AlignJustify size={16} />
          </Button>
        </Tooltip>
        <Divider orientation="vertical" className="h-6 mx-2" />
        <Tooltip label="撤销">
          <Button variant="ghost" size="sm" className="text-gray-600">
            <Undo size={16} />
          </Button>
        </Tooltip>
        <Tooltip label="重做">
          <Button variant="ghost" size="sm" className="text-gray-600">
            <Redo size={16} />
          </Button>
        </Tooltip>
        <Divider orientation="vertical" className="h-6 mx-2" />
        <Button variant="ghost" size="sm" className="text-gray-600">
          <Layout size={16} />
          <span className="ml-1 text-xs">布局</span>
        </Button>
        <Divider orientation="vertical" className="h-6 mx-2" />
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600"
          onClick={handleZoomOut}
        >
          <ZoomOut size={16} />
        </Button>
        <Text size="sm" className="text-gray-600 w-12 text-center">
          {zoom}%
        </Text>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600"
          onClick={handleZoomIn}
        >
          <ZoomIn size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600"
          onClick={handleResetZoom}
        >
          <RotateCcw size={16} />
        </Button>
      </div>

      {/* 右侧：操作按钮、用户信息 */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="border-blue-500 text-blue-600"
        >
          <Sparkles size={14} className="mr-1" />
          AI会话
        </Button>
        <Button variant="outline" size="sm">
          <Video size={14} className="mr-1" />
          在线面试
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download size={14} className="mr-1" />
          导出PDF
        </Button>
        <Button variant="filled" size="sm" onClick={onSave}>
          <Save size={14} className="mr-1" />
          保存
        </Button>
        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
              {user.github_login?.charAt(0) || 'U'}
            </div>
            <Text size="sm" className="text-gray-600">
              {user.github_login}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
