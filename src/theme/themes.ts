import { createTheme, type Theme } from '@mui/material/styles';
import { TOKENS, type ThemeFamily, type ThemeMode, type ThemeTokens } from './tokens';

const FONT_STACKS: Record<ThemeFamily, { body: string; display: string }> = {
  umineko: {
    body: '"Roboto", "Helvetica Neue", Arial, sans-serif',
    display: '"Mea Culpa", cursive',
  },
  estral: {
    body: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    display: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  classic: {
    body: '"Roboto", "Helvetica Neue", Arial, sans-serif',
    display: '"Roboto", "Helvetica Neue", Arial, sans-serif',
  },
};

const RADIUS: Record<ThemeFamily, number> = {
  umineko: 10,
  estral: 0,
  classic: 8,
};

const HEADING_PREFIX: Record<ThemeFamily, string> = {
  umineko: '',
  estral: '❯ ',
  classic: '',
};

function buildTheme(family: ThemeFamily, mode: ThemeMode): Theme {
  const t: ThemeTokens = TOKENS[family][mode];
  const fonts = FONT_STACKS[family];
  const isEstral = family === 'estral';
  const base = createTheme({ palette: { mode } });

  return createTheme({
    palette: {
      mode,
      primary: { main: t.primary, contrastText: t.primaryContrast },
      secondary: { main: t.accent, contrastText: t.accentContrast },
      background: { default: t.bg, paper: t.surface },
      text: { primary: t.text, secondary: t.muted },
      divider: t.border,
      error: { main: t.error },
      warning: { main: t.warning },
      info: { main: t.info },
      success: { main: t.success },
      readout: base.palette.augmentColor({ color: { main: t.readout }, name: 'readout' }),
      gold: base.palette.augmentColor({ color: { main: t.gold }, name: 'gold' }),
    },

    shape: { borderRadius: RADIUS[family] },

    typography: {
      fontFamily: fonts.body,
      h1: {
        fontFamily: fonts.body,
        fontSize: 'clamp(1.35rem, 4.5vw, 2.75rem)',
        fontWeight: 600,
        letterSpacing: isEstral ? '.12em' : '.01em',
        lineHeight: 1.15,
      },
      h5: {
        fontSize: 'clamp(1.05rem, 2.6vw, 1.4rem)',
        fontWeight: 600,
        letterSpacing: isEstral ? '.14em' : 'normal',
        textTransform: isEstral ? 'uppercase' : 'none',
      },
      h6: {
        fontWeight: 600,
        letterSpacing: isEstral ? '.1em' : 'normal',
      },
      subtitle1: {
        fontFamily: fonts.display,
        fontSize: isEstral ? 'clamp(.72rem, 1.8vw, .95rem)' : 'clamp(.95rem, 3vw, 2rem)',
        letterSpacing: isEstral ? '.18em' : 'normal',
        lineHeight: 1.3,
      },
      overline: {
        letterSpacing: '.18em',
        fontWeight: 600,
      },
      button: {
        textTransform: isEstral ? 'uppercase' : 'none',
        letterSpacing: isEstral ? '.14em' : '.02em',
        fontWeight: 600,
      },
    },

    app: {
      family,
      mode,
      texture: t.texture,
      textureBlend: t.textureBlend,
      aberration: t.aberration,
      headingPrefix: HEADING_PREFIX[family],
      border: t.border,
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: t.bg,
            backgroundImage: t.bgImage ?? 'none',
            backgroundAttachment: 'fixed',
            ...(t.texture
              ? {
                  '&::after': {
                    content: '""',
                    position: 'fixed',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 2000,
                    background: t.texture,
                    mixBlendMode: t.textureBlend,
                  },
                }
              : {}),
          },
        },
      },

      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: t.surface,
            backgroundImage: 'none',
            color: t.text,
            borderBottom: `1px solid ${t.border}`,
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            ...(isEstral ? { border: `1px solid ${t.border}` } : {}),
          },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
      },

      MuiListItem: {
        styleOverrides: {
          root: {
            '&:hover': { backgroundColor: t.raised },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },

      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            backgroundColor: t.surface,
            borderTop: `1px solid ${t.border}`,
          },
        },
      },

      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            color: t.muted,
            '&.Mui-selected': { color: t.primary },
          },
        },
      },
    },
  });
}

export const THEMES: Record<ThemeFamily, Record<ThemeMode, Theme>> = {
  umineko: { light: buildTheme('umineko', 'light'), dark: buildTheme('umineko', 'dark') },
  estral: { light: buildTheme('estral', 'light'), dark: buildTheme('estral', 'dark') },
  classic: { light: buildTheme('classic', 'light'), dark: buildTheme('classic', 'dark') },
};

export interface ThemeMetaEntry {
  label: string;
  blurb: string;
}

export const THEME_META: Record<ThemeFamily, ThemeMetaEntry> = {
  umineko: {
    label: 'Umineko',
    blurb: 'Bordeaux and gold. Dark is a candlelit dining hall, light is an old parchment page.',
  },
  estral: {
    label: 'Estral',
    blurb: 'Daemon violet and readout cyan in monospace. Dark is the running program, light is the printed record.',
  },
  classic: {
    label: 'Classic',
    blurb: 'Plain and high contrast. No texture, no ceremony.',
  },
};

export const THEME_FAMILIES: ThemeFamily[] = ['umineko', 'estral', 'classic'];

export function swatchesFor(family: ThemeFamily, mode: ThemeMode): string[] {
  const t = TOKENS[family][mode];
  return [t.bg, t.surface, t.primary, t.accent, t.gold];
}
