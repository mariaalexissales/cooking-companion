import { useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  Drawer,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import AddItemForm from './AddItemForm';
import type { ItemLocation, PantryItem } from '../db';
import { useIsCompact } from '../hooks/useLayout';
import { formatQuantity, hasExactName, matchesQuery } from '../utils/items';

interface SearchAddBarProps {
  location: ItemLocation;
  items: PantryItem[];
  otherItems: PantryItem[];
  query: string;
  onQueryChange: (next: string) => void;
}

const OTHER_LABEL: Record<ItemLocation, string> = { pantry: 'Fridge', fridge: 'Pantry' };
const HERE_LABEL: Record<ItemLocation, string> = { pantry: 'pantry', fridge: 'fridge' };

export default function SearchAddBar({
  location,
  items,
  otherItems,
  query,
  onQueryChange,
}: SearchAddBarProps) {
  const isCompact = useIsCompact();
  const [adding, setAdding] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [initialName, setInitialName] = useState('');

  const trimmed = query.trim();
  const elsewhere = trimmed ? otherItems.filter((item) => matchesQuery(item, trimmed)) : [];
  const canAddQuery = trimmed.length > 0 && !hasExactName(items, trimmed);

  function openAdd(name: string) {
    setInitialName(name);
    setFormKey((key) => key + 1);
    setAdding(true);
  }

  function closeAdd() {
    setAdding(false);
  }

  function handleAdded() {
    setAdding(false);
    onQueryChange('');
  }

  const form = (
    <AddItemForm
      key={formKey}
      location={location}
      existingItems={items}
      initialName={initialName}
      onDone={handleAdded}
      onCancel={closeAdd}
    />
  );

  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canAddQuery) openAdd(trimmed);
            if (e.key === 'Escape') onQueryChange('');
          }}
          placeholder="Search or add"
          fullWidth
          size="small"
          autoComplete="off"
          slotProps={{
            htmlInput: { 'aria-label': `Search the ${HERE_LABEL[location]}`, enterKeyHint: 'search' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onQueryChange('')}
                    aria-label="Clear search"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
          sx={{ '& .MuiInputBase-root': { minHeight: 44 } }}
        />
        <Button
          variant="contained"
          onClick={() => (adding && !isCompact ? closeAdd() : openAdd(canAddQuery ? trimmed : ''))}
          startIcon={adding && !isCompact ? <CloseIcon /> : <AddIcon />}
          sx={{ minHeight: 44, flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          {adding && !isCompact ? 'Close' : 'Add'}
        </Button>
      </Box>

      {canAddQuery && !adding && (
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => openAdd(trimmed)}
          sx={{ mt: 1, minHeight: 36, textTransform: 'none' }}
        >
          Add “{trimmed}” to the {HERE_LABEL[location]}
        </Button>
      )}

      {elsewhere.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Also in {OTHER_LABEL[location]}:{' '}
          {elsewhere
            .slice(0, 3)
            .map((item) => `${item.name} (${formatQuantity(item)})`)
            .join(', ')}
          {elsewhere.length > 3 ? ` and ${elsewhere.length - 3} more` : ''}
        </Typography>
      )}

      {!isCompact && (
        <Collapse in={adding} unmountOnExit>
          <Box sx={{ pt: 2 }}>{form}</Box>
        </Collapse>
      )}

      {isCompact && (
        <Drawer
          anchor="bottom"
          open={adding}
          onClose={closeAdd}
          slotProps={{
            paper: {
              sx: {
                p: 2,
                pb: 'calc(16px + env(safe-area-inset-bottom))',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                maxHeight: '90dvh',
              },
            },
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Add to the {HERE_LABEL[location]}
          </Typography>
          {form}
        </Drawer>
      )}
    </Paper>
  );
}
