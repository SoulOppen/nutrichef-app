import { Check, RefreshCw, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

function ShoppingItem({ item }) {
  const [checked, setChecked] = useState(false);
  const name = typeof item === 'string' ? item : (item.name || item.producto || item.item || 'Ingrediente');
  const amount = typeof item !== 'string' ? (item.amount || item.cantidad || '') : '';

  return (
    <li
      onClick={() => setChecked(c => !c)}
      className={`flex items-center gap-3 py-2.5 px-3 rounded-xl cursor-pointer transition-all select-none ${
        checked
          ? 'bg-green-50 dark:bg-green-900/20 opacity-60'
          : 'hover:bg-slate-100 dark:hover:bg-gray-700'
      }`}
    >
      {/* Checkbox */}
      <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
        checked ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-gray-500'
      }`}>
        {checked && <Check size={11} className="text-white" strokeWidth={3} />}
      </div>

      {/* Nombre — crece para ocupar el espacio disponible */}
      <span className={`flex-1 text-sm leading-snug ${
        checked
          ? 'line-through text-slate-400 dark:text-slate-500'
          : 'text-slate-700 dark:text-slate-200'
      }`}>
        {name}
      </span>

      {/* Cantidad — fija a la derecha, nunca se desborda */}
      {amount && (
        <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-lg border whitespace-nowrap ${
          checked
            ? 'bg-slate-100 dark:bg-gray-700 text-slate-400 border-slate-200 dark:border-gray-600'
            : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-gray-600 shadow-sm'
        }`}>
          {amount}
        </span>
      )}
    </li>
  );
}

export default function ShoppingListSection({ shoppingList, loadingList, onGenerateShoppingList }) {
  const [allChecked, setAllChecked] = useState(false);

  const totalItems = shoppingList?.categories?.reduce((acc, cat) => acc + (cat.items?.length || 0), 0) || 0;

  return (
    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-gray-700">
      {!shoppingList && (
        <button
          onClick={onGenerateShoppingList}
          disabled={loadingList}
          className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-[--c-primary] hover:border-[--c-primary-border] hover:bg-[--c-primary-light] font-bold transition-all flex justify-center items-center gap-2"
        >
          {loadingList
            ? <><RefreshCw className="animate-spin" size={20} /> Calculando cantidades...</>
            : <><ShoppingCart size={20} /> Generar Lista de Compras</>
          }
        </button>
      )}

      {shoppingList?.categories && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-gray-800">
            <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
              <ShoppingCart size={18} style={{ color: 'var(--c-primary)' }} />
              Lista del Súper
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-1">
                ({totalItems} productos)
              </span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Toca para marcar</p>
          </div>

          {/* Categorías */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-gray-800">
            {shoppingList.categories.map((cat, i) => (
              <div key={`cat-${i}`} className="p-4">
                {/* Nombre categoría */}
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 px-3">
                  {cat.name}
                </h4>

                {/* Items */}
                <ul className="space-y-0.5">
                  {cat.items?.map((item, j) => (
                    <ShoppingItem key={`item-${i}-${j}`} item={item} />
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
