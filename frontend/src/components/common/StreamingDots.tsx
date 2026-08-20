interface StreamingDotsProps {
  label?: string;
  className?: string;
}

export default function StreamingDots({ label = '正在生成', className = '' }: StreamingDotsProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 align-middle ${className}`}
      role="status"
      aria-label={label}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <span
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-[#176B52] opacity-30 motion-reduce:animate-none"
          style={{
            animation: 'resume-pilot-stream-dot 1.05s ease-in-out infinite',
            animationDelay: `${index * 90}ms`,
          }}
        />
      ))}
      <style>{`
        @keyframes resume-pilot-stream-dot {
          0%, 80%, 100% { opacity: 0.28; transform: translateY(0); }
          35% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </span>
  );
}
