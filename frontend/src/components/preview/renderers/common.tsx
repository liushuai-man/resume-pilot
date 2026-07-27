import type { TemplateVariant } from './index';
import ReactMarkdown from 'react-markdown';

interface TechStackTagsProps {
  techStack: string[];
  primaryColor: string;
  variant: TemplateVariant;
}

export function TechStackTags({
  techStack,
  primaryColor,
  variant,
}: TechStackTagsProps) {
  if (!techStack || techStack.length === 0) return null;

  if (variant === 'minimal') {
    return (
      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
        {techStack.join(' · ')}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginTop: '8px',
      }}
    >
      {techStack.map((tech, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            backgroundColor:
              variant === 'sidebar'
                ? 'rgba(255,255,255,0.15)'
                : `${primaryColor}15`,
            color: variant === 'sidebar' ? '#fff' : primaryColor,
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: 500,
          }}
        >
          {tech}
        </span>
      ))}
    </div>
  );
}

interface AchievementListProps {
  achievements: string[];
  fontSize: string;
}

export function AchievementList({
  achievements,
  fontSize,
}: AchievementListProps) {
  if (!achievements || achievements.length === 0) return null;

  return (
    <ul
      style={{
        paddingLeft: '16px',
        margin: 0,
        marginTop: '6px',
      }}
    >
      {achievements.map((item, index) => (
        <li
          key={index}
          style={{
            fontSize,
            color: '#4b5563',
            lineHeight: 1.6,
            marginBottom: '2px',
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

interface DescriptionTextProps {
  text: string;
  fontSize: string;
  variant: TemplateVariant;
}

export function DescriptionText({
  text,
  fontSize,
  variant,
}: DescriptionTextProps) {
  if (!text) return null;

  const textColor = variant === 'sidebar' ? '#d1d5db' : '#4b5563';

  return (
    <div
      style={{
        fontSize,
        color: textColor,
        lineHeight: 1.6,
        margin: 0,
        marginTop: '6px',
      }}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p style={{ margin: '0 0 6px 0' }}>{children}</p>
          ),
          ul: ({ children }) => (
            <ul style={{ margin: '0 0 6px 0', paddingLeft: '18px' }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol style={{ margin: '0 0 6px 0', paddingLeft: '18px' }}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li style={{ marginBottom: '2px', lineHeight: 1.6 }}>{children}</li>
          ),
          strong: ({ children }) => (
            <strong style={{ fontWeight: 600 }}>{children}</strong>
          ),
          em: ({ children }) => <em>{children}</em>,
          code: ({ children }) => (
            <code
              style={{
                backgroundColor: 'rgba(0,0,0,0.06)',
                padding: '1px 4px',
                borderRadius: '3px',
                fontSize: '0.9em',
              }}
            >
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote
              style={{
                margin: '0 0 6px 0',
                paddingLeft: '10px',
                borderLeft: `3px solid ${
                  variant === 'sidebar' ? 'rgba(255,255,255,0.2)' : '#d1d5db'
                }`,
                color: variant === 'sidebar' ? '#9ca3af' : '#6b7280',
              }}
            >
              {children}
            </blockquote>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

interface DateRangeProps {
  startDate: string;
  endDate: string;
  variant: TemplateVariant;
}

export function DateRange({ startDate, endDate, variant }: DateRangeProps) {
  const dateStr = formatDateRange(startDate, endDate);

  return (
    <span
      style={{
        fontSize: '12px',
        color: variant === 'sidebar' ? '#9ca3af' : '#9ca3af',
        whiteSpace: 'nowrap',
      }}
    >
      {dateStr}
    </span>
  );
}

function formatDateRange(start: string, end: string): string {
  if (!start && !end) return '';
  if (start && !end) return `${formatDate(start)} - 至今`;
  if (!start && end) return formatDate(end);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  if (dateStr.includes('T')) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  return dateStr;
}
