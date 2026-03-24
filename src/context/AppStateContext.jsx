import { useEffect, useMemo, useState } from 'react';
import { AppStateContext } from './appState.js';
import { readStoredJson } from '../lib/gemini.js';

const DEFAULT_PROFILE = {
  weight: '',
  height: '',
  age: '',
  gender: 'Femenino',
  activityLevel: '1.2',
  dailyCalories: '',
  manualCalories: false,
  proteinTarget: '',
  manualProtein: false,
  fiberTarget: '',
  manualFiber: false,
  useProteinPowder: false,
  budgetFriendly: false,
  goals: 'Mantenimiento y energia',
  dietaryStyle: 'Ninguna',
  religiousDiet: 'Ninguna',
  allergies: [],
  dislikes: [],
  learnedPreferences: []
};

export function AppStateProvider({ children }) {
  const [plan, setPlan] = useState(null);
  const [savedMeals, setSavedMeals] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState(() => readStoredJson('nutrichef_favs', []));
  const [interestedRecipes, setInterestedRecipes] = useState([]);
  const [profile, setProfile] = useState(() => readStoredJson('nutrichef_profile', DEFAULT_PROFILE));

  useEffect(() => {
    localStorage.setItem('nutrichef_profile', JSON.stringify(profile));
    localStorage.setItem('nutrichef_favs', JSON.stringify(favoriteRecipes));
  }, [profile, favoriteRecipes]);

  const value = useMemo(() => ({
    plan,
    setPlan,
    savedMeals,
    setSavedMeals,
    favoriteRecipes,
    setFavoriteRecipes,
    interestedRecipes,
    setInterestedRecipes,
    profile,
    setProfile,
  }), [plan, savedMeals, favoriteRecipes, interestedRecipes, profile]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}
