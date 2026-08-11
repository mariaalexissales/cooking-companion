import type { ThemeFamily, ThemeMode } from './tokens';

export interface AppThemeExtras {
  family: ThemeFamily;
  mode: ThemeMode;
  texture: string | null;
  aberration: [string, string] | null;
  headingPrefix: string;
  border: string;
}

declare module '@mui/material/styles' {
  interface Palette {
    readout: Palette['primary'];
    gold: Palette['primary'];
  }

  interface PaletteOptions {
    readout?: PaletteOptions['primary'];
    gold?: PaletteOptions['primary'];
  }

  interface Theme {
    app: AppThemeExtras;
  }

  interface ThemeOptions {
    app?: AppThemeExtras;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    readout: true;
    gold: true;
  }
}
