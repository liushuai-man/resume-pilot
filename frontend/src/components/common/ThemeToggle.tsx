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
      className="theme-toggle group relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#D8E1DD] bg-white text-[#52615B] transition-colors hover:border-[#B9CAC3] hover:bg-[#F3F7F5] hover:text-[#176B52] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176B52]"
    >
      <Sun className={`absolute transition-all duration-300 motion-reduce:transition-none ${isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} size={17} />
      <Moon className={`absolute transition-all duration-300 motion-reduce:transition-none ${isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} size={17} />
    </button>
  );
}
