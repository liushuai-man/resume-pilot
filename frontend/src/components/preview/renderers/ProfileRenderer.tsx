import type { RendererProps } from './index';
import { SectionWrapper } from './SectionWrapper';
import ReactMarkdown from 'react-markdown';

export function ProfileRenderer({
  section,
  style,
  variant,
  isHighlighted,
  onClick,
}: RendererProps) {
  if (section.type !== 'profile') return null;
  const data = section.data as any;

  if (variant === 'sidebar') {
    return (
      <div
        onClick={onClick}
        style={{
          padding: '20px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        className={isHighlighted ? 'highlighted' : ''}
      >
        {data.avatar && (
          <div style={{ marginBottom: '12px' }}>
            <img
              src={data.avatar}
              alt={data.name}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}
        <h1
          style={{
            fontSize: '20px',
            fontWeight: 700,
            margin: 0,
            color: '#fff',
          }}
        >
          {data.name || '姓名'}
        </h1>
        {data.title && (
          <p
            style={{
              fontSize: '13px',
              color: '#d1d5db',
              margin: '4px 0 12px 0',
            }}
          >
            {data.title}
          </p>
        )}
        <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.8 }}>
          {data.email && <div>✉ {data.email}</div>}
          {data.phone && <div>📱 {data.phone}</div>}
          {data.location && <div>📍 {data.location}</div>}
          {data.website && <div>🌐 {data.website}</div>}
        </div>
      </div>
    );
  }

  return (
    <SectionWrapper
      title=""
      style={style}
      variant={variant}
      isHighlighted={isHighlighted}
      onClick={onClick}
    >
      <div
        style={{
          textAlign: variant === 'minimal' ? 'left' : 'center',
          marginBottom: variant === 'minimal' ? '16px' : '20px',
        }}
      >
        <h1
          style={{
            fontSize: variant === 'minimal' ? '22px' : '28px',
            fontWeight: 700,
            margin: 0,
            color: variant === 'modern' ? style.primaryColor : '#111827',
            letterSpacing: variant === 'modern' ? '1px' : 'normal',
          }}
        >
          {data.name || '姓名'}
        </h1>
        {data.title && (
          <p
            style={{
              fontSize: variant === 'minimal' ? '14px' : '16px',
              color: '#6b7280',
              margin: '4px 0 12px 0',
              fontWeight: 500,
            }}
          >
            {data.title}
          </p>
        )}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: variant === 'minimal' ? 'flex-start' : 'center',
            gap: '12px',
            fontSize: '13px',
            color: '#6b7280',
          }}
        >
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>📱 {data.phone}</span>}
          {data.location && <span>📍 {data.location}</span>}
          {data.website && <span>🌐 {data.website}</span>}
        </div>
        {data.summary && (
          <div
            style={{
              marginTop: '12px',
              fontSize: '13px',
              color: '#4b5563',
              lineHeight: 1.6,
              textAlign: 'left',
            }}
          >
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p style={{ margin: '0 0 6px 0' }}>{children}</p>
                ),
                strong: ({ children }) => (
                  <strong style={{ fontWeight: 600 }}>{children}</strong>
                ),
                ul: ({ children }) => (
                  <ul style={{ margin: '0 0 6px 0', paddingLeft: '18px' }}>
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li style={{ marginBottom: '2px' }}>{children}</li>
                ),
              }}
            >
              {data.summary}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
