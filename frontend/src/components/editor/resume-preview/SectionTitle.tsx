interface SectionTitleProps {
  children: React.ReactNode;
  primaryColor: string;
  sectionTitleColor?: string;
  sectionTitleSize?: number;
  variant?: 'classic' | 'sidebar' | 'minimal';
  sidebar?: boolean;
}

export function SectionTitle({
  children,
  primaryColor,
  sectionTitleColor,
  sectionTitleSize = 16,
  variant = 'classic',
  sidebar = false,
}: SectionTitleProps) {
  if (sidebar) {
    return (
      <h3
        className="font-bold mb-3 pb-1"
        style={{
          color: primaryColor,
          fontSize: '14px',
          borderBottom: `1px solid ${primaryColor}60`,
        }}
      >
        {children}
      </h3>
    );
  }

  if (variant === 'minimal') {
    return (
      <h2
        className="font-bold mb-4 tracking-widest uppercase"
        style={{
          color: primaryColor,
          fontSize: '13px',
          letterSpacing: '3px',
        }}
      >
        {children}
      </h2>
    );
  }

  return (
    <h2
      className="font-semibold mb-4 flex items-center"
      style={{
        color: sectionTitleColor || primaryColor,
        fontSize: `${sectionTitleSize}px`,
        paddingBottom: '8px',
        borderBottom: `2px solid ${sectionTitleColor || primaryColor}`,
      }}
    >
      <span
        className="mr-3 rounded"
        style={{ width: '4px', height: '20px', backgroundColor: primaryColor }}
      ></span>
      {children}
    </h2>
  );
}
