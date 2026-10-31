import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Paper,
  Select,
  TextField,
  type SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { db, type ItemLocation, type PantryItem } from '../db';
import { fromDateInputValue } from '../utils/expiry';

const UNITS = ['pcs', 'g', 'kg', 'ml', 'l', 'oz', 'lb', 'cup', 'tbsp', 'tsp'];

interface ItemFormProps {
  location: ItemLocation;
  existingItems: PantryItem[];
  showExpiry?: boolean;
}

export default function ItemForm({ location, existingItems, showExpiry = false }: ItemFormProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [expiry, setExpiry] = useState('');
  const [duplicate, setDuplicate] = useState<PantryItem | null>(null);

  function reset() {
    setName('');
    setQuantity(1);
    setUnit('pcs');
    setExpiry('');
  }

  async function insert() {
    await db.items.add({
      name: name.trim(),
      quantity,
      unit,
      favourited: false,
      addedAt: new Date(),
      location,
      expiresAt: showExpiry ? fromDateInputValue(expiry) : undefined,
    });
    reset();
  }

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;

    const match = existingItems.find(
      (item) => item.name.toLowerCase() === trimmed.toLowerCase() && item.unit === unit,
    );

    if (match) {
      setDuplicate(match);
      return;
    }

    await insert();
  }

  async function mergeIntoExisting() {
    if (!duplicate) return;
    await db.items.update(duplicate.id, {
      quantity: duplicate.quantity + quantity,
      ...(showExpiry && expiry ? { expiresAt: fromDateInputValue(expiry) } : {}),
    });
    setDuplicate(null);
    reset();
  }

  async function keepSeparate() {
    setDuplicate(null);
    await insert();
  }

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          label={location === 'fridge' ? 'Fridge item' : 'Pantry item'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          sx={{ flex: '2 1 200px', minWidth: 0 }}
        />
        <TextField
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
          slotProps={{ htmlInput: { min: 0 } }}
          sx={{ flex: '1 1 100px', minWidth: { xs: 0, sm: 100 } }}
        />
        <Select
          value={unit}
          onChange={(e: SelectChangeEvent) => setUnit(e.target.value)}
          aria-label="Unit"
          sx={{ flex: '1 1 100px', minWidth: { xs: 0, sm: 100 } }}
        >
          {UNITS.map((u) => (
            <MenuItem key={u} value={u}>
              {u}
            </MenuItem>
          ))}
        </Select>
        {showExpiry && (
          <TextField
            label="Expires"
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ flex: '1 1 160px', minWidth: { xs: 0, sm: 160 } }}
          />
        )}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} fullWidth>
            Add
          </Button>
        </Box>
      </Paper>

      <Dialog open={duplicate !== null} onClose={() => setDuplicate(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Already on the list</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {duplicate &&
              `You already have ${duplicate.quantity} ${duplicate.unit} of ${duplicate.name}.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={() => setDuplicate(null)}>Cancel</Button>
          <Button onClick={keepSeparate}>Keep separate</Button>
          <Button onClick={mergeIntoExisting} variant="contained" autoFocus>
            {duplicate ? `Make it ${duplicate.quantity + quantity} ${duplicate.unit}` : 'Merge'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
