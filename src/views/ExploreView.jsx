import { useState } from 'react';
import { ChefHat, ChevronRight, Compass, RefreshCw, Search, Sparkles } from 'lucide-react';
import RecipeCard from '../components/RecipeCard.jsx';
import { useAppState } from '../context/appState.js';
import { callGeminiAPI } from '../lib/gemini.js';

export default function ExploreView() {
  const { profile, favoriteRecipes } = useAppState();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [generatingRecipe, setGeneratingRecipe] = useState(false);

  const handleDirectSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setRecipe(null);
    setSuggestions(null);

    const prompt = `
      El usuario buscó específicamente variaciones o alternativas saludables de: "${query}".
      Genera 3 opciones distintas de este plato, estrictamente adaptadas a su perfil nutricional:
      - Objetivo: ${profile.goals} (Calorías: ${profile.dailyCalories || 'N/A'}, Proteína: ${profile.proteinTarget || 'N/A'}g).
      - Dieta: ${profile.dietaryStyle}, Religión: ${profile.religiousDiet}.
      - Evitar: ${[...profile.allergies, ...profile.dislikes, ...profile.learnedPreferences].join(', ')}.
      - Platos que ya le gustan: ${favoriteRecipes.length > 0 ? favoriteRecipes.map(r => r.title).join(', ') : 'Ninguno registrado'}.
      - Presupuesto: ${profile.budgetFriendly ? 'Económico/Low Cost' : 'Normal'}
      
      Devuelve ÚNICAMENTE un JSON con esta estructura:
      {
        "suggestions": [
          {
            "id": 1,
            "name": "Nombre de la variación (Ej: Lasaña Keto)",
            "type": "Variación / Estilo",
            "description": "Por qué es perfecta y cómo se adapta a su dieta"
          }
        ]
      }
    `;

    try {
      const result = await callGeminiAPI(prompt);
      setSuggestions(result.suggestions);
    } catch (err) {
      console.error(err);
      setSuggestions([{
        id: "error",
        name: "No pude generar sugerencias ahora",
        type: "Error de Gemini",
        description: err.message || "Intenta de nuevo en unos minutos."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setRecipe(null);
    setSuggestions(null);

    const prompt = `
      El usuario tiene el siguiente antojo o idea: "${query}".
      Genera 3 sugerencias creativas y deliciosas que satisfagan esto, estrictamente adaptadas a su perfil nutricional:
      - Objetivo: ${profile.goals} (Calorías: ${profile.dailyCalories || 'N/A'}, Proteína: ${profile.proteinTarget || 'N/A'}g).
      - Dieta: ${profile.dietaryStyle}, Religión: ${profile.religiousDiet}.
      - Evitar: ${[...profile.allergies, ...profile.dislikes, ...profile.learnedPreferences].join(', ')}.
      - Platos que ya le gustan: ${favoriteRecipes.length > 0 ? favoriteRecipes.map(r => r.title).join(', ') : 'Ninguno registrado'}.
      - Presupuesto: ${profile.budgetFriendly ? 'Económico/Low Cost' : 'Normal'}
      
      Devuelve ÚNICAMENTE un JSON con esta estructura:
      {
        "suggestions": [
          {
            "id": 1,
            "name": "Nombre de la sugerencia",
            "type": "Ej: Postre, Snack, Cena",
            "description": "Por qué es perfecto para su antojo y cómo se adapta a su dieta"
          }
        ]
      }
    `;

    try {
      const result = await callGeminiAPI(prompt);
      setSuggestions(result.suggestions);
    } catch (err) {
      console.error(err);
      setSuggestions([{
        id: "error",
        name: "No pude generar sugerencias ahora",
        type: "Error de Gemini",
        description: err.message || "Intenta de nuevo en unos minutos."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const generateFromSuggestion = async (sugg) => {
    setGeneratingRecipe(true);
    setSuggestions(null);
    const prompt = `
      Genera la receta completa para: "${sugg.name}".
      Contexto del plato: ${sugg.description}.
      Perfil a cumplir:
      - Objetivo: ${profile.goals} (Calorías Meta: ${profile.dailyCalories || 'N/A'}, Proteína: ${profile.proteinTarget || 'N/A'}g, Fibra: ${profile.fiberTarget || 'N/A'}g).
      - Restricciones: ${[profile.dietaryStyle, profile.religiousDiet, ...profile.allergies].join(', ')}.
      - Evitar: ${profile.dislikes.join(', ')} ${profile.learnedPreferences.join(' ')}.
      - Proteína en polvo: ${profile.useProteinPowder ? 'Sí' : 'No'}.

      Devuelve la respuesta ÚNICAMENTE en un JSON válido con este esquema exacto:
      {
        "title": "Nombre creativo del plato",
        "description": "Breve descripción",
        "prepTime": "XX min", "cookTime": "XX min", "cuisine": "Tipo",
        "ingredients": [ { "name": "Ingrediente", "amount": "Cant.", "substitute": "Sustituto" } ],
        "steps": ["Paso 1..."],
        "macros": { "calories": "aprox", "protein": "Xg", "carbs": "Xg", "fat": "Xg", "fiber": "Xg" },
        "tips": "Tip"
      }
    `;

    try {
      const result = await callGeminiAPI(prompt);
      setRecipe(result);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingRecipe(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl shadow-md text-white text-center">
        <Compass size={40} className="mx-auto mb-4 opacity-90" />
        <h2 className="text-3xl font-bold mb-3">Explora y Antójate</h2>
        <p className="text-indigo-100 mb-6 max-w-lg mx-auto">Busca la receta de un plato específico (ej: "Lasaña") o dinos qué se te antoja para darte sugerencias (ej: "Algo dulce con chocolate").</p>
        
        <div className="flex flex-col sm:flex-row gap-3 bg-white/10 p-2 rounded-2xl md:rounded-full backdrop-blur-md max-w-2xl mx-auto border border-white/20">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDirectSearch()}
            placeholder="¿Qué quieres comer hoy?" 
            className="flex-1 bg-transparent text-white placeholder:text-indigo-200 px-4 py-2 outline-none"
          />
          <div className="flex gap-2">
            <button 
              onClick={handleDirectSearch}
              disabled={loading || !query.trim()}
              className="flex-1 sm:flex-none bg-white text-indigo-600 px-5 py-2.5 rounded-xl md:rounded-full font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
            >
              <Search size={18} /> Directa
            </button>
            <button 
              onClick={handleSuggest}
              disabled={loading || !query.trim()}
              className="flex-1 sm:flex-none bg-indigo-700 hover:bg-indigo-800 text-white px-5 py-2.5 rounded-xl md:rounded-full font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
            >
              <Sparkles size={18} /> Sugerencias
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-indigo-500">
          <RefreshCw className="animate-spin mb-4" size={40} />
          <p className="font-medium animate-pulse">Explorando opciones deliciosas...</p>
        </div>
      )}

      {suggestions && !recipe && !generatingRecipe && (
        <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          {suggestions.map((sugg) => (
            <div key={sugg.id} className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 flex flex-col hover:shadow-md transition-shadow">
              <span className="text-xs font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full w-max mb-3">
                {sugg.type}
              </span>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{sugg.name}</h3>
              <p className="text-slate-600 text-sm mb-6 flex-1">{sugg.description}</p>
              <button 
                onClick={() => generateFromSuggestion(sugg)}
                className="w-full py-2.5 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <ChefHat size={18} /> Ver Receta
              </button>
            </div>
          ))}
        </div>
      )}

      {generatingRecipe && !recipe && (
        <div className="flex flex-col items-center justify-center py-12 text-indigo-500">
          <RefreshCw className="animate-spin mb-4" size={40} />
          <p className="font-medium animate-pulse">Escribiendo el paso a paso de la receta...</p>
        </div>
      )}

      {recipe && (
        <div>
          <button onClick={() => setRecipe(null)} className="mb-4 text-indigo-600 font-medium flex items-center gap-1 hover:underline">
             <ChevronRight className="rotate-180" size={18} /> Volver a explorar
          </button>
          <RecipeCard recipe={recipe} />
        </div>
      )}
    </div>
  );
}


