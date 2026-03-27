import { useEffect, useMemo, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AppStateContext } from './appState.js';
import { db } from '../lib/firebase.js';
import { useAuth } from './AuthContext.jsx';
import { readStoredJson, writeStoredJson } from '../lib/gemini.js';

const DEFAULT_PROFILE = {
  weight: '', height: '', age: '', gender: 'Femenino',
  activityLevel: '1.2', dailyCalories: '', manualCalories: false,
  proteinTarget: '', manualProtein: false, fiberTarget: '', manualFiber: false,
  useProteinPowder: false, budgetFriendly: false,
  goals: 'Mantenimiento y energia', dietaryStyle: 'Ninguna',
  religiousDiet: 'Ninguna', allergies: [], dislikes: [], learnedPreferences: []
};

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
  const { user, isLocalMode } = useAuth();
  const uid = user?.uid ?? null;

  const [plan, setPlan] = useState(null);
  const [savedMeals, setSavedMeals] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [interestedRecipes, setInterestedRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]); // recetas agregadas manualmente
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [firestoreReady, setFirestoreReady] = useState(false);

  useEffect(() => {
    if (isLocalMode) {
      // Modo local: leer todo desde localStorage
      const p = readStoredJson('nutrichef_profile', DEFAULT_PROFILE);
      const f = readStoredJson('nutrichef_favs', []);
      const i = readStoredJson('nutrichef_interested', []);
      const sr = readStoredJson('nutrichef_saved_recipes', []);
      setProfile({ ...DEFAULT_PROFILE, ...p });
      setFavoriteRecipes(f);
      setInterestedRecipes(i);
      setSavedRecipes(sr);
      setFirestoreReady(true);
      return;
    }

    if (!uid) { setFirestoreReady(false); return; }

    setFirestoreReady(false);
    getDoc(doc(db, 'users', uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.profile) setProfile({ ...DEFAULT_PROFILE, ...data.profile });
        if (data.favoriteRecipes) setFavoriteRecipes(data.favoriteRecipes);
        if (data.interestedRecipes) setInterestedRecipes(data.interestedRecipes);
        if (data.savedRecipes) setSavedRecipes(data.savedRecipes);
        if (data.plan) setPlan(data.plan);
        if (data.savedMeals) setSavedMeals(data.savedMeals);
      } else {
        // Migrar desde localStorage si existe
        const lp = readStoredJson('nutrichef_profile', null);
        const lf = readStoredJson('nutrichef_favs', []);
        const li = readStoredJson('nutrichef_interested', []);
        const lsr = readStoredJson('nutrichef_saved_recipes', []);
        if (lp) setProfile({ ...DEFAULT_PROFILE, ...lp });
        if (lf.length) setFavoriteRecipes(lf);
        if (li.length) setInterestedRecipes(li);
        if (lsr.length) setSavedRecipes(lsr);
      }
      setFirestoreReady(true);
    });
  }, [uid, isLocalMode]);

  // Sincronizar a Firestore si hay cuenta
  useFirestoreSync(uid, 'profile', profile, firestoreReady && !isLocalMode);
  useFirestoreSync(uid, 'favoriteRecipes', favoriteRecipes, firestoreReady && !isLocalMode);
  useFirestoreSync(uid, 'interestedRecipes', interestedRecipes, firestoreReady && !isLocalMode);
  useFirestoreSync(uid, 'savedRecipes', savedRecipes, firestoreReady && !isLocalMode);
  useFirestoreSync(uid, 'plan', plan, firestoreReady && !isLocalMode);
  useFirestoreSync(uid, 'savedMeals', savedMeals, firestoreReady && !isLocalMode);

  // Sincronizar a localStorage en modo local
  useEffect(() => {
    if (!isLocalMode || !firestoreReady) return;
    writeStoredJson('nutrichef_profile', profile);
  }, [profile, isLocalMode, firestoreReady]);

  useEffect(() => {
    if (!isLocalMode || !firestoreReady) return;
    writeStoredJson('nutrichef_favs', favoriteRecipes);
  }, [favoriteRecipes, isLocalMode, firestoreReady]);

  useEffect(() => {
    if (!isLocalMode || !firestoreReady) return;
    writeStoredJson('nutrichef_interested', interestedRecipes);
  }, [interestedRecipes, isLocalMode, firestoreReady]);

  useEffect(() => {
    if (!isLocalMode || !firestoreReady) return;
    writeStoredJson('nutrichef_saved_recipes', savedRecipes);
  }, [savedRecipes, isLocalMode, firestoreReady]);

  const value = useMemo(() => ({
    plan, setPlan,
    savedMeals, setSavedMeals,
    favoriteRecipes, setFavoriteRecipes,
    interestedRecipes, setInterestedRecipes,
    savedRecipes, setSavedRecipes,
    profile, setProfile,
    firestoreReady,
  }), [plan, savedMeals, favoriteRecipes, interestedRecipes, savedRecipes, profile, firestoreReady]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}
