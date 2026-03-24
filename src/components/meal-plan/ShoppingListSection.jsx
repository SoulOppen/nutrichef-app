import { RefreshCw, ShoppingCart } from 'lucide-react';

export default function ShoppingListSection({ shoppingList, loadingList, onGenerateShoppingList }) {
  return (
    <div className="mt-8 pt-8 border-t border-slate-200">
      {!shoppingList && (
        <button
          onClick={onGenerateShoppingList}
          disabled={loadingList}
          className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 font-bold transition-all flex justify-center items-center gap-2"
        >
          {loadingList ? <RefreshCw className="animate-spin" size={20} /> : <ShoppingCart size={20} />}
          {loadingList ? 'Calculando cantidades...' : 'Generar Lista de Compras Inteligente'}
        </button>
      )}

      {shoppingList && shoppingList.categories && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShoppingCart className="text-orange-500" /> Lista del Super
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shoppingList.categories.map((cat, i) => (
              <div key={`cat-${i}`} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">{cat.name}</h4>
                <ul className="space-y-3">
                  {cat.items && cat.items.map((item, j) => (
                    <li key={`item-${j}`} className="flex justify-between items-start gap-2 text-slate-600 text-sm border-b border-slate-200/50 last:border-0 pb-2 last:pb-0">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></div>
                        <span className="leading-snug">{typeof item === 'string' ? item : (item.name || item.producto || item.item || 'Ingrediente')}</span>
                      </div>
                      {typeof item !== 'string' && (item.amount || item.cantidad) && (
                        <span className="font-semibold text-slate-700 whitespace-nowrap text-right bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">
                          {item.amount || item.cantidad}
                        </span>
                      )}
                    </li>
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
