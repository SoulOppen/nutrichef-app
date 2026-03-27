import { useEffect, useMemo, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AppStateContext } from './appState.js';
import { db } from '../lib/firebase.js';
import { useAuth } from './AuthContext.jsx';
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

// Guarda en Firestore con debounce para no escribir en cada tecla
function useFirestoreSync(uid, key, value, ready) {
  useEffect(() => {
    if (!uid || !ready) return;
    const timer = setTimeout(() => {
      setDoc(doc(db, 'users', uid), { [key]: value }, { merge: true });
    }, 800);
    return () => clearTimeout(timer);
  }, [uid, key, value, ready]);
}

export function AppStateProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [plan, setPlan] = useState(null);
  const [savedMeals, setSavedMeals] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [interestedRecipes, setInterestedRecipes] = useState([]);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [firestoreReady, setFirestoreReady] = useState(false);

  // Cargar datos desde Firestore cuando el usuario se autentica
  useEffect(() => {
    if (!uid) {
      setFirestoreReady(false);
      return;
    }

    setFirestoreReady(false);

    getDoc(doc(db, 'users', uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.profile) setProfile({ ...DEFAULT_PROFILE, ...data.profile });
        if (data.favoriteRecipes) setFavoriteRecipes(data.favoriteRecipes);
        if (data.plan) setPlan(data.plan);
        if (data.savedMeals) setSavedMeals(data.savedMeals);
      } else {
        // Usuario nuevo: migrar datos de localStorage si existen
        const localProfile = readStoredJson('nutrichef_profile', null);
        const localFavs = readStoredJson('nutrichef_favs', []);
        if (localProfile) setProfile({ ...DEFAULT_PROFILE, ...localProfile });
        if (localFavs.length) setFavoriteRecipes(localFavs);
      }
      setFirestoreReady(true);
    });
  }, [uid]);

  // Sincronizar cambios a Firestore
  useFirestoreSync(uid, 'profile', profile, firestoreReady);
  useFirestoreSync(uid, 'favoriteRecipes', favoriteRecipes, firestoreReady);
  useFirestoreSync(uid, 'plan', plan, firestoreReady);
  useFirestoreSync(uid, 'savedMeals', savedMeals, firestoreReady);

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
    firestoreReady,
  }), [plan, savedMeals, favoriteRecipes, interestedRecipes, profile, firestoreReady]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}
