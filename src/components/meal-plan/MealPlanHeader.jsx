import { Calendar, RefreshCw } from 'lucide-react';

export default function MealPlanHeader({ profileGoals, plan, planType, loading, onPlanTypeChange, onGeneratePlan }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-orange-100 mb-6 gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Planificador Inteligente</h2>
        <p className="text-slate-500 text-sm mt-1">Genera un menu alineado a tus metas ({profileGoals}).</p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        <select
          value={planType}
          onChange={(e) => onPlanTypeChange(e.target.value)}
          className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none bg-slate-50 font-bold text-slate-700"
        >
          <option value="Diario">{plan && plan.days?.length > 1 ? 'Solo el Dia Seleccionado' : 'Plan de 1 Dia'}</option>
          <option value="Semanal">Plan Semanal (Meal Prep)</option>
        </select>

        <button
          onClick={onGeneratePlan}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
        >
          {loading ? <RefreshCw className="animate-spin" size={20} /> : <Calendar size={20} />}
          {plan ? (planType === 'Diario' && plan.days?.length > 1 ? 'Regenerar Dia Actual' : 'Regenerar Plan') : 'Crear Plan'}
        </button>
      </div>
    </div>
  );
}
