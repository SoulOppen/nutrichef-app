import { CheckCircle2, Dumbbell } from 'lucide-react';

export default function SupplementReminder({ creatineTaken, onToggle }) {
  return (
    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-blue-200 p-2 rounded-lg text-blue-700">
          <Dumbbell size={20} />
        </div>
        <div>
          <h4 className="font-bold text-blue-900 text-sm">Recordatorio de Suplementos</h4>
          <p className="text-blue-700 text-xs">Creatina (5g diarios recomendados)</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
          creatineTaken ? 'bg-green-500 text-white' : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-100'
        }`}
      >
        {creatineTaken ? <CheckCircle2 size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-blue-400"></div>}
        {creatineTaken ? 'Tomada' : 'Marcar como tomada'}
      </button>
    </div>
  );
}
