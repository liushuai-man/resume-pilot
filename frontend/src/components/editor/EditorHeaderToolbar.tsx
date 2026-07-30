import { useEffect, useState } from 'react';
import { Button, Input, Badge, Loader } from '@mantine/core';
import { Save, Download, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EditorToolbarProps {
  title: string;
  resumeId: string;
  onSave: () => void;
  onExport: () => void;
  lastModified?: string;
  isSaving?: boolean;
  onTitleChange?: (title: string) => void;
}

export default function EditorHeaderToolbar({
  title,
  resumeId,
  onSave,
  onExport,
  lastModified,
  isSaving = false,
  onTitleChange,
}: EditorToolbarProps) {
  const navigate = useNavigate();
  const [editingTitle, setEditingTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setEditingTitle(title);
    }
  }, [title, isEditing]);

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (editingTitle !== title && onTitleChange) {
      onTitleChange(editingTitle);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setEditingTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center justify-between w-full gap-3">
      {/* 左侧：返回按钮、标题 */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="xs"
          onClick={() => navigate('/')}
          className="h-7 px-3 border-blue-400 text-blue-500 bg-white hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700"
        >
          首页
        </Button>
        <Input
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onFocus={() => setIsEditing(true)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          className="w-64"
          size="xs"
          placeholder="简历标题"
          radius="sm"
          styles={{
            input: {
              borderColor: '#d1d5db',
              boxShadow: 'none',
              outline: 'none',
            },
          }}
        />
        <Badge
          variant="outline"
          color={isSaving ? 'yellow' : 'green'}
          size="xs"
        >
          {isSaving ? (
            <span className="flex items-center gap-1">
              <Loader size={10} />
              保存中...
            </span>
          ) : lastModified ? (
            `已保存 ${lastModified}`
          ) : (
            '未保存'
          )}
        </Badge>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-2">
        <Button
          variant="filled"
          size="xs"
          className="h-7 px-3"
          onClick={onSave}
          disabled={isSaving}
          loading={isSaving}
        >
          <Save size={12} className="mr-1" />
          {isSaving ? '保存中' : '保存'}
        </Button>
        <Button
          variant="outline"
          size="xs"
          className="h-7 px-3"
          onClick={onExport}
          disabled={isSaving}
        >
          <Download size={12} className="mr-1" />
          导出PDF
        </Button>
        <Button
          variant="outline"
          size="xs"
          className="h-7 px-3"
          onClick={() => {
            onSave();
            navigate(`/resume/interview/${resumeId}`);
          }}
          disabled={isSaving}
        >
          <Bot size={12} className="mr-1" />
          在线面试
        </Button>
      </div>
    </div>
  );
}
