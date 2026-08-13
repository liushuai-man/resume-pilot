import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface CompactDropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface Props {
  value: string;
  options: CompactDropdownOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  menuWidth?: string;
  prefix?: ReactNode;
  align?: 'left' | 'right';
}

export default function CompactDropdown({ value, options, onChange, ariaLabel, disabled, className = '', menuWidth = 'w-64', prefix, align = 'left' }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) || options[0];
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <div ref={rootRef} className={`relative ${className}`}>
    <button type="button" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} disabled={disabled} onClick={() => setOpen((current) => !current)} className="flex h-8 max-w-full items-center gap-1.5 rounded-lg px-2 text-xs text-[#52615B] transition hover:bg-[#EEF3F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B52]/30 disabled:opacity-45">
      {prefix}{selected?.icon}<span className="truncate">{selected?.label || '请选择'}</span><ChevronDown size={12} className={`shrink-0 transition ${open ? 'rotate-180' : ''}`}/>
    </button>
    {open && <div role="listbox" aria-label={ariaLabel} className={`absolute bottom-full z-50 mb-2 ${menuWidth} ${align === 'right' ? 'right-0' : 'left-0'} rounded-xl border border-[#D8E1DD] bg-white p-1.5 shadow-[0_14px_36px_rgba(28,45,38,0.16)]`}>
      {options.map((option) => <button key={option.value} type="button" role="option" aria-selected={option.value === value} onClick={() => { onChange(option.value); setOpen(false); }} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition ${option.value === value ? 'bg-[#E4F0EB]' : 'hover:bg-[#F2F5F3]'}`}>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-[#52615B] shadow-sm">{option.icon}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-[#24312C]">{option.label}</span>{option.description && <span className="mt-0.5 block truncate text-[10px] text-[#7A8782]">{option.description}</span>}</span>{option.value === value && <Check size={14} className="shrink-0 text-[#176B52]"/>}
      </button>)}
    </div>}
  </div>;
}
