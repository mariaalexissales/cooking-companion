import { useState } from 'react';
import { Box, Button, CircularProgress, Paper, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Link as RouterLink } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import PageHeading from '../components/PageHeading';
import RecipeCard from '../components/RecipeCard';
import UndoSnackbar, { type UndoState } from '../components/UndoSnackbar';
import { db, type SavedRecipe } from '../db';
import { useAllItems } from '../hooks/useItems';
import { isOut } from '../utils/items';

export default function RecipesPage() {
  const recipes = useLiveQuery(() => db.recipes.toArray(), []);
  const items = useAllItems();
  const [filter, setFilter] = useState<'all' | 'favourites'>('all');
  const [undo, setUndo] = useState<UndoState | null>(null);

  if (!recipes) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const availableItemNames = (items ?? []).filter((item) => !isOut(item)).map((item) => item.name);

  const visible = recipes
    .filter((recipe) => filter === 'all' || recipe.favourited)
    .sort((a, b) => {
      if (a.favourited !== b.favourited) return a.favourited ? -1 : 1;
      return b.savedAt.getTime() - a.savedAt.getTime();
    });

  async function toggleFavourite(recipe: SavedRecipe) {
    await db.recipes.update(recipe.id, { favourited: !recipe.favourited });
  }

  async function remove(recipe: SavedRecipe) {
    await db.recipes.delete(recipe.id);
    setUndo({
      message: `Deleted “${recipe.title}”`,
      undo: async () => {
        await db.recipes.put(recipe);
      },
    });
  }

  return (
    <>
      <PageHeading
        title="Saved recipes"
        subtitle="Everything you've kept from the generator, stored on this device."
        action={
          recipes.length > 0 ? (
            <ToggleButtonGroup
              size="small"
              exclusive
              value={filter}
              onChange={(_, next: 'all' | 'favourites' | null) => next && setFilter(next)}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="favourites">Favourites</ToggleButton>
            </ToggleButtonGroup>
          ) : undefined
        }
      />

      {visible.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {recipes.length === 0 ? 'No saved recipes yet' : 'No favourites yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {recipes.length === 0
              ? 'Generate one from what you already have, then save the ones worth repeating.'
              : 'Tap the heart on a recipe to keep it here.'}
          </Typography>
          {recipes.length === 0 && (
            <Button
              component={RouterLink}
              to="/generate"
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
            >
              Generate a recipe
            </Button>
          )}
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' },
            columnGap: 2,
            alignItems: 'start',
          }}
        >
          {visible.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              favourited={recipe.favourited}
              availableItemNames={availableItemNames}
              onToggleFavourite={() => toggleFavourite(recipe)}
              onDelete={() => remove(recipe)}
            />
          ))}
        </Box>
      )}

      <UndoSnackbar state={undo} onClose={() => setUndo(null)} />
    </>
  );
}
