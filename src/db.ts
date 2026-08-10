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

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface SavedRecipe {
  id: number;
  title: string;
  description: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  tags: string[];
  favourited: boolean;
  savedAt: Date;
  usedItemNames: string[];
}

const db = new Dexie('PantryDB') as Dexie & {
  items: EntityTable<PantryItem, 'id'>;
  recipes: EntityTable<SavedRecipe, 'id'>;
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

db.version(3).stores({
  recipes: '++id, title, favourited, savedAt',
});

export { db };
