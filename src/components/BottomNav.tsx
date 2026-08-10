import { Badge, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';
import { useUrgentCount } from '../hooks/useItems';

export default function BottomNav() {
  const { pathname } = useLocation();
  const urgentCount = useUrgentCount();

  const current = NAV_ITEMS.some((item) => item.to === pathname) ? pathname : false;

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        borderRadius: 0,
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavigation value={current} showLabels>
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.to}
            component={RouterLink}
            to={item.to}
            value={item.to}
            label={item.label}
            icon={
              item.badge === 'urgent' && urgentCount > 0 ? (
                <Badge badgeContent={urgentCount} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )
            }
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
