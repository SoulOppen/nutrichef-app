import { Calendar } from 'lucide-react';

export default function PlanSummary({ plan, selectedDayIdx, onSelectDay }) {
  if (!plan) {
    return null;
  }

  return (
    <>
      <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-green-900 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">Resumen del Plan</h3>
          <div className="flex flex-wrap gap-2 text-sm font-bold justify-end">
            <span className="bg-white px-3 py-1 rounded-full shadow-sm">🔥 ~{plan.totalCalories}/dia</span>
            <span className="bg-white px-3 py-1 rounded-full shadow-sm text-blue-600">🥩 ~{plan.totalProtein} Prot</span>
            {plan.totalFiber && <span className="bg-white px-3 py-1 rounded-full shadow-sm text-green-600">🌿 ~{plan.totalFiber} Fibra</span>}
          </div>
        </div>
        <p className="opacity-90 text-sm">{plan.summary}</p>
      </div>

      {plan.days && plan.days.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar snap-x">
          {plan.days.map((day, idx) => (
            <button
              key={`day-${idx}`}
              onClick={() => onSelectDay(idx)}
              className={`snap-start shrink-0 px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                selectedDayIdx === idx ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-orange-50'
              }`}
            >
              <Calendar size={18} />
              {day.dayName}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
