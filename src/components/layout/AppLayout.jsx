import { Bookmark, Calendar, ChefHat, Compass, Settings, Utensils } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { ROUTES } from '../../routes/paths.js';

const NAV_ITEMS = [
  { to: ROUTES.create, label: 'Crear', icon: Utensils },
  { to: ROUTES.explore, label: 'Explorar', icon: Compass },
  { to: ROUTES.saved, label: 'Guardados', icon: Bookmark },
  { to: ROUTES.plan, label: 'Plan', icon: Calendar },
  { to: ROUTES.profile, label: 'Perfil', icon: Settings },
];

function navLinkClassName({ isActive }) {
  return `flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-sm font-bold transition-all ${
    isActive ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
  }`;
}

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-orange-50 text-slate-800 font-sans pb-12">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <NavLink to={ROUTES.create} className="flex items-center gap-2 text-orange-600">
            <ChefHat size={28} />
            <h1 className="text-xl font-bold tracking-tight">NutriChef IA</h1>
          </NavLink>

          <nav className="flex gap-1 md:gap-4 overflow-x-auto no-scrollbar">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                <item.icon size={18} />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
