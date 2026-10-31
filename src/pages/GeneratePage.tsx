import { useRef } from 'react';
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
import type { PantryItem } from '../db';
import { useAllItems } from '../hooks/useItems';
import { BOTTOM_NAV_HEIGHT, useIsCompact, useIsWide } from '../hooks/useLayout';
import { describeExpiry, isUrgent } from '../utils/expiry';
import { isOut, sortFridge, sortPantry } from '../utils/items';
import { isGeneratorConfigured } from '../services/recipeApi';
import { MEAL_TYPES, useGenerator } from '../state/generatorContext';

function describeItem(item: PantryItem): string {
  const base = `${item.name} — ${item.quantity} ${item.unit}`;
  if (!item.expiresAt) return base;
  return `${base}, ${describeExpiry(item.expiresAt).label.toLowerCase()}`;
}

function defaultSelection(items: PantryItem[]): Set<number> {
  const preferred = items.filter((item) => isUrgent(item.expiresAt) || item.favourited);
  return new Set((preferred.length > 0 ? preferred : items).map((item) => item.id));
}

interface ChipGroupProps {
  title: string;
  items: PantryItem[];
  selected: Set<number>;
  onToggle: (id: number) => void;
  onSetAll: (ids: number[], on: boolean) => void;
}

function ChipGroup({ title, items, selected, onToggle, onSetAll }: ChipGroupProps) {
  if (items.length === 0) return null;
  const ids = items.map((item) => item.id);
  const count = ids.filter((id) => selected.has(id)).length;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="overline" color="text.secondary" sx={{ flex: 1 }}>
          {title} ({count} of {items.length})
        </Typography>
        <Button size="small" onClick={() => onSetAll(ids, true)} disabled={count === items.length}>
          All
        </Button>
        <Button size="small" onClick={() => onSetAll(ids, false)} disabled={count === 0}>
          None
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {items.map((item) => {
          const active = selected.has(item.id);
          const pressing = isUrgent(item.expiresAt);
          return (
            <Chip
              key={item.id}
              label={`${item.name} (${item.quantity} ${item.unit})`}
              onClick={() => onToggle(item.id)}
              icon={active ? <CheckIcon /> : undefined}
              color={active ? (pressing ? 'warning' : 'primary') : 'default'}
              variant={active ? 'filled' : 'outlined'}
              aria-pressed={active}
              aria-label={`${item.name}, ${item.quantity} ${item.unit}${
                pressing ? ', needs using up' : ''
              }`}
              sx={{ minHeight: 36 }}
            />
          );
        })}
      </Box>
    </Box>
  );
}

export default function GeneratePage() {
  const items = useAllItems();
  const generator = useGenerator();
  const isCompact = useIsCompact();
  const isWide = useIsWide();
  const resultRef = useRef<HTMLDivElement>(null);

  if (!items) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const configured = isGeneratorConfigured();
  const inStock = items.filter((item) => !isOut(item));
  const fridge = sortFridge(inStock.filter((item) => item.location === 'fridge'));
  const pantry = sortPantry(inStock.filter((item) => item.location === 'pantry'));
  const selected = generator.selected ?? defaultSelection(inStock);
  const chosen = [...fridge, ...pantry]
    .filter((item) => selected.has(item.id))
    .sort((a, b) => Number(isUrgent(b.expiresAt)) - Number(isUrgent(a.expiresAt)));
  const urgentCount = inStock.filter((item) => isUrgent(item.expiresAt)).length;
  const availableItemNames = inStock.map((item) => item.name);
  const { last, loading } = generator;

  function toggle(id: number) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    generator.setSelected(next);
  }

  function setAll(ids: number[], on: boolean) {
    const next = new Set(selected);
    ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
    generator.setSelected(next);
  }

  async function handleGenerate() {
    const ok = await generator.generate({
      ingredients: chosen.map(describeItem),
      usedItemNames: chosen.map((item) => item.name),
    });
    if (ok && !isWide) {
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      );
    }
  }

  const stickyBottom = isCompact
    ? `calc(${BOTTOM_NAV_HEIGHT + 12}px + env(safe-area-inset-bottom))`
    : 16;

  const form =
    inStock.length === 0 ? (
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Nothing to cook with yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add a few things to your pantry or fridge first.
        </Typography>
      </Paper>
    ) : (
      <Paper variant="outlined" sx={{ p: 2 }}>
        {urgentCount > 0 && (
          <Typography variant="body2" color="warning.main" sx={{ mb: 1 }}>
            {urgentCount === 1
              ? '1 item needs using up, so it starts selected.'
              : `${urgentCount} items need using up, so they start selected.`}
          </Typography>
        )}

        <ChipGroup
          title="Fridge"
          items={fridge}
          selected={selected}
          onToggle={toggle}
          onSetAll={setAll}
        />
        <ChipGroup
          title="Pantry"
          items={pantry}
          selected={selected}
          onToggle={toggle}
          onSetAll={setAll}
        />

        <Divider sx={{ mb: 2 }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Servings"
            type="number"
            value={generator.servings}
            onChange={(e) =>
              generator.setServings(Math.min(12, Math.max(1, Number(e.target.value) || 1)))
            }
            slotProps={{ htmlInput: { min: 1, max: 12, inputMode: 'numeric' } }}
            sx={{ flex: { sm: '0 1 140px' }, width: { xs: '100%', sm: 'auto' } }}
          />
          <TextField
            select
            label="Meal"
            value={generator.mealType}
            onChange={(e) => generator.setMealType(e.target.value)}
            sx={{ flex: { sm: '0 1 180px' }, width: { xs: '100%', sm: 'auto' } }}
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
          value={generator.notes}
          onChange={(e) => generator.setNotes(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          sx={{ mb: 2 }}
        />

        <Box
          sx={{
            position: isWide ? 'static' : 'sticky',
            bottom: stickyBottom,
            zIndex: 1,
          }}
        >
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
            disabled={!configured || loading || chosen.length === 0}
            onClick={handleGenerate}
            sx={{ minHeight: 48, boxShadow: isWide ? 'none' : 6 }}
          >
            {loading
              ? 'Thinking…'
              : `Generate with ${chosen.length} ingredient${chosen.length === 1 ? '' : 's'}`}
          </Button>
        </Box>
        {chosen.length === 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Select at least one ingredient.
          </Typography>
        )}
      </Paper>
    );

  const result = (
    <Box ref={resultRef} sx={{ scrollMarginTop: 96 }}>
      {generator.error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={generator.clearError}>
          <AlertTitle>Couldn't generate a recipe</AlertTitle>
          {generator.error}
        </Alert>
      )}

      {last ? (
        <RecipeCard
          key={last.recipe.title}
          recipe={last.recipe}
          defaultExpanded
          availableItemNames={availableItemNames}
          actions={
            <Button
              size="small"
              variant="contained"
              startIcon={last.saved ? <CheckIcon /> : <BookmarkAddOutlinedIcon />}
              onClick={generator.save}
              disabled={last.saved}
            >
              {last.saved ? 'Saved' : 'Save recipe'}
            </Button>
          }
        />
      ) : (
        isWide && (
          <Paper
            variant="outlined"
            sx={{ p: 4, textAlign: 'center', color: 'text.secondary', borderStyle: 'dashed' }}
          >
            {loading ? (
              <CircularProgress />
            ) : (
              <Typography variant="body2">Your recipe will show up here.</Typography>
            )}
          </Paper>
        )
      )}
    </Box>
  );

  return (
    <>
      <PageHeading
        title="Recipe generator"
        subtitle="Pick what you want to use and let the model work out dinner."
      />

      {!configured && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Recipe generation isn't set up</AlertTitle>
          This copy of the app isn't connected to the recipe service. Everything else works as
          normal.
        </Alert>
      )}

      {isWide ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 7fr)',
            gap: 3,
            alignItems: 'start',
          }}
        >
          {form}
          <Box
            sx={{
              position: 'sticky',
              top: 136,
              maxHeight: 'calc(100dvh - 160px)',
              overflowY: 'auto',
            }}
          >
            {result}
          </Box>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>{form}</Box>
          {result}
        </>
      )}
    </>
  );
}
