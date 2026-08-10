import { Alert, Box, CircularProgress } from '@mui/material';
import PageHeading from '../components/PageHeading';
import ItemForm from '../components/ItemForm';
import ItemList from '../components/ItemList';
import { useItemsByLocation } from '../hooks/useItems';
import { byExpiry, describeExpiry } from '../utils/expiry';

export default function FridgePage() {
  const items = useItemsByLocation('fridge');

  if (!items) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const sorted = [...items].sort((a, b) => {
    const byDate = byExpiry(a, b);
    return byDate !== 0 ? byDate : a.name.localeCompare(b.name);
  });

  const expired = items.filter((item) => describeExpiry(item.expiresAt).status === 'expired');
  const critical = items.filter((item) => describeExpiry(item.expiresAt).status === 'critical');

  return (
    <>
      <PageHeading
        title="Refrigerator"
        subtitle="Sorted by what goes off first. Tap a date chip to change it."
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

      <ItemForm location="fridge" existingItems={items} showExpiry />
      <ItemList
        items={sorted}
        showExpiry
        emptyTitle="The fridge is empty"
        emptyHint="Add something with an expiry date and it will be sorted by what goes off first."
      />
    </>
  );
}
