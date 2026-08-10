import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import type { ReactElement } from 'react';

export interface NavItem {
  label: string;
  to: string;
  icon: ReactElement;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Pantry', to: '/', icon: <Inventory2OutlinedIcon /> },
];
