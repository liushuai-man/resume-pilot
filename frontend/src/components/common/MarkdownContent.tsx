import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({
  content,
  className = '',
}: MarkdownContentProps) {
  return (
    <div className={`min-w-0 break-words text-sm leading-6 ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mb-2 mt-3 text-base font-semibold first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-3 text-[15px] font-semibold first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-1.5 mt-2.5 text-sm font-semibold first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2 whitespace-pre-wrap last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 border-slate-300 pl-3 text-slate-600">
              {children}
            </blockquote>
          ),
          pre: ({ children }) => (
            <pre className="my-2 max-w-full overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs leading-5 text-slate-100">
              {children}
            </pre>
          ),
          code: ({ children }) => (
            <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[0.85em] text-slate-800">
              {children}
            </code>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline decoration-blue-300 underline-offset-2"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-3 border-slate-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownContent;
