import { createContext, useContext } from 'react';
import type { ThemeFamily, ThemeMode } from './tokens';

export interface ThemeControllerValue {
  family: ThemeFamily;
  mode: ThemeMode;
  setFamily: (family: ThemeFamily) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const ThemeControllerContext = createContext<ThemeControllerValue | null>(null);

export function useThemeController(): ThemeControllerValue {
  const value = useContext(ThemeControllerContext);
  if (!value) {
    throw new Error('useThemeController must be used inside ThemeControllerProvider');
  }
  return value;
}
