interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A5A26]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em] text-[#17211D]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66736D]">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
