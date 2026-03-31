import { useState } from 'react';
import { ChefHat, ChevronRight, Compass, RefreshCw, Search, Sparkles, Target, Zap } from 'lucide-react';
import RecipeCard from '../components/RecipeCard.jsx';
import { useAppState } from '../context/appState.js';
import {
  callGeminiAPI, compactProfile,
  buildExploreCacheKey, buildGeneratorRecipeCacheKey,
  buildLocaleInstruction, buildLocalBrandInstruction,
  buildSearchPrompt, detectSearchIntent,
  EXPLORE_CACHE_KEY, GENERATOR_RECIPE_CACHE_KEY,
} from '../lib/gemini.js';
import { searchLocalRecipes, getFeaturedRecipes } from '../lib/localRecipes.js';

export default function ExploreView() {
  const { profile, favoriteRecipes, saveGeneratedRecipe } = useAppState();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [generatingRecipe, setGeneratingRecipe] = useState(false);
  const [sourceLabel, setSourceLabel] = useState('');
  const [noLocalResults, setNoLocalResults] = useState(false);
  const [detectedMode, setDetectedMode] = useState('creative');

  const featuredRecipes = getFeaturedRecipes
    ? getFeaturedRecipes(profile, 6).map(r => ({ id: r.title, name: r.title, type: r.cuisine, description: r.description, _local: r }))
    : [];

  const handleSearch = async () => {
    if (!query.trim()) return;
    setRecipe(null); setSuggestions(null); setSourceLabel(''); setNoLocalResults(false);

    const intent = detectSearchIntent(query);
    setDetectedMode(intent);

    const localResults = searchLocalRecipes ? searchLocalRecipes(query, profile) : [];
    if (localResults.length > 0) {
      const results = intent === 'literal' ? localResults.slice(0, 1) : localResults;
      setSuggestions(results.map(r => ({ id: r.title, name: r.title, type: r.cuisine, description: r.description, _local: r })));
      setSourceLabel('local');
      return;
    }
    setNoLocalResults(true);
  };

  const handleSearchWithAI = async () => {
    if (!query.trim()) return;
    setNoLocalResults(false); setLoading(true);
    const intent = detectSearchIntent(query);
    setDetectedMode(intent);
    setSourceLabel(intent === 'literal' ? 'ia-literal' : 'ia-creative');
    const cacheKey = buildExploreCacheKey({ query, mode: intent, profile });
    const prompt = buildSearchPrompt({
      query, mode: intent,
      profileStr: compactProfile(profile),
      localeStr: buildLocaleInstruction(profile),
      brandInstruction: buildLocalBrandInstruction(profile),
      favoritesStr: favoriteRecipes.length > 0 ? favoriteRecipes.map(r => r.title).join(', ') : '',
    });
    try {
      const result = await callGeminiAPI(prompt, cacheKey, EXPLORE_CACHE_KEY);
      setSuggestions(result.suggestions);
    } catch (err) {
      setSuggestions([{ id: 'error', name: 'Error', type: 'Error', description: err.message }]);
    } finally { setLoading(false); }
  };

  const generateFromSuggestion = async (sugg) => {
    if (sugg._local) { setRecipe(sugg._local); setSuggestions(null); return; }
    setGeneratingRecipe(true); setSuggestions(null);
    const cacheKey = buildGeneratorRecipeCacheKey({ suggestion: sugg, ingredients: query, profile });
    const localeStr = buildLocaleInstruction(profile);
    const brandStr = buildLocalBrandInstruction(profile);
    const literalNote = detectedMode === 'literal'
      ? '\nIMPORTANTE: Solo la receta exacta pedida. Sin acompañamientos ni extras no solicitados.' : '';
    const prompt = `${localeStr}
Receta completa para "${sugg.name}". ${sugg.description}.
Perfil: ${compactProfile(profile)}.${brandStr ? `\n${brandStr}` : ''}${literalNote}
Devuelve SOLO este JSON:
{"title":"...","description":"...","prepTime":"...","cookTime":"...","cuisine":"...","ingredients":[{"name":"...","amount":"...","substitute":"..."}],"steps":["..."],"macros":{"calories":"...","protein":"...","carbs":"...","fat":"...","fiber":"..."},"tips":"...","marcas_sugeridas":[]}`;
    try {
      const result = await callGeminiAPI(prompt, cacheKey, GENERATOR_RECIPE_CACHE_KEY);
      if (saveGeneratedRecipe) await saveGeneratedRecipe(result);
      setRecipe(result);
    } catch (err) { console.error(err); }
    finally { setGeneratingRecipe(false); }
  };

  const ModeTag = () => {
    if (sourceLabel === 'local') return <span className="flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full"><Zap size={11} /> Instantáneo</span>;
    if (sourceLabel === 'ia-literal') return <span className="flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full"><Target size={11} /> Literal</span>;
    if (sourceLabel === 'ia-creative') return <span className="flex items-center gap-1 text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full"><Sparkles size={11} /> IA Creativa</span>;
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="p-8 rounded-3xl shadow-md text-white text-center" style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
        <Compass size={40} className="mx-auto mb-4 opacity-90" />
        <h2 className="text-3xl font-bold mb-2">Explorar</h2>
        {profile.religiousDiet && profile.religiousDiet !== 'Ninguna' && (
          <p className="text-indigo-200 text-xs mb-1">🔍 Filtrando para <strong>{profile.religiousDiet}</strong> · {profile.country || 'Chile'}</p>
        )}
        <p className="text-indigo-300 text-xs mb-4">💡 Búsquedas específicas ("falafel en airfryer") activan <strong>Modo Literal</strong> — solo esa receta exacta</p>
        <div className="flex gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md max-w-2xl mx-auto border border-white/20">
          <input
            type="text" value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder='"falafel en airfryer", "pollo marinado", "postre rápido"...'
            className="flex-1 bg-transparent text-white placeholder:text-indigo-300 px-4 py-2 outline-none text-sm"
          />
          <button onClick={handleSearch} disabled={loading || !query.trim()} className="bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm shrink-0 min-h-[44px]">
            <Search size={18} /> Buscar
          </button>
        </div>
      </div>

      {noLocalResults && !loading && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-800 p-8 text-center space-y-4 animate-in fade-in">
          <p className="text-slate-600 dark:text-slate-300 font-semibold">No encontramos "<span className="text-indigo-600 dark:text-indigo-400">{query}</span>" localmente.</p>
          {detectedMode === 'literal' && (
            <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-xl inline-block">
              <Target size={12} className="inline mr-1" /> Modo Literal — la IA devolverá solo esa receta exacta
            </p>
          )}
          <button onClick={handleSearchWithAI} className="mx-auto flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm min-h-[48px]" style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
            <Sparkles size={18} />
            {detectedMode === 'literal' ? `✨ Generar "${query}" con IA` : '✨ Crear opciones con IA'}
          </button>
          <p className="text-xs text-slate-400 dark:text-slate-500">La receta se guardará automáticamente en tu historial.</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-indigo-500">
          <RefreshCw className="animate-spin mb-4" size={40} />
          <p className="font-medium animate-pulse text-sm">{detectedMode === 'literal' ? `Generando exactamente "${query}"...` : 'Buscando con IA...'}</p>
        </div>
      )}

      {suggestions && !recipe && !generatingRecipe && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{detectedMode === 'literal' ? `Resultado: "${query}"` : `Resultados para "${query}"`}</h3>
              <ModeTag />
            </div>
            {sourceLabel === 'local' && (
              <button onClick={handleSearchWithAI} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                <Sparkles size={11} /> Más opciones con IA
              </button>
            )}
          </div>
          {detectedMode === 'literal' && sourceLabel.startsWith('ia') && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-2.5 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Target size={13} /> Modo Literal — solo la receta exacta que pediste, sin extras.
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-4">
            {suggestions.map(sugg => (
              <div key={sugg.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">{sugg.type}</span>
                  <div className="flex gap-1">
                    {sugg._local && <Zap size={11} className="text-green-500" />}
                    {sugg._local?.isKosher && <span className="text-[9px] font-black text-blue-600 bg-blue-100 dark:bg-blue-900/20 px-1 rounded">K</span>}
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-1 leading-tight text-sm">{sugg.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-4 flex-1 leading-relaxed">{sugg.description}</p>
                <button onClick={() => generateFromSuggestion(sugg)} className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold rounded-xl hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm min-h-[44px]">
                  <ChefHat size={15} /> Ver receta
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {generatingRecipe && !recipe && (
        <div className="flex flex-col items-center justify-center py-12 text-indigo-500">
          <RefreshCw className="animate-spin mb-4" size={40} />
          <p className="font-medium animate-pulse text-sm">{detectedMode === 'literal' ? 'Preparando la receta exacta...' : 'Generando receta...'}</p>
        </div>
      )}

      {recipe && (
        <div>
          <button onClick={() => { setRecipe(null); setSuggestions(suggestions); }} className="mb-4 text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:underline text-sm">
            <ChevronRight className="rotate-180" size={16} /> Volver
          </button>
          <RecipeCard recipe={recipe} />
        </div>
      )}

      {!loading && !suggestions && !recipe && !generatingRecipe && !noLocalResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Zap size={14} className="text-green-500" />
              {profile.religiousDiet !== 'Ninguna' ? `Recetas ${profile.religiousDiet}` : 'Recetas rápidas — sin IA'}
            </h3>
            {profile.religiousDiet !== 'Ninguna' && (
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">{profile.religiousDiet} · {profile.country || 'Chile'}</span>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredRecipes.map(sugg => (
              <div key={sugg.id} onClick={() => generateFromSuggestion(sugg)} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-100 dark:border-gray-700 cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-[10px] font-bold text-purple-500 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full">{sugg.type}</span>
                  <div className="flex gap-1"><Zap size={11} className="text-green-400" />{sugg._local?.isKosher && <span className="text-[9px] font-black text-blue-500">K</span>}</div>
                </div>
                <p className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">{sugg.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-tight line-clamp-2">{sugg.description}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-slate-400 dark:text-slate-500">Busca algo específico como "falafel en airfryer" para activar Modo Literal.</p>
        </div>
      )}
    </div>
  );
}
