import { useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import KitchenOutlinedIcon from '@mui/icons-material/KitchenOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import ExpiryChip from './ExpiryChip';
import UndoSnackbar, { type UndoState } from './UndoSnackbar';
import { db, type PantryItem } from '../db';
import { fromDateInputValue, toDateInputValue } from '../utils/expiry';
import { isOut } from '../utils/items';

const TOUCH = { width: 44, height: 44 } as const;

const STEP_BY_UNIT: Record<string, number> = { g: 50, ml: 50, kg: 0.5, l: 0.5 };

function stepFor(unit: string): number {
  return STEP_BY_UNIT[unit] ?? 1;
}

function roundQuantity(value: number): number {
  return Math.max(0, Math.round(value * 1000) / 1000);
}

interface ItemListProps {
  items: PantryItem[];
  showExpiry?: boolean;
  emptyTitle: string;
  emptyHint: string;
}

export default function ItemList({ items, showExpiry = false, emptyTitle, emptyHint }: ItemListProps) {
  const [menu, setMenu] = useState<{ anchor: HTMLElement; item: PantryItem } | null>(null);
  const [editingExpiry, setEditingExpiry] = useState<PantryItem | null>(null);
  const [expiryDraft, setExpiryDraft] = useState('');
  const [editingQuantity, setEditingQuantity] = useState<number | null>(null);
  const [quantityDraft, setQuantityDraft] = useState('');
  const [undo, setUndo] = useState<UndoState | null>(null);

  async function setQuantity(item: PantryItem, next: number) {
    await db.items.update(item.id, { quantity: roundQuantity(next) });
  }

  function startQuantityEdit(item: PantryItem) {
    setEditingQuantity(item.id);
    setQuantityDraft(String(item.quantity));
  }

  async function commitQuantity(item: PantryItem) {
    const parsed = Number(quantityDraft);
    if (quantityDraft.trim() !== '' && Number.isFinite(parsed)) {
      await setQuantity(item, parsed);
    }
    setEditingQuantity(null);
  }

  async function toggleStaple(item: PantryItem) {
    await db.items.update(item.id, { favourited: !item.favourited });
  }

  async function toggleLocation(item: PantryItem) {
    await db.items.update(item.id, {
      location: item.location === 'pantry' ? 'fridge' : 'pantry',
    });
  }

  async function remove(item: PantryItem) {
    await db.items.delete(item.id);
    setUndo({
      message: `Removed ${item.name}`,
      undo: async () => {
        await db.items.put(item);
      },
    });
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

  function runFromMenu(action: (item: PantryItem) => void | Promise<void>) {
    if (!menu) return;
    const { item } = menu;
    setMenu(null);
    void action(item);
  }

  const menuItem = menu?.item;
  const dateWord = menuItem?.location === 'fridge' ? 'expiry' : 'best-before';

  return (
    <>
      {items.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {emptyTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {emptyHint}
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <List disablePadding>
            {items.map((item, index) => {
              const out = isOut(item);
              const step = stepFor(item.unit);
              const editing = editingQuantity === item.id;
              return (
                <ListItem
                  key={item.id}
                  divider={index < items.length - 1}
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    columnGap: 1,
                    py: 1,
                    pr: 1,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0, opacity: out ? 0.6 : 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {item.favourited && (
                        <PushPinIcon
                          color="primary"
                          sx={{ fontSize: 16, flexShrink: 0 }}
                          titleAccess="Staple"
                        />
                      )}
                      <Typography
                        sx={{
                          fontWeight: item.favourited ? 600 : 400,
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {item.name}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <IconButton
                      onClick={() => setQuantity(item, item.quantity - step)}
                      disabled={out}
                      aria-label={`Use ${step} ${item.unit} of ${item.name}`}
                      sx={TOUCH}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    {editing ? (
                      <TextField
                        value={quantityDraft}
                        onChange={(e) => setQuantityDraft(e.target.value)}
                        onBlur={() => commitQuantity(item)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void commitQuantity(item);
                          if (e.key === 'Escape') setEditingQuantity(null);
                        }}
                        autoFocus
                        size="small"
                        type="number"
                        slotProps={{
                          htmlInput: {
                            min: 0,
                            step: 'any',
                            inputMode: 'decimal',
                            'aria-label': `Quantity of ${item.name}`,
                            onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.target.select(),
                          },
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">{item.unit}</InputAdornment>
                            ),
                          },
                        }}
                        sx={{ width: 104 }}
                      />
                    ) : (
                      <ButtonBase
                        onClick={() => startQuantityEdit(item)}
                        aria-label={`${item.quantity} ${item.unit} of ${item.name}. Change quantity`}
                        sx={{
                          minWidth: 64,
                          minHeight: 44,
                          px: 0.5,
                          borderRadius: 1,
                          typography: 'body2',
                          fontVariantNumeric: 'tabular-nums',
                          justifyContent: 'center',
                          '&:hover': { backgroundColor: 'action.hover' },
                        }}
                      >
                        {item.quantity} {item.unit}
                      </ButtonBase>
                    )}
                    <IconButton
                      onClick={() => setQuantity(item, item.quantity + step)}
                      aria-label={`Add ${step} ${item.unit} of ${item.name}`}
                      sx={TOUCH}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={(e) => setMenu({ anchor: e.currentTarget, item })}
                      aria-label={`More for ${item.name}`}
                      aria-haspopup="menu"
                      sx={TOUCH}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {(out || showExpiry || item.expiresAt) && (
                    <Box sx={{ flexBasis: '100%', display: 'flex', gap: 0.5, pb: 0.5 }}>
                      {out ? (
                        <Chip size="small" label="Out" variant="outlined" sx={{ opacity: 0.8 }} />
                      ) : (
                        <ExpiryChip
                          expiresAt={item.expiresAt}
                          onClick={() => openExpiryEditor(item)}
                        />
                      )}
                    </Box>
                  )}
                </ListItem>
              );
            })}
          </List>
        </Paper>
      )}

      <Menu
        anchorEl={menu?.anchor ?? null}
        open={menu !== null}
        onClose={() => setMenu(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => runFromMenu(toggleStaple)} sx={{ minHeight: 44 }}>
          <ListItemIcon>
            {menuItem?.favourited ? (
              <PushPinIcon fontSize="small" />
            ) : (
              <PushPinOutlinedIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>{menuItem?.favourited ? 'Not a Staple' : 'Make it a Staple'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => runFromMenu(openExpiryEditor)} sx={{ minHeight: 44 }}>
          <ListItemIcon>
            <EditCalendarOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {menuItem?.expiresAt ? `Change ${dateWord} date` : `Add ${dateWord} date`}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => runFromMenu(toggleLocation)} sx={{ minHeight: 44 }}>
          <ListItemIcon>
            {menuItem?.location === 'pantry' ? (
              <KitchenOutlinedIcon fontSize="small" />
            ) : (
              <Inventory2OutlinedIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {menuItem?.location === 'pantry' ? 'Move to Fridge' : 'Move to Pantry'}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => runFromMenu(remove)}
          sx={{ minHeight: 44, color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Remove</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={editingExpiry !== null}
        onClose={() => setEditingExpiry(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {editingExpiry
            ? `${editingExpiry.location === 'fridge' ? 'Expiry' : 'Best before'} for ${editingExpiry.name}`
            : 'Date'}
        </DialogTitle>
        <DialogContent>
          <TextField
            type="date"
            label={editingExpiry?.location === 'fridge' ? 'Expires' : 'Best before'}
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

      <UndoSnackbar state={undo} onClose={() => setUndo(null)} />
    </>
  );
}
