import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import PantryPage from './pages/PantryPage';

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container
        component="main"
        maxWidth="md"
        sx={{ flex: 1, py: 3, pb: isMobile ? 12 : 4 }}
      >
        <Routes>
          <Route path="/" element={<PantryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
      {isMobile && <BottomNav />}
    </Box>
  );
}
