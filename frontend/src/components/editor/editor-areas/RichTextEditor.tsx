import { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
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
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || '请输入内容...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none',
      },
    },
  });

  // 同步外部 value 变化到编辑器
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  const handleFormat = useCallback(
    (format: string) => {
      if (!editor) return;

      switch (format) {
        case 'bold':
          editor.chain().focus().toggleBold().run();
          break;
        case 'italic':
          editor.chain().focus().toggleItalic().run();
          break;
        case 'undo':
          editor.chain().focus().undo().run();
          break;
        case 'redo':
          editor.chain().focus().redo().run();
          break;
        case 'bulletList':
          editor.chain().focus().toggleBulletList().run();
          break;
        case 'orderedList':
          editor.chain().focus().toggleOrderedList().run();
          break;
        case 'alignLeft':
          editor.chain().focus().setTextAlign('left').run();
          break;
        case 'alignCenter':
          editor.chain().focus().setTextAlign('center').run();
          break;
        case 'alignRight':
          editor.chain().focus().setTextAlign('right').run();
          break;
        case 'link': {
          const previousUrl = editor.getAttributes('link').href;
          const url = window.prompt('请输入链接地址：', previousUrl);

          if (url === null) {
            return;
          }

          if (url === '') {
            editor.chain().focus().unsetLink().run();
          } else {
            editor.chain().focus().setLink({ href: url }).run();
          }
          break;
        }
        case 'clearFormat':
          editor.chain().focus().unsetAllMarks().run();
          break;
        default:
          console.log('Unknown format:', format);
      }
    },
    [editor]
  );

  const isActive = useCallback(
    (format: string) => {
      if (!editor) return false;

      switch (format) {
        case 'bold':
          return editor.isActive('bold');
        case 'italic':
          return editor.isActive('italic');
        case 'bulletList':
          return editor.isActive('bulletList');
        case 'orderedList':
          return editor.isActive('orderedList');
        case 'alignLeft':
          return editor.isActive({ textAlign: 'left' });
        case 'alignCenter':
          return editor.isActive({ textAlign: 'center' });
        case 'alignRight':
          return editor.isActive({ textAlign: 'right' });
        case 'link':
          return editor.isActive('link');
        default:
          return false;
      }
    },
    [editor]
  );

  const handleAIComplete = () => {
    console.log('AI补全');
  };

  const handleAIPolish = () => {
    console.log('AI润色');
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* 工具栏 - 常驻显示 */}
      <TextareaToolbar onFormat={handleFormat} isActive={isActive} />

      {/* 编辑区域 */}
      <div className="flex-1 bg-white text-gray-800 p-4 min-h-[150px] overflow-auto">
        <EditorContent editor={editor} />
      </div>

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
