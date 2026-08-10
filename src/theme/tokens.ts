export type ThemeFamily = 'umineko' | 'estral' | 'classic';
export type ThemeMode = 'light' | 'dark';

export interface ThemeTokens {
  bg: string;
  surface: string;
  raised: string;
  primary: string;
  primaryContrast: string;
  accent: string;
  accentContrast: string;
  text: string;
  muted: string;
  border: string;
  gold: string;
  readout: string;
  error: string;
  warning: string;
  info: string;
  success: string;
  bgImage: string | null;
  texture: string | null;
  textureBlend: string;
  aberration: [string, string] | null;
}

export const TOKENS: Record<ThemeFamily, Record<ThemeMode, ThemeTokens>> = {
  umineko: {
    dark: {
      bg: '#2d0c13',
      surface: '#561d20',
      raised: '#783a40',
      primary: '#cf868c',
      primaryContrast: '#1a0509',
      accent: '#e8c46a',
      accentContrast: '#2d0c13',
      text: '#e3b68e',
      muted: '#d4a57d',
      border: '#6c4c2d',
      gold: '#e8c46a',
      readout: '#d4a57d',
      error: '#f4808f',
      warning: '#e8a33d',
      info: '#8fb3c4',
      success: '#7fb88f',
      bgImage:
        'radial-gradient(circle at 15% 0%, rgba(232,196,106,.06), transparent 45%), ' +
        'radial-gradient(circle at 85% 100%, rgba(120,58,64,.28), transparent 50%)',
      texture: null,
      textureBlend: 'normal',
      aberration: null,
    },
    light: {
      bg: '#f7f0e6',
      surface: '#efe3d3',
      raised: '#e6d5be',
      primary: '#7a2e33',
      primaryContrast: '#fbf6ef',
      accent: '#8a6410',
      accentContrast: '#fbf6ef',
      text: '#2d1216',
      muted: '#6c4c2d',
      border: '#c9ab84',
      gold: '#8a6410',
      readout: '#6c4c2d',
      error: '#b3122e',
      warning: '#8a5410',
      info: '#2a6478',
      success: '#2e6b41',
      bgImage:
        'radial-gradient(circle at 15% 0%, rgba(138,100,16,.05), transparent 45%), ' +
        'radial-gradient(circle at 85% 100%, rgba(122,46,51,.06), transparent 50%)',
      texture: null,
      textureBlend: 'normal',
      aberration: null,
    },
  },

  estral: {
    dark: {
      bg: '#0a0711',
      surface: '#150e24',
      raised: '#1e1433',
      primary: '#b78cff',
      primaryContrast: '#0a0711',
      accent: '#e85fff',
      accentContrast: '#0a0711',
      text: '#e9e3f5',
      muted: '#8478a6',
      border: 'rgba(183,140,255,.28)',
      gold: '#e8c46a',
      readout: '#6fe3ff',
      error: '#ff3b6b',
      warning: '#ff5fd2',
      info: '#6fe3ff',
      success: '#4fe3a8',
      bgImage:
        'radial-gradient(circle at 18% 12%, rgba(183,140,255,.10), transparent 42%), ' +
        'radial-gradient(circle at 82% 78%, rgba(232,95,255,.08), transparent 46%)',
      texture:
        'repeating-linear-gradient(to bottom, rgba(0,0,0,.22) 0 1px, transparent 1px 3px)',
      textureBlend: 'multiply',
      aberration: ['#ff0040', '#00ffe1'],
    },
    light: {
      bg: '#f4f1fa',
      surface: '#eae4f5',
      raised: '#ddd5ee',
      primary: '#5b2fbf',
      primaryContrast: '#f4f1fa',
      accent: '#a81fb0',
      accentContrast: '#f4f1fa',
      text: '#1a1226',
      muted: '#655a85',
      border: 'rgba(91,47,191,.30)',
      gold: '#8a6410',
      readout: '#0e6e8c',
      error: '#c41442',
      warning: '#a3178c',
      info: '#0e6e8c',
      success: '#0b6b53',
      bgImage:
        'radial-gradient(circle at 18% 12%, rgba(91,47,191,.07), transparent 42%), ' +
        'radial-gradient(circle at 82% 78%, rgba(168,31,176,.05), transparent 46%)',
      texture:
        'repeating-linear-gradient(to bottom, rgba(91,47,191,.05) 0 1px, transparent 1px 4px)',
      textureBlend: 'normal',
      aberration: ['#e0004a', '#0090c0'],
    },
  },

  classic: {
    dark: {
      bg: '#121212',
      surface: '#1e1e1e',
      raised: '#2a2a2a',
      primary: '#90caf9',
      primaryContrast: '#0d1b25',
      accent: '#f48fb1',
      accentContrast: '#2a0f19',
      text: '#e8e8e8',
      muted: '#a8a8a8',
      border: 'rgba(255,255,255,.14)',
      gold: '#d4b25a',
      readout: '#90caf9',
      error: '#f4776a',
      warning: '#ffb547',
      info: '#64b6f7',
      success: '#66bb6a',
      bgImage: null,
      texture: null,
      textureBlend: 'normal',
      aberration: null,
    },
    light: {
      bg: '#fafafa',
      surface: '#ffffff',
      raised: '#f0f2f5',
      primary: '#1976d2',
      primaryContrast: '#ffffff',
      accent: '#c2185b',
      accentContrast: '#ffffff',
      text: '#1a1a1a',
      muted: '#5f6368',
      border: 'rgba(0,0,0,.14)',
      gold: '#8a6410',
      readout: '#1565c0',
      error: '#c62828',
      warning: '#9c5c00',
      info: '#0277bd',
      success: '#2e7d32',
      bgImage: null,
      texture: null,
      textureBlend: 'normal',
      aberration: null,
    },
  },
};
