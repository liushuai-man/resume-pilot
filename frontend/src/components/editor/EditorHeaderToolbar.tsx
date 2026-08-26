import { useEffect, useState } from 'react';
import { Badge, Button, Input, Loader } from '@mantine/core';
import { Download, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EditorToolbarProps {
  title: string;
  onSave: () => void;
  onExport: () => void;
  lastModified?: string;
  isSaving?: boolean;
  onTitleChange?: (title: string) => void;
  isGuest?: boolean;
}

export default function EditorHeaderToolbar({ title, onSave, onExport, lastModified, isSaving = false, onTitleChange, isGuest = false }: EditorToolbarProps) {
  const navigate = useNavigate();
  const [editingTitle, setEditingTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { if (!isEditing) setEditingTitle(title); }, [title, isEditing]);

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (editingTitle !== title) onTitleChange?.(editingTitle);
  };

  return <div className="flex w-full items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3">
      <Button variant="outline" size="xs" radius="md" color="teal" onClick={() => navigate('/resumes')} className="h-8 shrink-0 px-3">我的简历</Button>
      <Input value={editingTitle} onChange={(event) => setEditingTitle(event.target.value)} onFocus={() => setIsEditing(true)} onBlur={handleTitleBlur} onKeyDown={(event) => {
        if (event.key === 'Enter') (event.target as HTMLInputElement).blur();
        if (event.key === 'Escape') { setEditingTitle(title); setIsEditing(false); }
      }} className="w-64 min-w-0" size="sm" placeholder="简历标题" radius="md" styles={{ input: { borderColor: '#D8E1DD', backgroundColor: '#F7F9F8' } }} />
      <Badge variant="light" color={isSaving ? 'yellow' : 'teal'} size="sm" radius="sm" className="shrink-0">
        {isSaving ? <span className="flex items-center gap-1"><Loader size={10} />保存中...</span> : lastModified ? `${isGuest ? '已缓存' : '已保存'} ${lastModified}` : isGuest ? '仅本机缓存' : '未保存'}
      </Badge>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      <Button size="xs" radius="md" color="teal" className="h-8 px-3" onClick={onSave} disabled={isSaving} loading={isSaving} leftSection={<Save size={14} />}>{isGuest ? '缓存到本机' : '保存'}</Button>
      <Button variant="outline" size="xs" radius="md" color="teal" className="h-8 px-3" onClick={onExport} disabled={isSaving} leftSection={<Download size={14} />}>导出 PDF</Button>
    </div>
  </div>;
}
