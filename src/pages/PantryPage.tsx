import { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import PageHeading from '../components/PageHeading';
import SearchAddBar from '../components/SearchAddBar';
import ItemList from '../components/ItemList';
import { useItemsByLocation } from '../hooks/useItems';
import { matchesQuery, sortPantry } from '../utils/items';

export default function PantryPage() {
  const items = useItemsByLocation('pantry');
  const fridgeItems = useItemsByLocation('fridge');
  const [query, setQuery] = useState('');

  if (!items) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const visible = sortPantry(items.filter((item) => matchesQuery(item, query)));
  const searching = query.trim().length > 0;

  return (
    <>
      <PageHeading title="Pantry" subtitle="Cupboard food. Staples stay pinned to the top." />
      <SearchAddBar
        location="pantry"
        items={items}
        otherItems={fridgeItems ?? []}
        query={query}
        onQueryChange={setQuery}
      />
      <ItemList
        items={visible}
        emptyTitle={searching ? `No “${query.trim()}” in the pantry` : 'Nothing in the pantry yet'}
        emptyHint={
          searching
            ? 'Use Add to put it on the list.'
            : 'Use Add above for your first item. Everything stays on this device.'
        }
      />
    </>
  );
}
