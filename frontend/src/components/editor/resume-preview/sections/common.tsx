import { SectionTitle } from '../SectionTitle';

interface SectionWrapperProps {
  title: string;
  children: React.ReactNode;
  primaryColor: string;
  lineColor: string;
  sectionTitleColor?: string;
  sectionTitleSize?: number;
  highlightClass?: string;
  variant?: 'classic' | 'sidebar' | 'minimal';
  hasDivider?: boolean;
}

export function SectionWrapper({
  title,
  children,
  primaryColor,
  lineColor,
  sectionTitleColor,
  sectionTitleSize,
  highlightClass = '',
  variant = 'classic',
  hasDivider = true,
}: SectionWrapperProps) {
  const className = hasDivider
    ? `mb-6 pb-6 ${highlightClass}`
    : `mb-6 ${highlightClass}`;

  const style = hasDivider
    ? { borderBottom: `1px solid ${lineColor}` }
    : {};

  return (
    <div className={className} style={style}>
      <SectionTitle
        primaryColor={primaryColor}
        sectionTitleColor={sectionTitleColor}
        sectionTitleSize={sectionTitleSize}
        variant={variant}
      >
        {title}
      </SectionTitle>
      {children}
    </div>
  );
}

export function AchievementList({
  achievements,
  primaryColor,
  fontSize = '12px',
  color = '#666',
}: {
  achievements: string[];
  primaryColor: string;
  fontSize?: string;
  color?: string;
}) {
  if (!achievements || achievements.length === 0) return null;

  return (
    <ul className="mt-2">
      {achievements.map((achievement, index) => (
        <li key={index} className="flex items-start mt-1" style={{ fontSize, color }}>
          <span className="mr-2" style={{ color: primaryColor }}>
            •
          </span>
          {achievement}
        </li>
      ))}
    </ul>
  );
}

export function TechStackTags({
  techStack,
  primaryColor,
  variant = 'classic',
}: {
  techStack: string[];
  primaryColor: string;
  variant?: 'classic' | 'minimal';
}) {
  if (!techStack || techStack.length === 0) return null;

  if (variant === 'minimal') {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {techStack.map((tech, index) => (
          <span
            key={index}
            style={{
              fontSize: '11px',
              color: '#888',
              padding: '2px 0',
              borderBottom: `1px solid ${primaryColor}40`,
            }}
          >
            {tech}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {techStack.map((tech, index) => (
        <span
          key={index}
          className="px-2 py-0.5 rounded text-xs"
          style={{
            backgroundColor: `${primaryColor}20`,
            color: primaryColor,
            border: `1px solid ${primaryColor}40`,
          }}
        >
          {tech}
        </span>
      ))}
    </div>
  );
}

export function DescriptionHtml({
  html,
  fontSize = '12px',
  color = '#666',
  lineHeight,
}: {
  html: string;
  fontSize?: string;
  color?: string;
  lineHeight?: string;
}) {
  if (!html) return null;

  return (
    <div
      className="text-gray-600 mt-2 prose prose-sm max-w-none"
      style={{ fontSize, color, lineHeight }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
