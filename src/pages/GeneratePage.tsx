import { useEffect, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import CheckIcon from '@mui/icons-material/Check';
import PageHeading from '../components/PageHeading';
import RecipeCard from '../components/RecipeCard';
import { db, type PantryItem } from '../db';
import { useAllItems } from '../hooks/useItems';
import { describeExpiry, isUrgent } from '../utils/expiry';
import {
  generateRecipe,
  isGeneratorConfigured,
  RecipeApiError,
  type GeneratedRecipe,
} from '../services/recipeApi';

const MEAL_TYPES = ['Anything', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

function describeItem(item: PantryItem): string {
  const base = `${item.name} — ${item.quantity} ${item.unit}`;
  if (!item.expiresAt) return base;
  return `${base}, ${describeExpiry(item.expiresAt).label.toLowerCase()}`;
}

export default function GeneratePage() {
  const items = useAllItems();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [initialised, setInitialised] = useState(false);
  const [servings, setServings] = useState(2);
  const [mealType, setMealType] = useState(MEAL_TYPES[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedRecipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!items || initialised) return;
    setSelected(new Set(items.map((item) => item.id)));
    setInitialised(true);
  }, [items, initialised]);

  if (!items) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const configured = isGeneratorConfigured();
  const urgent = items.filter((item) => isUrgent(item.expiresAt));
  const rest = items.filter((item) => !isUrgent(item.expiresAt));
  const ordered = [...urgent, ...rest];
  const chosen = ordered.filter((item) => selected.has(item.id));

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(items?.map((item) => item.id) ?? []));
  }

  function clearAll() {
    setSelected(new Set());
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);
    try {
      const recipe = await generateRecipe({
        ingredients: chosen.map(describeItem),
        servings,
        mealType,
        notes: notes.trim(),
      });
      setResult(recipe);
    } catch (caught) {
      setError(
        caught instanceof RecipeApiError || caught instanceof Error
          ? caught.message
          : 'Something went wrong generating the recipe.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    await db.recipes.add({
      ...result,
      favourited: false,
      savedAt: new Date(),
      usedItemNames: chosen.map((item) => item.name),
    });
    setSaved(true);
  }

  return (
    <>
      <PageHeading
        title="Recipe generator"
        subtitle="Pick what you want to use and let the model work out dinner."
      />

      {!configured && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Generator not connected</AlertTitle>
          Set <code>VITE_RECIPE_API_URL</code> to your deployed Worker URL and rebuild. See the
          README for the one-time Cloudflare setup.
        </Alert>
      )}

      {items.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Nothing to cook with yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add a few things to your pantry or fridge first.
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              mb: 1.5,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="overline" color="text.secondary">
              Ingredients ({chosen.length} of {items.length})
            </Typography>
            <Box>
              <Button size="small" onClick={selectAll}>
                Select all
              </Button>
              <Button size="small" onClick={clearAll}>
                Clear
              </Button>
            </Box>
          </Box>

          {urgent.length > 0 && (
            <Typography variant="body2" color="warning.main" sx={{ mb: 1 }}>
              {urgent.length === 1
                ? '1 item needs using up — listed first.'
                : `${urgent.length} items need using up — listed first.`}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {ordered.map((item) => {
              const active = selected.has(item.id);
              const pressing = isUrgent(item.expiresAt);
              return (
                <Chip
                  key={item.id}
                  label={`${item.name} (${item.quantity} ${item.unit})`}
                  onClick={() => toggle(item.id)}
                  icon={active ? <CheckIcon /> : undefined}
                  color={active ? (pressing ? 'warning' : 'primary') : 'default'}
                  variant={active ? 'filled' : 'outlined'}
                  aria-pressed={active}
                  aria-label={`${item.name}, ${item.quantity} ${item.unit}${
                    pressing ? ', needs using up' : ''
                  }`}
                />
              );
            })}
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="Servings"
              type="number"
              value={servings}
              onChange={(e) => setServings(Math.max(1, Number(e.target.value)))}
              slotProps={{ htmlInput: { min: 1, max: 12 } }}
              sx={{ flex: '0 1 140px' }}
            />
            <TextField
              select
              label="Meal"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              sx={{ flex: '0 1 180px' }}
            >
              {MEAL_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            label="Notes"
            placeholder="Vegetarian, no onions, under 30 minutes…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
            disabled={!configured || loading || chosen.length === 0}
            onClick={handleGenerate}
          >
            {loading ? 'Thinking…' : 'Generate recipe'}
          </Button>
          {chosen.length === 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Select at least one ingredient.
            </Typography>
          )}
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          <AlertTitle>Couldn't generate a recipe</AlertTitle>
          {error}
        </Alert>
      )}

      {result && (
        <>
          {saved && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Saved to your recipes.
            </Alert>
          )}
          <RecipeCard
            recipe={result}
            defaultExpanded
            availableItemNames={items.map((item) => item.name)}
            actions={
              <Button
                size="small"
                variant="contained"
                startIcon={saved ? <CheckIcon /> : <BookmarkAddOutlinedIcon />}
                onClick={handleSave}
                disabled={saved}
              >
                {saved ? 'Saved' : 'Save recipe'}
              </Button>
            }
          />
        </>
      )}
    </>
  );
}
