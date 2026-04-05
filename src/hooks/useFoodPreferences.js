import { useContext } from 'react';
import { FoodPreferencesContext } from '../context/FoodPreferencesContext.jsx';

export function useFoodPreferences() {
  const context = useContext(FoodPreferencesContext);

  if (!context) {
    throw new Error('useFoodPreferences must be used within FoodPreferencesProvider.');
  }

  return context;
}
