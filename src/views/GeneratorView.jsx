import { useEffect, useRef, useState } from 'react';
import { Apple, Camera, ChefHat, ChevronRight, Flame, RefreshCw, Sparkles } from 'lucide-react';
import RecipeCard from '../components/RecipeCard.jsx';
import { useAppState } from '../context/appState.js';
import { buildGeneratorRecipeCacheKey, buildGeneratorSuggestionsCacheKey, callGeminiAPI, callGeminiVisionAPI, GENERATOR_RECIPE_CACHE_KEY, GENERATOR_SUGGESTIONS_CACHE_KEY, getCooldownMessage, getGeminiCooldownUntil, readStoredJson, writeStoredJson } from '../lib/gemini.js';

export default function GeneratorView() {
  const { profile, favoriteRecipes } = useAppState();
  const [ingredients, setIngredients] = useState('');
  const [dishType, setDishType] = useState('Plato Principal (Salado)');
  const [difficulty, setDifficulty] = useState('Media');
  const [cuisine, setCuisine] = useState('Sorpréndeme');
  
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  
  const [suggestions, setSuggestions] = useState(null);
  const [generatingRecipe, setGeneratingRecipe] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  const [error, setError] = useState(null);
  const [quotaNotice, setQuotaNotice] = useState(null);
  const [cacheNotice, setCacheNotice] = useState(null);
  const [cooldownUntil, setCooldownUntilState] = useState(() => getGeminiCooldownUntil());
  const [now, setNow] = useState(Date.now());
  const fileInputRef = useRef(null);
  const cooldownRemainingMs = Math.max(0, cooldownUntil - now);
  const isCooldownActive = cooldownRemainingMs > 0;
  const cooldownLabel = isCooldownActive ? `Disponible en ${Math.ceil(cooldownRemainingMs / 1000)}s` : null;

  useEffect(() => {
    if (!isCooldownActive) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
      setCooldownUntilState(getGeminiCooldownUntil());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isCooldownActive]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result.split(',')[1];
      setScanning(true);
      try {
        const prompt = "Identifica todos los ingredientes de comida visibles en esta imagen. Devuelve ÚNICAMENTE una lista de los nombres de los ingredientes separados por comas, sin texto adicional ni saltos de línea.";
        const resultText = await callGeminiVisionAPI(prompt, base64Data, file.type);
        setIngredients(prev => prev ? `${prev}, ${resultText.trim()}` : resultText.trim());
      } catch (err) {
        console.error(err);
        setError("Error al escanear la imagen.");
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getSuggestions = async () => {
    if (!ingredients.trim()) {
      setError("Por favor ingresa algunos ingredientes que tengas.");
      return;
    }
    if (isCooldownActive) {
      const cooldownMessage = getCooldownMessage(cooldownUntil);
      setQuotaNotice(cooldownMessage);
      setError(cooldownMessage);
      return;
    }

    const suggestionsCacheKey = buildGeneratorSuggestionsCacheKey({
      ingredients,
      dishType,
      difficulty,
      cuisine,
      profile: {
        ...profile,
        favoriteTitles: favoriteRecipes.map((recipe) => recipe.title),
      }
    });
    const suggestionsCache = readStoredJson(GENERATOR_SUGGESTIONS_CACHE_KEY, {});

    setLoading(true);
    setError(null);
    setQuotaNotice(null);
    setCacheNotice(null);
    setSuggestions(null);
    setSelectedRecipe(null);

    const prompt = `
      Eres un Chef Experto e IA Nutricional. 
      PARÁMETROS DEL USUARIO:
      - Ingredientes disponibles (prioriza usar estos, puedes agregar básicos de despensa): ${ingredients}
      - Tipo de plato: ${dishType} (Dulce o Salado)
      - Nivel de Dificultad: ${difficulty}
      - Tipo de cocina sugerida: ${cuisine}.
      - Modo Económico Activado: ${profile.budgetFriendly ? 'SÍ, minimiza costos y usa lo que hay.' : 'NO, prioriza la creatividad.'}
      
      PERFIL DEL USUARIO (¡ESTRICTO! DEBES CUMPLIR ESTO):
      - Datos físicos y meta: Peso: ${profile.weight || 'N/A'}kg, Calorías Meta: ${profile.dailyCalories || 'N/A'}kcal.
      - Objetivo principal: ${profile.goals}
      - Estilo de dieta: ${profile.dietaryStyle}, Religión: ${profile.religiousDiet}
      - Alergias/Intolerancias: ${profile.allergies.length > 0 ? profile.allergies.join(', ') : 'Ninguna'}
      - Evitar: ${profile.dislikes.length > 0 ? profile.dislikes.join(', ') : 'Ninguno'}.
      - Platos que le encantan (Inspírate en esto si cuadra): ${favoriteRecipes.length > 0 ? favoriteRecipes.map(r => r.title).join(', ') : 'Aún ninguno'}
      - Preferencias aprendidas por IA: ${profile.learnedPreferences.length > 0 ? profile.learnedPreferences.join(' | ') : 'Ninguna'}

      En lugar de imponer una sola receta, genera 3 OPCIONES diferentes de preparaciones (ej. una al horno, otra en sartén, una ensalada fría, etc.) que se puedan hacer con esos ingredientes.

      Devuelve ÚNICAMENTE un JSON válido con este esquema exacto:
      {
        "suggestions": [
          {
            "id": 1,
            "name": "Nombre creativo de la opción",
            "type": "Método/Estilo (Ej: Al horno, Rápido en sartén)",
            "description": "Por qué es buena idea y cómo usa los ingredientes disponibles."
          }
        ]
      }
    `;

    try {
      const result = await callGeminiAPI(prompt);
      setSuggestions(result.suggestions);
      suggestionsCache[suggestionsCacheKey] = result.suggestions;
      writeStoredJson(GENERATOR_SUGGESTIONS_CACHE_KEY, suggestionsCache);
    } catch (err) {
      const cachedSuggestions = suggestionsCache[suggestionsCacheKey];

      if (Array.isArray(cachedSuggestions) && cachedSuggestions.length > 0) {
        setSuggestions(cachedSuggestions);
        setCacheNotice('Mostrando la ultima tanda de opciones guardadas mientras Gemini vuelve a estar disponible.');
      }

      if (err.message?.includes('limite de solicitudes') || err.message?.includes('Gemini esta en pausa')) {
        setCooldownUntilState(getGeminiCooldownUntil());
        setNow(Date.now());
        setQuotaNotice(err.message);
      }

      setError(err.message || "Hubo un error al generar las opciones. Intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateFromSuggestion = async (sugg) => {
    if (isCooldownActive) {
      const cooldownMessage = getCooldownMessage(cooldownUntil);
      setQuotaNotice(cooldownMessage);
      setError(cooldownMessage);
      return;
    }

    const recipeCacheKey = buildGeneratorRecipeCacheKey({ suggestion: sugg, ingredients, profile });
    const recipeCache = readStoredJson(GENERATOR_RECIPE_CACHE_KEY, {});

    setGeneratingRecipe(true);
    setError(null);
    setQuotaNotice(null);
    setCacheNotice(null);
    const prompt = `
      Genera la receta completa para: "${sugg.name}".
      Contexto de la idea original: ${sugg.description}. Usando estos ingredientes base: ${ingredients}.
      
      Perfil a cumplir:
      - Objetivo: ${profile.goals} (Calorías Meta: ${profile.dailyCalories || 'N/A'}, Proteína: ${profile.proteinTarget || 'N/A'}g, Fibra: ${profile.fiberTarget || 'N/A'}g).
      - Restricciones: ${[profile.dietaryStyle, profile.religiousDiet, ...profile.allergies].join(', ')}.
      - Evitar: ${profile.dislikes.join(', ')} ${profile.learnedPreferences.join(' ')}.
      - Proteína en polvo: ${profile.useProteinPowder ? 'Sí' : 'No'}.

      Devuelve la respuesta ÚNICAMENTE en un JSON válido con este esquema exacto:
      {
        "title": "Nombre creativo del plato",
        "description": "Breve descripción apetitosa de 2 líneas",
        "prepTime": "XX min",
        "cookTime": "XX min",
        "cuisine": "Tipo de cocina",
        "ingredients": [
          { "name": "Nombre ingrediente", "amount": "Cantidad", "substitute": "Sustituto sugerido si no lo tiene" }
        ],
        "steps": ["Paso 1...", "Paso 2..."],
        "macros": { "calories": "aprox", "protein": "Xg", "carbs": "Xg", "fat": "Xg", "fiber": "Xg" },
        "tips": "Un consejo de cocina relacionado a este plato"
      }
    `;

    try {
      const result = await callGeminiAPI(prompt);
      setSelectedRecipe(result);
      recipeCache[recipeCacheKey] = result;
      writeStoredJson(GENERATOR_RECIPE_CACHE_KEY, recipeCache);
    } catch (err) {
      const cachedRecipe = recipeCache[recipeCacheKey];

      if (cachedRecipe) {
        setSelectedRecipe(cachedRecipe);
        setCacheNotice('Mostrando la ultima receta guardada para esta idea mientras Gemini vuelve a estar disponible.');
      }

      if (err.message?.includes('limite de solicitudes') || err.message?.includes('Gemini esta en pausa')) {
        setCooldownUntilState(getGeminiCooldownUntil());
        setNow(Date.now());
        setQuotaNotice(err.message);
      }

      console.error(err);
      setError(err.message || "No pude generar la receta ahora. Intenta de nuevo en unos minutos.");
    } finally {
      setGeneratingRecipe(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Apple className="text-orange-500" size={20} />
            ¿Qué hay en tu cocina?
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Ingredientes Disponibles</label>
              <div className="relative">
                <textarea 
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="Ej: Pollo, arroz, tomates, espinaca..."
                  className="w-full p-3 pb-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50 min-h-[100px]"
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={scanning}
                  className="absolute bottom-3 right-3 bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-300 p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm z-10"
                  title="Escanear ingredientes con foto"
                >
                  {scanning ? <RefreshCw className="animate-spin" size={14} /> : <Camera size={14} />}
                  {scanning ? 'Escaneando...' : '✨ Escanear Foto'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Tipo</label>
                <select value={dishType} onChange={e => setDishType(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none">
                  <option>Plato Principal (Salado)</option>
                  <option>Desayuno</option>
                  <option>Snack / Picoteo</option>
                  <option>Postre (Dulce)</option>
                  <option>Aperitivo</option>
                  <option>Bebida / Batido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Dificultad</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none">
                  <option>Fácil</option>
                  <option>Media</option>
                  <option>Difícil (Reto)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Inspiración (Cocina)</label>
              <select value={cuisine} onChange={e => setCuisine(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none">
                <option>Sorpréndeme</option>
                <option>Mediterránea</option>
                <option>Asiática</option>
                <option>Latinoamericana</option>
                <option>Fusión</option>
                <option>India</option>
              </select>
            </div>

            <button 
              onClick={getSuggestions}
              disabled={loading || generatingRecipe || isCooldownActive}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all disabled:opacity-70 flex justify-center items-center gap-2 shadow-sm"
            >
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <Flame size={20} />}
              {loading ? 'Analizando tu cocina...' : (isCooldownActive ? cooldownLabel : 'Buscar Opciones')}
            </button>
            {quotaNotice && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <div className="font-semibold">Gemini esta limitado temporalmente</div>
                <div className="mt-1">{quotaNotice}</div>
              </div>
            )}
            {cacheNotice && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                {cacheNotice}
              </div>
            )}
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
          </div>
        </div>
      </div>

      <div className="lg:col-span-8">
        {loading && (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-orange-400 space-y-4 bg-white/50 rounded-3xl border border-dashed border-orange-200">
            <RefreshCw className="animate-spin" size={48} />
            <p className="font-medium animate-pulse">Pensando qué preparar con tus ingredientes...</p>
          </div>
        )}
        
        {!loading && !suggestions && !selectedRecipe && (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 space-y-4 bg-white/50 rounded-3xl border border-dashed border-slate-200 p-8 text-center">
            <ChefHat size={64} className="opacity-20" />
            <p className="text-lg">Ingresa lo que tienes en tu nevera y te daré opciones para preparar.</p>
          </div>
        )}

        {suggestions && !selectedRecipe && !generatingRecipe && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Sparkles className="text-orange-500" /> Mira lo que puedes hacer:</h3>
            <div className="grid gap-4">
              {suggestions.map((sugg) => (
                <div key={sugg.id} className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:border-orange-300 transition-colors">
                  <div className="flex-1">
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full inline-block mb-2">
                      {sugg.type}
                    </span>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">{sugg.name}</h4>
                    <p className="text-slate-600 text-sm">{sugg.description}</p>
                  </div>
                  <button 
                    onClick={() => generateFromSuggestion(sugg)}
                    disabled={generatingRecipe || isCooldownActive}
                    className="w-full sm:w-auto py-2.5 px-6 bg-orange-50 text-orange-700 font-bold rounded-xl hover:bg-orange-600 hover:text-white transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 disabled:hover:bg-orange-50 disabled:hover:text-orange-700"
                  >
                    <ChefHat size={18} /> {isCooldownActive ? cooldownLabel : 'Ver Receta'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {generatingRecipe && !selectedRecipe && (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-orange-500">
            <RefreshCw className="animate-spin mb-4" size={48} />
            <p className="font-medium animate-pulse">Escribiendo el paso a paso de la receta...</p>
          </div>
        )}

        {selectedRecipe && (
          <div>
             <button onClick={() => setSelectedRecipe(null)} className="mb-4 text-orange-600 font-medium flex items-center gap-1 hover:underline">
               <ChevronRight className="rotate-180" size={18} /> Volver a opciones
             </button>
             <RecipeCard recipe={selectedRecipe} />
          </div>
        )}
      </div>
    </div>
  );
}


