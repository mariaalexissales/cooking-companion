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
  useMediaQuery,
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

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode, toggleMode } = useThemeController();
  const { pathname } = useLocation();
  const urgentCount = useUrgentCount();

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: 1 }}>
        <Box
          component="img"
          src={companionImg}
          alt=""
          sx={{
            height: { xs: 48, sm: 88 },
            width: { xs: 48, sm: 88 },
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
          <Typography variant="subtitle1" color="text.secondary" noWrap>
            I am the cooking companion that never leaves your side!
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {!isMobile && (
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
          >
            {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Settings">
          <IconButton component={RouterLink} to="/settings" color="inherit" aria-label="Settings">
            <SettingsOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
