import { useState, type ReactNode } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ScheduleIcon from '@mui/icons-material/ScheduleOutlined';
import RestaurantIcon from '@mui/icons-material/RestaurantOutlined';
import SoupKitchenOutlinedIcon from '@mui/icons-material/SoupKitchenOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import CookMode from './CookMode';
import type { GeneratedRecipe } from '../services/recipeApi';
import { isCovered } from '../utils/matching';
import { shareShoppingList, type ShareOutcome } from '../utils/shoppingList';

const SHARE_LABEL: Record<ShareOutcome, string> = {
  shared: 'Shared',
  copied: 'Copied',
  failed: "Couldn't copy",
  cancelled: 'Copy shopping list',
};

interface RecipeCardProps {
  recipe: GeneratedRecipe;
  favourited?: boolean;
  defaultExpanded?: boolean;
  availableItemNames?: string[];
  onToggleFavourite?: () => void;
  onDelete?: () => void;
  actions?: ReactNode;
}

export default function RecipeCard({
  recipe,
  favourited,
  defaultExpanded = false,
  availableItemNames,
  onToggleFavourite,
  onDelete,
  actions,
}: RecipeCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [cooking, setCooking] = useState(false);
  const [shareState, setShareState] = useState<ShareOutcome>('cancelled');
  const theme = useTheme();

  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;
  const missingCount = availableItemNames
    ? recipe.ingredients.filter((i) => !isCovered(i.name, availableItemNames)).length
    : 0;

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="h3">
              {recipe.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {recipe.description}
            </Typography>
          </Box>
          {onToggleFavourite && (
            <IconButton
              onClick={onToggleFavourite}
              aria-label={favourited ? 'Unfavourite recipe' : 'Favourite recipe'}
            >
              {favourited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
            </IconButton>
          )}
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            size="small"
            icon={<ScheduleIcon />}
            label={`${totalMinutes} min`}
            variant="outlined"
          />
          <Chip
            size="small"
            icon={<RestaurantIcon />}
            label={`Serves ${recipe.servings}`}
            variant="outlined"
          />
          {availableItemNames && (
            <Chip
              size="small"
              label={missingCount === 0 ? 'You have everything' : `${missingCount} to buy`}
              color={missingCount === 0 ? 'success' : 'warning'}
              variant={missingCount === 0 ? 'outlined' : 'filled'}
            />
          )}
          {recipe.tags.map((tag) => (
            <Chip
              key={tag}
              size="small"
              label={tag}
              variant="outlined"
              sx={{ color: theme.palette.readout.main, borderColor: theme.palette.readout.main }}
            />
          ))}
        </Stack>
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Ingredients
          </Typography>
          <Box component="ul" sx={{ pl: 3, mt: 0.5, mb: 2 }}>
            {recipe.ingredients.map((ingredient, index) => {
              const missing =
                availableItemNames && !isCovered(ingredient.name, availableItemNames);
              return (
                <Typography
                  component="li"
                  variant="body2"
                  key={`${ingredient.name}-${index}`}
                  sx={{ mb: 0.5, color: missing ? 'text.secondary' : 'text.primary' }}
                >
                  {ingredient.amount} {ingredient.name}
                  {missing && (
                    <Chip
                      size="small"
                      label="need to buy"
                      color="warning"
                      variant="outlined"
                      sx={{ ml: 1, height: 20 }}
                    />
                  )}
                </Typography>
              );
            })}
          </Box>

          {availableItemNames && missingCount > 0 && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ShoppingCartOutlinedIcon />}
              onClick={async () =>
                setShareState(await shareShoppingList(recipe, availableItemNames))
              }
              sx={{ mb: 2 }}
            >
              {SHARE_LABEL[shareState]}
            </Button>
          )}

          <Typography variant="overline" color="text.secondary" component="p">
            Method
          </Typography>
          <Box component="ol" sx={{ pl: 3, mt: 0.5, mb: 0 }}>
            {recipe.steps.map((step, index) => (
              <Typography component="li" variant="body2" key={index} sx={{ mb: 1 }}>
                {step}
              </Typography>
            ))}
          </Box>
        </CardContent>
      </Collapse>

      <CardActions sx={{ px: 2, pb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button
          size="small"
          onClick={() => setExpanded((prev) => !prev)}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {expanded ? 'Hide' : 'Show'} recipe
        </Button>
        <Button size="small" startIcon={<SoupKitchenOutlinedIcon />} onClick={() => setCooking(true)}>
          Cook
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        {actions}
        {onDelete && (
          <IconButton size="small" onClick={onDelete} aria-label={`Delete ${recipe.title}`}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
      </CardActions>

      <CookMode
        open={cooking}
        recipe={recipe}
        availableItemNames={availableItemNames}
        onClose={() => setCooking(false)}
      />
    </Card>
  );
}
