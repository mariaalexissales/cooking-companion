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
import { db, type PantryItem } from '../db';

const UNITS = ['pcs', 'g', 'kg', 'ml', 'l', 'oz', 'lb', 'cup', 'tbsp', 'tsp'];

interface ItemFormProps {
  existingItems: PantryItem[];
}

export default function ItemForm({ existingItems }: ItemFormProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [duplicate, setDuplicate] = useState<PantryItem | null>(null);

  function reset() {
    setName('');
    setQuantity(1);
    setUnit('pcs');
  }

  async function insert() {
    await db.items.add({
      name: name.trim(),
      quantity,
      unit,
      favourited: false,
      addedAt: new Date(),
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
    await db.items.update(duplicate.id, { quantity: duplicate.quantity + quantity });
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
          flexDirection: { xs: 'column', sm: 'row' },
          flexWrap: 'wrap',
          gap: 2,
          alignItems: { sm: 'center' },
        }}
      >
        <TextField
          label="Pantry item"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          sx={{ flex: '2 1 200px' }}
        />
        <TextField
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
          slotProps={{ htmlInput: { min: 0 } }}
          sx={{ flex: '1 1 100px', minWidth: 100 }}
        />
        <Select
          value={unit}
          onChange={(e: SelectChangeEvent) => setUnit(e.target.value)}
          aria-label="Unit"
          sx={{ flex: '1 1 100px', minWidth: 100 }}
        >
          {UNITS.map((u) => (
            <MenuItem key={u} value={u}>
              {u}
            </MenuItem>
          ))}
        </Select>
        <Box sx={{ flex: '0 0 auto' }}>
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
