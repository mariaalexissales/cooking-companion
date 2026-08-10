import {
  AppBar,
  Box,
  Button,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import companionImg from '../assets/image.png';
import { NAV_ITEMS } from './navItems';

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { pathname } = useLocation();

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
          <Typography
            variant="h1"
            component={RouterLink}
            to="/"
            sx={{
              color: 'inherit',
              textDecoration: 'none',
              fontSize: { xs: '22px', sm: '48px' },
            }}
          >
            Cooking Companion
          </Typography>
          <Typography variant="subtitle1" sx={{ fontSize: { xs: '15px', sm: '32px' } }} noWrap>
            I am the cooking companion that never leaves your side!
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {!isMobile && (
          <Stack direction="row" spacing={1}>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.to;
              return (
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
            })}
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}
