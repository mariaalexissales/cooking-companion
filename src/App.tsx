import { Box, Container, useTheme } from '@mui/material';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import { BOTTOM_NAV_HEIGHT, useIsCompact } from './hooks/useLayout';
import PantryPage from './pages/PantryPage';
import FridgePage from './pages/FridgePage';
import RecipesPage from './pages/RecipesPage';
import GeneratePage from './pages/GeneratePage';
import SettingsPage from './pages/SettingsPage';
import GeneratorProvider from './state/GeneratorProvider';

const WIDE_ROUTES = ['/generate', '/recipes'];

export default function App() {
  const theme = useTheme();
  const isCompact = useIsCompact();
  const { pathname } = useLocation();

  return (
    <GeneratorProvider>
      <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container
          component="main"
          maxWidth={WIDE_ROUTES.includes(pathname) ? 'lg' : 'md'}
          sx={{
            flex: 1,
            py: 3,
            pb: isCompact
              ? `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom) + ${theme.spacing(3)})`
              : 4,
          }}
        >
          <Routes>
            <Route path="/" element={<PantryPage />} />
            <Route path="/fridge" element={<FridgePage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/generate" element={<GeneratePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
        {isCompact && <BottomNav />}
      </Box>
    </GeneratorProvider>
  );
}
