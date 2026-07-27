import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  minHeight?: string;
}

export function MarkdownTextarea({
  value,
  onChange,
  placeholder = '支持 Markdown 语法...',
  rows = 4,
  minHeight = '120px',
}: MarkdownTextareaProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  return (
    <div style={{ border: '1px solid #d1d5db', borderRadius: '6px', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          fontSize: '12px',
        }}
      >
        <button
          onClick={() => setMode('edit')}
          style={{
            padding: '6px 14px',
            border: 'none',
            background: mode === 'edit' ? '#ffffff' : 'transparent',
            color: mode === 'edit' ? '#374151' : '#6b7280',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: mode === 'edit' ? 500 : 400,
            borderRight: '1px solid #e5e7eb',
          }}
        >
          ✏️ 编辑
        </button>
        <button
          onClick={() => setMode('preview')}
          style={{
            padding: '6px 14px',
            border: 'none',
            background: mode === 'preview' ? '#ffffff' : 'transparent',
            color: mode === 'preview' ? '#374151' : '#6b7280',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: mode === 'preview' ? 500 : 400,
          }}
        >
          👁️ 预览
        </button>
        <div style={{ flex: 1 }} />
        <span
          style={{
            padding: '6px 10px',
            color: '#9ca3af',
            fontSize: '11px',
          }}
        >
          支持 **加粗** / *斜体* / - 列表
        </span>
      </div>

      {mode === 'edit' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            lineHeight: '1.6',
            resize: 'vertical',
            minHeight,
            fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace",
            boxSizing: 'border-box',
          }}
        />
      ) : (
        <div
          style={{
            padding: '12px',
            minHeight,
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#374151',
            backgroundColor: '#ffffff',
          }}
          className="markdown-preview"
        >
          {value ? (
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p style={{ margin: '0 0 8px 0' }}>{children}</p>
                ),
                ul: ({ children }) => (
                  <ul
                    style={{
                      margin: '0 0 8px 0',
                      paddingLeft: '20px',
                    }}
                  >
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol
                    style={{
                      margin: '0 0 8px 0',
                      paddingLeft: '20px',
                    }}
                  >
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li style={{ marginBottom: '4px' }}>{children}</li>
                ),
                strong: ({ children }) => (
                  <strong style={{ fontWeight: 600 }}>{children}</strong>
                ),
                em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
                h1: ({ children }) => (
                  <h1
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      margin: '0 0 8px 0',
                    }}
                  >
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      margin: '0 0 6px 0',
                    }}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      margin: '0 0 4px 0',
                    }}
                  >
                    {children}
                  </h3>
                ),
                code: ({ children }) => (
                  <code
                    style={{
                      backgroundColor: '#f3f4f6',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      fontSize: '12px',
                      fontFamily: "'Monaco', 'Menlo', monospace",
                    }}
                  >
                    {children}
                  </code>
                ),
                blockquote: ({ children }) => (
                  <blockquote
                    style={{
                      margin: '0 0 8px 0',
                      paddingLeft: '12px',
                      borderLeft: '3px solid #d1d5db',
                      color: '#6b7280',
                    }}
                  >
                    {children}
                  </blockquote>
                ),
              }}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <span style={{ color: '#d1d5db' }}>暂无内容</span>
          )}
        </div>
      )}
    </div>
  );
}
