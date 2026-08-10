import Dexie, { type EntityTable } from 'dexie';

export type ItemLocation = 'pantry' | 'fridge';

export interface PantryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  favourited: boolean;
  addedAt: Date;
  location: ItemLocation;
  expiresAt?: Date;
}

const db = new Dexie('PantryDB') as Dexie & {
  items: EntityTable<PantryItem, 'id'>;
};

db.version(1).stores({
  items: '++id, name, favourited',
});

db.version(2)
  .stores({
    items: '++id, name, favourited, location, expiresAt',
  })
  .upgrade((tx) =>
    tx
      .table<PantryItem>('items')
      .toCollection()
      .modify((item) => {
        item.location = 'pantry';
      }),
  );

export { db };
