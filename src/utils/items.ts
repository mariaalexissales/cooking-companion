import type { PantryItem } from '../db';
import { byExpiry } from './expiry';

export function isOut(item: PantryItem): boolean {
  return item.quantity <= 0;
}

function normaliseQuery(value: string): string {
  return value.trim().toLowerCase();
}

export function matchesQuery(item: PantryItem, query: string): boolean {
  const q = normaliseQuery(query);
  if (!q) return true;
  return item.name.toLowerCase().includes(q);
}

export function hasExactName(items: PantryItem[], query: string): boolean {
  const q = normaliseQuery(query);
  return items.some((item) => item.name.toLowerCase() === q);
}

export function formatQuantity(item: PantryItem): string {
  return `${item.quantity} ${item.unit}`;
}

function outLast(a: PantryItem, b: PantryItem): number {
  return Number(isOut(a)) - Number(isOut(b));
}

export function sortPantry(items: PantryItem[]): PantryItem[] {
  return [...items].sort((a, b) => {
    const out = outLast(a, b);
    if (out !== 0) return out;
    if (a.favourited !== b.favourited) return a.favourited ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function sortFridge(items: PantryItem[]): PantryItem[] {
  return [...items].sort((a, b) => {
    const out = outLast(a, b);
    if (out !== 0) return out;
    const date = byExpiry(a, b);
    return date !== 0 ? date : a.name.localeCompare(b.name);
  });
}
