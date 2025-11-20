import { StrictMode } from 'react'
import AppRoutes from '@/routes/AppRoutes.jsx'
import './App.css'
import { createContext, useState, useEffect, useMemo } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';

export const ThemeContext = createContext();

export default function App() {
  const { session, checking } = useAuthSession();
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // When not authenticated, always force theme to light
  useEffect(() => {
    if (!checking && !session) {
      setTheme('light');
      localStorage.removeItem('theme');
    }
  }, [session, checking]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')) }), [theme]);

  return (
    <StrictMode>
      <ThemeContext.Provider value={value}>
        <AppRoutes />
      </ThemeContext.Provider>
    </StrictMode>
  );
}