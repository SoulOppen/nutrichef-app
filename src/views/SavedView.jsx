import { useState } from 'react';
import { Bookmark, ChevronRight, Heart } from 'lucide-react';
import RecipeCard from '../components/RecipeCard.jsx';
import { useAppState } from '../context/appState.js';

export default function SavedView() {
  const { favoriteRecipes, interestedRecipes } = useAppState();
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  if (selectedRecipe) {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setSelectedRecipe(null)} className="mb-4 text-orange-600 font-medium flex items-center gap-1 hover:underline">
          <ChevronRight className="rotate-180" size={18} /> Volver a Mis Guardados
        </button>
        <RecipeCard recipe={selectedRecipe} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Heart className="text-red-500" fill="currentColor" /> Mis Recetas Favoritas
        </h2>
        {favoriteRecipes.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500">
            Aún no has marcado ninguna receta como favorita. 
            <br /> <span className="text-sm">La IA usará lo que guardes aquí para aprender de tus gustos reales.</span>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteRecipes.map((rec, i) => (
              <div key={`fav-${i}`} onClick={() => setSelectedRecipe(rec)} className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 cursor-pointer hover:shadow-md hover:border-red-300 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">{rec.cuisine || 'Receta'}</span>
                  <Heart size={18} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor"/>
                </div>
                <h3 className="font-bold text-slate-800 mb-2 leading-tight">{rec.title}</h3>
                <div className="flex gap-2 text-xs font-semibold text-slate-500">
                  <span className="bg-slate-100 px-2 py-1 rounded-md">🔥 {rec.macros?.calories || '?'}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-md">⏱️ {rec.prepTime || '?'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Bookmark className="text-blue-500" fill="currentColor" /> Me Interesa Probar
        </h2>
        {interestedRecipes.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500">
            Guarda aquí las recetas que te llamen la atención para revisarlas más tarde.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interestedRecipes.map((rec, i) => (
              <div key={`int-${i}`} onClick={() => setSelectedRecipe(rec)} className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{rec.cuisine || 'Receta'}</span>
                  <Bookmark size={18} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor"/>
                </div>
                <h3 className="font-bold text-slate-800 mb-2 leading-tight">{rec.title}</h3>
                <div className="flex gap-2 text-xs font-semibold text-slate-500">
                  <span className="bg-slate-100 px-2 py-1 rounded-md">🔥 {rec.macros?.calories || '?'}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-md">⏱️ {rec.prepTime || '?'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


