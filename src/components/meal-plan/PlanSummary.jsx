export default function PlanSummary({ plan }) {
  if (!plan) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,1),rgba(255,255,255,1))] p-6 text-emerald-950 shadow-md">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700/70">Resumen</p>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-emerald-950">Tu semana ya tiene una guía clara</h3>
          <p className="mt-2 text-sm leading-relaxed text-emerald-900/80">{plan.summary}</p>
        </div>

        <div className="flex flex-wrap gap-2 lg:max-w-[280px] lg:justify-end">
          <span className="rounded-2xl border border-white/70 bg-white px-3 py-2 text-sm font-black text-emerald-900 shadow-sm">
            🔥 ~{plan.totalCalories}/día
          </span>
          <span className="rounded-2xl border border-white/70 bg-white px-3 py-2 text-sm font-black text-blue-600 shadow-sm">
            🥩 ~{plan.totalProtein} Prot
          </span>
          {plan.totalFiber && (
            <span className="rounded-2xl border border-white/70 bg-white px-3 py-2 text-sm font-black text-green-600 shadow-sm">
              🌿 ~{plan.totalFiber} Fibra
            </span>
          )}
          {plan.days?.length ? (
            <span className="rounded-2xl border border-white/70 bg-white px-3 py-2 text-sm font-black text-slate-600 shadow-sm">
              📅 {plan.days.length} días organizados
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
