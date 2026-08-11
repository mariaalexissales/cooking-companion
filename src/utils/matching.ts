function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z\s]/g, '').trim();
}

export function isCovered(ingredientName: string, itemNames: string[]): boolean {
  const ingredient = normalise(ingredientName);
  if (!ingredient) return false;

  return itemNames.some((raw) => {
    const item = normalise(raw);
    if (!item) return false;
    return ingredient.includes(item) || item.includes(ingredient);
  });
}

export function missingFrom(ingredientNames: string[], itemNames: string[]): string[] {
  return ingredientNames.filter((name) => !isCovered(name, itemNames));
}
