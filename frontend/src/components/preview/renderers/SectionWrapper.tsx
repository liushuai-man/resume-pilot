import React from 'react';
import type { ResumeStyle } from '@/types/resume-document';
import type { TemplateVariant } from './index';

interface SectionWrapperProps {
  title: string;
  style: ResumeStyle;
  variant: TemplateVariant;
  isHighlighted?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function SectionWrapper({
  title,
  style,
  variant,
  isHighlighted,
  onClick,
  children,
}: SectionWrapperProps) {
  const titleStyles = getTitleStyle(style, variant);
  const wrapperStyles = getWrapperStyle(style);

  return (
    <div
      className={`resume-section ${variant} ${isHighlighted ? 'highlighted' : ''}`}
      style={wrapperStyles}
      onClick={onClick}
    >
      {variant !== 'minimal' && title && (
        <h2 className="section-title" style={titleStyles}>
          {title}
        </h2>
      )}
      <div className="section-content">{children}</div>
    </div>
  );
}

function getTitleStyle(
  style: ResumeStyle,
  variant: TemplateVariant
): React.CSSProperties {
  const base: React.CSSProperties = {
    color: style.sectionTitleColor || '#1f2937',
    fontSize: `${style.sectionTitleSize || 16}px`,
    fontWeight: 600,
    margin: 0,
    marginBottom: '12px',
    lineHeight: 1.3,
  };

  switch (variant) {
    case 'modern':
      return {
        ...base,
        borderBottom: `2px solid ${style.primaryColor}`,
        paddingBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontSize: '14px',
      };
    case 'classic':
      return {
        ...base,
        borderBottom: `1px solid ${style.lineColor || '#e5e7eb'}`,
        paddingBottom: '8px',
      };
    case 'minimal':
      return {
        ...base,
        fontSize: '13px',
        fontWeight: 500,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
      };
    case 'sidebar':
      return {
        ...base,
        color: style.sidebarTextColor || '#374151',
        fontSize: '13px',
        marginBottom: '8px',
      };
    default:
      return base;
  }
}

function getWrapperStyle(style: ResumeStyle): React.CSSProperties {
  const base: React.CSSProperties = {
    marginBottom: `${style.sectionSpacing}px`,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    borderRadius: '2px',
  };

  return base;
}
