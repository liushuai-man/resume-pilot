import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ColorScheme = 'light' | 'dark';

interface ThemeContextValue {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
}

const STORAGE_KEY = 'resume-pilot-color-scheme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialColorScheme(): ColorScheme {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(getInitialColorScheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = colorScheme;
    root.style.colorScheme = colorScheme;
    window.localStorage.setItem(STORAGE_KEY, colorScheme);
  }, [colorScheme]);

  const value = useMemo(
    () => ({
      colorScheme,
      toggleColorScheme: () => setColorScheme((current) => current === 'light' ? 'dark' : 'light'),
    }),
    [colorScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
