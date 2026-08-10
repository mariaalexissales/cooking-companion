import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ItemLocation, type PantryItem } from '../db';
import { isUrgent } from '../utils/expiry';

/** Items in one location. `undefined` while the first query is in flight. */
export function useItemsByLocation(location: ItemLocation): PantryItem[] | undefined {
  return useLiveQuery(() => db.items.where('location').equals(location).toArray(), [location]);
}

export function useAllItems(): PantryItem[] | undefined {
  return useLiveQuery(() => db.items.toArray(), []);
}

/** How many fridge items are expired or expiring within three days. */
export function useUrgentCount(): number {
  const count = useLiveQuery(async () => {
    const fridgeItems = await db.items.where('location').equals('fridge').toArray();
    return fridgeItems.filter((item) => isUrgent(item.expiresAt)).length;
  }, []);
  return count ?? 0;
}
