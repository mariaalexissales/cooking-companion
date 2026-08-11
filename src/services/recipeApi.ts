export interface GeneratedIngredient {
  name: string;
  amount: string;
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  ingredients: GeneratedIngredient[];
  steps: string[];
  tags: string[];
}

export interface GenerateRequest {
  ingredients: string[];
  servings: number;
  mealType: string;
  notes: string;
}

export type RecipeErrorKind = 'config' | 'network' | 'rate-limit' | 'upstream' | 'invalid';

export class RecipeApiError extends Error {
  kind: RecipeErrorKind;

  constructor(kind: RecipeErrorKind, message: string) {
    super(message);
    this.name = 'RecipeApiError';
    this.kind = kind;
  }
}

const ENDPOINT = import.meta.env.VITE_RECIPE_API_URL;
const REQUEST_TIMEOUT_MS = 60_000;

export function isGeneratorConfigured(): boolean {
  return typeof ENDPOINT === 'string' && ENDPOINT.length > 0;
}

function isRecipe(value: unknown): value is GeneratedRecipe {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.title === 'string' &&
    typeof r.description === 'string' &&
    typeof r.servings === 'number' &&
    typeof r.prepMinutes === 'number' &&
    typeof r.cookMinutes === 'number' &&
    Array.isArray(r.steps) &&
    r.steps.every((s) => typeof s === 'string') &&
    Array.isArray(r.tags) &&
    r.tags.every((t) => typeof t === 'string') &&
    Array.isArray(r.ingredients) &&
    r.ingredients.every(
      (i) =>
        typeof i === 'object' &&
        i !== null &&
        typeof (i as GeneratedIngredient).name === 'string' &&
        typeof (i as GeneratedIngredient).amount === 'string',
    )
  );
}

async function readErrorDetail(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (typeof body === 'object' && body !== null && 'error' in body) {
      return String((body as { error: unknown }).error);
    }
    return '';
  } catch {
    return '';
  }
}

export async function generateRecipe(request: GenerateRequest): Promise<GeneratedRecipe> {
  const endpoint = ENDPOINT;
  if (!endpoint) {
    throw new RecipeApiError(
      'config',
      'No recipe service configured. Set VITE_RECIPE_API_URL to your deployed Worker URL.',
    );
  }

  let response: Response;
  try {
    response = await fetch(`${endpoint.replace(/\/$/, '')}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (caught) {
    const timedOut = caught instanceof Error && caught.name === 'TimeoutError';
    throw new RecipeApiError(
      'network',
      timedOut
        ? 'The recipe service took too long to answer. Try again.'
        : "Couldn't reach the recipe service. Check your connection and try again.",
    );
  }

  if (response.status === 429) {
    throw new RecipeApiError(
      'rate-limit',
      'The recipe service is rate limited right now. Wait a moment and try again.',
    );
  }

  if (!response.ok) {
    const detail = await readErrorDetail(response);
    throw new RecipeApiError(
      'upstream',
      detail || `The recipe service returned an error (${response.status}).`,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new RecipeApiError('invalid', 'The recipe service sent something that was not JSON.');
  }

  if (!isRecipe(payload)) {
    throw new RecipeApiError(
      'invalid',
      "The recipe came back in an unexpected shape. Try generating again.",
    );
  }

  return payload;
}
