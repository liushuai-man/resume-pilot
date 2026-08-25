import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/theme/ThemeProvider';

export default function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const label = isDark ? '切换到浅色模式' : '切换到深色模式';

  return (
    <button
      type="button"
      onClick={toggleColorScheme}
      title={label}
      aria-label={label}
      aria-pressed={isDark}
      className="theme-toggle group relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface text-muted transition-colors hover:border-border-strong hover:bg-brand-soft hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <Sun className={`absolute transition-all duration-300 motion-reduce:transition-none ${isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} size={17} />
      <Moon className={`absolute transition-all duration-300 motion-reduce:transition-none ${isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} size={17} />
    </button>
  );
}
