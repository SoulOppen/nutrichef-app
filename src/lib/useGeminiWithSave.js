import { useCallback } from 'react';
import { useAppState } from '../context/appState.js';
import { callGeminiAPI } from './gemini.js';

// Campos que indican que el resultado es una receta completa (no sugerencias ni planes)
const RECIPE_FIELDS = ['title', 'ingredients', 'steps', 'macros'];

function isRecipe(parsed) {
  return RECIPE_FIELDS.every(f => f in parsed);
}

/**
 * Hook que envuelve callGeminiAPI y guarda automáticamente en Firestore
 * si el resultado parece una receta completa.
 */
export function useGeminiWithSave() {
  const { saveGeneratedRecipe } = useAppState();

  const callAndSave = useCallback(async (promptText, cacheKey = null, storeCacheKey = null) => {
    const result = await callGeminiAPI(promptText, cacheKey, storeCacheKey);
    if (result && isRecipe(result)) {
      await saveGeneratedRecipe(result);
    }
    return result;
  }, [saveGeneratedRecipe]);

  return callAndSave;
}
