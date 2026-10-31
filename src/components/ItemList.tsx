import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import KitchenIcon from '@mui/icons-material/Kitchen';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ConfirmDialog from './ConfirmDialog';
import ExpiryChip from './ExpiryChip';
import { db, type PantryItem } from '../db';
import { fromDateInputValue, toDateInputValue } from '../utils/expiry';

const rowButtonSx = { p: { xs: 1, sm: 0.5 } } as const;

interface ItemListProps {
  items: PantryItem[];
  showExpiry?: boolean;
  emptyTitle: string;
  emptyHint: string;
}

export default function ItemList({ items, showExpiry = false, emptyTitle, emptyHint }: ItemListProps) {
  const [pendingDelete, setPendingDelete] = useState<PantryItem | null>(null);
  const [editingExpiry, setEditingExpiry] = useState<PantryItem | null>(null);
  const [expiryDraft, setExpiryDraft] = useState('');

  async function setQuantity(item: PantryItem, next: number) {
    await db.items.update(item.id, { quantity: Math.max(0, next) });
  }

  async function toggleFavourite(item: PantryItem) {
    await db.items.update(item.id, { favourited: !item.favourited });
  }

  async function toggleLocation(item: PantryItem) {
    await db.items.update(item.id, {
      location: item.location === 'pantry' ? 'fridge' : 'pantry',
    });
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await db.items.delete(pendingDelete.id);
    setPendingDelete(null);
  }

  function openExpiryEditor(item: PantryItem) {
    setEditingExpiry(item);
    setExpiryDraft(toDateInputValue(item.expiresAt));
  }

  async function saveExpiry() {
    if (!editingExpiry) return;
    await db.items.update(editingExpiry.id, { expiresAt: fromDateInputValue(expiryDraft) });
    setEditingExpiry(null);
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
                columnGap: 1,
                rowGap: 0.5,
                py: 1.5,
              }}
            >
              <ListItemText
                primary={item.name}
                sx={{
                  flex: { xs: '1 1 auto', sm: '1 1 130px' },
                  minWidth: 0,
                  my: 0,
                  order: { xs: 1, sm: 2 },
                }}
                slotProps={{ primary: { sx: { fontWeight: item.favourited ? 600 : 400 } } }}
              />

              {(showExpiry || item.expiresAt) && (
                <ExpiryChip
                  expiresAt={item.expiresAt}
                  onClick={() => openExpiryEditor(item)}
                  sx={{ order: { xs: 2, sm: 4 } }}
                />
              )}

              <Box
                aria-hidden
                sx={{
                  flexBasis: '100%',
                  height: 0,
                  order: 3,
                  display: { xs: 'block', sm: 'none' },
                }}
              />

              <IconButton
                size="small"
                onClick={() => toggleFavourite(item)}
                aria-label={item.favourited ? `Unfavourite ${item.name}` : `Favourite ${item.name}`}
                sx={{ ...rowButtonSx, order: { xs: 4, sm: 1 }, ml: { xs: 'auto', sm: 0 } }}
              >
                {item.favourited ? (
                  <FavoriteIcon color="error" fontSize="small" />
                ) : (
                  <FavoriteBorderIcon fontSize="small" />
                )}
              </IconButton>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  order: { xs: 5, sm: 3 },
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setQuantity(item, item.quantity - 1)}
                  disabled={item.quantity <= 0}
                  aria-label={`Decrease ${item.name}`}
                  sx={rowButtonSx}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{
                    minWidth: { xs: 56, sm: 68 },
                    textAlign: 'center',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {item.quantity} {item.unit}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setQuantity(item, item.quantity + 1)}
                  aria-label={`Increase ${item.name}`}
                  sx={rowButtonSx}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>

              <Tooltip title={item.location === 'pantry' ? 'Move to fridge' : 'Move to pantry'}>
                <IconButton
                  size="small"
                  onClick={() => toggleLocation(item)}
                  aria-label={
                    item.location === 'pantry'
                      ? `Move ${item.name} to fridge`
                      : `Move ${item.name} to pantry`
                  }
                  sx={{ ...rowButtonSx, order: { xs: 6, sm: 5 } }}
                >
                  {item.location === 'pantry' ? (
                    <KitchenIcon fontSize="small" />
                  ) : (
                    <Inventory2OutlinedIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              <IconButton
                size="small"
                onClick={() => setPendingDelete(item)}
                aria-label={`Remove ${item.name}`}
                sx={{ ...rowButtonSx, order: { xs: 7, sm: 6 } }}
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

      <Dialog
        open={editingExpiry !== null}
        onClose={() => setEditingExpiry(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{editingExpiry ? `Expiry for ${editingExpiry.name}` : 'Expiry'}</DialogTitle>
        <DialogContent>
          <TextField
            type="date"
            label="Expires"
            value={expiryDraft}
            onChange={(e) => setExpiryDraft(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpiryDraft('')}>Clear</Button>
          <Button onClick={() => setEditingExpiry(null)}>Cancel</Button>
          <Button onClick={saveExpiry} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
