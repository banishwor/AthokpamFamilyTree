import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const changeAppliedTheme = () => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'system') {
        isDark = mediaQuery.matches;
      }

      setResolvedTheme(isDark ? 'dark' : 'light');

      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    changeAppliedTheme();

    mediaQuery.addEventListener('change', changeAppliedTheme);
    return () => {
      mediaQuery.removeEventListener('change', changeAppliedTheme);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
export default ThemeContext;
