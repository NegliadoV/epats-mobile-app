import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { Colors, palette, ThemeName } from './tokens';

interface ThemeCtx {
  theme: ThemeName;
  c: Colors;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);
const KEY = 'epats_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Основная тема по умолчанию — тёмная. Светлая только если пользователь сам выбрал в настройках
  const [theme, setTheme] = useState<ThemeName>('dark');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(v => {
      if (v === 'dark' || v === 'light') setTheme(v);
    });
  }, []);

  const value = useMemo<ThemeCtx>(() => ({
    theme,
    c: palette[theme],
    toggle: () => setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(KEY, next);
      return next;
    }),
  }), [theme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme must be used inside ThemeProvider');
  return v;
}
