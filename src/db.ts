import Dexie, { type EntityTable } from 'dexie';

export interface PantryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  favourited: boolean;
  addedAt: Date;
}

const db = new Dexie('PantryDB') as Dexie & {
  items: EntityTable<PantryItem, 'id'>;
};

db.version(1).stores({
  items: '++id, name, favourited',
});

export { db };