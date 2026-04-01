import { useState } from 'react';
import { SlidersHorizontal, Check } from 'lucide-react';
import BottomSheet from './BottomSheet.jsx';

const MODES = [
  {
    value: null,
    label: 'Auto',
    emoji: '🔮',
    description: 'NutriChef elige el mejor método según tu búsqueda',
  },
  {
    value: 'local',
    label: 'Local',
    emoji: '⚡',
    description: 'Solo recetas guardadas, sin llamadas a la IA',
  },
  {
    value: 'literal',
    label: 'Exacto',
    emoji: '🎯',
    description: 'Busca la receta con ese nombre exacto',
  },
  {
    value: 'creative',
    label: 'Creativo',
    emoji: '✨',
    description: 'La IA inventa algo nuevo e inesperado',
  },
];

/**
 * FilterSelector — replaces the horizontal chip row in ExploreView.
 * Shows a compact button with the current mode label.
 * On tap, opens a BottomSheet with the 4 mode options.
 */
export default function FilterSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = MODES.find(m => m.value === value) ?? MODES[0];

  const select = (mode) => {
    onChange(mode.value);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all active:scale-95 hover:border-slate-300 dark:hover:border-gray-600 shrink-0"
      >
        <SlidersHorizontal size={14} className="text-slate-400" />
        <span>{current.emoji} {current.label}</span>
        <span className="ml-0.5 text-slate-300 dark:text-gray-600">›</span>
      </button>

      {/* Bottom sheet picker */}
      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Tipo de búsqueda">
        <div className="px-4 pb-4 space-y-2">
          {MODES.map((mode) => {
            const isSelected = mode.value === value;
            return (
              <button
                key={String(mode.value)}
                onClick={() => select(mode)}
                className={`w-full flex items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'bg-[--c-primary-light] border-2 border-[--c-primary-border]'
                    : 'bg-slate-50 dark:bg-gray-800 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-gray-750'
                }`}
              >
                <span className="text-2xl leading-none">{mode.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${isSelected ? 'text-[--c-primary-text]' : 'text-slate-800 dark:text-white'}`}>
                    {mode.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isSelected ? 'text-[--c-primary-text] opacity-80' : 'text-slate-500 dark:text-slate-400'}`}>
                    {mode.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full" style={{ background: 'var(--c-primary)' }}>
                    <Check size={13} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}
