import type { RendererProps } from './index';
import { SectionWrapper } from './SectionWrapper';
import ReactMarkdown from 'react-markdown';
import { getIconComponent } from '@/utils/section-icons';

const DEFAULT_ICONS: Record<string, string> = {
  email: 'Mail',
  phone: 'Phone',
  location: 'MapPin',
  website: 'Globe',
};

function getFieldIcon(data: any, field: string) {
  const iconKey = `${field}Icon`;
  const custom = data?.[iconKey];
  if (custom !== undefined && custom !== null) {
    const Comp = getIconComponent(custom);
    if (Comp) return Comp;
  }
  const defaultName = DEFAULT_ICONS[field];
  if (defaultName) {
    return getIconComponent(defaultName);
  }
  return null;
}

export function ProfileRenderer({
  section,
  style,
  variant,
  isHighlighted,
  onClick,
}: RendererProps) {
  if (section.type !== 'profile') return null;
  const data = section.data as any;

  const baseSize = style.fontSize || 14;
  const contactSize = `${baseSize}px`;
  const smallSize = `${Math.max(baseSize - 2, 10)}px`;

  const renderContactItem = (field: string, value: string, color: string) => {
    if (!value) return null;
    const Icon = getFieldIcon(data, field);
    return (
      <span
        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
      >
        {Icon && <Icon size={13} color={color} />}
        {value}
      </span>
    );
  };

  function renderFieldIcon(
    data: any,
    field: string,
    size: number,
    color: string
  ) {
    const Icon = getFieldIcon(data, field);
    if (!Icon) return null;
    return <Icon size={size} color={color} />;
  }

  if (variant === 'sidebar') {
    const sidebarIconColor = 'rgba(255,255,255,0.7)';
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
              fontSize: smallSize,
              color: '#d1d5db',
              margin: '4px 0 12px 0',
            }}
          >
            {data.title}
          </p>
        )}
        <div style={{ fontSize: smallSize, color: '#9ca3af', lineHeight: 1.8 }}>
          {data.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {renderFieldIcon(data, 'email', 12, sidebarIconColor)}
              {data.email}
            </div>
          )}
          {data.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {renderFieldIcon(data, 'phone', 12, sidebarIconColor)}
              {data.phone}
            </div>
          )}
          {data.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {renderFieldIcon(data, 'location', 12, sidebarIconColor)}
              {data.location}
            </div>
          )}
          {data.website && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {renderFieldIcon(data, 'website', 12, sidebarIconColor)}
              {data.website}
            </div>
          )}
        </div>
      </div>
    );
  }

  const primaryColor = style.primaryColor || '#2563eb';

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
            color: variant === 'modern' ? primaryColor : '#111827',
            letterSpacing: variant === 'modern' ? '1px' : 'normal',
          }}
        >
          {data.name || '姓名'}
        </h1>
        {data.title && (
          <p
            style={{
              fontSize: contactSize,
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
            gap: '16px',
            fontSize: contactSize,
            color: '#6b7280',
          }}
        >
          {renderContactItem('email', data.email, primaryColor)}
          {renderContactItem('phone', data.phone, primaryColor)}
          {renderContactItem('location', data.location, primaryColor)}
          {renderContactItem('website', data.website, primaryColor)}
        </div>
        {data.summary && (
          <div
            style={{
              marginTop: '12px',
              fontSize: contactSize,
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
