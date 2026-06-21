import React from 'react';
import { useTheme, Theme } from '../context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes: { id: Theme; label: string; icon: React.ReactNode }[] = [
    {
      id: 'light',
      label: 'Light',
      icon: <Sun id="theme-icon-light" className="w-4 h-4" />,
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: <Moon id="theme-icon-dark" className="w-4 h-4" />,
    },
    {
      id: 'system',
      label: 'System',
      icon: <Monitor id="theme-icon-system" className="w-4 h-4" />,
    },
  ];

  return (
    <div id="theme-toggle-container" className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-zinc-800 rounded-full border border-gray-200 dark:border-zinc-700 w-fit">
      {themes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            id={`theme-btn-${t.id}`}
            onClick={() => setTheme(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
              isActive
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            title={`${t.label} Mode`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
