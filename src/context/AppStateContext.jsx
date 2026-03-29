import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc,
  query, orderBy, limit,
} from 'firebase/firestore';
import { AppStateContext } from './appState.js';
import { db } from '../lib/firebase.js';
import { useAuth } from './AuthContext.jsx';
import { readStoredJson, writeStoredJson } from '../lib/gemini.js';

export const DEFAULT_PROFILE = {
  weight: '', height: '', age: '', gender: 'Femenino',
  activityLevel: '1.2',
  sportType: 'Ninguno',
  trainingDuration: '60',
  trainingDaysPerWeek: '3',
  dailyCalories: '', manualCalories: false,
  proteinTarget: '', manualProtein: false,
  fiberTarget: '', manualFiber: false,
  carbTarget: '', manualCarb: false,
  useProteinPowder: false, budgetFriendly: false,
  goals: 'Mantenimiento y energia',
  dietaryStyle: 'Ninguna', religiousDiet: 'Ninguna',
  allergies: [], dislikes: [], learnedPreferences: [],
  preferredSupermarket: '',
};

export function isProfileComplete(profile) {
  return Boolean(profile.weight && profile.height && profile.age && profile.goals);
}

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
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [firestoreReady, setFirestoreReady] = useState(false);

  // ── Carga inicial ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLocalMode) {
      setProfile({ ...DEFAULT_PROFILE, ...readStoredJson('nutrichef_profile', DEFAULT_PROFILE) });
      setFavoriteRecipes(readStoredJson('nutrichef_favs', []));
      setInterestedRecipes(readStoredJson('nutrichef_interested', []));
      setSavedRecipes(readStoredJson('nutrichef_saved_recipes', []));
      setGeneratedRecipes(readStoredJson('nutrichef_generated', []));
      setFirestoreReady(true);
      return;
    }

    if (!uid) { setFirestoreReady(false); return; }

    setFirestoreReady(false);
    getDoc(doc(db, 'users', uid)).then(async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.profile) setProfile({ ...DEFAULT_PROFILE, ...data.profile });
        if (data.favoriteRecipes) setFavoriteRecipes(data.favoriteRecipes);
        if (data.interestedRecipes) setInterestedRecipes(data.interestedRecipes);
        if (data.savedRecipes) setSavedRecipes(data.savedRecipes);
        if (data.plan) setPlan(data.plan);
        if (data.savedMeals) setSavedMeals(data.savedMeals);
      } else {
        const lp = readStoredJson('nutrichef_profile', null);
        if (lp) setProfile({ ...DEFAULT_PROFILE, ...lp });
        const lf = readStoredJson('nutrichef_favs', []);
        if (lf.length) setFavoriteRecipes(lf);
        const li = readStoredJson('nutrichef_interested', []);
        if (li.length) setInterestedRecipes(li);
        const lsr = readStoredJson('nutrichef_saved_recipes', []);
        if (lsr.length) setSavedRecipes(lsr);
      }

      try {
        const q = query(
          collection(db, 'users', uid, 'generatedRecipes'),
          orderBy('generatedAt', 'desc'),
          limit(50)
        );
        const snap2 = await getDocs(q);
        setGeneratedRecipes(snap2.docs.map(d => ({ _firestoreId: d.id, ...d.data() })));
      } catch (_) { /* subcolección vacía */ }

      setFirestoreReady(true);
    });
  }, [uid, isLocalMode]);

  // ── Sync Firestore ────────────────────────────────────────────────────────────
  const syncReady = firestoreReady && !isLocalMode;
  useFirestoreSync(uid, 'profile', profile, syncReady);
  useFirestoreSync(uid, 'favoriteRecipes', favoriteRecipes, syncReady);
  useFirestoreSync(uid, 'interestedRecipes', interestedRecipes, syncReady);
  useFirestoreSync(uid, 'savedRecipes', savedRecipes, syncReady);
  useFirestoreSync(uid, 'plan', plan, syncReady);
  useFirestoreSync(uid, 'savedMeals', savedMeals, syncReady);

  // ── Sync localStorage ─────────────────────────────────────────────────────────
  useEffect(() => { if (isLocalMode && firestoreReady) writeStoredJson('nutrichef_profile', profile); }, [profile, isLocalMode, firestoreReady]);
  useEffect(() => { if (isLocalMode && firestoreReady) writeStoredJson('nutrichef_favs', favoriteRecipes); }, [favoriteRecipes, isLocalMode, firestoreReady]);
  useEffect(() => { if (isLocalMode && firestoreReady) writeStoredJson('nutrichef_interested', interestedRecipes); }, [interestedRecipes, isLocalMode, firestoreReady]);
  useEffect(() => { if (isLocalMode && firestoreReady) writeStoredJson('nutrichef_saved_recipes', savedRecipes); }, [savedRecipes, isLocalMode, firestoreReady]);
  useEffect(() => { if (isLocalMode && firestoreReady) writeStoredJson('nutrichef_generated', generatedRecipes.slice(0, 50)); }, [generatedRecipes, isLocalMode, firestoreReady]);

  // ── saveGeneratedRecipe ───────────────────────────────────────────────────────
  // Guarda una receta nueva. Devuelve el firestoreId para poder actualizarla luego.
  const saveGeneratedRecipe = useCallback(async (recipe) => {
    if (!recipe?.title) return null;

    const entry = { ...recipe, generatedAt: new Date().toISOString() };
    let firestoreId = null;

    if (uid && !isLocalMode) {
      try {
        const ref = await addDoc(collection(db, 'users', uid, 'generatedRecipes'), entry);
        firestoreId = ref.id;
      } catch (err) {
        console.error('Error guardando receta generada:', err);
      }
    }

    const entryWithId = { ...entry, _firestoreId: firestoreId };
    setGeneratedRecipes(prev => {
      // Si ya existe por título, no duplicar
      if (prev.some(r => r.title === recipe.title && !recipe._refinedFrom)) return prev;
      return [entryWithId, ...prev];
    });

    return firestoreId;
  }, [uid, isLocalMode]);

  // ── refineGeneratedRecipe ─────────────────────────────────────────────────────
  // Actualiza una receta existente en Firestore (no crea un duplicado).
  // refinedRecipe debe tener _firestoreId si viene del historial.
  const refineGeneratedRecipe = useCallback(async (originalFirestoreId, refinedRecipe) => {
    if (!refinedRecipe?.title) return;

    const entry = {
      ...refinedRecipe,
      refinedAt: new Date().toISOString(),
      // Historial de refinamientos para auditoría
      _refinements: [
        ...(refinedRecipe._refinements || []),
        {
          instruction: refinedRecipe._refinement,
          at: new Date().toISOString(),
        }
      ],
    };

    // Actualizar en el array local
    setGeneratedRecipes(prev =>
      prev.map(r =>
        r._firestoreId === originalFirestoreId ? { ...r, ...entry } : r
      )
    );

    // Actualizar en Firestore si existe el documento
    if (uid && !isLocalMode && originalFirestoreId) {
      try {
        await updateDoc(
          doc(db, 'users', uid, 'generatedRecipes', originalFirestoreId),
          entry
        );
      } catch (err) {
        console.error('Error actualizando receta refinada:', err);
        // Si falla el update, guardar como nuevo documento
        await saveGeneratedRecipe(entry);
      }
    }
  }, [uid, isLocalMode, saveGeneratedRecipe]);

  // ── addDislike ────────────────────────────────────────────────────────────────
  // Agrega un ingrediente a dislikes del perfil y lo sincroniza automáticamente.
  const addDislike = useCallback((ingredient) => {
    if (!ingredient) return;
    const clean = ingredient.trim().toLowerCase();
    setProfile(prev => {
      if (prev.dislikes.includes(clean)) return prev;
      return { ...prev, dislikes: [...prev.dislikes, clean] };
    });
  }, []);

  const value = useMemo(() => ({
    plan, setPlan,
    savedMeals, setSavedMeals,
    favoriteRecipes, setFavoriteRecipes,
    interestedRecipes, setInterestedRecipes,
    savedRecipes, setSavedRecipes,
    generatedRecipes,
    saveGeneratedRecipe,
    refineGeneratedRecipe,
    addDislike,
    profile, setProfile,
    firestoreReady,
  }), [
    plan, savedMeals, favoriteRecipes, interestedRecipes,
    savedRecipes, generatedRecipes,
    saveGeneratedRecipe, refineGeneratedRecipe, addDislike,
    profile, firestoreReady,
  ]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}
