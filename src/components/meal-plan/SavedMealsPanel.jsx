import { Star } from 'lucide-react';

export default function SavedMealsPanel({ savedMeals, onRemoveMeal }) {
  if (savedMeals.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
          <Star size={20} />
        </div>
        <div>
          <h4 className="font-bold text-yellow-900 text-sm">Comidas Fijadas ({savedMeals.length})</h4>
          <p className="text-yellow-700 text-xs">Estas comidas se incluiran en tu proximo plan.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {savedMeals.map((meal, index) => (
          <span key={`saved-${index}`} className="bg-white px-2 py-1 border border-yellow-300 rounded-md text-yellow-800 flex items-center gap-1">
            {meal.title}
            <button onClick={() => onRemoveMeal(index)} className="hover:text-red-500 font-bold ml-1">x</button>
          </span>
        ))}
      </div>
    </div>
  );
}
