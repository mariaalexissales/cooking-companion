import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { db } from '../db';
import { generateRecipe, RecipeApiError } from '../services/recipeApi';
import {
  GeneratorContext,
  MEAL_TYPES,
  type GenerateInput,
  type GeneratorValue,
  type LastRecipe,
} from './generatorContext';

const STORAGE_KEY = 'cooking-companion:last-recipe';

function readLast(): LastRecipe | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastRecipe;
    return parsed && parsed.recipe && Array.isArray(parsed.recipe.steps) ? parsed : null;
  } catch {
    return null;
  }
}

export default function GeneratorProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Set<number> | null>(null);
  const [servings, setServings] = useState(2);
  const [mealType, setMealType] = useState(MEAL_TYPES[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<LastRecipe | null>(readLast);

  useEffect(() => {
    try {
      if (last) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(last));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      return;
    }
  }, [last]);

  const generate = useCallback(
    async ({ ingredients, usedItemNames }: GenerateInput) => {
      setLoading(true);
      setError(null);
      try {
        const recipe = await generateRecipe({
          ingredients,
          servings,
          mealType,
          notes: notes.trim(),
        });
        setLast({ recipe, usedItemNames, saved: false });
        return true;
      } catch (caught) {
        setError(
          caught instanceof RecipeApiError || caught instanceof Error
            ? caught.message
            : 'Something went wrong generating the recipe.',
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [servings, mealType, notes],
  );

  const save = useCallback(async () => {
    if (!last || last.saved) return;
    await db.recipes.add({
      ...last.recipe,
      favourited: false,
      savedAt: new Date(),
      usedItemNames: last.usedItemNames,
    });
    setLast({ ...last, saved: true });
  }, [last]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<GeneratorValue>(
    () => ({
      selected,
      servings,
      mealType,
      notes,
      loading,
      error,
      last,
      setSelected,
      setServings,
      setMealType,
      setNotes,
      generate,
      save,
      clearError,
    }),
    [selected, servings, mealType, notes, loading, error, last, generate, save, clearError],
  );

  return <GeneratorContext.Provider value={value}>{children}</GeneratorContext.Provider>;
}
