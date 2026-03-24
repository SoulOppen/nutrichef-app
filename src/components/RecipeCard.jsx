import { useState } from 'react';
import { AlertTriangle, Apple, Bookmark, BookOpen, CheckCircle2, Clock, Heart, Info, MessageSquare, RefreshCw, Send, Star, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { useAppState } from '../context/appState.js';
import { fetchGeminiContent } from '../lib/gemini.js';

export default function RecipeCard({ recipe }) {
  const { setProfile, savedMeals, setSavedMeals, favoriteRecipes, setFavoriteRecipes, interestedRecipes, setInterestedRecipes } = useAppState();
  const [chefQuestion, setChefQuestion] = useState('');
  const [chefAnswer, setChefAnswer] = useState('');
  const [asking, setAsking] = useState(false);
  
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null); // 'like' | 'dislike'
  const [feedbackReason, setFeedbackReason] = useState('');

  // Estados de Guardado
  const isSavedForPlan = savedMeals && savedMeals.some(m => m.title === recipe.title);
  const isFavorite = favoriteRecipes && favoriteRecipes.some(r => r.title === recipe.title);
  const isInterested = interestedRecipes && interestedRecipes.some(r => r.title === recipe.title);
  
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
    const prompt = `El usuario está cocinando esta receta: "${recipe.title}". Ingredientes: ${recipe.ingredients ? recipe.ingredients.map(i => i.name).join(', ') : 'Desconocidos'}. Pregunta del usuario sobre el plato: "${chefQuestion}". Responde de forma concisa, útil y amable en un solo párrafo corto, asumiendo el rol de un chef experto.`;
    
    try {
      const data = await fetchGeminiContent({
        kind: 'text',
        payload: { contents: [{ parts: [{ text: prompt }] }] }
      });
      setChefAnswer(data.candidates?.[0]?.content?.parts?.[0]?.text || "No tengo una respuesta para eso ahora.");
    } catch (err) {
      console.error(err);
      setChefAnswer(err.message || "Hubo un error de conexión con el Chef IA.");
    } finally {
      setAsking(false);
      setChefQuestion('');
    }
  };

  const submitFeedback = () => {
    if (!feedbackReason.trim()) return;
    
    const prefix = feedbackType === 'like' ? 'Le encantó (buscar sabores parecidos): ' : 'Evitar/No le gustó: ';
    
    setProfile(prev => ({
      ...prev,
      learnedPreferences: [...prev.learnedPreferences, `${prefix} ${feedbackReason}`]
    }));
    
    setFeedbackGiven(true);
  };

  if (!recipe) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cabecera de Receta */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white relative">
        
        {/* Controles de Guardado Superiores */}
        <div className="absolute top-6 right-6 flex flex-col sm:flex-row gap-2">
          <button 
            onClick={toggleInterested}
            title="Me interesa para después"
            className={`p-2.5 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-sm ${
              isInterested ? 'bg-blue-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white border border-white/20'
            }`}
          >
            <Bookmark size={18} fill={isInterested ? "currentColor" : "none"} />
          </button>
          
          <button 
            onClick={toggleFavorite}
            title="Marcar como Favorito"
            className={`p-2.5 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-sm ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white border border-white/20'
            }`}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>

          <button 
            onClick={toggleSaveForPlan}
            className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-1.5 transition-all shadow-md backdrop-blur-sm ${
              isSavedForPlan ? 'bg-yellow-400 text-yellow-900' : 'bg-black/20 hover:bg-black/30 text-white border border-white/20'
            }`}
          >
            <Star size={16} fill={isSavedForPlan ? "currentColor" : "none"} /> 
            <span className="hidden sm:inline">{isSavedForPlan ? 'Fijada en Plan' : 'Añadir a Plan'}</span>
          </button>
        </div>

        <div className="flex justify-between items-start mb-4 mt-8 sm:mt-0">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            {recipe.cuisine || 'Receta Adaptada'}
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3 pr-24">{recipe.title}</h2>
        <p className="text-orange-50 text-lg opacity-90">{recipe.description}</p>
        
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-xl backdrop-blur-sm">
            <Clock size={18} />
            <span className="font-medium">Prep: {recipe.prepTime || '?'} | Cocción: {recipe.cookTime || '?'}</span>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Ingredientes */}
          <div className="md:col-span-5 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Apple className="text-orange-500" /> Ingredientes
              </h3>
              <ul className="space-y-3">
                {recipe.ingredients && recipe.ingredients.map((ing, i) => (
                  <li key={`ing-${i}`} className="flex flex-col bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-800">{ing.name}</span>
                      <span className="text-sm text-slate-500 bg-white px-2 py-1 rounded-md shadow-sm">{ing.amount}</span>
                    </div>
                    {ing.substitute && (
                      <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg flex gap-1 items-start">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <span>¿No tienes? Prueba con: <strong>{ing.substitute}</strong></span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Macros */}
            {recipe.macros && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Información Nutricional</h4>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg shadow-sm flex flex-col justify-center">
                    <div className="text-xs text-slate-400">Cal</div>
                    <div className="font-bold text-slate-700 text-sm md:text-base truncate">{recipe.macros.calories || '-'}</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-sm flex flex-col justify-center">
                    <div className="text-xs text-slate-400">Prot</div>
                    <div className="font-bold text-slate-700 text-sm md:text-base truncate">{recipe.macros.protein || '-'}</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-sm flex flex-col justify-center">
                    <div className="text-xs text-slate-400">Carb</div>
                    <div className="font-bold text-slate-700 text-sm md:text-base truncate">{recipe.macros.carbs || '-'}</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-sm flex flex-col justify-center">
                    <div className="text-xs text-slate-400">Grasa</div>
                    <div className="font-bold text-slate-700 text-sm md:text-base truncate">{recipe.macros.fat || '-'}</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-sm flex flex-col justify-center">
                    <div className="text-xs text-green-500">Fibra</div>
                    <div className="font-bold text-green-700 text-sm md:text-base truncate">{recipe.macros.fiber || '-'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pasos */}
          <div className="md:col-span-7 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                <BookOpen className="text-orange-500" /> Preparación
              </h3>
              <div className="space-y-6">
                {recipe.steps && recipe.steps.map((step, i) => (
                  <div key={`step-${i}`} className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <p className="text-slate-700 leading-relaxed pt-1">{typeof step === 'string' ? step : (step.text || step.description || JSON.stringify(step))}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            {recipe.tips && typeof recipe.tips === 'string' && (
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex gap-3">
                <Info className="text-blue-500 shrink-0" />
                <p className="text-sm text-blue-900 leading-relaxed"><span className="font-bold">Tip del Chef: </span>{recipe.tips}</p>
              </div>
            )}

            {/* Módulo de Aprendizaje Activo (Post-Consumo) */}
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 mt-8">
              <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                <RefreshCw size={18} /> ¿Ya preparaste y comiste esto?
              </h4>
              <p className="text-sm text-orange-700 mb-4">Danos tu opinión para que la IA siga aprendiendo de tus gustos y mejore futuras recetas.</p>
              
              {!feedbackGiven ? (
                !feedbackType ? (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setFeedbackType('like')}
                      className="px-4 py-3 bg-white border border-green-300 text-green-700 rounded-xl hover:bg-green-50 font-medium transition-colors flex-1 flex flex-col items-center gap-1 shadow-sm"
                    >
                      <ThumbsUp size={24} /> Me encantó
                    </button>
                    <button 
                      onClick={() => setFeedbackType('dislike')}
                      className="px-4 py-3 bg-white border border-red-300 text-red-700 rounded-xl hover:bg-red-50 font-medium transition-colors flex-1 flex flex-col items-center gap-1 shadow-sm"
                    >
                      <ThumbsDown size={24} /> No me gustó
                    </button>
                  </div>
                ) : (
                  <div className="animate-in slide-in-from-top-2">
                    <label className={`block text-sm font-bold mb-2 ${feedbackType === 'like' ? 'text-green-800' : 'text-red-800'}`}>
                      {feedbackType === 'like' ? '¡Genial! ¿Qué fue lo que más te gustó?' : '¡Lo sentimos! ¿Qué fue lo que no te gustó?'}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input 
                        type="text" 
                        value={feedbackReason}
                        onChange={e => setFeedbackReason(e.target.value)}
                        placeholder={feedbackType === 'like' ? "Ej: El toque de ajo, la textura crocante..." : "Ej: Odié el sabor del coliflor, estaba muy seco..."}
                        className={`flex-1 p-3 rounded-xl border focus:ring-2 outline-none text-sm bg-white ${
                          feedbackType === 'like' ? 'border-green-200 focus:ring-green-500' : 'border-red-200 focus:ring-red-500'
                        }`}
                      />
                      <button 
                        onClick={submitFeedback}
                        disabled={!feedbackReason.trim()}
                        className={`px-6 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 shadow-sm ${
                          feedbackType === 'like' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        Enseñar a la IA
                      </button>
                      <button 
                        onClick={() => {setFeedbackType(null); setFeedbackReason('');}}
                        className="p-3 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-xl"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-sm font-medium text-green-700 bg-green-100 p-4 rounded-xl flex items-center gap-2 border border-green-200 shadow-inner">
                  <CheckCircle2 size={18} /> ¡Perfecto! He guardado tu opinión en tu perfil para tenerlo en cuenta.
                </div>
              )}
            </div>

            {/* Asistente Culinario / Ask the Chef */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-6">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <MessageSquare size={18} className="text-orange-500" /> ✨ Pregúntale al Chef IA
              </h4>
              <p className="text-sm text-slate-500 mb-4">¿Dudas sobre un reemplazo? ¿Técnicas de preparación? ¡Consulta al chef para esta receta!</p>
              
              {chefAnswer && (
                <div className="mb-4 p-4 bg-orange-100 text-orange-900 rounded-xl text-sm border border-orange-200 animate-in fade-in">
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
                  placeholder="Ej: ¿A cuántos grados precaliento el horno?"
                  className="flex-1 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm bg-white"
                />
                <button 
                  onClick={askChef}
                  disabled={asking || !chefQuestion.trim()}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-5 rounded-xl font-bold transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {asking ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}


