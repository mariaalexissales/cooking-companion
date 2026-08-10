import { Box, CircularProgress } from '@mui/material';
import { useLiveQuery } from 'dexie-react-hooks';
import PageHeading from '../components/PageHeading';
import ItemForm from '../components/ItemForm';
import ItemList from '../components/ItemList';
import { db } from '../db';

export default function PantryPage() {
  const items = useLiveQuery(() => db.items.toArray(), []);

  if (!items) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const sorted = [...items].sort((a, b) => {
    if (a.favourited !== b.favourited) return a.favourited ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <PageHeading
        title="Pantry"
        subtitle="Cupboard staples. Favourites stay pinned to the top."
      />
      <ItemForm existingItems={items} />
      <ItemList
        items={sorted}
        emptyTitle="Nothing in the pantry yet"
        emptyHint="Add your first item above. Everything stays on this device."
      />
    </>
  );
}
