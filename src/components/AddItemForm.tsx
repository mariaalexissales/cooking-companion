import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  MenuItem,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { db, type ItemLocation, type PantryItem } from '../db';
import { fromDateInputValue } from '../utils/expiry';

const UNITS = ['pcs', 'g', 'kg', 'ml', 'l', 'oz', 'lb', 'cup', 'tbsp', 'tsp'];

interface AddItemFormProps {
  location: ItemLocation;
  existingItems: PantryItem[];
  initialName?: string;
  onDone: () => void;
  onCancel: () => void;
}

function parseQuantity(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export default function AddItemForm({
  location,
  existingItems,
  initialName = '',
  onDone,
  onCancel,
}: AddItemFormProps) {
  const isFridge = location === 'fridge';
  const [name, setName] = useState(initialName);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [expiry, setExpiry] = useState('');
  const [showDate, setShowDate] = useState(isFridge);
  const [duplicate, setDuplicate] = useState<PantryItem | null>(null);

  const trimmed = name.trim();
  const amount = parseQuantity(quantity);

  async function insert() {
    await db.items.add({
      name: trimmed,
      quantity: amount,
      unit,
      favourited: false,
      addedAt: new Date(),
      location,
      expiresAt: showDate ? fromDateInputValue(expiry) : undefined,
    });
    onDone();
  }

  async function handleAdd() {
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
      quantity: duplicate.quantity + amount,
      ...(showDate && expiry ? { expiresAt: fromDateInputValue(expiry) } : {}),
    });
    setDuplicate(null);
    onDone();
  }

  async function keepSeparate() {
    setDuplicate(null);
    await insert();
  }

  function submitOnEnter(event: React.KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleAdd();
    }
  }

  return (
    <>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          void handleAdd();
        }}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: '2fr 1fr 1fr auto' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <TextField
          label={isFridge ? 'Fridge item' : 'Pantry item'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={submitOnEnter}
          autoFocus={!initialName}
          sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}
        />
        <TextField
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          onKeyDown={submitOnEnter}
          autoFocus={Boolean(initialName)}
          slotProps={{ htmlInput: { min: 0, step: 'any', inputMode: 'decimal' } }}
        />
        <TextField select label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
          {UNITS.map((u) => (
            <MenuItem key={u} value={u}>
              {u}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, height: 56, alignItems: 'center' }}>
          <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={!trimmed}>
            Add
          </Button>
        </Box>

        {showDate ? (
          <TextField
            label={isFridge ? 'Expires' : 'Best before'}
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ gridColumn: { xs: '1 / -1', md: '1 / 2' } }}
          />
        ) : (
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={() => setShowDate(true)}
            sx={{ gridColumn: '1 / -1', justifySelf: 'start', py: 0.5 }}
          >
            + Add a best-before date
          </Link>
        )}

        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            gridColumn: '1 / -1',
            gap: 1,
          }}
        >
          <Button onClick={onCancel} sx={{ flex: 1 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!trimmed}
            sx={{ flex: 2 }}
          >
            Add
          </Button>
        </Box>
      </Box>

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
            {duplicate ? `Make it ${duplicate.quantity + amount} ${duplicate.unit}` : 'Merge'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
