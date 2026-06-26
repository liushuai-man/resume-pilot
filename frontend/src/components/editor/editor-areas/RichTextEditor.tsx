import { useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import TextareaToolbar from './TextareaToolbar';
import { useAI } from '@/hooks/useAI';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  context?: string;
  targetField?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  context = '',
  targetField = '',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const { isLoading, complete, polish } = useAI({ targetField });

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

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  const handleFormat = useCallback(
    (format: string) => {
      if (!editor) return;

      // 确保编辑器有焦点
      editor.commands.focus();

      switch (format) {
        case 'bold':
          editor.chain().focus().toggleBold().run();
          break;
        case 'italic':
          editor.chain().focus().toggleItalic().run();
          break;
        case 'underline':
          editor.chain().focus().toggleUnderline().run();
          break;
        case 'heading1':
          editor.chain().focus().toggleHeading({ level: 1 }).run();
          break;
        case 'heading2':
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          break;
        case 'heading3':
          editor.chain().focus().toggleHeading({ level: 3 }).run();
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
        case 'indentDecrease': {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const element =
              container.nodeType === Node.TEXT_NODE
                ? container.parentElement
                : (container as HTMLElement);
            const block = element?.closest('p, li, div') as HTMLElement;
            if (block) {
              const currentIndent = parseInt(block.style.marginLeft) || 0;
              block.style.marginLeft = Math.max(0, currentIndent - 20) + 'px';
            }
          }
          break;
        }
        case 'indentIncrease': {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const element =
              container.nodeType === Node.TEXT_NODE
                ? container.parentElement
                : (container as HTMLElement);
            const block = element?.closest('p, li, div') as HTMLElement;
            if (block) {
              const currentIndent = parseInt(block.style.marginLeft) || 0;
              block.style.marginLeft = currentIndent + 20 + 'px';
            }
          }
          break;
        }
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
        case 'underline':
          return editor.isActive('underline');
        case 'heading1':
          return editor.isActive('heading', { level: 1 });
        case 'heading2':
          return editor.isActive('heading', { level: 2 });
        case 'heading3':
          return editor.isActive('heading', { level: 3 });
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

  const handleAIComplete = useCallback(async () => {
    if (!editor || isLoading) return;

    const currentText = editor.getText();
    if (!currentText.trim()) {
      return;
    }

    const result = await complete(currentText, context);
    if (result) {
      editor.commands.insertContent(result);
    }
  }, [editor, isLoading, complete, context]);

  const handleAIPolish = useCallback(async () => {
    if (!editor || isLoading) return;

    const currentText = editor.getText();
    if (!currentText.trim()) {
      return;
    }

    const result = await polish(currentText);
    if (result) {
      editor.commands.setContent(result);
    }
  }, [editor, isLoading, polish]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
      <TextareaToolbar onFormat={handleFormat} isActive={isActive} />

      <div className="flex-1 bg-white text-gray-800 p-4 min-h-[150px] overflow-auto">
        <EditorContent editor={editor} ref={editorRef} />
      </div>

      <div className="flex gap-2 p-3 border-t border-gray-200">
        <button
          onClick={handleAIComplete}
          disabled={isLoading}
          className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg transition-colors ${
            isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>补全中...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>AI补全</span>
            </>
          )}
        </button>
        <button
          onClick={handleAIPolish}
          disabled={isLoading}
          className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg transition-colors ${
            isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>润色中...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>AI润色</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
