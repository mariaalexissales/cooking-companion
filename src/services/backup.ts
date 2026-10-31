import { db, type ItemLocation, type PantryItem, type SavedRecipe } from '../db';
import { fromDateInputValue, toDateInputValue } from '../utils/expiry';

const APP_ID = 'cooking-companion';
const SCHEMA_VERSION = 1;

interface BackupItem {
  name: string;
  quantity: number;
  unit: string;
  staple: boolean;
  location: ItemLocation;
  addedAt: string;
  expiresOn?: string;
}

interface BackupRecipe extends Omit<SavedRecipe, 'id' | 'savedAt'> {
  savedAt: string;
}

interface BackupFile {
  app: typeof APP_ID;
  schemaVersion: number;
  exportedAt: string;
  items: BackupItem[];
  recipes: BackupRecipe[];
}

export interface ImportResult {
  addedItems: number;
  addedRecipes: number;
  skipped: number;
}

export async function exportBackup(): Promise<void> {
  const [items, recipes] = await Promise.all([db.items.toArray(), db.recipes.toArray()]);
  const file: BackupFile = {
    app: APP_ID,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    items: items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      staple: item.favourited,
      location: item.location,
      addedAt: item.addedAt.toISOString(),
      ...(item.expiresAt ? { expiresOn: toDateInputValue(item.expiresAt) } : {}),
    })),
    recipes: recipes.map((recipe) => ({
      title: recipe.title,
      description: recipe.description,
      servings: recipe.servings,
      prepMinutes: recipe.prepMinutes,
      cookMinutes: recipe.cookMinutes,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      tags: recipe.tags,
      favourited: recipe.favourited,
      usedItemNames: recipe.usedItemNames,
      savedAt: recipe.savedAt.toISOString(),
    })),
  };

  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cooking-companion-${toDateInputValue(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function isBackupFile(value: unknown): value is BackupFile {
  if (typeof value !== 'object' || value === null) return false;
  const file = value as Partial<BackupFile>;
  return (
    file.app === APP_ID &&
    typeof file.schemaVersion === 'number' &&
    file.schemaVersion <= SCHEMA_VERSION &&
    Array.isArray(file.items) &&
    Array.isArray(file.recipes)
  );
}

function isBackupItem(value: unknown): value is BackupItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Partial<BackupItem>;
  return (
    typeof item.name === 'string' &&
    item.name.trim().length > 0 &&
    typeof item.quantity === 'number' &&
    typeof item.unit === 'string' &&
    (item.location === 'pantry' || item.location === 'fridge')
  );
}

function isBackupRecipe(value: unknown): value is BackupRecipe {
  if (typeof value !== 'object' || value === null) return false;
  const recipe = value as Partial<BackupRecipe>;
  return (
    typeof recipe.title === 'string' &&
    Array.isArray(recipe.ingredients) &&
    Array.isArray(recipe.steps)
  );
}

function itemKey(name: string, unit: string, location: ItemLocation): string {
  return `${name.trim().toLowerCase()}|${unit}|${location}`;
}

export async function importBackup(file: File): Promise<ImportResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error("That file isn't a Cooking Companion backup.");
  }
  if (!isBackupFile(parsed)) {
    throw new Error("That file isn't a Cooking Companion backup, or it's from a newer version.");
  }

  const backup = parsed;
  return db.transaction('rw', db.items, db.recipes, async () => {
    const existingItems = await db.items.toArray();
    const existingRecipes = await db.recipes.toArray();
    const itemKeys = new Set(existingItems.map((i) => itemKey(i.name, i.unit, i.location)));
    const recipeTitles = new Set(existingRecipes.map((r) => r.title.trim().toLowerCase()));

    const newItems: Omit<PantryItem, 'id'>[] = [];
    const newRecipes: Omit<SavedRecipe, 'id'>[] = [];
    let skipped = 0;

    for (const raw of backup.items) {
      if (!isBackupItem(raw)) {
        skipped += 1;
        continue;
      }
      const key = itemKey(raw.name, raw.unit, raw.location);
      if (itemKeys.has(key)) {
        skipped += 1;
        continue;
      }
      itemKeys.add(key);
      const addedAt = new Date(raw.addedAt);
      newItems.push({
        name: raw.name.trim(),
        quantity: Math.max(0, raw.quantity),
        unit: raw.unit,
        favourited: Boolean(raw.staple),
        location: raw.location,
        addedAt: Number.isNaN(addedAt.getTime()) ? new Date() : addedAt,
        expiresAt: raw.expiresOn ? fromDateInputValue(raw.expiresOn) : undefined,
      });
    }

    for (const raw of backup.recipes) {
      if (!isBackupRecipe(raw)) {
        skipped += 1;
        continue;
      }
      const title = raw.title.trim().toLowerCase();
      if (recipeTitles.has(title)) {
        skipped += 1;
        continue;
      }
      recipeTitles.add(title);
      const savedAt = new Date(raw.savedAt);
      newRecipes.push({
        title: raw.title,
        description: raw.description ?? '',
        servings: raw.servings ?? 2,
        prepMinutes: raw.prepMinutes ?? 0,
        cookMinutes: raw.cookMinutes ?? 0,
        ingredients: raw.ingredients,
        steps: raw.steps,
        tags: Array.isArray(raw.tags) ? raw.tags : [],
        favourited: Boolean(raw.favourited),
        savedAt: Number.isNaN(savedAt.getTime()) ? new Date() : savedAt,
        usedItemNames: Array.isArray(raw.usedItemNames) ? raw.usedItemNames : [],
      });
    }

    await db.items.bulkAdd(newItems as PantryItem[]);
    await db.recipes.bulkAdd(newRecipes as SavedRecipe[]);
    return { addedItems: newItems.length, addedRecipes: newRecipes.length, skipped };
  });
}
