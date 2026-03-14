import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [userPreference, setUserPreference] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme | null;
      const hasPreference = localStorage.getItem('hasUserPreference') === 'true';
      if (saved && hasPreference) {
        return saved;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    if (userPreference) {
      localStorage.setItem('theme', theme);
      localStorage.setItem('hasUserPreference', 'true');
    }
  }, [theme, userPreference]);

  useEffect(() => {
    const hasPreference = localStorage.getItem('hasUserPreference') === 'true';
    setUserPreference(hasPreference);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const userHasChosen = localStorage.getItem('hasUserPreference') === 'true';
      if (!userHasChosen) {
        setTheme('matches' in event && event.matches ? 'dark' : 'light');
      }
    };

    try {
      mediaQuery.addEventListener('change', handleChange as (event: MediaQueryListEvent) => void);
    } catch {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      try {
        mediaQuery.removeEventListener('change', handleChange as (event: MediaQueryListEvent) => void);
      } catch {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const toggleTheme = () => {
    setUserPreference(true);
    setTheme((previous) => (previous === 'light' ? 'dark' : 'light'));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
