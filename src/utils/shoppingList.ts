import type { GeneratedRecipe } from '../services/recipeApi';
import { isCovered } from './matching';

export type ShareOutcome = 'shared' | 'copied' | 'failed' | 'cancelled';

export function missingIngredients(recipe: GeneratedRecipe, availableItemNames: string[]) {
  return recipe.ingredients.filter((ingredient) => !isCovered(ingredient.name, availableItemNames));
}

export function shoppingListText(recipe: GeneratedRecipe, availableItemNames: string[]): string {
  const lines = missingIngredients(recipe, availableItemNames).map(
    (ingredient) => `- ${ingredient.amount} ${ingredient.name}`.replace(/\s+/g, ' '),
  );
  return [`To buy for ${recipe.title}:`, ...lines].join('\n');
}

export async function shareShoppingList(
  recipe: GeneratedRecipe,
  availableItemNames: string[],
): Promise<ShareOutcome> {
  const text = shoppingListText(recipe, availableItemNames);
  if (typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches) {
    try {
      await navigator.share({ title: `Shopping list: ${recipe.title}`, text });
      return 'shared';
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
