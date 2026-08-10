import { useState } from 'react';
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ConfirmDialog from './ConfirmDialog';
import { db, type PantryItem } from '../db';

interface ItemListProps {
  items: PantryItem[];
  emptyTitle: string;
  emptyHint: string;
}

export default function ItemList({ items, emptyTitle, emptyHint }: ItemListProps) {
  const [pendingDelete, setPendingDelete] = useState<PantryItem | null>(null);

  async function setQuantity(item: PantryItem, next: number) {
    await db.items.update(item.id, { quantity: Math.max(0, next) });
  }

  async function toggleFavourite(item: PantryItem) {
    await db.items.update(item.id, { favourited: !item.favourited });
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await db.items.delete(pendingDelete.id);
    setPendingDelete(null);
  }

  if (items.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          {emptyTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {emptyHint}
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper variant="outlined">
        <List disablePadding>
          {items.map((item, index) => (
            <ListItem
              key={item.id}
              divider={index < items.length - 1}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 1,
                py: 1.5,
              }}
            >
              <IconButton
                onClick={() => toggleFavourite(item)}
                aria-label={item.favourited ? `Unfavourite ${item.name}` : `Favourite ${item.name}`}
              >
                {item.favourited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>

              <ListItemText
                primary={item.name}
                sx={{ flex: '1 1 130px', minWidth: 0, my: 0 }}
                slotProps={{ primary: { sx: { fontWeight: item.favourited ? 600 : 400 } } }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => setQuantity(item, item.quantity - 1)}
                  disabled={item.quantity <= 0}
                  aria-label={`Decrease ${item.name}`}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{ minWidth: 68, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}
                >
                  {item.quantity} {item.unit}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setQuantity(item, item.quantity + 1)}
                  aria-label={`Increase ${item.name}`}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>

              <IconButton
                size="small"
                onClick={() => setPendingDelete(item)}
                aria-label={`Remove ${item.name}`}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remove item"
        message={pendingDelete ? `Remove ${pendingDelete.name} from your list?` : ''}
        confirmLabel="Remove"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
