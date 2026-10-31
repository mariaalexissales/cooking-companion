import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLiveQuery } from 'dexie-react-hooks';
import PageHeading from '../components/PageHeading';
import { useThemeController } from '../theme/context';
import { THEME_FAMILIES, THEME_META, swatchesFor } from '../theme/themes';
import type { ThemeMode } from '../theme/tokens';
import { db } from '../db';
import { isGeneratorConfigured } from '../services/recipeApi';

export default function SettingsPage() {
  const { family, mode, setFamily, setMode } = useThemeController();

  const counts = useLiveQuery(async () => {
    const [pantry, fridge, recipes] = await Promise.all([
      db.items.where('location').equals('pantry').count(),
      db.items.where('location').equals('fridge').count(),
      db.recipes.count(),
    ]);
    return { pantry, fridge, recipes };
  }, []);

  return (
    <>
      <PageHeading title="Settings" subtitle="Themes, and what's stored on this device." />

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
            mb: 2,
          }}
        >
          <Typography variant="overline" color="text.secondary">
            Appearance
          </Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={mode}
            onChange={(_, next: ThemeMode | null) => next && setMode(next)}
          >
            <ToggleButton value="light">
              <LightModeOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
              Light
            </ToggleButton>
            <ToggleButton value="dark">
              <DarkModeOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
              Dark
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {THEME_FAMILIES.map((candidate) => {
            const selected = candidate === family;
            return (
              <Card
                key={candidate}
                variant="outlined"
                sx={{
                  borderColor: selected ? 'primary.main' : 'divider',
                  borderWidth: selected ? 2 : 1,
                }}
              >
                <CardActionArea
                  onClick={() => setFamily(candidate)}
                  aria-label={`Use the ${THEME_META[candidate].label} theme`}
                  aria-pressed={selected}
                >
                  <Box sx={{ display: 'flex', height: 56 }}>
                    {swatchesFor(candidate, mode).map((colour, index) => (
                      <Box key={index} sx={{ flex: 1, backgroundColor: colour }} />
                    ))}
                  </Box>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {THEME_META[candidate].label}
                      </Typography>
                      {selected && <CheckCircleIcon fontSize="small" color="primary" />}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {THEME_META[candidate].blurb}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="overline" color="text.secondary">
          On this device
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 1.5 }}>
          <Chip label={`${counts?.pantry ?? 0} pantry items`} variant="outlined" />
          <Chip label={`${counts?.fridge ?? 0} fridge items`} variant="outlined" />
          <Chip label={`${counts?.recipes ?? 0} saved recipes`} variant="outlined" />
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="body2" color="text.secondary">
          Everything lives in this browser's IndexedDB. There's no account and no sync — clearing
          site data clears the app.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Recipe generator:{' '}
          <Box component="span" sx={{ color: isGeneratorConfigured() ? 'success.main' : 'warning.main' }}>
            {isGeneratorConfigured() ? 'connected' : 'not configured'}
          </Box>
        </Typography>
      </Paper>
    </>
  );
}
