import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { THEMES } from './themes';
import { TOKENS, type ThemeFamily, type ThemeMode } from './tokens';
import { ThemeControllerContext, type ThemeControllerValue } from './context';

const STORAGE_KEY = 'cooking-companion:theme';

const FAMILIES: ThemeFamily[] = ['umineko', 'estral', 'classic'];

interface StoredPreference {
  family: ThemeFamily;
  mode: ThemeMode;
}

function readStoredPreference(): StoredPreference {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const fallback: StoredPreference = {
    family: 'umineko',
    mode: prefersDark ? 'dark' : 'light',
  };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return fallback;
    const { family, mode } = parsed as Partial<StoredPreference>;
    return {
      family: family && FAMILIES.includes(family) ? family : fallback.family,
      mode: mode === 'light' || mode === 'dark' ? mode : fallback.mode,
    };
  } catch {
    return fallback;
  }
}

function persistPreference(preference: StoredPreference): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
    return true;
  } catch {
    return false;
  }
}

export default function ThemeControllerProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<StoredPreference>(readStoredPreference);

  useEffect(() => {
    persistPreference(preference);
  }, [preference]);

  useEffect(() => {
    const color = TOKENS[preference.family][preference.mode].bg;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = color;
  }, [preference]);

  const setFamily = useCallback((family: ThemeFamily) => {
    setPreference((prev) => ({ ...prev, family }));
  }, []);

  const setMode = useCallback((mode: ThemeMode) => {
    setPreference((prev) => ({ ...prev, mode }));
  }, []);

  const toggleMode = useCallback(() => {
    setPreference((prev) => ({ ...prev, mode: prev.mode === 'dark' ? 'light' : 'dark' }));
  }, []);

  const value = useMemo<ThemeControllerValue>(
    () => ({ ...preference, setFamily, setMode, toggleMode }),
    [preference, setFamily, setMode, toggleMode],
  );

  const theme = THEMES[preference.family][preference.mode];

  return (
    <ThemeControllerContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeControllerContext.Provider>
  );
}
