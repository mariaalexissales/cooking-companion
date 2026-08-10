import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import KitchenOutlinedIcon from '@mui/icons-material/KitchenOutlined';
import type { ReactElement } from 'react';

export interface NavItem {
  label: string;
  to: string;
  icon: ReactElement;
  badge?: 'urgent';
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Pantry', to: '/', icon: <Inventory2OutlinedIcon /> },
  { label: 'Fridge', to: '/fridge', icon: <KitchenOutlinedIcon />, badge: 'urgent' },
];
