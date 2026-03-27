import { useState } from 'react';
import { AlertTriangle, Bookmark, BookOpen, CheckCircle2, ChefHat, Clock, Heart, Info, MessageSquare, RefreshCw, Send, Star, ThumbsDown, ThumbsUp, X, Zap } from 'lucide-react';
import { useAppState } from '../context/appState.js';

// Barra de macro individual
function MacroBar({ label, value, color, max }) {
  const raw = parseFloat(String(value).replace(/[^\d.]/g, '')) || 0;
  const pct = Math.min(100, (raw / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-bold text-slate-800 dark:text-white">{value || '—'}</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Ingrediente individual con checkbox para marcar mientras cocinas
function IngredientRow({ ing, index }) {
  const [checked, setChecked] = useState(false);
  return (
    <li
      onClick={() => setChecked(c => !c)}
      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
        checked
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 opacity-60'
          : 'bg-slate-50 dark:bg-gray-800 border-slate-100 dark:border-gray-700 hover:border-[--c-primary-border]'
      }`}
    >
      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
        checked ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-gray-500'
      }`}>
        {checked && <CheckCircle2 size={12} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-2">
          <span className={`font-medium text-sm leading-tight ${checked ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
            {ing.name}
          </span>
          <span className="text-xs font-bold shrink-0 px-2 py-0.5 bg-white dark:bg-gray-700 rounded-md shadow-sm text-slate-500 dark:text-slate-300 border border-slate-100 dark:border-gray-600">
            {ing.amount}
          </span>
        </div>
        {ing.substitute && (
          <div className="mt-1.5 text-xs flex gap-1 items-start" style={{ color: 'var(--c-primary)' }}>
            <AlertTriangle size={11} className="shrink-0 mt-0.5" />
            <span className="opacity-80">Sub: <strong>{ing.substitute}</strong></span>
          </div>
        )}
      </div>
    </li>
  );
}

export default function RecipeCard({ recipe }) {
  const { setProfile, savedMeals, setSavedMeals, favoriteRecipes, setFavoriteRecipes, interestedRecipes, setInterestedRecipes } = useAppState();
  const [chefQuestion, setChefQuestion] = useState('');
  const [chefAnswer, setChefAnswer] = useState('');
  const [asking, setAsking] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  const [feedbackReason, setFeedbackReason] = useState('');

  const isSavedForPlan = savedMeals?.some(m => m.title === recipe.title);
  const isFavorite = favoriteRecipes?.some(r => r.title === recipe.title);
  const isInterested = interestedRecipes?.some(r => r.title === recipe.title);

  const toggleSaveForPlan = () => {
    if (isSavedForPlan) setSavedMeals(savedMeals.filter(m => m.title !== recipe.title));
    else setSavedMeals([...(savedMeals || []), { title: recipe.title, calories: recipe.macros?.calories }]);
  };
  const toggleFavorite = () => {
    if (isFavorite) setFavoriteRecipes(favoriteRecipes.filter(r => r.title !== recipe.title));
    else {
      setFavoriteRecipes([...(favoriteRecipes || []), recipe]);
      if (isInterested) setInterestedRecipes(interestedRecipes.filter(r => r.title !== recipe.title));
    }
  };
  const toggleInterested = () => {
    if (isInterested) setInterestedRecipes(interestedRecipes.filter(r => r.title !== recipe.title));
    else {
      setInterestedRecipes([...(interestedRecipes || []), recipe]);
      if (isFavorite) setFavoriteRecipes(favoriteRecipes.filter(r => r.title !== recipe.title));
    }
  };

  const askChef = async () => {
    if (!chefQuestion.trim()) return;
    setAsking(true);
    const prompt = `El usuario está cocinando: "${recipe.title}". Ingredientes: ${recipe.ingredients?.map(i => i.name).join(', ') || 'N/A'}. Pregunta: "${chefQuestion}". Responde en un párrafo corto y útil como chef experto. Solo texto, sin JSON.`;
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'text',
          payload: {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 }
          }
        })
      });
      const data = await response.json();
      setChefAnswer(data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No tengo una respuesta ahora.');
    } catch (err) {
      setChefAnswer('Hubo un error de conexión.');
    } finally {
      setAsking(false);
      setChefQuestion('');
    }
  };

  const submitFeedback = () => {
    if (!feedbackReason.trim()) return;
    const prefix = feedbackType === 'like' ? 'Le encantó: ' : 'Evitar/No le gustó: ';
    setProfile(prev => ({ ...prev, learnedPreferences: [...prev.learnedPreferences, `${prefix}${feedbackReason}`] }));
    setFeedbackGiven(true);
  };

  if (!recipe) return null;

  const calories = parseFloat(String(recipe.macros?.calories || '0').replace(/[^\d.]/g, '')) || 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="p-8 text-white relative" style={{ background: `linear-gradient(135deg, var(--c-primary), var(--c-accent))` }}>
        <div className="absolute top-5 right-5 flex gap-2">
          <button onClick={toggleInterested} title="Me interesa" className={`p-2.5 rounded-full transition-all shadow-md backdrop-blur-sm ${isInterested ? 'bg-blue-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white border border-white/20'}`}>
            <Bookmark size={17} fill={isInterested ? 'currentColor' : 'none'} />
          </button>
          <button onClick={toggleFavorite} title="Favorito" className={`p-2.5 rounded-full transition-all shadow-md backdrop-blur-sm ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white border border-white/20'}`}>
            <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button onClick={toggleSaveForPlan} className={`px-3 py-2 rounded-full font-bold text-sm flex items-center gap-1.5 transition-all shadow-md backdrop-blur-sm ${isSavedForPlan ? 'bg-yellow-400 text-yellow-900' : 'bg-black/20 hover:bg-black/30 text-white border border-white/20'}`}>
            <Star size={15} fill={isSavedForPlan ? 'currentColor' : 'none'} />
            <span className="hidden sm:inline text-xs">{isSavedForPlan ? 'En Plan' : '+ Plan'}</span>
          </button>
        </div>

        <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-3 mt-8 sm:mt-0">
          {recipe.cuisine || 'Receta IA'}
        </span>
        <h2 className="text-2xl md:text-3xl font-black mb-2 pr-20 leading-tight">{recipe.title}</h2>
        <p className="text-white/80 text-sm leading-relaxed mb-5">{recipe.description}</p>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-sm">
            <Clock size={14} /> Prep: {recipe.prepTime || '?'}
          </div>
          <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-sm">
            <ChefHat size={14} /> Cocción: {recipe.cookTime || '?'}
          </div>
          {calories > 0 && (
            <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-sm">
              <Zap size={14} /> {recipe.macros.calories}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 md:p-8">

        {/* Macros mejorados — barras de progreso */}
        {recipe.macros && (
          <div className="mb-8 bg-slate-50 dark:bg-gray-800 rounded-2xl p-5 border border-slate-100 dark:border-gray-700">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Información Nutricional</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              <MacroBar label="Proteína" value={recipe.macros.protein} color="bg-blue-500" max={60} />
              <MacroBar label="Carbohidratos" value={recipe.macros.carbs} color="bg-amber-400" max={120} />
              <MacroBar label="Grasa" value={recipe.macros.fat} color="bg-rose-400" max={50} />
              <MacroBar label="Fibra" value={recipe.macros.fiber} color="bg-green-500" max={30} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Ingredientes con checkboxes */}
          <div className="md:col-span-5">
            <h3 className="text-base font-black text-slate-800 dark:text-white mb-3 uppercase tracking-wide">
              🛒 Ingredientes ({recipe.ingredients?.length || 0})
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Toca para marcar mientras cocinas</p>
            <ul className="space-y-2">
              {recipe.ingredients?.map((ing, i) => (
                <IngredientRow key={i} ing={ing} index={i} />
              ))}
            </ul>
          </div>

          {/* Pasos */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-white mb-4 uppercase tracking-wide flex items-center gap-2">
                <BookOpen size={18} style={{ color: 'var(--c-primary)' }} /> Preparación
              </h3>
              <div className="space-y-4">
                {recipe.steps?.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-7 h-7 rounded-full font-black text-sm flex items-center justify-center text-white" style={{ background: 'var(--c-primary)' }}>
                      {i + 1}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5 text-sm">
                      {typeof step === 'string' ? step : step.text || step.description || JSON.stringify(step)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {recipe.tips && typeof recipe.tips === 'string' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex gap-3">
                <Info className="text-blue-500 shrink-0 mt-0.5" size={16} />
                <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                  <span className="font-bold">Tip: </span>{recipe.tips}
                </p>
              </div>
            )}

            {/* Feedback */}
            <div className="rounded-2xl border p-5" style={{ background: 'var(--c-primary-light)', borderColor: 'var(--c-primary-border)' }}>
              <h4 className="font-bold mb-1 text-sm flex items-center gap-2" style={{ color: 'var(--c-primary-text)' }}>
                <RefreshCw size={15} /> ¿Ya la preparaste?
              </h4>
              <p className="text-xs mb-4 opacity-70" style={{ color: 'var(--c-primary-text)' }}>Tu opinión mejora las próximas recomendaciones.</p>

              {!feedbackGiven ? (
                !feedbackType ? (
                  <div className="flex gap-2">
                    <button onClick={() => setFeedbackType('like')} className="flex-1 flex flex-col items-center gap-1 py-3 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-50 text-sm font-medium transition-colors">
                      <ThumbsUp size={20} /> Me encantó
                    </button>
                    <button onClick={() => setFeedbackType('dislike')} className="flex-1 flex flex-col items-center gap-1 py-3 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 text-sm font-medium transition-colors">
                      <ThumbsDown size={20} /> No me gustó
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className={`text-sm font-bold ${feedbackType === 'like' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                      {feedbackType === 'like' ? '¿Qué fue lo mejor?' : '¿Qué no te gustó?'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={feedbackReason}
                        onChange={e => setFeedbackReason(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && submitFeedback()}
                        placeholder={feedbackType === 'like' ? 'Ej: El toque de ajo...' : 'Ej: Muy seco, sin sabor...'}
                        className="flex-1 p-2.5 rounded-xl border text-sm outline-none bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:ring-2"
                        style={{ '--tw-ring-color': 'var(--c-primary)' }}
                      />
                      <button onClick={submitFeedback} disabled={!feedbackReason.trim()} className={`px-4 rounded-xl text-sm font-bold text-white disabled:opacity-50 ${feedbackType === 'like' ? 'bg-green-600' : 'bg-red-600'}`}>
                        ✓
                      </button>
                      <button onClick={() => { setFeedbackType(null); setFeedbackReason(''); }} className="p-2.5 text-slate-400 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-xl">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={16} /> ¡Guardado en tu perfil!
                </div>
              )}
            </div>

            {/* Ask the Chef */}
            <div className="bg-slate-50 dark:bg-gray-800 p-5 rounded-2xl border border-slate-200 dark:border-gray-700">
              <h4 className="font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2 text-sm">
                <MessageSquare size={16} style={{ color: 'var(--c-primary)' }} /> Pregúntale al Chef IA
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">¿Dudas sobre técnica, sustitutos o tiempos?</p>
              {chefAnswer && (
                <div className="mb-3 p-3 rounded-xl text-sm border animate-in fade-in" style={{ background: 'var(--c-primary-light)', borderColor: 'var(--c-primary-border)', color: 'var(--c-primary-text)' }}>
                  <span className="font-bold block mb-1">👨‍🍳 Chef:</span>
                  {chefAnswer}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chefQuestion}
                  onChange={e => setChefQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && askChef()}
                  placeholder="Ej: ¿A cuántos grados el horno?"
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-gray-600 text-sm outline-none bg-white dark:bg-gray-700 dark:text-white focus:ring-2"
                />
                <button onClick={askChef} disabled={asking || !chefQuestion.trim()} className="bg-slate-800 dark:bg-slate-600 hover:bg-slate-900 text-white px-4 rounded-xl disabled:opacity-60 flex items-center">
                  {asking ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
