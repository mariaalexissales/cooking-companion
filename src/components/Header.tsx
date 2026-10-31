import {
  AppBar,
  Badge,
  Box,
  Button,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import companionImg from '../assets/image.png';
import { NAV_ITEMS } from './navItems';
import { useThemeController } from '../theme/context';
import { useUrgentCount } from '../hooks/useItems';
import { useIsCompact } from '../hooks/useLayout';

export default function Header() {
  const theme = useTheme();
  const isCompact = useIsCompact();
  const { mode, toggleMode } = useThemeController();
  const { pathname } = useLocation();
  const urgentCount = useUrgentCount();

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: 1, flexWrap: 'wrap', px: { xs: 1.5, sm: 3 } }}>
        <Box
          component="img"
          src={companionImg}
          alt=""
          sx={{
            height: { xs: 44, sm: 64, md: 88 },
            width: { xs: 44, sm: 64, md: 88 },
            objectFit: 'cover',
            border: `3px solid ${theme.palette.text.primary}`,
            borderRadius: '50%',
            backgroundColor: theme.palette.background.paper,
            flexShrink: 0,
          }}
        />

        <Box sx={{ ml: { xs: 1, sm: 2 }, minWidth: 0 }}>
          <Typography variant="h1" component={RouterLink} to="/" sx={{ color: 'inherit', textDecoration: 'none' }}>
            Cooking Companion
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            noWrap
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            I am the cooking companion that never leaves your side!
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {!isCompact && (
          <Stack direction="row" spacing={1}>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.to;
              const button = (
                <Button
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  color="inherit"
                  startIcon={item.icon}
                  sx={{
                    borderBottom: 2,
                    borderRadius: 0,
                    borderColor: active ? 'primary.main' : 'transparent',
                    opacity: active ? 1 : 0.75,
                  }}
                >
                  {item.label}
                </Button>
              );
              return item.badge === 'urgent' && urgentCount > 0 ? (
                <Badge key={item.to} badgeContent={urgentCount} color="error">
                  {button}
                </Badge>
              ) : (
                button
              );
            })}
          </Stack>
        )}

        <Tooltip title={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}>
          <IconButton
            color="inherit"
            onClick={toggleMode}
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            sx={{ p: { xs: 0.75, sm: 1 } }}
          >
            {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Settings">
          <IconButton
            component={RouterLink}
            to="/settings"
            color="inherit"
            aria-label="Settings"
            sx={{ p: { xs: 0.75, sm: 1 } }}
          >
            <SettingsOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
