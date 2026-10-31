import { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  ButtonBase,
  Chip,
  Container,
  Dialog,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import type { GeneratedRecipe } from '../services/recipeApi';
import { missingIngredients, shareShoppingList, type ShareOutcome } from '../utils/shoppingList';

interface CookModeProps {
  open: boolean;
  recipe: GeneratedRecipe;
  availableItemNames?: string[];
  onClose: () => void;
}

const SHARE_LABEL: Record<ShareOutcome, string> = {
  shared: 'Shared',
  copied: 'Copied',
  failed: "Couldn't copy",
  cancelled: 'Shopping list',
};

function useScreenWakeLock(active: boolean): boolean {
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    async function acquire() {
      try {
        sentinel = await navigator.wakeLock.request('screen');
        if (cancelled) {
          await sentinel.release();
          return;
        }
        setHeld(true);
        sentinel.addEventListener('release', () => setHeld(false));
      } catch {
        setHeld(false);
      }
    }

    function onVisibility() {
      if (document.visibilityState === 'visible') void acquire();
    }

    void acquire();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      void sentinel?.release();
    };
  }, [active]);

  return held;
}

export default function CookMode({ open, recipe, availableItemNames, onClose }: CookModeProps) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const [shareState, setShareState] = useState<ShareOutcome>('cancelled');
  const awake = useScreenWakeLock(open);

  const missing = availableItemNames ? missingIngredients(recipe, availableItemNames) : [];

  function toggle(index: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" component="h2" sx={{ flex: 1, minWidth: 0 }} noWrap>
            {recipe.title}
          </Typography>
          <IconButton color="inherit" onClick={onClose} aria-label="Close cook mode" edge="end">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3, pb: 'calc(24px + env(safe-area-inset-bottom))' }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip size="small" label={`Serves ${recipe.servings}`} variant="outlined" />
          <Chip
            size="small"
            label={`${recipe.prepMinutes + recipe.cookMinutes} min`}
            variant="outlined"
          />
          {awake && <Chip size="small" label="Screen stays on" color="info" variant="outlined" />}
        </Box>

        <Typography variant="overline" color="text.secondary">
          Ingredients
        </Typography>
        <Box component="ul" sx={{ pl: 3, mt: 0.5, mb: 2 }}>
          {recipe.ingredients.map((ingredient, index) => {
            const isMissing = missing.includes(ingredient);
            return (
              <Typography
                component="li"
                key={`${ingredient.name}-${index}`}
                sx={{ fontSize: '1.1rem', mb: 0.75, color: isMissing ? 'text.secondary' : 'text.primary' }}
              >
                {ingredient.amount} {ingredient.name}
                {isMissing && (
                  <Chip size="small" label="need to buy" color="warning" variant="outlined" sx={{ ml: 1 }} />
                )}
              </Typography>
            );
          })}
        </Box>

        {missing.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<ShoppingCartOutlinedIcon />}
            onClick={async () => setShareState(await shareShoppingList(recipe, availableItemNames ?? []))}
            sx={{ mb: 3, minHeight: 44 }}
          >
            {shareState === 'cancelled' ? `Shopping list (${missing.length})` : SHARE_LABEL[shareState]}
          </Button>
        )}

        <Typography variant="overline" color="text.secondary" component="p">
          Method · tap a step when it's done
        </Typography>
        <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {recipe.steps.map((step, index) => {
            const isDone = done.has(index);
            return (
              <Box component="li" key={index} sx={{ mb: 1 }}>
                <ButtonBase
                  onClick={() => toggle(index)}
                  aria-pressed={isDone}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    p: 1.5,
                    textAlign: 'left',
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    opacity: isDone ? 0.55 : 1,
                  }}
                >
                  {isDone ? (
                    <CheckCircleIcon color="success" sx={{ mt: 0.25 }} />
                  ) : (
                    <RadioButtonUncheckedIcon color="disabled" sx={{ mt: 0.25 }} />
                  )}
                  <Typography
                    sx={{
                      fontSize: { xs: '1.15rem', md: '1.3rem' },
                      lineHeight: 1.5,
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}
                  >
                    <Box component="span" sx={{ fontWeight: 700, mr: 1 }}>
                      {index + 1}.
                    </Box>
                    {step}
                  </Typography>
                </ButtonBase>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Dialog>
  );
}
