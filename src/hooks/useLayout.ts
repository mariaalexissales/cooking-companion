import { useMediaQuery, useTheme } from '@mui/material';

export const BOTTOM_NAV_HEIGHT = 56;

export function useIsCompact(): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('lg'), { noSsr: true });
}
