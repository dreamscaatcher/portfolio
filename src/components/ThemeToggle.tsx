// src/components/ThemeToggle.tsx
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('portfolio-theme') as 'dark' | 'light' | null;
    const initial = saved ?? 'dark';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  }

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      title="Toggle dark / light mode"
      aria-label="Toggle theme"
    >
      <div className="toggle-thumb">{theme === 'dark' ? '🌙' : '☀️'}</div>
      <div className="toggle-icons">
        <span>🌙</span>
        <span>☀️</span>
      </div>
    </button>
  );
}
