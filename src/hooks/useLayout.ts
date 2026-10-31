import { useMediaQuery, useTheme } from '@mui/material';

export const BOTTOM_NAV_HEIGHT = 56;

export function useIsCompact(): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
}

export function useIsWide(): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up('lg'), { noSsr: true });
}

export const SNACKBAR_OFFSET_SX = {
  bottom: {
    xs: `calc(${BOTTOM_NAV_HEIGHT + 8}px + env(safe-area-inset-bottom))`,
    md: 24,
  },
} as const;
