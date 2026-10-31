import { useState } from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import PageHeading from '../components/PageHeading';
import SearchAddBar from '../components/SearchAddBar';
import ItemList from '../components/ItemList';
import { useItemsByLocation } from '../hooks/useItems';
import { describeExpiry } from '../utils/expiry';
import { isOut, matchesQuery, sortFridge } from '../utils/items';

export default function FridgePage() {
  const items = useItemsByLocation('fridge');
  const pantryItems = useItemsByLocation('pantry');
  const [query, setQuery] = useState('');

  if (!items) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const visible = sortFridge(items.filter((item) => matchesQuery(item, query)));
  const searching = query.trim().length > 0;
  const inStock = items.filter((item) => !isOut(item));
  const expired = inStock.filter((item) => describeExpiry(item.expiresAt).status === 'expired');
  const critical = inStock.filter((item) => describeExpiry(item.expiresAt).status === 'critical');

  return (
    <>
      <PageHeading
        title="Refrigerator"
        subtitle="Sorted by what goes off first. Tap a date to change it."
      />

      {expired.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {expired.length === 1
            ? `${expired[0].name} has expired.`
            : `${expired.length} items have expired.`}
        </Alert>
      )}
      {expired.length === 0 && critical.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {critical.length === 1
            ? `${critical[0].name} needs using up.`
            : `${critical.length} items need using up in the next few days.`}
        </Alert>
      )}

      <SearchAddBar
        location="fridge"
        items={items}
        otherItems={pantryItems ?? []}
        query={query}
        onQueryChange={setQuery}
      />
      <ItemList
        items={visible}
        showExpiry
        emptyTitle={searching ? `No “${query.trim()}” in the fridge` : 'The fridge is empty'}
        emptyHint={
          searching
            ? 'Use Add to put it on the list.'
            : 'Add something with an expiry date and it will be sorted by what goes off first.'
        }
      />
    </>
  );
}
