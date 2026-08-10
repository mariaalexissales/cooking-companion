function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z\s]/g, '').trim();
}

/**
 * Loose match between a recipe ingredient and pantry item names — "chicken thighs"
 * counts as covered by "chicken". Deliberately generous: a false positive just means
 * one unmarked ingredient, while a false negative sends you shopping for what you have.
 */
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
