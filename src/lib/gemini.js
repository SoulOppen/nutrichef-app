export const GEMINI_API_ENDPOINT = '/api/gemini';
export const GEMINI_COOLDOWN_KEY = 'nutrichef_gemini_cooldown_until';
export const GEMINI_COOLDOWN_MS = 5 * 1000;
export const GENERATOR_SUGGESTIONS_CACHE_KEY = 'nutrichef_generator_suggestions_cache';
export const GENERATOR_RECIPE_CACHE_KEY = 'nutrichef_generator_recipe_cache';

export function readStoredJson(key, fallbackValue) {
  if (typeof window === 'undefined') return fallbackValue;
  const storedValue = window.localStorage.getItem(key);
  if (!storedValue) return fallbackValue;
  try {
    return JSON.parse(storedValue);
  } catch (error) {
    console.error(`No se pudo leer ${key}:`, error);
    return fallbackValue;
  }
}

export function writeStoredJson(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`No se pudo guardar ${key}:`, error);
  }
}

export function getGeminiCooldownUntil() {
  const storedValue = readStoredJson(GEMINI_COOLDOWN_KEY, 0);
  return Number(storedValue) || 0;
}

export function setGeminiCooldownUntil(timestamp) {
  writeStoredJson(GEMINI_COOLDOWN_KEY, timestamp);
}

export function getCooldownMessage(cooldownUntil) {
  const remainingMs = Math.max(0, cooldownUntil - Date.now());
  const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
  return `Gemini esta en pausa. Espera ${remainingMinutes} min.`;
}

export function getRecipeCache() {
  return readStoredJson(GENERATOR_RECIPE_CACHE_KEY, {});
}

export function setRecipeCache(cache) {
  writeStoredJson(GENERATOR_RECIPE_CACHE_KEY, cache);
}

export function buildGeneratorRecipeCacheKey({ suggestion, ingredients, profile }) {
  return JSON.stringify({
    suggestionName: suggestion.name,
    suggestionType: suggestion.type,
    ingredients: ingredients.trim().toLowerCase(),
    goals: profile.goals,
    dietaryStyle: profile.dietaryStyle,
    allergies: profile.allergies,
    dislikes: profile.dislikes,
    dailyCalories: profile.dailyCalories
  });
}

export async function fetchGeminiContent({ kind, payload }) {
  const cooldownUntil = getGeminiCooldownUntil();

  if (cooldownUntil > Date.now()) {
    throw new Error(getCooldownMessage(cooldownUntil));
  }

  const response = await fetch(GEMINI_API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, payload })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error || 'Error con Gemini';

    if (response.status === 429) {
      const nextCooldown = Date.now() + GEMINI_COOLDOWN_MS;
      setGeminiCooldownUntil(nextCooldown);
      throw new Error(message);
    }

    throw new Error(message);
  }

  return data;
}

export async function callGeminiAPI(promptText, cacheKey = null) {
  const cache = getRecipeCache();

  if (cacheKey && cache[cacheKey]) {
    console.log("⚡ CACHE HIT");
    return cache[cacheKey];
  }

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: promptText }]
      }
    ],
    generationConfig: {
      temperature: 0.7
    }
  };

  try {
    const data = await fetchGeminiContent({ kind: 'text', payload });

    const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResult) {
      throw new Error("La IA no devolvió texto");
    }

    const cleanText = textResult
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanText);

    if (cacheKey) {
      cache[cacheKey] = parsed;
      setRecipeCache(cache);
      console.log("💾 CACHE SAVE");
    }

    return parsed;

  } catch (error) {
    console.error("Error Gemini:", error);
    throw error;
  }
}

export async function callGeminiVisionAPI(promptText, base64Image, mimeType) {
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: promptText },
          { inlineData: { mimeType, data: base64Image } }
        ]
      }
    ]
  };

  const data = await fetchGeminiContent({ kind: 'vision', payload });

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export function buildGeneratorSuggestionsCacheKey({ ingredients, profile }) {
  return `generator:suggestions:${JSON.stringify({ ingredients, profile })}`;
}