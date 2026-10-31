import { createContext, useContext } from 'react';
import type { GeneratedRecipe } from '../services/recipeApi';

export const MEAL_TYPES = ['Anything', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

export interface LastRecipe {
  recipe: GeneratedRecipe;
  usedItemNames: string[];
  saved: boolean;
}

export interface GenerateInput {
  ingredients: string[];
  usedItemNames: string[];
}

export interface GeneratorValue {
  selected: Set<number> | null;
  servings: number;
  mealType: string;
  notes: string;
  loading: boolean;
  error: string | null;
  last: LastRecipe | null;
  setSelected: (next: Set<number>) => void;
  setServings: (next: number) => void;
  setMealType: (next: string) => void;
  setNotes: (next: string) => void;
  generate: (input: GenerateInput) => Promise<boolean>;
  save: () => Promise<void>;
  clearError: () => void;
}

export const GeneratorContext = createContext<GeneratorValue | null>(null);

export function useGenerator(): GeneratorValue {
  const value = useContext(GeneratorContext);
  if (!value) {
    throw new Error('useGenerator must be used inside GeneratorProvider');
  }
  return value;
}
